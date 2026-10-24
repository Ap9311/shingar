/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Mail,
  Phone,
  MessageCircle,
  Trash2,
  MapPin,
  Search,
  Clock,
} from 'lucide-react';
import { useAtelier } from '../../context/AtelierContext';

export const AdminMessagesPage: React.FC = () => {
  const { inquiries, deleteAtelierInquiry } = useAtelier();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInquiries = inquiries.filter((inq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inq.name || '').toLowerCase().includes(q) ||
      (inq.email || '').toLowerCase().includes(q) ||
      (inq.phone || '').toLowerCase().includes(q) ||
      (inq.dressReference || '').toLowerCase().includes(q) ||
      (inq.message || '').toLowerCase().includes(q) ||
      (inq.preferredDate || '').toLowerCase().includes(q)
    );
  });

  const buildEmailReplyUrl = (inq: {
    name: string;
    email: string;
    dressReference: string;
    preferredDate: string;
    message: string;
  }) => {
    const subject = `Reply from Shingar Dresses, Junagadh (${inq.dressReference || 'Your Message'})`;
    const replyHtml = `<h2 style="font-family: Georgia, serif; color: #111111; margin-bottom: 12px;">Hello {Name},</h2>
<p>Dear <strong>{Name}</strong>,</p>
<p>Thank you for sending us a message on the <strong>Shingar Dresses &amp; Shingar NX</strong> website regarding <strong>${inq.dressReference || 'our clothes'}</strong> (${inq.preferredDate || 'Junagadh Shop'}).</p>
<blockquote style="margin: 14px 0; padding: 10px 14px; background: #f5f5f4; border-left: 3px solid #1c1917; color: #57534e; font-size: 13px;">
  "${inq.message}"
</blockquote>
<p>Please visit our shop or call/WhatsApp us at <strong>+91 98251 21298</strong> anytime.</p>
<p>Warm regards,<br/><strong>Shingar Dresses &amp; Shingar NX, Junagadh</strong></p>`;

    const params = new URLSearchParams({
      mode: 'individual',
      recipients: inq.email,
      subject,
      replyMessage: replyHtml,
    });
    return `/admin/email?${params.toString()}`;
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    const digits = (phone || '').replace(/\D+/g, '');
    if (!digits) return '';
    return digits.length === 10 ? `91${digits}` : digits;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-stone-500 mb-1">
            Responses from &ldquo;Send Us a Message&rdquo; on /contact Page
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Customer Messages ({inquiries.length})
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Every message sent from the Contact page appears here. Click{' '}
            <strong>Reply by Email</strong> or <strong>Reply on WhatsApp</strong> to
            answer the customer.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, or cloth..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
          />
        </div>
      </div>

      {/* Messages List */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white border border-stone-200 p-10 text-center space-y-2">
          <MessageSquare className="w-7 h-7 text-stone-400 mx-auto" />
          <p className="font-serif text-xl text-stone-900">
            No Customer Messages Found
          </p>
          <p className="text-xs text-stone-500">
            When a customer fills out &ldquo;Send Us a Message&rdquo; on the Contact
            page, their message will show up here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => {
            const waPhone = cleanPhoneForWhatsApp(inq.phone);
            const waText = encodeURIComponent(
              `Hello ${inq.name}, this is Shingar Dresses (Junagadh) replying to your message about "${inq.dressReference || 'our shop'}".`
            );

            return (
              <div
                key={inq.id}
                className="bg-white border border-stone-200 p-5 sm:p-6 space-y-4 hover:border-stone-400 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-200 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl text-stone-950">
                        {inq.name}
                      </h2>
                      <span className="px-2.5 py-0.5 bg-stone-100 border border-stone-300 text-[11px] font-medium text-stone-800">
                        {inq.dressReference || 'General Shop Question'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                      <span className="font-mono text-stone-900">{inq.email}</span>
                      {inq.phone && (
                        <span className="font-mono text-stone-800">
                          Phone: {inq.phone}
                        </span>
                      )}
                      {inq.preferredDate && (
                        <span className="inline-flex items-center gap-1 text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-stone-500" />
                          <span>{inq.preferredDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {typeof inq.createdAt === 'string' ||
                      typeof inq.createdAt === 'number'
                        ? new Date(inq.createdAt).toLocaleString()
                        : 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Message Content */}
                <div className="bg-stone-50 border border-stone-200 p-4 text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                  {inq.message}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {inq.email && (
                      <Link
                        to={buildEmailReplyUrl(inq)}
                        className="px-4 py-2 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reply by Email</span>
                      </Link>
                    )}

                    {waPhone && (
                      <a
                        href={`https://wa.me/${waPhone}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reply on WhatsApp</span>
                      </a>
                    )}

                    {inq.phone && (
                      <a
                        href={`tel:${inq.phone}`}
                        className="px-3.5 py-2 border border-stone-300 bg-white hover:border-stone-900 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteAtelierInquiry(inq.id)}
                    className="px-3 py-2 border border-stone-200 hover:border-stone-900 text-stone-500 hover:text-stone-950 text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
