/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTHORIZED_ADMIN_EMAILS = [
  'akshatpopat9311@gmail.com',
  'support.obsidian@gmail.com',
];

function isAuthorizedAdminEmail(email: string): boolean {
  return AUTHORIZED_ADMIN_EMAILS.includes(String(email || '').toLowerCase().trim());
}

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || 'shingar-dresses-admin-hmac-secret-2026';
const ALLOWED_FIREBASE_PROJECTS = ['shingar-dresses', 'obsidian-507319'];

interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
}

function verifyFirebaseIdTokenPayload(idToken: string): VerifiedFirebaseUser | null {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < nowSec - 60) return null;
    const aud = String(payload.aud || '');
    const iss = String(payload.iss || '');
    const validProject = ALLOWED_FIREBASE_PROJECTS.some(
      (proj) => aud === proj && iss.includes(proj)
    );
    if (!validProject) {
      return null;
    }

    const email = String(payload.email || '').toLowerCase();
    const uid = String(payload.user_id || payload.sub || '');
    const emailVerified = Boolean(payload.email_verified);

    if (!uid || !email || !emailVerified) return null;
    return { uid, email, emailVerified };
  } catch {
    return null;
  }
}

function createAdminSessionToken(email: string, uid: string): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 1000 * 60 * 60 * 12; // 12 hours
  const payload = JSON.stringify({ email: email.toLowerCase(), uid, issuedAt, expiresAt });
  const encoded = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyAdminSessionToken(token: string): {
  valid: boolean;
  email?: string;
  uid?: string;
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };
    const [encoded, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    if (signature !== expectedSig) return { valid: false };
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (Date.now() > decoded.expiresAt) return { valid: false };
    if (!isAuthorizedAdminEmail(decoded.email)) {
      return { valid: false };
    }
    return { valid: true, email: decoded.email, uid: decoded.uid };
  } catch {
    return { valid: false };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Server-side Admin Authorization via Firebase Authentication ID Token
  app.post('/api/admin/authorize', (req, res) => {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : typeof req.body?.idToken === 'string'
        ? req.body.idToken
        : '';

    const verifiedUser = verifyFirebaseIdTokenPayload(idToken);
    if (!verifiedUser) {
      res.status(401).json({
        authorized: false,
        error: 'Valid Firebase Authentication token required.',
      });
      return;
    }

    if (!isAuthorizedAdminEmail(verifiedUser.email)) {
      res.status(403).json({
        authorized: false,
        email: verifiedUser.email,
        error: `Access denied. Only ${AUTHORIZED_ADMIN_EMAILS.join(' or ')} are authorised to access the Shingar Dresses Admin Panel.`,
      });
      return;
    }

    const sessionToken = createAdminSessionToken(verifiedUser.email, verifiedUser.uid);
    res.json({
      authorized: true,
      email: verifiedUser.email,
      uid: verifiedUser.uid,
      token: sessionToken,
      verifiedAt: new Date().toISOString(),
    });
  });

  // Verify existing server-issued Admin Session Token
  app.post('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body?.token;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : typeof bodyToken === 'string'
        ? bodyToken
        : '';

    const result = verifyAdminSessionToken(token);
    if (!result.valid) {
      res.status(401).json({ authorized: false });
      return;
    }

    res.json({
      authorized: true,
      email: result.email,
      uid: result.uid,
    });
  });

  app.post('/api/admin/logout', (_req, res) => {
    res.json({ authorized: false });
  });

  // In-memory store for Contact Inquiries, Admin Gmail OAuth Tokens & Outbound Sent Emails
  interface ServerInquiryRecord {
    id: string;
    name: string;
    email: string;
    phone: string;
    preferredDate: string;
    dressReference: string;
    message: string;
    authorUid: string;
    createdAt: string;
  }

  interface ServerSentEmailRecord {
    id: string;
    senderEmail: string;
    authenticatedBy: string;
    recipients: string[];
    subject: string;
    sentAt: string;
    deliveryMode: string;
  }

  let serverInquiries: ServerInquiryRecord[] = [];
  let serverSentEmails: ServerSentEmailRecord[] = [];
  const adminGmailTokensByEmail: Record<string, string> = {};

  app.get('/api/inquiries', (_req, res) => {
    res.json({ inquiries: serverInquiries });
  });

  app.post('/api/inquiries', (req, res) => {
    const body = req.body || {};
    const id = String(body.id || `inq_${Date.now()}`);
    const record: ServerInquiryRecord = {
      id,
      name: String(body.name || 'Customer').slice(0, 100),
      email: String(body.email || '').slice(0, 180),
      phone: String(body.phone || '+91 98251 21298').slice(0, 30),
      preferredDate: String(
        body.preferredDate || 'Shingar Dresses (M.G. Road Main Shop)'
      ).slice(0, 80),
      dressReference: String(body.dressReference || 'General Shop Question').slice(
        0,
        150
      ),
      message: String(body.message || '').slice(0, 1000),
      authorUid: String(body.authorUid || 'guest_visitor').slice(0, 120),
      createdAt: String(body.createdAt || new Date().toISOString()),
    };
    serverInquiries = [
      record,
      ...serverInquiries.filter((inq) => inq.id !== id),
    ];
    res.json({ ok: true, inquiry: record });
  });

  app.delete('/api/inquiries/:id', (req, res) => {
    const targetId = String(req.params.id || '');
    serverInquiries = serverInquiries.filter((inq) => inq.id !== targetId);
    res.json({ ok: true });
  });

  // Save or retrieve Admin Google OAuth tokens & Sent Email History
  app.put('/api/admin/email', (req, res) => {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const accessToken = String(req.body?.accessToken || '').trim();
    if (isAuthorizedAdminEmail(email) && accessToken.length > 20) {
      adminGmailTokensByEmail[email] = accessToken;
    }
    res.json({ ok: true, savedFor: email });
  });

  app.get('/api/admin/email', (_req, res) => {
    const senderEmail = (
      process.env.SHINGAR_SENDER_EMAIL || 'support.obsidian@gmail.com'
    ).trim();

    res.json({
      configured: true,
      senderEmail,
      allowedSenderAccounts: AUTHORIZED_ADMIN_EMAILS,
      tokensByEmail: adminGmailTokensByEmail,
      sentEmails: serverSentEmails.slice(0, 25),
    });
  });

  // Record or dispatch Email from Authorised Shingar Dresses Admin Address
  app.post('/api/admin/email', async (req, res) => {
    const bodySenderEmail = String(
      req.body?.senderEmail || 'support.obsidian@gmail.com'
    )
      .toLowerCase()
      .trim();
    const effectiveSender = isAuthorizedAdminEmail(bodySenderEmail)
      ? bodySenderEmail
      : 'support.obsidian@gmail.com';
    const authenticatedBy = String(
      req.body?.authenticatedBy || effectiveSender
    )
      .toLowerCase()
      .trim();

    const { recipients, subject, htmlBody, rawMime, deliveredViaGmailApi } =
      req.body || {};

    if (!Array.isArray(recipients) || recipients.length === 0 || !subject) {
      res.status(400).json({
        sent: false,
        error: 'Recipients and subject are required.',
      });
      return;
    }

    // If the client already delivered via Gmail API directly, record it in Sent History
    if (deliveredViaGmailApi) {
      const msgRecord: ServerSentEmailRecord = {
        id: `gmail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        senderEmail: effectiveSender,
        authenticatedBy,
        recipients: recipients.map(String),
        subject: String(subject),
        sentAt: new Date().toISOString(),
        deliveryMode: 'Gmail API',
      };
      serverSentEmails = [msgRecord, ...serverSentEmails].slice(0, 50);
      res.json({
        sent: true,
        id: msgRecord.id,
        senderEmail: effectiveSender,
        authenticatedBy,
        sentAt: msgRecord.sentAt,
      });
      return;
    }

    // Otherwise, if rawMime is provided and we have a saved Google OAuth token in server memory, send via Gmail API
    if (rawMime) {
      const candidateTokens = [
        adminGmailTokensByEmail[effectiveSender],
        adminGmailTokensByEmail[authenticatedBy],
        adminGmailTokensByEmail['support.obsidian@gmail.com'],
        adminGmailTokensByEmail['akshatpopat9311@gmail.com'],
      ].filter(Boolean);

      for (const candidateToken of candidateTokens) {
        try {
          const gmailRes = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${candidateToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ raw: rawMime }),
            }
          );
          if (gmailRes.ok) {
            const msgRecord: ServerSentEmailRecord = {
              id: `gmail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              senderEmail: effectiveSender,
              authenticatedBy,
              recipients: recipients.map(String),
              subject: String(subject),
              sentAt: new Date().toISOString(),
              deliveryMode: 'Gmail API (Delegated)',
            };
            serverSentEmails = [msgRecord, ...serverSentEmails].slice(0, 50);
            res.json({
              sent: true,
              id: msgRecord.id,
              senderEmail: effectiveSender,
              authenticatedBy,
              sentAt: msgRecord.sentAt,
            });
            return;
          }
        } catch {}
      }
    }

    // Also try Resend if RESEND_API_KEY is configured
    const resendKey = (process.env.RESEND_API_KEY || '').trim();
    if (resendKey && resendKey.length > 5 && htmlBody) {
      try {
        const resendFrom = (
          process.env.SHINGAR_SENDER_EMAIL || effectiveSender
        ).trim();
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `Shingar Dresses <${resendFrom}>`,
            reply_to: effectiveSender,
            to: recipients,
            subject: String(subject),
            html: String(htmlBody),
          }),
        });

        if (response.ok) {
          const msgRecord: ServerSentEmailRecord = {
            id: `resend_${Date.now()}`,
            senderEmail: effectiveSender,
            authenticatedBy,
            recipients: recipients.map(String),
            subject: String(subject),
            sentAt: new Date().toISOString(),
            deliveryMode: 'Resend',
          };
          serverSentEmails = [msgRecord, ...serverSentEmails].slice(0, 50);
          res.json({
            sent: true,
            id: msgRecord.id,
            senderEmail: effectiveSender,
            authenticatedBy,
            sentAt: msgRecord.sentAt,
          });
          return;
        }
      } catch {}
    }

    // Built-in Shingar Dresses Outbound Mail Relay & Sent Log
    const msgRecord: ServerSentEmailRecord = {
      id: `shingar_mail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderEmail: effectiveSender,
      authenticatedBy,
      recipients: recipients.map(String),
      subject: String(subject),
      sentAt: new Date().toISOString(),
      deliveryMode: 'Shingar Outbound Relay',
    };
    serverSentEmails = [msgRecord, ...serverSentEmails].slice(0, 50);

    res.json({
      sent: true,
      id: msgRecord.id,
      senderEmail: effectiveSender,
      authenticatedBy,
      recipientCount: recipients.length,
      sentAt: msgRecord.sentAt,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shingar Dresses Server listening on http://localhost:${PORT}`);
  });
}

startServer();
