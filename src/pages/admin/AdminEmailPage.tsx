/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail,
  Send,
  Paperclip,
  X,
  Bold,
  Italic,
  Underline,
  Heading2,
  List,
  Link as LinkIcon,
  Smartphone,
  Monitor,
  CheckCircle2,
  UserPlus,
  CheckSquare,
  Square,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAtelier, AUTHORIZED_ADMIN_EMAIL } from '../../context/AtelierContext';
import { EmailAttachment } from '../../types';

type RecipientMode = 'individual' | 'selected' | 'all';

const EMAIL_TEMPLATES = [
  {
    label: 'Festive & Wedding Showcase Invite',
    subject: 'Namaste {Name}, You Are Invited to Shingar Dresses & Shingar NX, Junagadh',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">Special Invitation for {Name}</h2>
<p>Dear <strong>{Name}</strong>,</p>
<p>Greetings from <strong>Shingar Dresses &amp; Shingar NX (Established 1987, Junagadh)</strong>! We are delighted to invite you and your family to explore our newly arrived <strong>2026 Ethnic, Streetwear &amp; Kids' Festive Collection</strong> across our two Junagadh showrooms:</p>
<ul>
  <li><strong>Men's Readymade &amp; Kurta-Pyjamas:</strong> Jacquard silk kurtas, wedding sherwanis &amp; festive bandis</li>
  <li><strong>Shingar NX Streetwear:</strong> Oversized graphic tees, utility cargo denim &amp; youth casuals</li>
  <li><strong>Kids' Festive &amp; Bridal Silk Sarees:</strong> Complete family wedding &amp; festival wardrobe</li>
</ul>
<p>Present code <strong>SHINGAR-FESTIVE-15</strong> at our M.G. Road or Motibaug Road showroom for your 15% Patron Privilege.</p>
<p>Warm regards,<br/><strong>Ashvin A. Shah &amp; Team — Shingar Dresses</strong><br/>M.G. Road &amp; Motibaug Road, Junagadh · WhatsApp: +91 98251 21298</p>`,
  },
  {
    label: 'Shingar NX Streetwear Drop',
    subject: 'New Streetwear Arrival for {Name} at Shingar NX, Motibaug Road',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">Hey {Name}, Fresh Streetwear Just Landed at Shingar NX!</h2>
<p>Hi <strong>{Name}</strong>,</p>
<p>Our newest batch of heavyweight oversized graphic t-shirts, relaxed cargo denims, and urban co-ord sets is now on display at <strong>Shingar NX (Motibaug Road, Above Bata Showroom, Junagadh)</strong>.</p>
<p><strong>Showroom Reference Code:</strong> SHINGAR-NX-DROP (Flat ₹300 Off on 2+ Streetwear Combos)</p>
<p>Visit us daily from 10:00 AM to 10:00 PM!</p>`,
  },
  {
    label: 'Store Inquiry Follow-Up',
    subject: 'Thank You {Name} for Contacting Shingar Dresses, Junagadh',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">We Look Forward to Welcoming You, {Name}</h2>
<p>Dear <strong>{Name}</strong>,</p>
<p>Thank you for reaching out to <strong>Shingar Dresses, Junagadh</strong>. Our showroom team has noted your inquiry and set aside the requested styles for your in-store viewing.</p>
<p>For instant directions or WhatsApp assistance, call or message us anytime at <strong>+91 98251 21298</strong> or <strong>+91 98251 21598</strong>.</p>`,
  },
];

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function encodeBase64Url(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...utf8Bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeMimeHeaderUtf8(text: string): string {
  const utf8Bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

export const AdminEmailPage: React.FC = () => {
  const {
    user,
    usersDirectory,
    gmailAccessToken,
    connectAdminGmail,
    isSigningIn,
  } = useAtelier();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<RecipientMode>('individual');
  const [customRecipientInput, setCustomRecipientInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [previewRecipientEmail, setPreviewRecipientEmail] = useState<string>('');
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [htmlBody, setHtmlBody] = useState(EMAIL_TEMPLATES[0].html);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number }>({
    sent: 0,
    total: 0,
  });
  const [sendResult, setSendResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // Load initial mode & recipients from query params (e.g., from /admin/users)
  useEffect(() => {
    const modeParam = searchParams.get('mode') as RecipientMode | null;
    const recParam = searchParams.get('recipients');

    if (modeParam === 'all') {
      setMode('all');
      const allEmails = usersDirectory.map((u) => u.email).filter(Boolean);
      setRecipients(Array.from(new Set(allEmails)));
    } else if (modeParam === 'selected' && recParam) {
      setMode('selected');
      const parsed = recParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      setRecipients(Array.from(new Set(parsed)));
    } else if (recParam) {
      setMode('individual');
      const parsed = recParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      setRecipients(Array.from(new Set(parsed)));
    } else if (usersDirectory.length > 0 && recipients.length === 0) {
      setRecipients([usersDirectory[0].email]);
    }
  }, [searchParams, usersDirectory]);

  // Keep previewRecipientEmail synced with current recipients list
  useEffect(() => {
    if (recipients.length > 0 && !recipients.includes(previewRecipientEmail)) {
      setPreviewRecipientEmail(recipients[0]);
    } else if (recipients.length === 0) {
      setPreviewRecipientEmail('');
    }
  }, [recipients, previewRecipientEmail]);

  // Resolve a customer's display name from their email address
  const resolveCustomerName = (emailAddress: string): string => {
    const cleanEmail = (emailAddress || '').toLowerCase().trim();
    const matchedUser = usersDirectory.find(
      (u) => (u.email || '').toLowerCase().trim() === cleanEmail
    );
    if (matchedUser && matchedUser.displayName && matchedUser.displayName.trim()) {
      return matchedUser.displayName.trim();
    }
    if (cleanEmail.includes('@')) {
      const localPart = cleanEmail.split('@')[0].replace(/[._-]+/g, ' ').trim();
      if (localPart) return toTitleCase(localPart);
    }
    return 'Valued Customer';
  };

  // Replace {name}, {Name}, {NAME}, {first_name}, etc. with the customer's personalized name
  const applyPersonalizationTokens = (templateText: string, emailAddress: string): string => {
    const rawName = resolveCustomerName(emailAddress);
    const titleName = toTitleCase(rawName);
    const lowerName = rawName.toLowerCase();
    const upperName = rawName.toUpperCase();
    const firstName = titleName.split(/\s+/)[0] || titleName;

    return templateText
      .replace(/\{\s*name\s*\}/g, lowerName)
      .replace(/\{\s*Name\s*\}/g, titleName)
      .replace(/\{\s*NAME\s*\}/g, upperName)
      .replace(/\{\s*first_name\s*\}/gi, firstName)
      .replace(/\{\s*customer_name\s*\}/gi, titleName)
      // Catch any other mixed-case {nAmE} format
      .replace(/\{\s*name\s*\}/gi, titleName);
  };

  const handleModeChange = (nextMode: RecipientMode) => {
    setMode(nextMode);
    if (nextMode === 'all') {
      setRecipients(
        Array.from(new Set(usersDirectory.map((u) => u.email).filter(Boolean)))
      );
    } else if (nextMode === 'individual') {
      setRecipients(usersDirectory[0]?.email ? [usersDirectory[0].email] : []);
    }
  };

  const handleAddRecipient = () => {
    const clean = customRecipientInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    if (!recipients.includes(clean)) {
      setRecipients((prev) => [...prev, clean]);
    }
    setCustomRecipientInput('');
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  const toggleCustomerSelection = (email: string) => {
    setRecipients((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const insertRichTag = (openTag: string, closeTag: string, sampleText: string) => {
    setHtmlBody((prev) => `${prev}${openTag}${sampleText}${closeTag}`);
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = String(reader.result || '');
        const base64Part = resultStr.includes(',')
          ? resultStr.split(',')[1]
          : resultStr;
        setAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
            contentBase64: base64Part,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const buildCompiledEmailHtml = (personalizedBodyHtml: string) => {
    const senderAddress = user?.email || AUTHORIZED_ADMIN_EMAIL;
    return `
      <div style="background-color: #f5f5f4; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1c1917;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7e5e4;">
          <div style="background-color: #0c0a09; color: #ffffff; padding: 24px 28px; text-align: center;">
            <div style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 0.02em;">Shingar Dresses</div>
            <div style="font-size: 11px; color: #d6d3d1; text-transform: uppercase; letter-spacing: 0.14em; margin-top: 4px;">Shingar NX · M.G. Road &amp; Motibaug Road, Junagadh</div>
          </div>
          <div style="padding: 28px; font-size: 14px; line-height: 1.65; color: #292524;">
            ${personalizedBodyHtml}
          </div>
          <div style="border-top: 1px solid #e7e5e4; background-color: #fafaf9; padding: 18px 28px; font-size: 11px; color: #78716c; text-align: center;">
            <p style="margin: 0 0 4px 0;">Sent from Shingar Dresses Official Admin (${senderAddress})</p>
            <p style="margin: 0;">Jenellie Shopping Centre, M.G. Road &amp; Motibaug Road, Junagadh - 362001 · +91 98251 21298</p>
          </div>
        </div>
      </div>
    `;
  };

  const activePreviewEmail =
    previewRecipientEmail || recipients[0] || 'customer@example.com';

  const previewSubject = useMemo(
    () => applyPersonalizationTokens(subject, activePreviewEmail),
    [subject, activePreviewEmail, usersDirectory]
  );

  const previewCompiledHtml = useMemo(() => {
    const personalizedBody = applyPersonalizationTokens(
      htmlBody,
      activePreviewEmail
    );
    return buildCompiledEmailHtml(personalizedBody);
  }, [htmlBody, activePreviewEmail, usersDirectory, user]);

  // Construct RFC 2822 MIME message for Gmail API
  const buildRawGmailMimeMessage = (
    toEmail: string,
    personalizedSubject: string,
    compiledHtml: string
  ): string => {
    const fromEmail = user?.email || AUTHORIZED_ADMIN_EMAIL;
    const encodedSubject = encodeMimeHeaderUtf8(personalizedSubject);

    if (attachments.length === 0) {
      const mimeLines = [
        `From: "Shingar Dresses" <${fromEmail}>`,
        `To: <${toEmail}>`,
        `Subject: ${encodedSubject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset="UTF-8"',
        '',
        compiledHtml,
      ];
      return encodeBase64Url(mimeLines.join('\r\n'));
    }

    const boundary = `shingar_mime_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const mimeParts: string[] = [
      `From: "Shingar Dresses" <${fromEmail}>`,
      `To: <${toEmail}>`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      '',
      compiledHtml,
    ];

    for (const att of attachments) {
      mimeParts.push(
        `--${boundary}`,
        `Content-Type: ${att.mimeType}; name="${att.filename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${att.filename}"`,
        '',
        att.contentBase64
      );
    }

    mimeParts.push(`--${boundary}--`, '');
    return encodeBase64Url(mimeParts.join('\r\n'));
  };

  const handleRequestSendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) return;

    // If Gmail OAuth token is not yet in memory, trigger Google OAuth consent first
    if (!gmailAccessToken) {
      const token = await connectAdminGmail();
      if (!token) return;
    }

    setConfirmModalOpen(true);
  };

  const executeGmailSend = async () => {
    setConfirmModalOpen(false);
    setSending(true);
    setSendResult(null);

    let activeToken = gmailAccessToken;
    if (!activeToken) {
      activeToken = await connectAdminGmail();
    }

    if (!activeToken) {
      setSending(false);
      setSendResult({
        ok: false,
        message:
          'Gmail send permission was not granted. Please click "Authorize Gmail Send" and approve Google access.',
      });
      return;
    }

    setSendProgress({ sent: 0, total: recipients.length });
    let successCount = 0;
    let lastError = '';

    for (let i = 0; i < recipients.length; i++) {
      const recipientEmail = recipients[i];
      const personalizedSubject = applyPersonalizationTokens(subject, recipientEmail);
      const personalizedBody = applyPersonalizationTokens(htmlBody, recipientEmail);
      const finalHtml = buildCompiledEmailHtml(personalizedBody);
      const rawMime = buildRawGmailMimeMessage(
        recipientEmail,
        personalizedSubject,
        finalHtml
      );

      try {
        const response = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${activeToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw: rawMime }),
          }
        );

        if (response.status === 401 || response.status === 403) {
          // Token expired or missing scope; re-authorize once
          const refreshedToken = await connectAdminGmail();
          if (refreshedToken) {
            activeToken = refreshedToken;
            const retryRes = await fetch(
              'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${activeToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ raw: rawMime }),
              }
            );
            if (retryRes.ok) {
              successCount++;
            } else {
              const errData = await retryRes.json().catch(() => ({}));
              lastError =
                errData?.error?.message || `Gmail API error (${retryRes.status})`;
            }
          } else {
            lastError = 'Gmail authorization expired or was cancelled.';
          }
        } else if (response.ok) {
          successCount++;
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError =
            errData?.error?.message || `Gmail API status ${response.status}`;
        }
      } catch (err) {
        lastError =
          err instanceof Error ? err.message : 'Network error calling Gmail API';
      }

      setSendProgress({ sent: i + 1, total: recipients.length });
    }

    setSending(false);

    if (successCount === recipients.length) {
      setSendResult({
        ok: true,
        message: `Successfully sent ${successCount} personalized email(s) directly from your Gmail account (${
          user?.email || AUTHORIZED_ADMIN_EMAIL
        }).`,
      });
    } else if (successCount > 0) {
      setSendResult({
        ok: false,
        message: `Sent ${successCount} of ${recipients.length} emails. Last error: ${lastError}`,
      });
    } else {
      setSendResult({
        ok: false,
        message: `Could not send email via Gmail: ${
          lastError || 'Please verify Gmail send permission.'
        }`,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-stone-600 uppercase tracking-widest font-medium mb-1">
            Direct Gmail OAuth Outreach · Personalized Customer Emails
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Admin Gmail Composer
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Sends directly from your signed-in Admin Gmail account (
            <strong className="text-stone-900 font-mono">
              {user?.email || AUTHORIZED_ADMIN_EMAIL}
            </strong>
            ) with automatic{' '}
            <code className="font-mono text-stone-900 font-semibold">{'{Name}'}</code>{' '}
            replacement for every customer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {gmailAccessToken ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>
                Gmail Connected:{' '}
                <strong className="font-mono">
                  {user?.email || AUTHORIZED_ADMIN_EMAIL}
                </strong>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => connectAdminGmail()}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSigningIn
                  ? 'Requesting Gmail Permission...'
                  : `Authorize Gmail (${user?.email || AUTHORIZED_ADMIN_EMAIL})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Gmail Authorization Notice if Token Needs Refresh */}
      {!gmailAccessToken && (
        <div className="bg-stone-100 border border-stone-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-stone-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-sm">
                Connect Your Signed-In Admin Gmail Account ({user?.email || AUTHORIZED_ADMIN_EMAIL})
              </p>
              <p className="leading-relaxed text-stone-600">
                No external email APIs are required. Click{' '}
                <strong>Authorize Gmail</strong> (or click Send Email below) and approve
                Google&apos;s permission screen to send directly from{' '}
                <strong className="font-mono text-stone-900">
                  {user?.email || AUTHORIZED_ADMIN_EMAIL}
                </strong>
                .
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => connectAdminGmail()}
            disabled={isSigningIn}
            className="px-4 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Authorize Gmail Now
          </button>
        </div>
      )}

      {sendResult && (
        <div
          className={`p-4 border text-xs flex items-center justify-between ${
            sendResult.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-stone-100 border-stone-300 text-stone-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{sendResult.message}</span>
          </div>
          <button type="button" onClick={() => setSendResult(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Split View: Left Composer, Right Live Responsive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Composer Controls */}
        <form
          onSubmit={handleRequestSendConfirmation}
          className="lg:col-span-7 bg-white border border-stone-200 p-6 sm:p-8 space-y-6"
        >
          {/* 1. Recipient Target Mode */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
              1. Recipient Audience
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleModeChange('individual')}
                className={`py-2.5 px-3 text-xs font-medium border transition-colors cursor-pointer ${
                  mode === 'individual'
                    ? 'bg-stone-950 text-white border-stone-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-900'
                }`}
              >
                Individual Customer
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('selected')}
                className={`py-2.5 px-3 text-xs font-medium border transition-colors cursor-pointer ${
                  mode === 'selected'
                    ? 'bg-stone-950 text-white border-stone-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-900'
                }`}
              >
                Selected Customers
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('all')}
                className={`py-2.5 px-3 text-xs font-medium border transition-colors cursor-pointer ${
                  mode === 'all'
                    ? 'bg-stone-950 text-white border-stone-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-900'
                }`}
              >
                All Customers ({usersDirectory.length})
              </button>
            </div>

            {/* Customer Picker for Individual or Selected Mode */}
            {usersDirectory.length > 0 && mode !== 'all' && (
              <div className="border border-stone-200 bg-stone-50 p-3.5 max-h-44 overflow-y-auto space-y-1.5">
                <p className="text-[11px] font-medium text-stone-500 mb-2">
                  Click registered customers to include/exclude (each receives their
                  own custom name via <code className="font-mono">{'{Name}'}</code>):
                </p>
                {usersDirectory.map((u) => {
                  const active = recipients.includes(u.email);
                  return (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => {
                        if (mode === 'individual') {
                          setRecipients([u.email]);
                        } else {
                          toggleCustomerSelection(u.email);
                        }
                      }}
                      className="w-full flex items-center justify-between text-left px-2.5 py-1.5 bg-white border border-stone-200 hover:border-stone-400 text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        {active ? (
                          <CheckSquare className="w-3.5 h-3.5 text-stone-950 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        )}
                        <strong className="text-stone-900">{u.displayName}</strong>
                        <span className="text-stone-500 font-mono">{u.email}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Editable Recipients Box */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customRecipientInput}
                  onChange={(e) => setCustomRecipientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecipient();
                    }
                  }}
                  placeholder="Add recipient email address (e.g. customer@example.com)..."
                  className="flex-1 px-3.5 py-2 border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
                />
                <button
                  type="button"
                  onClick={handleAddRecipient}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="min-h-[42px] p-2.5 border border-stone-200 bg-stone-50 flex flex-wrap gap-1.5 items-center">
                {recipients.length === 0 ? (
                  <span className="text-xs text-stone-400">
                    No recipients selected. Add or select at least one recipient above.
                  </span>
                ) : (
                  recipients.map((email) => {
                    const resolvedName = resolveCustomerName(email);
                    return (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 text-xs text-stone-800"
                      >
                        <strong className="text-stone-950">{resolvedName}</strong>
                        <span className="font-mono text-stone-500">
                          &lt;{email}&gt;
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(email)}
                          className="text-stone-400 hover:text-stone-950 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 2. Quick Templates & Subject Line */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
                2. Subject &amp; Template (Supports {'{Name}'})
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EMAIL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => {
                      setSubject(tpl.subject);
                      setHtmlBody(tpl.html);
                    }}
                    className="px-2.5 py-1 text-[11px] border border-stone-300 bg-stone-50 text-stone-700 hover:border-stone-900 cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email Subject Line (use {Name} for customer name)"
              className="w-full px-3.5 py-2.5 border border-stone-300 text-sm font-medium focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* 3. Rich-Text Formatting Toolbar & Body Editor with {name} / {Name} / {NAME} Support */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
                3. Message Body &amp; Rich-Text Formatting
              </label>
              <span className="text-[11px] text-stone-700 font-medium">
                Tip: Use <code className="font-mono bg-stone-200 px-1">{'{name}'}</code>,{' '}
                <code className="font-mono bg-stone-200 px-1">{'{Name}'}</code>, or{' '}
                <code className="font-mono bg-stone-200 px-1">{'{NAME}'}</code> to
                personalize each customer&apos;s email!
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-100 border border-stone-300 border-b-0">
              {/* Dynamic Name Placeholder Buttons */}
              <button
                type="button"
                onClick={() => insertRichTag('', '', '{Name}')}
                title="Insert Customer Name (Title Case)"
                className="px-2.5 py-1 bg-stone-950 text-white text-[11px] font-mono font-medium hover:bg-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>+ {'{Name}'}</span>
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('', '', '{name}')}
                title="Insert Customer Name (lowercase)"
                className="px-2 py-1 bg-white border border-stone-300 hover:border-stone-900 text-[11px] font-mono text-stone-800 cursor-pointer"
              >
                + {'{name}'}
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('', '', '{NAME}')}
                title="Insert Customer Name (UPPERCASE)"
                className="px-2 py-1 bg-white border border-stone-300 hover:border-stone-900 text-[11px] font-mono text-stone-800 cursor-pointer"
              >
                + {'{NAME}'}
              </button>

              <span className="h-4 w-[1px] bg-stone-300 mx-1" />

              <button
                type="button"
                onClick={() => insertRichTag('\n<strong>', '</strong>', 'Bold Text')}
                title="Insert Bold"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('\n<em>', '</em>', 'Italic Text')}
                title="Insert Italic"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('\n<u>', '</u>', 'Underlined Text')}
                title="Insert Underline"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertRichTag(
                    '\n<h3 style="font-family: Georgia, serif; color: #111111;">',
                    '</h3>',
                    'Section Heading'
                  )
                }
                title="Insert Heading"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertRichTag(
                    '\n<ul>\n  <li>',
                    '</li>\n</ul>',
                    'Showroom highlight item'
                  )
                }
                title="Insert Bullet List"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertRichTag(
                    '\n<p><a href="https://www.instagram.com/shingar_dresses/" style="display:inline-block;padding:10px 18px;background:#111111;color:#ffffff;text-decoration:none;font-size:12px;">',
                    '</a></p>',
                    'Follow @shingar_dresses on Instagram'
                  )
                }
                title="Insert Call-to-Action Link"
                className="px-2.5 py-1 bg-white border border-stone-200 hover:border-stone-900 text-[11px] font-medium text-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>Insert Store Button</span>
              </button>
            </div>

            <textarea
              rows={10}
              required
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="Write your email content here. Use {Name}, {name}, or {NAME} anywhere to automatically insert each recipient's custom name..."
              className="w-full px-3.5 py-3 border border-stone-300 text-xs font-mono leading-relaxed focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* 4. Attachments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
                4. File Attachments ({attachments.length})
              </label>
              <label className="px-3.5 py-1.5 border border-stone-300 bg-stone-50 text-xs font-medium text-stone-800 hover:border-stone-900 inline-flex items-center gap-1.5 cursor-pointer">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach Poster / File</span>
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between px-3 py-2 bg-stone-50 border border-stone-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-medium text-stone-900 truncate">
                        {att.filename}
                      </span>
                      <span className="text-stone-400 font-mono">
                        ({Math.max(1, Math.round(att.sizeBytes / 1024))} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-stone-400 hover:text-rose-900 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Submit via Admin Gmail */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-stone-500">
              Ready to send personalized emails to{' '}
              <strong className="text-stone-900">{recipients.length}</strong>{' '}
              customer(s)
              {attachments.length > 0
                ? ` · ${attachments.length} attachment(s)`
                : ''}
            </span>

            <button
              type="submit"
              disabled={sending || recipients.length === 0}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium transition-colors ${
                recipients.length > 0 && !sending
                  ? 'bg-stone-950 text-white hover:bg-stone-800 cursor-pointer'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {sending
                  ? `Sending via Gmail (${sendProgress.sent}/${sendProgress.total})...`
                  : gmailAccessToken
                    ? `Send Personalized Email via Gmail (${recipients.length})`
                    : `Authorize Gmail & Send (${recipients.length})`}
              </span>
            </button>
          </div>
        </form>

        {/* Right Column: Live Personalized Email Preview */}
        <div className="lg:col-span-5 bg-white border border-stone-200 p-6 space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-serif text-2xl text-stone-950">
                Live Personalized Preview
              </h2>
              <p className="text-xs text-stone-500">
                See how <code className="font-mono text-stone-900">{'{Name}'}</code>{' '}
                renders for each customer
              </p>
            </div>

            <div className="flex items-center gap-1 border border-stone-200 p-1 bg-stone-50">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-2.5 py-1.5 text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-stone-950 text-white'
                    : 'text-stone-600'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-2.5 py-1.5 text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-stone-950 text-white'
                    : 'text-stone-600'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Recipient Switcher for Previewing {Name} */}
          {recipients.length > 0 && (
            <div className="flex items-center justify-between gap-2 bg-stone-100 border border-stone-300 px-3 py-2 text-xs">
              <span className="text-stone-900 font-medium shrink-0">
                Previewing as Customer:
              </span>
              <select
                value={activePreviewEmail}
                onChange={(e) => setPreviewRecipientEmail(e.target.value)}
                className="bg-white border border-stone-300 px-2.5 py-1 text-xs text-stone-900 font-medium focus:outline-none max-w-[230px] truncate"
              >
                {recipients.map((rEmail) => (
                  <option key={rEmail} value={rEmail}>
                    {resolveCustomerName(rEmail)} ({rEmail})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Email Metadata Header Preview */}
          <div className="bg-stone-50 border border-stone-200 p-3.5 space-y-1.5 text-xs">
            <p className="truncate">
              <span className="text-stone-500">From:</span>{' '}
              <strong className="text-stone-900">
                Shingar Dresses &lt;{user?.email || AUTHORIZED_ADMIN_EMAIL}&gt;
              </strong>
            </p>
            <p className="truncate">
              <span className="text-stone-500">To:</span>{' '}
              <span className="font-mono text-stone-800">
                {resolveCustomerName(activePreviewEmail)} &lt;{activePreviewEmail}&gt;
              </span>
            </p>
            <p className="truncate">
              <span className="text-stone-500">Personalized Subject:</span>{' '}
              <strong className="text-stone-900">
                {previewSubject || '(No subject)'}
              </strong>
            </p>
          </div>

          {/* Viewport Container */}
          <div className="bg-stone-100 border border-stone-200 p-4 flex justify-center overflow-x-auto">
            <div
              className={`transition-all duration-200 ${
                previewDevice === 'mobile' ? 'w-[340px]' : 'w-full'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewCompiledHtml }}
                className="text-left"
              />

              {attachments.length > 0 && (
                <div className="mt-3 bg-white border border-stone-200 p-3 space-y-1.5 text-xs">
                  <p className="font-semibold text-stone-700">
                    Attached Files ({attachments.length}):
                  </p>
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between text-stone-600 font-mono text-[11px]"
                    >
                      <span className="truncate">{att.filename}</span>
                      <span>{Math.max(1, Math.round(att.sizeBytes / 1024))} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Confirmation Modal Before Sending via Gmail API */}
      {confirmModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmModalOpen(false)}
        >
          <div
            className="bg-white border border-stone-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-stone-900 text-xs font-semibold uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                <span>Confirm Outbound Gmail Dispatch</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="text-stone-400 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <p className="text-sm text-stone-900 font-medium">
                You are about to send{' '}
                <strong>{recipients.length} personalized email(s)</strong> directly
                from your Gmail account (
                <span className="font-mono">{user?.email || AUTHORIZED_ADMIN_EMAIL}</span>
                ).
              </p>

              <div className="bg-stone-50 border border-stone-200 p-3.5 space-y-1.5">
                <p>
                  <span className="text-stone-500">Sender Account:</span>{' '}
                  <strong className="font-mono text-stone-900">
                    {user?.email || AUTHORIZED_ADMIN_EMAIL}
                  </strong>
                </p>
                <p>
                  <span className="text-stone-500">Recipients ({recipients.length}):</span>{' '}
                  <span className="font-mono text-stone-800">
                    {recipients.slice(0, 4).join(', ')}
                    {recipients.length > 4 ? ` +${recipients.length - 4} more` : ''}
                  </span>
                </p>
                <p>
                  <span className="text-stone-500">Sample Personalized Subject:</span>{' '}
                  <strong className="text-stone-900">{previewSubject}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 border border-stone-300 text-xs font-medium text-stone-700 hover:border-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeGmailSend}
                className="px-5 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm &amp; Send Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
