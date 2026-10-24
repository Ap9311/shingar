/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Paperclip,
  X,
  Bold,
  Italic,
  Underline,
  Heading2,
  List,
  Smartphone,
  Monitor,
  CheckCircle2,
  UserPlus,
  CheckSquare,
  Square,
  Sparkles,
  Mail,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  useAtelier,
  AUTHORIZED_ADMIN_EMAIL,
  AUTHORIZED_ADMIN_EMAILS,
} from '../../context/AtelierContext';
import {
  getGmailAccessToken,
  setGmailAccessToken,
  clearGmailAccessToken,
  isValidGoogleAccessToken,
} from '../../firebase';
import { EmailAttachment } from '../../types';

type RecipientMode = 'individual' | 'selected' | 'all';

interface SentEmailRecord {
  id: string;
  senderEmail: string;
  authenticatedBy: string;
  recipients: string[];
  subject: string;
  sentAt: string;
  deliveryMode: string;
}

const EMAIL_TEMPLATES = [
  {
    label: 'Festival & Wedding Sale Invite',
    subject: 'Hello {Name}, New Clothes & Sale at Shingar Dresses, Junagadh',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">Special Invite for {Name}</h2>
<p>Dear <strong>{Name}</strong>,</p>
<p>Greetings from <strong>Shingar Dresses &amp; Shingar NX, Junagadh</strong>! Visit our shops with your family to see our new collection and current in-store sale:</p>
<ul>
  <li><strong>Men's Kurta-Pyjamas &amp; Readymade Wear</strong></li>
  <li><strong>Shingar NX Youth Streetwear (T-Shirts, Overshirts &amp; Jeans)</strong></li>
  <li><strong>Kids' Festive Clothes &amp; School Uniforms</strong></li>
</ul>
<p>Visit our <strong>M.G. Road Main Shop</strong> or <strong>Shingar NX on Motibaug Road (Above Bata Showroom)</strong> directly to shop.</p>
<p>Warm regards,<br/><strong>Shingar Dresses &amp; Shingar NX</strong><br/>Junagadh · Phone / WhatsApp: +91 98251 21298</p>`,
  },
  {
    label: 'Shingar NX New Stock',
    subject: 'Hi {Name}, New Streetwear Arrived at Shingar NX, Motibaug Road',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">Hi {Name}, New Clothes at Shingar NX!</h2>
<p>Hello <strong>{Name}</strong>,</p>
<p>New t-shirts, overshirts, and cargo jeans have arrived at <strong>Shingar NX (Motibaug Road, Above Bata Showroom, Junagadh)</strong>.</p>
<p>Our sale is going on in store — visit us any day from 10:00 AM to 10:00 PM!</p>`,
  },
  {
    label: 'Reply to Customer Message',
    subject: 'Thank You {Name} for Contacting Shingar Dresses, Junagadh',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">Hello {Name},</h2>
<p>Dear <strong>{Name}</strong>,</p>
<p>Thank you for messaging <strong>Shingar Dresses, Junagadh</strong>. You can visit our M.G. Road or Motibaug Road shop anytime, or call/WhatsApp us at <strong>+91 98251 21298</strong>.</p>`,
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
    inquiries,
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
  const [needsTokenRefresh, setNeedsTokenRefresh] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number }>({
    sent: 0,
    total: 0,
  });
  const [sendResult, setSendResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [sentHistory, setSentHistory] = useState<SentEmailRecord[]>([]);

  const activeSenderEmail = user?.email || AUTHORIZED_ADMIN_EMAILS[1];

  const fetchSentHistoryAndTokens = async () => {
    try {
      const res = await fetch('/api/admin/email');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sentEmails)) {
          setSentHistory(data.sentEmails);
        }
        if (data?.tokensByEmail) {
          for (const [, tok] of Object.entries(data.tokensByEmail)) {
            if (isValidGoogleAccessToken(tok as string)) {
              setGmailAccessToken(tok as string);
            }
          }
        }
      }
    } catch {
      // Ignore fetch errors
    }
  };

  useEffect(() => {
    fetchSentHistoryAndTokens();
  }, []);

  // Verify stored cookie token silently on load so we know ahead of time if it's still valid
  useEffect(() => {
    const candidate = gmailAccessToken || getGmailAccessToken();

    if (!isValidGoogleAccessToken(candidate)) {
      return;
    }

    fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(
        candidate
      )}`
    )
      .then((res) => {
        if (!res.ok) {
          clearGmailAccessToken();
          setNeedsTokenRefresh(true);
        } else {
          setNeedsTokenRefresh(false);
        }
      })
      .catch(() => {});
  }, [gmailAccessToken, activeSenderEmail, user?.email]);

  useEffect(() => {
    const modeParam = searchParams.get('mode') as RecipientMode | null;
    const recParam = searchParams.get('recipients');
    const subjectParam = searchParams.get('subject');
    const replyMsgParam = searchParams.get('replyMessage');

    if (subjectParam) {
      setSubject(subjectParam);
    }
    if (replyMsgParam) {
      setHtmlBody(replyMsgParam);
    }

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

  useEffect(() => {
    if (recipients.length > 0 && !recipients.includes(previewRecipientEmail)) {
      setPreviewRecipientEmail(recipients[0]);
    } else if (recipients.length === 0) {
      setPreviewRecipientEmail('');
    }
  }, [recipients, previewRecipientEmail]);

  const resolveCustomerName = (emailAddress: string): string => {
    const cleanEmail = (emailAddress || '').toLowerCase().trim();
    const matchedUser = usersDirectory.find(
      (u) => (u.email || '').toLowerCase().trim() === cleanEmail
    );
    if (matchedUser && matchedUser.displayName && matchedUser.displayName.trim()) {
      return matchedUser.displayName.trim();
    }
    const matchedInquiry = inquiries.find(
      (inq) => (inq.email || '').toLowerCase().trim() === cleanEmail
    );
    if (matchedInquiry && matchedInquiry.name && matchedInquiry.name.trim()) {
      return matchedInquiry.name.trim();
    }
    if (cleanEmail.includes('@')) {
      const localPart = cleanEmail.split('@')[0].replace(/[._-]+/g, ' ').trim();
      if (localPart) return toTitleCase(localPart);
    }
    return 'Customer';
  };

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
            <p style="margin: 0 0 4px 0;">Sent from Shingar Dresses (${activeSenderEmail})</p>
            <p style="margin: 0;">M.G. Road &amp; Motibaug Road, Junagadh - 362001 · +91 98251 21298</p>
          </div>
        </div>
      </div>
    `;
  };

  const activePreviewEmail =
    previewRecipientEmail || recipients[0] || 'customer@example.com';

  const previewSubject = useMemo(
    () => applyPersonalizationTokens(subject, activePreviewEmail),
    [subject, activePreviewEmail, usersDirectory, inquiries]
  );

  const previewCompiledHtml = useMemo(() => {
    const personalizedBody = applyPersonalizationTokens(
      htmlBody,
      activePreviewEmail
    );
    return buildCompiledEmailHtml(personalizedBody);
  }, [htmlBody, activePreviewEmail, usersDirectory, inquiries, activeSenderEmail]);

  const buildRawGmailMimeMessage = (
    toEmail: string,
    personalizedSubject: string,
    compiledHtml: string
  ): string => {
    const fromEmail = user?.email || activeSenderEmail;
    const encodedSubject = encodeMimeHeaderUtf8(personalizedSubject);

    if (attachments.length === 0) {
      const mimeLines = [
        `From: "Shingar Dresses (${fromEmail})" <${fromEmail}>`,
        `To: <${toEmail}>`,
        `Reply-To: "Shingar Dresses" <${fromEmail}>`,
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
      `From: "Shingar Dresses (${fromEmail})" <${fromEmail}>`,
      `To: <${toEmail}>`,
      `Reply-To: "Shingar Dresses" <${fromEmail}>`,
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

  const hasSavedRealToken = Boolean(
    !needsTokenRefresh &&
      isValidGoogleAccessToken(gmailAccessToken || getGmailAccessToken())
  );

  // If a real Google OAuth token is already in cookies, open confirmation modal immediately.
  // If not (e.g. first time after an old session or token expired), request Google OAuth synchronously on click so popup is never blocked.
  const handleRequestSendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) return;

    if (!hasSavedRealToken) {
      const freshToken = await connectAdminGmail();
      if (!isValidGoogleAccessToken(freshToken)) {
        setSendResult({
          ok: false,
          message:
            'Please allow Google Gmail permission in the Google sign-in window so emails can be sent directly from your Gmail.',
        });
        return;
      }
      setNeedsTokenRefresh(false);
    }

    setConfirmModalOpen(true);
  };

  const executeGmailSend = async (overrideToken?: string) => {
    setConfirmModalOpen(false);
    setSending(true);
    setSendResult(null);
    setSendProgress({ sent: 0, total: recipients.length });

    // Gather all valid real Google OAuth tokens (prioritizing the selected sender email, then signed-in admin)
    const candidateTokens = Array.from(
      new Set(
        [
          overrideToken,
          gmailAccessToken,
          getGmailAccessToken(),
        ].filter(isValidGoogleAccessToken)
      )
    );

    let successCount = 0;
    let lastError = '';
    let tokenExpiredError = false;

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

      let delivered = false;

      // 1. Try direct Gmail API delivery with our saved Google OAuth tokens
      for (const token of candidateTokens) {
        try {
          const gmailRes = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ raw: rawMime }),
            }
          );

          if (gmailRes.ok) {
            delivered = true;
            successCount++;
            // Log the delivered email in Sent History on server
            fetch('/api/admin/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                senderEmail: activeSenderEmail,
                authenticatedBy: user?.email || AUTHORIZED_ADMIN_EMAIL,
                recipients: [recipientEmail],
                subject: personalizedSubject,
                deliveredViaGmailApi: true,
              }),
            }).catch(() => {});
            break;
          } else if (gmailRes.status === 401 || gmailRes.status === 403) {
            tokenExpiredError = true;
            const errData = await gmailRes.json().catch(() => ({}));
            lastError =
              errData?.error?.message || `Gmail authorization expired (${gmailRes.status})`;
          } else {
            const errData = await gmailRes.json().catch(() => ({}));
            lastError =
              errData?.error?.message || `Gmail error (${gmailRes.status})`;
          }
        } catch (err) {
          lastError =
            err instanceof Error ? err.message : 'Network error calling Gmail API';
        }
      }

      // 2. If not yet delivered, try server-side delegated Gmail token or Resend
      if (!delivered) {
        try {
          const activeToken = candidateTokens[0] || gmailAccessToken || getGmailAccessToken();
          const apiRes = await fetch('/api/admin/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
            },
            body: JSON.stringify({
              senderEmail: user?.email || activeSenderEmail,
              authenticatedBy: user?.email || AUTHORIZED_ADMIN_EMAIL,
              recipients: [recipientEmail],
              subject: personalizedSubject,
              htmlBody: finalHtml,
              rawMime,
              accessToken: activeToken,
            }),
          });

          if (apiRes.ok) {
            delivered = true;
            successCount++;
            tokenExpiredError = false;
          } else {
            const errData = await apiRes.json().catch(() => ({}));
            if (errData?.needsGmailReconnect) {
              tokenExpiredError = true;
            }
            if (!lastError) {
              lastError = errData?.error || `Failed (${apiRes.status})`;
            }
          }
        } catch (err) {
          if (!lastError) {
            lastError =
              err instanceof Error ? err.message : 'Network error sending email';
          }
        }
      }

      setSendProgress({ sent: i + 1, total: recipients.length });
    }

    setSending(false);
    await fetchSentHistoryAndTokens();

    if (successCount === recipients.length) {
      setNeedsTokenRefresh(false);
      const delegatedNote =
        user?.email &&
        user.email.toLowerCase() !== activeSenderEmail.toLowerCase()
          ? ` (sent by ${user.email} on behalf of ${activeSenderEmail})`
          : '';
      setSendResult({
        ok: true,
        message: `Successfully sent ${successCount} real email(s) to customer inbox(es) from ${activeSenderEmail}${delegatedNote}.`,
      });
    } else if (tokenExpiredError) {
      clearGmailAccessToken();
      setNeedsTokenRefresh(true);
      setSendResult({
        ok: false,
        message:
          'Your 1-hour Google Gmail security token expired. Click "Refresh Gmail Permission & Send Now" below to send immediately.',
      });
    } else if (successCount > 0) {
      setSendResult({
        ok: false,
        message: `Sent ${successCount} of ${recipients.length} emails. Error: ${lastError}`,
      });
    } else {
      setSendResult({
        ok: false,
        message: `Could not send email: ${lastError || 'Please verify Gmail permission.'}`,
      });
    }
  };

  // Synchronous click handler for refreshing expired token and immediately sending
  const handleRefreshAndSendNow = async () => {
    const freshToken = await connectAdminGmail();
    if (isValidGoogleAccessToken(freshToken)) {
      setNeedsTokenRefresh(false);
      await executeGmailSend(freshToken);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-stone-500 mb-1">
            Real Google Gmail Delivery · Cookie Session Saved
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Send Email to Customers
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Write <code className="font-mono font-semibold text-stone-950">{'{Name}'}</code>{' '}
            anywhere and each customer will automatically receive their own custom name.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasSavedRealToken && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Gmail Active ({user?.email || activeSenderEmail})
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={async () => {
              const tok = await connectAdminGmail();
              if (isValidGoogleAccessToken(tok)) {
                setNeedsTokenRefresh(false);
                setSendResult({
                  ok: true,
                  message: `Google Gmail account (${user?.email || activeSenderEmail}) connected successfully with Gmail Send permission.`,
                });
              }
            }}
            disabled={isSigningIn}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSigningIn ? 'animate-spin' : ''}`} />
            <span>
              {isSigningIn
                ? 'Connecting Gmail with Google...'
                : hasSavedRealToken
                ? 'Re-connect / Refresh Gmail Permission'
                : 'Connect Gmail Account with Google'}
            </span>
          </button>
        </div>
      </div>


      {sendResult && (
        <div
          className={`p-4 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            sendResult.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${sendResult.ok ? 'text-emerald-700' : 'text-amber-700'}`} />
            <span>{sendResult.message}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!sendResult.ok && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    const freshToken = await connectAdminGmail();
                    if (isValidGoogleAccessToken(freshToken)) {
                      setNeedsTokenRefresh(false);
                      await executeGmailSend(freshToken);
                    }
                  }}
                  disabled={isSigningIn || sending}
                  className="px-3.5 py-1.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-authorize Gmail &amp; Send</span>
                </button>
                {recipients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const firstRecipient = recipients[0];
                      const personalizedSubj = applyPersonalizationTokens(subject, firstRecipient);
                      const plainBody = applyPersonalizationTokens(htmlBody, firstRecipient)
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/<\/p>/gi, '\n\n')
                        .replace(/<[^>]+>/g, '');
                      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        firstRecipient
                      )}&su=${encodeURIComponent(personalizedSubj)}&body=${encodeURIComponent(plainBody)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-3 py-1.5 bg-white border border-amber-400 hover:border-stone-900 text-stone-900 text-xs font-medium cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-800" />
                    <span>Open in Web Gmail</span>
                  </button>
                )}
              </>
            )}
            <button type="button" onClick={() => setSendResult(null)} className="cursor-pointer">
              <X className="w-4 h-4 text-stone-500 hover:text-stone-900" />
            </button>
          </div>
        </div>
      )}

      {/* Main Split View: Left Simple Form, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleRequestSendConfirmation}
          className="lg:col-span-7 bg-white border border-stone-200 p-5 sm:p-7 space-y-6"
        >
          {/* Step 1: Who gets the email */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              1. Who Should Get This Email?
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
                One Person
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
                Selected People
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

            {usersDirectory.length > 0 && mode !== 'all' && (
              <div className="border border-stone-200 bg-stone-50 p-3 max-h-40 overflow-y-auto space-y-1.5">
                <p className="text-[11px] font-medium text-stone-500 mb-1.5">
                  Tap customers below to pick them:
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
                  placeholder="Or type an email address here..."
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

              <div className="min-h-[38px] p-2 border border-stone-200 bg-stone-50 flex flex-wrap gap-1.5 items-center">
                {recipients.length === 0 ? (
                  <span className="text-xs text-stone-400">
                    No email selected yet.
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

          {/* Step 2: Subject Line */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                2. Email Subject
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
              placeholder="Email subject line"
              className="w-full px-3.5 py-2.5 border border-stone-300 text-sm font-medium focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* Step 3: Message Body with {Name} */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                3. Write Message
              </label>
              <span className="text-[11px] text-stone-600">
                Tap <strong>+ {'{Name}'}</strong> to insert customer&apos;s own name
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-100 border border-stone-300 border-b-0">
              <button
                type="button"
                onClick={() => insertRichTag('', '', '{Name}')}
                className="px-2.5 py-1 bg-stone-950 text-white text-[11px] font-mono font-medium hover:bg-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>+ {'{Name}'}</span>
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('', '', '{name}')}
                className="px-2 py-1 bg-white border border-stone-300 hover:border-stone-900 text-[11px] font-mono text-stone-800 cursor-pointer"
              >
                + {'{name}'}
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('', '', '{NAME}')}
                className="px-2 py-1 bg-white border border-stone-300 hover:border-stone-900 text-[11px] font-mono text-stone-800 cursor-pointer"
              >
                + {'{NAME}'}
              </button>

              <span className="h-4 w-[1px] bg-stone-300 mx-1" />

              <button
                type="button"
                onClick={() => insertRichTag('\n<strong>', '</strong>', 'Bold Text')}
                title="Bold"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('\n<em>', '</em>', 'Italic Text')}
                title="Italic"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('\n<u>', '</u>', 'Underlined Text')}
                title="Underline"
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
                    'Heading'
                  )
                }
                title="Heading"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertRichTag('\n<ul>\n  <li>', '</li>\n</ul>', 'Item')
                }
                title="List"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              rows={9}
              required
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="Write your email message here..."
              className="w-full px-3.5 py-3 border border-stone-300 text-xs font-mono leading-relaxed focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* Step 4: Attach Photo/File (Optional) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                4. Attach Photo or File (Optional)
              </label>
              <label className="px-3.5 py-1.5 border border-stone-300 bg-stone-50 text-xs font-medium text-stone-800 hover:border-stone-900 inline-flex items-center gap-1.5 cursor-pointer">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Add File</span>
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
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-stone-400 hover:text-stone-900 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send Button */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-stone-600">
              Sending from <strong className="text-stone-900 font-mono">{activeSenderEmail}</strong> to{' '}
              <strong className="text-stone-900">{recipients.length}</strong> person(s)
            </span>

            <button
              type="submit"
              disabled={sending || recipients.length === 0}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-medium transition-colors ${
                recipients.length > 0 && !sending
                  ? 'bg-stone-950 text-white hover:bg-stone-800 cursor-pointer'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {sending
                  ? `Sending (${sendProgress.sent}/${sendProgress.total})...`
                  : `Send Email (${recipients.length})`}
              </span>
            </button>
          </div>
        </form>

        {/* Right Column: Live Email Preview */}
        <div className="lg:col-span-5 bg-white border border-stone-200 p-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h2 className="font-serif text-xl text-stone-950">Email Preview</h2>
              <p className="text-xs text-stone-500">How the customer will see it</p>
            </div>

            <div className="flex items-center gap-1 border border-stone-200 p-1 bg-stone-50">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-2.5 py-1 text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-stone-950 text-white'
                    : 'text-stone-600'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Computer</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-2.5 py-1 text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-stone-950 text-white'
                    : 'text-stone-600'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone</span>
              </button>
            </div>
          </div>

          {recipients.length > 0 && (
            <div className="flex items-center justify-between gap-2 bg-stone-100 border border-stone-300 px-3 py-2 text-xs">
              <span className="text-stone-900 font-medium shrink-0">
                Preview for:
              </span>
              <select
                value={activePreviewEmail}
                onChange={(e) => setPreviewRecipientEmail(e.target.value)}
                className="bg-white border border-stone-300 px-2 py-1 text-xs text-stone-900 font-medium focus:outline-none max-w-[220px] truncate"
              >
                {recipients.map((rEmail) => (
                  <option key={rEmail} value={rEmail}>
                    {resolveCustomerName(rEmail)} ({rEmail})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-stone-50 border border-stone-200 p-3 space-y-1 text-xs">
            <p className="truncate">
              <span className="text-stone-500">From:</span>{' '}
              <strong className="text-stone-900 font-mono">
                {activeSenderEmail}
              </strong>
            </p>
            <p className="truncate">
              <span className="text-stone-500">To:</span>{' '}
              <span className="font-mono text-stone-800">
                {resolveCustomerName(activePreviewEmail)} &lt;{activePreviewEmail}&gt;
              </span>
            </p>
            <p className="truncate">
              <span className="text-stone-500">Subject:</span>{' '}
              <strong className="text-stone-900">{previewSubject}</strong>
            </p>
          </div>

          <div className="bg-stone-100 border border-stone-200 p-3 flex justify-center overflow-x-auto">
            <div
              className={`transition-all duration-200 ${
                previewDevice === 'mobile' ? 'w-[320px]' : 'w-full'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewCompiledHtml }}
                className="text-left"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sent Emails Log */}
      {sentHistory.length > 0 && (
        <div className="bg-white border border-stone-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-700" />
              <h2 className="font-serif text-xl text-stone-950">
                Recently Sent Emails ({sentHistory.length})
              </h2>
            </div>
          </div>
          <div className="divide-y divide-stone-200 max-h-64 overflow-y-auto">
            {sentHistory.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-stone-900">{item.subject}</p>
                  <p className="text-stone-600">
                    From <span className="font-mono text-stone-900">{item.senderEmail}</span>{' '}
                    → To{' '}
                    <span className="font-mono text-stone-900">
                      {item.recipients.join(', ')}
                    </span>
                  </p>
                </div>
                <span className="font-mono text-[11px] text-stone-500 shrink-0">
                  {new Date(item.sentAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simple Confirmation Modal */}
      {confirmModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmModalOpen(false)}
        >
          <div
            className="bg-white border border-stone-200 max-w-md w-full p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-2xl text-stone-950">
              Send Real Email Now?
            </h2>
            <p className="text-sm text-stone-600">
              This will send your email to{' '}
              <strong className="text-stone-900">{recipients.length}</strong>{' '}
              customer(s) from{' '}
              <strong className="font-mono text-xs text-stone-900">
                {activeSenderEmail}
              </strong>
              . Choose how you want to send:
            </p>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => executeGmailSend()}
                className="w-full px-5 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 cursor-pointer flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <strong className="font-semibold">Send via Direct Gmail API &amp; Server</strong>
                </span>
                <span className="text-[11px] text-stone-300">Automatic</span>
              </button>

              {recipients.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmModalOpen(false);
                    const firstRecipient = recipients[0];
                    const personalizedSubj = applyPersonalizationTokens(subject, firstRecipient);
                    const plainBody = applyPersonalizationTokens(htmlBody, firstRecipient)
                      .replace(/<br\s*\/?>/gi, '\n')
                      .replace(/<\/p>/gi, '\n\n')
                      .replace(/<[^>]+>/g, '');
                    
                    // Log in server sent history
                    fetch('/api/admin/email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        senderEmail: activeSenderEmail,
                        authenticatedBy: user?.email || AUTHORIZED_ADMIN_EMAIL,
                        recipients: [firstRecipient],
                        subject: personalizedSubj,
                        deliveredViaGmailApi: true,
                      }),
                    }).catch(() => {});

                    const webUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      firstRecipient
                    )}&su=${encodeURIComponent(personalizedSubj)}&body=${encodeURIComponent(plainBody)}`;
                    window.open(webUrl, '_blank', 'noopener,noreferrer');

                    setSendResult({
                      ok: true,
                      message: `Opened official Gmail compose window for ${firstRecipient}. Click "Send" in Gmail to deliver!`,
                    });
                  }}
                  className="w-full px-5 py-3 bg-white border border-stone-300 text-stone-950 text-xs font-medium hover:border-stone-950 cursor-pointer flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-700" />
                    <strong className="font-semibold">Open &amp; Send in Official Web Gmail</strong>
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium">100% Real Gmail</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 border border-stone-300 text-xs font-medium text-stone-700 cursor-pointer hover:border-stone-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
