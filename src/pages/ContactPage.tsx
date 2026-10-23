/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  Send,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { SHINGAAR_BRANCHES } from '../data/seedData';
import { BranchLocatorSection } from '../components/BranchLocatorSection';

export const ContactPage: React.FC = () => {
  const { user, submitAtelierInquiry } = useAtelier();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    'Mumbai — Kala Ghoda Flagship'
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
        dressReference: dressReference || 'General Store Inquiry',
        message,
      });
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to submit inquiry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-white min-h-screen text-stone-900">
      {/* Header */}
      <section className="bg-stone-50 border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Concierge &amp; Appointments</span>
              <span aria-hidden="true">·</span>
              <span>Mumbai · New Delhi · Jaipur · Surat</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-stone-950 tracking-tight">
              Contact &amp; Store Hours
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Reach out to our showroom stylists for garment availability, private bridal
              appointments, or store directions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Details + Inquiry Form */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-16 border-b border-stone-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Store Details, Hours & Social Links */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border border-stone-200 p-6 sm:p-8 bg-stone-50 space-y-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-rose-900">
                  Flagship Showroom
                </p>
                <h2 className="font-serif text-2xl text-stone-950 mt-1">
                  Shingar Dresses — Mumbai Flagship
                </h2>
              </div>

              <div className="space-y-3 text-sm text-stone-700">
                <p className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rose-900 shrink-0 mt-1" />
                  <span>
                    14 Rampart Row, Heritage Precinct, Kala Ghoda, Fort, Mumbai 400001
                  </span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>+91 22 2284 7900</span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>concierge@shingardresses.com</span>
                </p>
                <p className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Monday – Sunday · 11:00 AM – 8:30 PM IST</span>
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Official Social Channels
                </p>
                <div className="flex flex-wrap gap-3 text-xs font-medium">
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 border border-stone-300 bg-white text-stone-800 hover:border-stone-900 inline-flex items-center gap-1.5"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.pinterest.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 border border-stone-300 bg-white text-stone-800 hover:border-stone-900 inline-flex items-center gap-1.5"
                  >
                    <span>Pinterest</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 border border-stone-300 bg-white text-stone-800 hover:border-stone-900 inline-flex items-center gap-1.5"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Regional Branches Quick List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Regional Showrooms
              </h3>
              <div className="space-y-3">
                {SHINGAAR_BRANCHES.slice(1).map((branch) => (
                  <div
                    key={branch.id}
                    className="border border-stone-200 p-4 bg-white space-y-1 text-xs"
                  >
                    <p className="font-semibold text-stone-900">{branch.name}</p>
                    <p className="text-stone-600">{branch.address}</p>
                    <p className="text-stone-500">
                      {branch.phone} · {branch.hours}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Store Inquiry / Appointment Form */}
          <div className="lg:col-span-7">
            <div className="border border-stone-200 p-6 sm:p-10 bg-white">
              <div className="mb-6">
                <h2 className="font-serif text-3xl text-stone-950">
                  Book a Store Visit or Garment Inquiry
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  Submit your preferred showroom and garment reference. If you are not yet
                  signed in, you will be prompted to sign in with Google to verify your
                  contact details.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-stone-50 border border-stone-200 space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-800 font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Your showroom inquiry has been registered.</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Our stylist team at <strong>{preferredDate}</strong> has received your
                    request and will coordinate your in-store viewing.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 bg-stone-950 text-white text-xs font-medium"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-900">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1.5">
                        Email Address *
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
                      <label className="block text-xs font-medium text-stone-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98201 74500"
                        className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1.5">
                        Preferred Showroom Branch
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
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Garment or Offer Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={dressReference}
                      onChange={(e) => setDressReference(e.target.value)}
                      placeholder="e.g. Arundhati Sindoor Zardozi Lehenga (SHG-BL-101)"
                      className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Message &amp; Preferred Visit Date *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your preferred appointment date, bridal/festive requirements, or questions..."
                      className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-rose-900 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting Inquiry...' : 'Submit Store Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <BranchLocatorSection />
    </main>
  );
};
