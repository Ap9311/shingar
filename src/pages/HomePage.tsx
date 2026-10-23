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

const HOME_SECTIONS = [
  { id: 'section-hero', number: '01', label: 'Main Showcase' },
  { id: 'section-departments', number: '02', label: 'Explore by Department' },
  { id: 'section-spotlight', number: '03', label: 'Curated Spotlight' },
  { id: 'section-latest', number: '04', label: "Ethnic, Casual & Kids' Edit" },
  { id: 'section-lookbook', number: '05', label: 'Fashion Lookbook' },
];

export const HomePage: React.FC = () => {
  const { collections, categories } = useAtelier();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState('section-hero');

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

  // Track which section the user is currently viewing on the Home Page
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 240;
      let current = HOME_SECTIONS[0].id;
      for (const sec of HOME_SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPosition) {
          current = sec.id;
        }
      }
      setActiveSectionId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    const scrollAmount = Math.max(300, Math.round(container.clientWidth * 0.75));
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      if (container.scrollLeft >= maxScrollLeft - 16) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 16) {
        container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeSectionMeta =
    HOME_SECTIONS.find((s) => s.id === activeSectionId) || HOME_SECTIONS[0];

  return (
    <main className="bg-white text-stone-900">
      {/* Sticky Section Wayfinding Bar so user always knows where they are */}
      <div className="sticky top-16 sm:top-20 z-30 bg-stone-100/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="px-2 py-0.5 bg-stone-950 text-white font-mono text-[10px] uppercase tracking-wider">
              Home · Section {activeSectionMeta.number}
            </span>
            <span className="font-medium text-stone-900 whitespace-nowrap">
              {activeSectionMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {HOME_SECTIONS.map((sec) => {
              const isCurrent = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isCurrent
                      ? 'bg-stone-950 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-900 hover:text-stone-950'
                  }`}
                >
                  {sec.number}. {sec.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 01. Main Showcase Hero — Fixed Static Text + Auto-Looping Images */}
      <section
        id="section-hero"
        className="relative border-b border-stone-200 bg-stone-950 text-white overflow-hidden scroll-mt-28"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[540px] sm:min-h-[600px] lg:min-h-[660px]">
          {/* Left Column: Permanent Static Main Text */}
          <div className="lg:col-span-6 px-4 sm:px-8 lg:px-14 py-12 sm:py-16 lg:py-20 flex flex-col justify-between z-10 bg-stone-950">
            <div className="space-y-6 my-auto">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-stone-300 border border-stone-800 bg-stone-900 px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Shingar Dresses &amp; Shingar NX · Junagadh</span>
              </div>

              <h1
                className="font-serif text-white font-normal tracking-tight leading-[1.06]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.85rem)',
                  textWrap: 'balance',
                }}
              >
                Signature Menswear, Streetwear &amp; Family Festive Fashion.
              </h1>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
                Welcome to Junagadh&apos;s premier fashion showcase. Explore royal silk
                kurta-pyjamas, Indo-Western wedding ensembles, Shingar NX youth
                streetwear, traditional festive wear, and school uniforms across our
                M.G. Road and Motibaug Road showrooms.
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/collection"
                  className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 bg-white text-stone-950 text-xs sm:text-sm font-medium hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Full Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/lookbook"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-stone-700 text-stone-200 text-xs sm:text-sm font-medium hover:border-white hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Open Lookbook</span>
                </Link>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-400">
              <div>
                <p className="font-mono uppercase text-[10px] text-stone-500">
                  Flagship Showroom
                </p>
                <p className="text-stone-200 font-medium mt-0.5">
                  M.G. Road, Junagadh
                </p>
              </div>
              <div>
                <p className="font-mono uppercase text-[10px] text-stone-500">
                  Youth &amp; Streetwear
                </p>
                <p className="text-stone-200 font-medium mt-0.5">
                  Shingar NX, Motibaug Road
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-mono uppercase text-[10px] text-stone-500">
                  Store Timings
                </p>
                <p className="text-stone-200 font-medium mt-0.5">
                  10:00 AM – 10:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Continuously Looping Hero Photography (No User Next/Back Controls) */}
          <div className="lg:col-span-6 relative min-h-[380px] sm:min-h-[460px] lg:min-h-full bg-stone-900 overflow-hidden select-none pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide.imageUrl}
                src={currentSlide.imageUrl}
                alt="Shingar Dresses Showcase"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full object-cover object-top"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end p-6 sm:p-10">
              <div className="text-white max-w-md">
                <p className="text-[11px] font-mono uppercase tracking-widest text-stone-300 mb-1">
                  {currentSlide.tag}
                </p>
                <p className="font-serif text-xl sm:text-2xl leading-snug">
                  {currentSlide.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Explore by Department — Horizontal Left-to-Right / Right-to-Left Carousel */}
      <section
        id="section-departments"
        className="bg-stone-50 border-b border-stone-200 py-12 sm:py-16 scroll-mt-28"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 mb-1.5">
                <span className="px-2 py-0.5 bg-stone-200 text-stone-900 font-semibold">
                  Section 02
                </span>
                <span>Shingar Dresses &amp; Shingar NX</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 tracking-tight">
                Explore by Department
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollHorizontal(deptScrollRef, 'left')}
                  aria-label="Previous Departments"
                  className="px-3.5 py-2 border border-stone-300 bg-white hover:border-stone-950 text-stone-900 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontal(deptScrollRef, 'right')}
                  aria-label="Next Departments"
                  className="px-3.5 py-2 border border-stone-950 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <Link
                to="/collection"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-900 hover:underline pl-2"
              >
                <span>All Departments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div
            ref={deptScrollRef}
            className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3"
          >
            {categories.map((cat, index) => {
              const count = collections.filter((c) => c.category === cat.name).length;
              return (
                <Link
                  key={cat.id}
                  to={`/collection?category=${encodeURIComponent(cat.name)}`}
                  className="snap-start shrink-0 w-[270px] sm:w-[310px] group p-6 bg-white border border-stone-200 hover:border-stone-950 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 tabular-nums">
                      <span>Dept 0{index + 1}</span>
                      <span>
                        {count} {count === 1 ? 'Design' : 'Designs'}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-stone-950 mt-2 group-hover:text-stone-600 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <span className="mt-6 pt-3 border-t border-stone-100 text-xs font-medium text-stone-900 inline-flex items-center justify-between">
                    <span>Open Department</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 03. Curated Spotlight — Horizontal Left-to-Right / Right-to-Left Carousel */}
      <section
        id="section-spotlight"
        className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-16 border-b border-stone-200 scroll-mt-28"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 mb-1.5">
              <span className="px-2 py-0.5 bg-stone-900 text-white font-semibold">
                Section 03
              </span>
              <span>Curated Spotlight</span>
            </div>
            <h2
              className="font-serif text-3xl sm:text-4xl text-stone-950 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Featured Showroom Arrivals
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollHorizontal(spotlightScrollRef, 'left')}
                aria-label="Previous Featured Garments"
                className="px-3.5 py-2 border border-stone-300 bg-white hover:border-stone-950 text-stone-900 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => scrollHorizontal(spotlightScrollRef, 'right')}
                aria-label="Next Featured Garments"
                className="px-3.5 py-2 border border-stone-950 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link
              to="/collection"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-900 hover:underline pl-2 whitespace-nowrap"
            >
              <span>View All Clothing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div
          ref={spotlightScrollRef}
          className="flex items-stretch gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
        >
          {spotlightList.map((item) => (
            <Link
              key={item.id}
              to={`/collection?piece=${encodeURIComponent(item.id)}`}
              className="snap-start shrink-0 w-[285px] sm:w-[340px] md:w-[370px] group flex flex-col border border-stone-200 bg-white hover:border-stone-950 transition-all duration-200"
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                    <span className="truncate">{item.category}</span>
                    <span className="font-mono shrink-0">{item.sku}</span>
                  </div>
                  <h3 className="font-serif text-2xl text-stone-950 group-hover:text-stone-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-sm font-mono tabular-nums font-medium text-stone-950">
                    {item.price > 0
                      ? `₹${item.price.toLocaleString('en-IN')}`
                      : 'Price on Request'}
                  </span>
                  <span className="text-xs font-medium text-stone-900 inline-flex items-center gap-1">
                    <span>Inspect Piece</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 04. Ethnic, Casual & Kids' Edit — Horizontal Left-to-Right / Right-to-Left Carousel */}
      <section
        id="section-latest"
        className="bg-stone-50 border-b border-stone-200 py-12 sm:py-16 scroll-mt-28"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 mb-1.5">
                <span className="px-2 py-0.5 bg-stone-200 text-stone-900 font-semibold">
                  Section 04
                </span>
                <span>Ethnic, Casual &amp; Kids&apos; Edit</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 tracking-tight">
                Latest Collection Showcase
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollHorizontal(latestScrollRef, 'left')}
                  aria-label="Previous Collection Items"
                  className="px-3.5 py-2 border border-stone-300 bg-white hover:border-stone-950 text-stone-900 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontal(latestScrollRef, 'right')}
                  aria-label="Next Collection Items"
                  className="px-3.5 py-2 border border-stone-950 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <Link
                to="/collection"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-900 hover:underline pl-2 whitespace-nowrap"
              >
                <span>Open Full Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div
            ref={latestScrollRef}
            className="flex items-stretch gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
          >
            {latestItems.map((item) => (
              <Link
                key={item.id}
                to={`/collection?piece=${encodeURIComponent(item.id)}`}
                className="snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[320px] group bg-white border border-stone-200 flex flex-col hover:border-stone-950 transition-colors"
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
                    <span className="font-mono tabular-nums text-stone-900 font-medium shrink-0">
                      {item.price > 0
                        ? `₹${item.price.toLocaleString('en-IN')}`
                        : 'Price on Request'}
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

      {/* 05. Compact Editorial Lookbook Preview (Promotional Offers Removed from Home) */}
      <section
        id="section-lookbook"
        className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-16 scroll-mt-28"
      >
        <div className="border border-stone-200 bg-stone-50 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
              <span className="px-2 py-0.5 bg-stone-900 text-white font-semibold">
                Section 05
              </span>
              <span>Visual Archive</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-950">
              2026 Ethnic, Streetwear &amp; Festive Lookbook
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Browse high-resolution photography from our Men&apos;s Kurta-Pyjama line,
              Shingar NX youth streetwear drop, traditional sarees, and kids&apos;
              festive wear.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/lookbook"
                className="inline-flex items-center gap-2 px-5 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Explore Lookbook Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 bg-white text-stone-900 text-xs font-medium hover:border-stone-950 transition-colors"
              >
                <span>Visit Junagadh Showrooms</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {collections.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to="/lookbook"
                className="group block aspect-[3/4] overflow-hidden bg-stone-200 border border-stone-200"
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
