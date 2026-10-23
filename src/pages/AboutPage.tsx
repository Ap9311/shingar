/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import {
  ABOUT_BOUTIQUE_IMAGE,
  HERO_SLIDES,
  SHINGAR_CONTACT_DETAILS,
  INITIAL_CATEGORIES,
} from '../data/seedData';
import { BranchLocatorSection } from '../components/BranchLocatorSection';

export const AboutPage: React.FC = () => {
  const divisionsScrollRef = useRef<HTMLDivElement>(null);

  const scrollDivisions = (direction: 'left' | 'right') => {
    if (!divisionsScrollRef.current) return;
    const container = divisionsScrollRef.current;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 16 : 300;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      if (container.scrollLeft >= maxScrollLeft - 12) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 12) {
        container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  return (
    <main className="bg-white text-stone-900 overflow-x-hidden">
      {/* Shop Story */}
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-700 font-medium">
              <Award className="w-4 h-4" />
              <span>Serving Junagadh Since {SHINGAR_CONTACT_DETAILS.establishedYear}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-stone-950 leading-tight tracking-tight">
              About Shingar Dresses &amp; Shingar NX
            </h1>

            <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
              Started in 1987 in Junagadh, Gujarat,{' '}
              <strong className="text-stone-950">Shingar Dresses</strong> is a trusted
              family clothing shop for over 39 years. We also run{' '}
              <strong className="text-stone-950">Shingar NX</strong> for youth
              streetwear and modern casual wear.
            </p>

            <p className="text-sm text-stone-600 leading-relaxed">
              At our <strong>M.G. Road Main Shop</strong> (Jenellie Shopping Centre, near
              Ranavav Chowk) and <strong>Shingar NX on Motibaug Road</strong> (Above Bata
              Showroom), we offer Men&apos;s Kurta-Pyjamas, wedding wear, t-shirts, jeans,
              kids&apos; fancy dresses, and school uniforms.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-200">
              <div>
                <p className="text-xs text-stone-500">Started In</p>
                <p className="font-serif text-2xl text-stone-950 mt-0.5">1987</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Junagadh Shops</p>
                <p className="font-serif text-2xl text-stone-950 mt-0.5">2 Branches</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-stone-500">Owner</p>
                <p className="font-serif text-xl text-stone-950 mt-0.5">
                  {SHINGAR_CONTACT_DETAILS.ownerName}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 px-5 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                <span>View Clothes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 bg-white text-stone-900 text-xs font-medium hover:border-stone-900 transition-colors"
              >
                <span>Phone &amp; Timings</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden bg-stone-200 border border-stone-200">
              <img
                src={HERO_SLIDES[0].imageUrl}
                alt="Shingar Dresses Menswear"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden bg-stone-200 border border-stone-200 mt-6 sm:mt-8">
              <img
                src={ABOUT_BOUTIQUE_IMAGE}
                alt="Shingar NX Showroom"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Sell — 5 Clothing Divisions (Horizontally Scrollable) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-stone-500 mb-1">What We Sell</p>
            <h2 className="font-serif text-2xl sm:text-4xl text-stone-950">
              Our 5 Clothing Sections
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollDivisions('left')}
              aria-label="Scroll Left"
              className="px-3.5 py-2 border border-stone-300 bg-white hover:border-stone-950 text-stone-900 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => scrollDivisions('right')}
              aria-label="Scroll Right"
              className="px-3.5 py-2 border border-stone-950 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={divisionsScrollRef}
          className="w-full flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3"
        >
          {INITIAL_CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.name}
              to={`/collection?category=${encodeURIComponent(cat.name)}`}
              className="snap-center sm:snap-start shrink-0 w-full sm:w-[310px] md:w-[340px] border border-stone-200 p-6 bg-white hover:border-stone-950 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-mono text-stone-500">0{idx + 1}</p>
                <h3 className="font-serif text-2xl text-stone-950">{cat.name}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <span className="pt-3 border-t border-stone-100 text-xs font-medium text-stone-900 inline-flex items-center justify-between">
                <span>View Clothes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Single Interactive Store Locator for Both Junagadh Shops (No Duplicate Cards) */}
      <BranchLocatorSection />
    </main>
  );
};
