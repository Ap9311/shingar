import crypto from 'crypto';

const AUTHORIZED_ADMIN_EMAIL = (
  process.env.AUTHORIZED_ADMIN_EMAIL || 'akshatpopat9311@gmail.com'
).toLowerCase();
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || 'shingar-dresses-admin-hmac-secret-2026';

function verifyAdminSessionToken(token: string) {
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
    if (String(decoded.email || '').toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
      return { valid: false };
    }
    return { valid: true, email: decoded.email, uid: decoded.uid };
  } catch {
    return { valid: false };
  }
}

export default async function handler(req: any, res: any) {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const senderEmail = (
    process.env.SHINGAR_SENDER_EMAIL || 'concierge@shingardresses.com'
  ).trim();
  const configured = Boolean(resendKey && resendKey.length > 5 && senderEmail.includes('@'));

  if (req.method === 'GET') {
    res.status(200).json({
      configured,
      senderEmail,
      provider: configured ? 'Resend Transactional Email API' : 'Not Configured',
      statusMessage: configured
        ? `Authorised outbound email service active (${senderEmail}).`
        : 'Email sending is not configured on this server. Set RESEND_API_KEY and SHINGAR_SENDER_EMAIL in your server/Vercel environment variables to enable live email dispatch.',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const adminCheck = verifyAdminSessionToken(token);

  if (!adminCheck.valid) {
    res.status(403).json({
      sent: false,
      error: `Unauthorised request. Only ${AUTHORIZED_ADMIN_EMAIL} may dispatch customer emails.`,
    });
    return;
  }

  if (!configured) {
    res.status(503).json({
      sent: false,
      configured: false,
      error:
        'Outbound email service is not configured. Configure RESEND_API_KEY and SHINGAR_SENDER_EMAIL on the server before sending emails.',
    });
    return;
  }

  const { recipients, subject, htmlBody, attachments } = req.body || {};
  if (!Array.isArray(recipients) || recipients.length === 0 || !subject || !htmlBody) {
    res.status(400).json({
      sent: false,
      error: 'Recipients, subject, and message body are required.',
    });
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Shingar Dresses <${senderEmail}>`,
        to: recipients,
        subject: String(subject),
        html: String(htmlBody),
        attachments: Array.isArray(attachments)
          ? attachments.map((att: { filename: string; contentBase64: string }) => ({
              filename: att.filename,
              content: att.contentBase64,
            }))
          : undefined,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({
        sent: false,
        error: data?.message || 'Email provider rejected the dispatch request.',
      });
      return;
    }

    res.status(200).json({
      sent: true,
      id: data?.id || `msg_${Date.now()}`,
      recipientCount: recipients.length,
      sentAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      sent: false,
      error: err instanceof Error ? err.message : 'Failed to connect to email service.',
    });
  }
}
