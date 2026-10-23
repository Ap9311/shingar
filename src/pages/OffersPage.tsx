/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ArrowRight, MapPin } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { CoutureArtwork } from '../components/CoutureArtwork';

export const OffersPage: React.FC = () => {
  const { offers } = useAtelier();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeOffers = offers.filter((o) => o.active);
  const displayOffers = activeOffers.length > 0 ? activeOffers : offers;

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="bg-white min-h-screen text-stone-900">
      <section className="bg-stone-50 border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>In-Store Privileges</span>
              <span aria-hidden="true">·</span>
              <span>Valid Across All Showrooms</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-stone-950 tracking-tight">
              Promotional Offers
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Present any of the promotional reference codes below during your visit to
              our Shingar Dresses (M.G. Road) or Shingar NX (Motibaug Road) showrooms in
              Junagadh to redeem seasonal privileges.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          {displayOffers.map((offer) => (
            <article
              key={offer.id}
              className="border border-stone-200 bg-white grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
            >
              <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:min-h-[360px] bg-stone-100">
                <CoutureArtwork
                  src={offer.posterUrl}
                  alt={offer.title}
                  title={offer.title}
                  subtitle={offer.privilegeBadge}
                  sku={offer.privilegeCode}
                  className="w-full h-full"
                />
              </div>

              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-800 font-semibold">
                    <span>{offer.privilegeBadge}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-500 font-normal">{offer.validUntil}</span>
                  </div>

                  <h2 className="font-serif text-3xl text-stone-950">{offer.title}</h2>
                  <p className="text-sm font-medium text-stone-800">{offer.subtitle}</p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[11px] text-stone-500">Showroom Reference Code</p>
                      <p className="font-mono text-base font-semibold text-stone-950">
                        {offer.privilegeCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.privilegeCode)}
                      className="px-3 py-2 border border-stone-300 text-xs font-medium text-stone-800 hover:border-stone-900 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode === offer.privilegeCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/contact?dress=${encodeURIComponent(
                        `Offer Redemption: ${offer.privilegeCode}`
                      )}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
                    >
                      <span>Book Showroom Visit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-stone-300 text-xs font-medium text-stone-800 hover:border-stone-900"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stone-700" />
                      <span>Store Locations</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
