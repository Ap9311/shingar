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
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useAtelier } from '../../context/AtelierContext';
import { EmailAttachment, EmailServiceStatus } from '../../types';

type RecipientMode = 'individual' | 'selected' | 'all';

const EMAIL_TEMPLATES = [
  {
    label: 'Seasonal Collection Invitation',
    subject: 'Private Viewing Invitation: Shingar Dresses Autumn–Winter 2026 Showcase',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">You Are Invited to the Shingar Dresses Showcase</h2>
<p>Dear Valued Patron,</p>
<p>We are delighted to invite you to an exclusive in-store preview of our <strong>Autumn–Winter 2026 Bridal &amp; Heritage Silk Collection</strong> across our Mumbai, New Delhi, Jaipur, and Surat showrooms.</p>
<ul>
  <li>Hand-embroidered Sindoor &amp; Velvet Bridal Lehengas</li>
  <li>Pure Katan Banarasi &amp; Double-Ikat Patola Sarees</li>
  <li>Complimentary custom drape &amp; master-tailor consultation</li>
</ul>
<p>Present reference code <strong>SHINGAAR-BRIDAL-26</strong> during your showroom visit to receive complimentary bridal veil customization.</p>
<p>Warm regards,<br/><strong>Shingar Dresses Concierge</strong><br/>14 Rampart Row, Kala Ghoda, Mumbai · +91 22 2284 7900</p>`,
  },
  {
    label: 'Promotional Offer Announcement',
    subject: 'Exclusive In-Store Privilege at Shingar Dresses Showrooms',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">Seasonal Showroom Privilege</h2>
<p>Dear Patron,</p>
<p>Celebrate the festive wedding season with <strong>Shingar Dresses</strong>. Enjoy a <strong>20% In-Store Patron Privilege</strong> when selecting two or more handloom Banarasi or Paithani sarees at any of our flagship branches.</p>
<p><strong>Showroom Reference Code:</strong> KASHI-LOOM-20</p>
<p>We look forward to welcoming you in store.</p>`,
  },
  {
    label: 'Private Fitting Confirmation',
    subject: 'Your Shingar Dresses Showroom Appointment & Styling Notes',
    html: `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">Showroom Appointment Confirmation</h2>
<p>Dear Patron,</p>
<p>Thank you for registering your interest with <strong>Shingar Dresses</strong>. Our senior bridal stylist and master tailor have reserved a private viewing suite for your visit.</p>
<p>If you wish to share additional measurements or garment references prior to your arrival, simply reply to our concierge desk or call +91 22 2284 7900.</p>`,
  },
];

