/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Tag, Sparkles } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { CoutureArtwork } from '../components/CoutureArtwork';
import { HERO_BANNER_IMAGE, SHINGAAR_BRANCHES } from '../data/seedData';

export const HomePage: React.FC = () => {
  const { collections, categories, offers } = useAtelier();

  const featuredItems = collections.filter((item) => item.featured).slice(0, 3);
  const latestItems = collections.slice(0, 6);
  const activeOffers = offers.filter((offer) => offer.active).slice(0, 2);

  return (
    <main className="bg-white text-stone-900">
      {/* 1. Storefront Hero Section */}
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 px-4 sm:px-8 lg:px-14 py-12 sm:py-20 lg:py-24 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Autumn–Winter 2026 Showcase</span>
                <span aria-hidden="true">·</span>
                <span>Mumbai · New Delhi · Jaipur · Surat</span>
              </div>

              <h1
                className="font-serif text-stone-950 font-normal tracking-tight leading-[1.08] max-w-xl"
                style={{ fontSize: 'clamp(2.5rem, 4.2vw, 4.25rem)', textWrap: 'balance' }}
              >
                Timeless Indian Couture &amp; Heritage Silks.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                Discover hand-embroidered bridal lehengas, pure Katan Banarasi weaves,
                floor-length Anarkalis, and contemporary festive silhouettes crafted for
                private in-store fittings at Shingar Dresses.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/collection"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-stone-950 text-white text-sm font-medium hover:bg-rose-900 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/lookbook"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-stone-300 bg-white text-stone-900 text-sm font-medium hover:border-stone-900 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>View Lookbook</span>
                </Link>
              </div>
            </div>

            <div className="pt-12 mt-12 border-t border-stone-200 grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-stone-500">Showrooms</p>
                <p className="text-sm font-semibold text-stone-900 mt-0.5">
                  4 Flagship Cities
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Craftsmanship</p>
                <p className="text-sm font-semibold text-stone-900 mt-0.5">
                  Handloom &amp; Zardozi
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Consultation</p>
                <p className="text-sm font-semibold text-stone-900 mt-0.5">
                  In-Store Showcase
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative min-h-[420px] sm:min-h-[540px] lg:min-h-[680px] bg-stone-200 overflow-hidden">
            <img
              src={HERO_BANNER_IMAGE}
              alt="Shingar Dresses Bridal Couture Showcase"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent flex items-end p-6 sm:p-10">
              <div className="text-white max-w-md">
                <p className="text-xs uppercase tracking-widest text-stone-200 mb-1">
                  Signature Bridal Edit
                </p>
                <p className="font-serif text-2xl sm:text-3xl leading-snug">
                  The Royal Sindoor &amp; Antique Zari Trousseau
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Clothing Showcase */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs text-rose-900 font-medium uppercase tracking-widest mb-2">
              Curated Spotlight
            </p>
            <h2
              className="font-serif text-3xl sm:text-4xl text-stone-950 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Featured Clothing
            </h2>
          </div>
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 hover:text-rose-900 transition-colors whitespace-nowrap shrink-0"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(featuredItems.length > 0 ? featuredItems : latestItems.slice(0, 3)).map(
            (item) => (
              <Link
                key={item.id}
                to={`/collection?piece=${encodeURIComponent(item.id)}`}
                className="group flex flex-col border border-stone-200 bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
                  <CoutureArtwork
                    src={item.imageUrl}
                    alt={item.title}
                    title={item.title}
                    subtitle={item.category}
                    sku={item.sku}
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{item.sku}</span>
                    </div>
                    <h3 className="font-serif text-2xl text-stone-950 group-hover:text-rose-900 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-stone-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-sm font-mono tabular-nums font-medium text-stone-900">
                      {item.price > 0
                        ? `₹${item.price.toLocaleString('en-IN')}`
                        : 'Price on Request'}
                    </span>
                    <span className="text-xs font-medium text-rose-900 inline-flex items-center gap-1">
                      <span>Inspect Piece</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      {/* 3. Latest Collections & Categories */}
      <section className="bg-stone-50 border-b border-stone-200 py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">
                Departments &amp; Silhouettes
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 tracking-tight">
                Latest Collections
              </h2>
            </div>
            <Link
              to="/collection"
              className="text-sm font-medium text-stone-800 hover:text-rose-900 inline-flex items-center gap-1.5"
            >
              <span>Browse All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Quick Navigation Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {categories.slice(0, 5).map((cat) => {
              const count = collections.filter((c) => c.category === cat.name).length;
              return (
                <Link
                  key={cat.id}
                  to={`/collection?category=${encodeURIComponent(cat.name)}`}
                  className="p-5 bg-white border border-stone-200 hover:border-stone-900 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-mono text-stone-400 tabular-nums">
                      {count} {count === 1 ? 'Piece' : 'Pieces'}
                    </p>
                    <h3 className="font-serif text-xl text-stone-950 mt-1">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <span className="mt-4 text-xs font-medium text-rose-900 inline-flex items-center gap-1">
                    <span>View Category</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Latest Arrivals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {latestItems.map((item) => (
              <Link
                key={item.id}
                to={`/collection?piece=${encodeURIComponent(item.id)}`}
                className="group bg-white border border-stone-200 flex flex-col hover:border-stone-400 transition-colors"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
                  <CoutureArtwork
                    src={item.imageUrl}
                    alt={item.title}
                    title={item.title}
                    subtitle={item.category}
                    sku={item.sku}
                    className="w-full h-full"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{item.category}</span>
                    <span className="font-mono tabular-nums text-stone-900 font-medium">
                      {item.price > 0
                        ? `₹${item.price.toLocaleString('en-IN')}`
                        : 'Price on Request'}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-stone-950 group-hover:text-rose-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 truncate">{item.fabric}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Promotional Offers & Lookbook Preview Split */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Active Offers Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-end justify-between border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs text-rose-900 uppercase tracking-widest font-medium mb-1">
                  In-Store Privileges
                </p>
                <h2 className="font-serif text-3xl text-stone-950">
                  Current Promotional Offers
                </h2>
              </div>
              <Link
                to="/offers"
                className="text-sm font-medium text-stone-900 hover:text-rose-900 inline-flex items-center gap-1 whitespace-nowrap"
              >
                <span>All Offers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="border border-stone-200 bg-white flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                    <CoutureArtwork
                      src={offer.posterUrl}
                      alt={offer.title}
                      title={offer.title}
                      subtitle={offer.privilegeBadge}
                      sku={offer.privilegeCode}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <p className="text-xs text-rose-900 font-medium">
                        {offer.privilegeBadge} · {offer.validUntil}
                      </p>
                      <h3 className="font-serif text-xl text-stone-950">{offer.title}</h3>
                      <p className="text-xs text-stone-600 line-clamp-2">
                        {offer.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500">Store Code:</span>
                      <span className="font-mono font-semibold text-stone-900">
                        {offer.privilegeCode}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Lookbook & Store Visit Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-end justify-between border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">
                  Visual Archive
                </p>
                <h2 className="font-serif text-3xl text-stone-950">
                  Editorial Lookbook
                </h2>
              </div>
              <Link
                to="/lookbook"
                className="text-sm font-medium text-stone-900 hover:text-rose-900 inline-flex items-center gap-1 whitespace-nowrap"
              >
                <span>Open Gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="border border-stone-200 bg-stone-50 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {collections.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    to="/lookbook"
                    className="group block aspect-[3/4] overflow-hidden bg-stone-200"
                  >
                    <CoutureArtwork
                      src={item.imageUrl}
                      alt={item.title}
                      title={item.title}
                      sku={item.sku}
                      className="w-full h-full"
                    />
                  </Link>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-stone-950">
                  2026 Bridal &amp; Festive Lookbook
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Explore high-resolution studio portraits of our handloom sarees,
                  bridal lehengas, and festive silhouettes across three seasonal chapters.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/lookbook"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-rose-900 transition-colors"
                >
                  <span>Browse Lookbook Photos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-300 bg-white text-stone-900 text-xs font-medium hover:border-stone-900 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-900" />
                  <span>Our Store Locations ({SHINGAAR_BRANCHES.length})</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
