/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Camera,
  MapPin,
} from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { CoutureArtwork } from '../components/CoutureArtwork';
import { HERO_SLIDES } from '../data/seedData';

export const HomePage: React.FC = () => {
  const { collections, categories } = useAtelier();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const deptScrollRef = useRef<HTMLDivElement>(null);
  const spotlightScrollRef = useRef<HTMLDivElement>(null);
  const latestScrollRef = useRef<HTMLDivElement>(null);

  // Automatically loop hero images again and again (no manual user buttons)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[activeSlideIndex] || HERO_SLIDES[0];
  const featuredItems = collections.filter((item) => item.featured);
  const spotlightList = featuredItems.length > 0 ? featuredItems : collections;
  const latestItems = collections;

  const scrollHorizontal = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return;
    const container = ref.current;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const step = firstCard
      ? firstCard.offsetWidth + 16
      : Math.max(280, Math.round(container.clientWidth * 0.85));
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
      {/* 1. Hero Section — Fixed Main Text + Auto-Looping Images */}
      <section className="relative border-b border-stone-200 bg-stone-950 text-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[520px] sm:min-h-[580px] lg:min-h-[640px]">
          {/* Left Column: Permanent Static Main Text */}
          <div className="lg:col-span-6 px-4 sm:px-8 lg:px-14 py-10 sm:py-16 flex flex-col justify-between z-10 bg-stone-950">
            <div className="space-y-5 my-auto">
              <div className="inline-flex items-center gap-2 text-xs text-stone-300 border border-stone-800 bg-stone-900 px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Shingar Dresses &amp; Shingar NX · Junagadh</span>
              </div>

              <h1
                className="font-serif text-white font-normal tracking-tight leading-[1.08]"
                style={{
                  fontSize: 'clamp(2.1rem, 4vw, 3.6rem)',
                  textWrap: 'balance',
                }}
              >
                Quality Clothes for Men, Kids &amp; Family Since 1987.
              </h1>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
                Visit our M.G. Road and Motibaug Road shops in Junagadh for Men&apos;s
                Kurta-Pyjamas, Shingar NX Streetwear, Kids&apos; Fancy Dresses, Festive
                Wear, and School Uniforms.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/collection"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-stone-950 text-xs sm:text-sm font-medium hover:bg-stone-200 transition-colors"
                >
                  <span>View Clothes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/offers"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-stone-700 text-stone-200 text-xs sm:text-sm font-medium hover:border-white hover:text-white transition-colors"
                >
                  <span>Store Offers</span>
                </Link>
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-400">
              <div>
                <p className="text-[11px] text-stone-500">Branch 1 (Main Shop)</p>
                <p className="text-stone-200 font-medium mt-0.5">
                  M.G. Road, Junagadh
                </p>
              </div>
              <div>
                <p className="text-[11px] text-stone-500">Branch 2 (Streetwear)</p>
                <p className="text-stone-200 font-medium mt-0.5">
                  Shingar NX, Motibaug Road
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[11px] text-stone-500">Shop Timings</p>
                <p className="text-stone-200 font-medium mt-0.5">
                  10:00 AM – 10:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Auto-Looping Hero Photos */}
          <div className="lg:col-span-6 relative min-h-[340px] sm:min-h-[440px] lg:min-h-full bg-stone-900 overflow-hidden select-none pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide.imageUrl}
                src={currentSlide.imageUrl}
                alt="Shingar Dresses Junagadh"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full object-cover object-top"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end p-5 sm:p-10">
              <div className="text-white max-w-md">
                <p className="text-xs text-stone-300 mb-1">{currentSlide.tag}</p>
                <p className="font-serif text-xl sm:text-2xl leading-snug">
                  {currentSlide.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category — Centered on Mobile & Scrollable */}
      <section className="bg-stone-50 border-b border-stone-200 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <p className="text-xs text-stone-500 mb-1">Our Clothing Types</p>
              <h2 className="font-serif text-2xl sm:text-4xl text-stone-950 tracking-tight">
                Shop by Category
              </h2>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollHorizontal(deptScrollRef, 'left')}
                  aria-label="Previous Categories"
                  className="px-3.5 py-2 border border-stone-300 bg-white hover:border-stone-950 text-stone-900 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontal(deptScrollRef, 'right')}
                  aria-label="Next Categories"
                  className="px-3.5 py-2 border border-stone-950 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <Link
                to="/collection"
                className="text-xs font-medium text-stone-900 hover:underline inline-flex items-center gap-1 pl-2"
              >
                <span>See All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div
            ref={deptScrollRef}
            className="w-full flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3"
          >
            {categories.map((cat) => {
              const count = collections.filter((c) => c.category === cat.name).length;
              return (
                <Link
                  key={cat.id}
                  to={`/collection?category=${encodeURIComponent(cat.name)}`}
                  className="snap-center sm:snap-start shrink-0 w-full sm:w-[300px] md:w-[320px] group p-5 sm:p-6 bg-white border border-stone-200 hover:border-stone-950 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Category</span>
                      <span>
                        {count} {count === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-stone-950 mt-2 group-hover:text-stone-600 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <span className="mt-5 pt-3 border-t border-stone-100 text-xs font-medium text-stone-900 inline-flex items-center justify-between">
                    <span>See Clothes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Popular Clothes — Centered on Mobile & Scrollable */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-14 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs text-stone-500 mb-1">Most Liked in Shop</p>
            <h2 className="font-serif text-2xl sm:text-4xl text-stone-950 tracking-tight">
              Popular Clothes
            </h2>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollHorizontal(spotlightScrollRef, 'left')}
                aria-label="Previous Popular Clothes"
                className="px-3.5 py-2 border border-stone-300 bg-white hover:border-stone-950 text-stone-900 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => scrollHorizontal(spotlightScrollRef, 'right')}
                aria-label="Next Popular Clothes"
                className="px-3.5 py-2 border border-stone-950 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link
              to="/collection"
              className="text-xs font-medium text-stone-900 hover:underline inline-flex items-center gap-1 pl-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div
          ref={spotlightScrollRef}
          className="w-full flex items-stretch gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3"
        >
          {spotlightList.map((item) => (
            <Link
              key={item.id}
              to={`/collection?piece=${encodeURIComponent(item.id)}`}
              className="snap-center sm:snap-start shrink-0 w-full sm:w-[320px] md:w-[360px] group flex flex-col border border-stone-200 bg-white hover:border-stone-950 transition-all duration-200"
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
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-stone-500 truncate">{item.category}</p>
                  <h3 className="font-serif text-xl sm:text-2xl text-stone-950 group-hover:text-stone-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-sm font-mono tabular-nums font-semibold text-stone-950">
                    {item.price > 0
                      ? `₹${item.price.toLocaleString('en-IN')}`
                      : 'Ask Price in Shop'}
                  </span>
                  <span className="text-xs font-medium text-stone-900 inline-flex items-center gap-1">
                    <span>See Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. New Arrivals — Centered on Mobile & Scrollable */}
      <section className="bg-stone-50 border-b border-stone-200 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <p className="text-xs text-stone-500 mb-1">Fresh Stock at Both Shops</p>
              <h2 className="font-serif text-2xl sm:text-4xl text-stone-950 tracking-tight">
                New Arrivals
              </h2>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollHorizontal(latestScrollRef, 'left')}
                  aria-label="Previous New Arrivals"
                  className="px-3.5 py-2 border border-stone-300 bg-white hover:border-stone-950 text-stone-900 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontal(latestScrollRef, 'right')}
                  aria-label="Next New Arrivals"
                  className="px-3.5 py-2 border border-stone-950 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <Link
                to="/collection"
                className="text-xs font-medium text-stone-900 hover:underline inline-flex items-center gap-1 pl-2"
              >
                <span>See All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div
            ref={latestScrollRef}
            className="w-full flex items-stretch gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3"
          >
            {latestItems.map((item) => (
              <Link
                key={item.id}
                to={`/collection?piece=${encodeURIComponent(item.id)}`}
                className="snap-center sm:snap-start shrink-0 w-full sm:w-[290px] md:w-[310px] group bg-white border border-stone-200 flex flex-col hover:border-stone-950 transition-colors"
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
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="truncate pr-2">{item.category}</span>
                    <span className="font-mono tabular-nums text-stone-900 font-semibold shrink-0">
                      {item.price > 0
                        ? `₹${item.price.toLocaleString('en-IN')}`
                        : 'Ask Price'}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-stone-950 group-hover:text-stone-600 transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 truncate">{item.fabric}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Store Photo Gallery (Lookbook) Preview */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="border border-stone-200 bg-stone-50 p-5 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs text-stone-500">Photo Gallery</p>
            <h2 className="font-serif text-2xl sm:text-4xl text-stone-950">
              See Our Lookbook Photos
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              View photos of our latest Kurta-Pyjamas, Shingar NX youth streetwear,
              festive dresses, and kids&apos; wear.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/lookbook"
                className="inline-flex items-center gap-2 px-5 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Lookbook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 bg-white text-stone-900 text-xs font-medium hover:border-stone-950 transition-colors"
              >
                <span>Shop Addresses &amp; Phone</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {collections.slice(0, 3).map((item, idx) => (
              <Link
                key={item.id}
                to="/lookbook"
                className={`group block aspect-[3/4] overflow-hidden bg-stone-200 border border-stone-200 ${
                  idx === 2 ? 'col-span-2 sm:col-span-1' : ''
                }`}
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
        </div>
      </section>
    </main>
  );
};