export const AdminEmailPage: React.FC = () => {
  const { usersDirectory, adminServerToken } = useAtelier();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<RecipientMode>('individual');
  const [customRecipientInput, setCustomRecipientInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [htmlBody, setHtmlBody] = useState(EMAIL_TEMPLATES[0].html);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const [serviceStatus, setServiceStatus] = useState<EmailServiceStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // Check server-side email service configuration on mount
  useEffect(() => {
    setLoadingStatus(true);
    fetch('/api/admin/email')
      .then((res) => res.json())
      .then((data) => {
        setServiceStatus({
          configured: Boolean(data?.configured),
          senderEmail: data?.senderEmail || 'concierge@shingardresses.com',
          provider: data?.provider || 'Not Configured',
          statusMessage:
            data?.statusMessage ||
            'Outbound email service is not configured on this server.',
        });
      })
      .catch(() => {
        setServiceStatus({
          configured: false,
          senderEmail: 'concierge@shingardresses.com',
          provider: 'Not Configured',
          statusMessage:
            'Could not verify outbound email configuration. Sending is disabled.',
        });
      })
      .finally(() => setLoadingStatus(false));
  }, []);

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

  // Rich-text snippet insertion helpers
  const insertRichTag = (openTag: string, closeTag: string, sampleText: string) => {
    setHtmlBody((prev) => `${prev}\n${openTag}${sampleText}${closeTag}`);
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

  const compiledEmailHtml = useMemo(() => {
    return `
      <div style="background-color: #f5f5f4; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1c1917;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7e5e4;">
          <div style="background-color: #0c0a09; color: #ffffff; padding: 24px 28px; text-align: center;">
            <div style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 0.02em;">Shingar Dresses</div>
            <div style="font-size: 11px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.14em; margin-top: 4px;">Mumbai · New Delhi · Jaipur · Surat</div>
          </div>
          <div style="padding: 28px; font-size: 14px; line-height: 1.65; color: #292524;">
            ${htmlBody}
          </div>
          <div style="border-top: 1px solid #e7e5e4; background-color: #fafaf9; padding: 18px 28px; font-size: 11px; color: #78716c; text-align: center;">
            <p style="margin: 0 0 4px 0;">Sent from the official Shingar Dresses Concierge (${
              serviceStatus?.senderEmail || 'concierge@shingardresses.com'
            })</p>
            <p style="margin: 0;">14 Rampart Row, Kala Ghoda, Fort, Mumbai 400001 · +91 22 2284 7900</p>
          </div>
        </div>
      </div>
    `;
  }, [htmlBody, serviceStatus]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceStatus?.configured) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminServerToken || ''}`,
        },
        body: JSON.stringify({
          recipients,
          subject,
          htmlBody: compiledEmailHtml,
          attachments: attachments.map((a) => ({
            filename: a.filename,
            contentBase64: a.contentBase64,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.sent) {
        setSendResult({
          ok: false,
          message:
            data?.error || 'Could not dispatch email. Check server configuration.',
        });
      } else {
        setSendResult({
          ok: true,
          message: `Dispatched email to ${data.recipientCount} recipient(s) from ${serviceStatus.senderEmail}.`,
        });
      }
    } catch (err) {
      setSendResult({
        ok: false,
        message:
          err instanceof Error ? err.message : 'Unable to reach email endpoint.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-rose-900 uppercase tracking-widest font-medium mb-1">
            Customer Outreach &amp; Announcements
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Email Composer
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Compose rich HTML emails with attachments for individual customers, selected
            customers, or all registered customers.
          </p>
        </div>

        <div className="text-xs text-stone-600 bg-white border border-stone-200 px-4 py-2.5">
          <span>Authorised Sender: </span>
          <strong className="font-mono text-stone-900">
            {serviceStatus?.senderEmail || 'concierge@shingardresses.com'}
          </strong>
        </div>
      </div>

      {/* Email Service Configuration Banner */}
      {!loadingStatus && serviceStatus && !serviceStatus.configured && (
        <div className="bg-amber-50 border border-amber-300 p-5 flex items-start gap-3.5 text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-sm">
              Outbound Email Service Not Configured — Sending Disabled
            </p>
            <p className="leading-relaxed text-amber-900">
              {serviceStatus.statusMessage} You can compose, format, attach files, and
              test the responsive preview below, but the <strong>Send Email</strong>{' '}
              button remains disabled until a verified email provider is configured on
              the server.
            </p>
          </div>
        </div>
      )}

      {sendResult && (
        <div
          className={`p-4 border text-xs flex items-center justify-between ${
            sendResult.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
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
          onSubmit={handleSendEmail}
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
              <div className="border border-stone-200 bg-stone-50 p-3.5 max-h-40 overflow-y-auto space-y-1.5">
                <p className="text-[11px] font-medium text-stone-500 mb-2">
                  Click registered customers to include/exclude:
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
                          <CheckSquare className="w-3.5 h-3.5 text-rose-900 shrink-0" />
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
                  recipients.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 text-xs font-mono text-stone-800"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-stone-400 hover:text-rose-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 2. Quick Templates & Subject Line */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
                2. Subject &amp; Template
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
              placeholder="Email Subject Line"
              className="w-full px-3.5 py-2.5 border border-stone-300 text-sm font-medium focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* 3. Rich-Text Formatting Toolbar & Body Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
              3. Message Body &amp; Rich-Text Formatting
            </label>

            <div className="flex flex-wrap items-center gap-1 p-1.5 bg-stone-100 border border-stone-300 border-b-0">
              <button
                type="button"
                onClick={() => insertRichTag('<strong>', '</strong>', 'Bold Text')}
                title="Insert Bold"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('<em>', '</em>', 'Italic Text')}
                title="Insert Italic"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertRichTag('<u>', '</u>', 'Underlined Text')}
                title="Insert Underline"
                className="p-1.5 bg-white border border-stone-200 hover:border-stone-900 text-stone-800 cursor-pointer"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertRichTag(
                    '<h3 style="font-family: Georgia, serif; color: #111111;">',
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
                    '<ul>\n  <li>',
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
                    '<p><a href="https://shingardresses.com/collection" style="display:inline-block;padding:10px 18px;background:#111111;color:#ffffff;text-decoration:none;font-size:12px;">',
                    '</a></p>',
                    'Explore Shingar Dresses Collection'
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
              rows={9}
              required
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="Write your email content (supports HTML & rich formatting)..."
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
                <span>Attach File</span>
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
                      className="text-stone-400 hover:text-rose-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Submit / Disabled State */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-stone-500">
              Ready for <strong className="text-stone-900">{recipients.length}</strong>{' '}
              recipient(s)
              {attachments.length > 0
                ? ` · ${attachments.length} attachment(s)`
                : ''}
            </span>

            <button
              type="submit"
              disabled={
                !serviceStatus?.configured || sending || recipients.length === 0
              }
              title={
                !serviceStatus?.configured
                  ? 'Configure RESEND_API_KEY and SHINGAR_SENDER_EMAIL on the server to enable sending'
                  : 'Send Email'
              }
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium transition-colors ${
                serviceStatus?.configured && recipients.length > 0
                  ? 'bg-stone-950 text-white hover:bg-rose-900 cursor-pointer'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {sending
                  ? 'Sending Email...'
                  : serviceStatus?.configured
                    ? `Send Email (${recipients.length})`
                    : 'Send Disabled (Email Service Not Configured)'}
              </span>
            </button>
          </div>
        </form>

        {/* Right Column: Live Responsive Email Preview */}
        <div className="lg:col-span-5 bg-white border border-stone-200 p-6 space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-serif text-2xl text-stone-950">
                Responsive Email Preview
              </h2>
              <p className="text-xs text-stone-500">
                Live rendering of the customer email layout
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

          {/* Email Metadata Header Preview */}
          <div className="bg-stone-50 border border-stone-200 p-3.5 space-y-1.5 text-xs">
            <p className="truncate">
              <span className="text-stone-500">From:</span>{' '}
              <strong className="text-stone-900">
                Shingar Dresses &lt;
                {serviceStatus?.senderEmail || 'concierge@shingardresses.com'}&gt;
              </strong>
            </p>
            <p className="truncate">
              <span className="text-stone-500">To:</span>{' '}
              <span className="font-mono text-stone-800">
                {recipients.length > 0
                  ? recipients.join(', ')
                  : 'No recipients selected'}
              </span>
            </p>
            <p className="truncate">
              <span className="text-stone-500">Subject:</span>{' '}
              <strong className="text-stone-900">{subject || '(No subject)'}</strong>
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
                dangerouslySetInnerHTML={{ __html: compiledEmailHtml }}
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
    </div>
  );
};
