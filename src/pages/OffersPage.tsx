/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ExternalLink, Store } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { CoutureArtwork } from '../components/CoutureArtwork';
import { SHINGAAR_BRANCHES } from '../data/seedData';

export const OffersPage: React.FC = () => {
  const { offers } = useAtelier();

  const activeOffers = offers.filter((o) => o.active);
  const displayOffers = activeOffers.length > 0 ? activeOffers : offers;

  return (
    <main className="bg-white min-h-screen text-stone-900">
      <section className="bg-stone-50 border-b border-stone-200 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs text-stone-500">
              In-Store Sales · No Coupon Needed
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl text-stone-950 tracking-tight">
              Store Offers &amp; Sales
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Current sales going on at our M.G. Road and Shingar NX (Motibaug Road)
              shops in Junagadh. Visit our branches directly to buy.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="space-y-8">
          {displayOffers.map((offer) => (
            <article
              key={offer.id}
              className="border border-stone-200 bg-white grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
            >
              <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:min-h-[340px] bg-stone-100">
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
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-stone-950 text-white font-medium">
                      {offer.privilegeBadge}
                    </span>
                    <span className="text-stone-500">{offer.validUntil}</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-950">
                    {offer.title}
                  </h2>
                  <p className="text-sm font-medium text-stone-800">{offer.subtitle}</p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
                    <Store className="w-4 h-4 text-stone-900 shrink-0" />
                    <span>Sale is live in-store — visit our Junagadh branch to purchase</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={SHINGAAR_BRANCHES[0].directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-stone-300 text-xs font-medium text-stone-900 hover:border-stone-950"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stone-700" />
                      <span>M.G. Road Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={SHINGAAR_BRANCHES[1].directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-stone-300 text-xs font-medium text-stone-900 hover:border-stone-950"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stone-700" />
                      <span>Shingar NX Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
                    >
                      <span>Contact Shop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
