/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Phone,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  UserCheck,
} from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { SHINGAAR_BRANCHES, SHINGAR_CONTACT_DETAILS } from '../data/seedData';
import { BranchLocatorSection } from '../components/BranchLocatorSection';

export const ContactPage: React.FC = () => {
  const { user, submitAtelierInquiry } = useAtelier();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    SHINGAAR_BRANCHES[0]?.name || 'Shingar Dresses (M.G. Road Main Shop)'
  );
  const [dressReference, setDressReference] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!name && user.displayName) setName(user.displayName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user, name, email]);

  useEffect(() => {
    const dressParam = searchParams.get('dress');
    if (dressParam) setDressReference(dressParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await submitAtelierInquiry({
        name,
        email,
        phone,
        preferredDate,
        dressReference: dressReference || 'General Shop Question',
        message,
      });
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Could not send message.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-white min-h-screen text-stone-900">
      {/* Header */}
      <section className="bg-stone-50 border-b border-stone-200 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs text-stone-500">
              Shingar Dresses &amp; Shingar NX · Junagadh
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl text-stone-950 tracking-tight">
              Contact &amp; Shop Timings
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Call or WhatsApp us anytime for clothes, sizes, or school uniforms.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Numbers + Simple Message Form */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Left: Phone, WhatsApp & Instagram */}
          <div className="lg:col-span-5">
            <div className="border border-stone-200 p-5 sm:p-7 bg-stone-50 space-y-6">
              <div>
                <p className="text-xs text-stone-500">Call or Message Us</p>
                <h2 className="font-serif text-2xl text-stone-950 mt-0.5">
                  Phone &amp; WhatsApp Numbers
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                {SHINGAR_CONTACT_DETAILS.whatsappNumbers.map((item) => (
                  <div
                    key={item.raw}
                    className="flex items-center justify-between p-3 bg-white border border-stone-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-stone-700 shrink-0" />
                      <div>
                        <p className="text-[11px] text-stone-500">{item.label}</p>
                        <a
                          href={`tel:+${item.raw}`}
                          className="font-mono font-semibold text-stone-950 hover:text-stone-600"
                        >
                          {item.number}
                        </a>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${item.raw}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white border border-stone-200">
                    <p className="text-[11px] text-stone-500">Shop Landline</p>
                    <a
                      href="tel:+912852651406"
                      className="font-mono text-xs font-semibold text-stone-900 mt-0.5 block"
                    >
                      {SHINGAR_CONTACT_DETAILS.landline}
                    </a>
                  </div>
                  <div className="p-3 bg-white border border-stone-200">
                    <p className="text-[11px] text-stone-500 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-stone-700" />
                      <span>Owner ({SHINGAR_CONTACT_DETAILS.ownerName})</span>
                    </p>
                    <a
                      href="tel:+919428241901"
                      className="font-mono text-xs font-semibold text-stone-900 mt-0.5 block"
                    >
                      {SHINGAR_CONTACT_DETAILS.ownerPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Instagram Pages */}
              <div className="pt-4 border-t border-stone-200 space-y-2.5">
                <p className="text-xs font-medium text-stone-600">
                  Our Instagram Pages
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SHINGAR_CONTACT_DETAILS.instagramHandles.map((ig) => (
                    <a
                      key={ig.handle}
                      href={ig.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-stone-300 bg-white hover:border-stone-950 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-mono font-semibold text-stone-950">
                          {ig.handle}
                        </p>
                        <p className="text-[11px] text-stone-500">{ig.label}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Simple Message Form */}
          <div className="lg:col-span-7">
            <div className="border border-stone-200 p-5 sm:p-8 bg-white">
              <div className="mb-5">
                <h2 className="font-serif text-2xl sm:text-3xl text-stone-950">
                  Send Us a Message
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  Have a question about a cloth, size, or school uniform? Write to us
                  below.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-stone-50 border border-stone-200 space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-800 font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Message Sent!</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Thank you. Our shop team at <strong>{preferredDate}</strong> will
                    call or message you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 bg-stone-950 text-white text-xs font-medium cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-stone-100 border border-stone-300 text-xs text-stone-900">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98251 21298"
                        className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Which Shop Branch?
                      </label>
                      <select
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-stone-300 text-sm bg-white focus:outline-none focus:border-stone-900"
                      >
                        {SHINGAAR_BRANCHES.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Cloth Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={dressReference}
                      onChange={(e) => setDressReference(e.target.value)}
                      placeholder="e.g. Kurta-Pyjama, Jeans, School Uniform"
                      className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write what you are looking for..."
                      className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Single Interactive Store Locator (No Duplicate Branch Cards) */}
      <BranchLocatorSection />
    </main>
  );
};
