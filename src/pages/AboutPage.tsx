/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Clock, ExternalLink, Award } from 'lucide-react';
import {
  ABOUT_BOUTIQUE_IMAGE,
  HERO_SLIDES,
  SHINGAAR_BRANCHES,
  SHINGAR_CONTACT_DETAILS,
} from '../data/seedData';
import { BranchLocatorSection } from '../components/BranchLocatorSection';

export const AboutPage: React.FC = () => {
  return (
    <main className="bg-white text-stone-900">
      {/* Brand Story Hero */}
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-14 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-700 font-mono uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Established in {SHINGAR_CONTACT_DETAILS.establishedYear}</span>
              <span aria-hidden="true">·</span>
              <span>39+ Years in Junagadh, Gujarat</span>
            </div>

            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-stone-950 leading-[1.08] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Shingar Dresses &amp; Shingar NX.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Founded in 1987 in the heart of Junagadh, Gujarat,{' '}
              <strong className="text-stone-900">Shingar Dresses</strong> has grown over
              nearly four decades into Saurashtra’s premier family readymade garment
              showroom and youth fashion house under{' '}
              <strong className="text-stone-900">Shingar NX</strong>.
            </p>

            <p className="text-sm text-stone-600 leading-relaxed">
              From royal Men’s Kurta-Pyjamas, festive Bandis, and bridal silk weaves at
              our M.G. Road flagship (Jenellie Shopping Centre, near Ranavav Chowk /
              Vanzari Chowk) to trending graphic streetwear, denim cargos, and youth
              casuals at Shingar NX on Motibaug Road (Above Bata Showroom), we serve
              every generation in person with trusted quality and personal fitting.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200">
              <div>
                <p className="text-xs text-stone-500">Established</p>
                <p className="font-serif text-2xl text-stone-950 mt-0.5">1987</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Junagadh Branches</p>
                <p className="font-serif text-2xl text-stone-950 mt-0.5">2 Showrooms</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-stone-500">Management</p>
                <p className="font-serif text-xl text-stone-950 mt-0.5">
                  {SHINGAR_CONTACT_DETAILS.ownerName}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                <span>Explore Clothing Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 bg-white text-stone-900 text-xs font-medium hover:border-stone-900 transition-colors"
              >
                <span>Contact &amp; Store Timings</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden bg-stone-200 border border-stone-200">
              <img
                src={HERO_SLIDES[0].imageUrl}
                alt="Shingar Dresses Men's Ethnic & Readymade Showcase"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden bg-stone-200 border border-stone-200 mt-8">
              <img
                src={ABOUT_BOUTIQUE_IMAGE}
                alt="Shingar NX Streetwear & Festive Showcase"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Apparel Specialties */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-stone-200">
        <div className="max-w-2xl mb-12">
          <p className="text-xs text-stone-600 uppercase tracking-widest font-medium mb-2">
            What We Showcase
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Five Specialised Apparel Divisions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-stone-200 p-7 space-y-3 bg-white">
            <p className="text-xs font-mono text-stone-700">01. Ethnic &amp; Menswear</p>
            <h3 className="font-serif text-2xl text-stone-950">
              Men&apos;s Readymade &amp; Kurta-Pyjamas
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Royal silk-blend Kurta-Pyjamas, Nehru jackets, wedding sherwanis, and
              tailored formal shirts crafted for weddings, Navratri, and family
              celebrations.
            </p>
          </div>

          <div className="border border-stone-200 p-7 space-y-3 bg-white">
            <p className="text-xs font-mono text-stone-700">02. Shingar NX Division</p>
            <h3 className="font-serif text-2xl text-stone-950">
              Trending Streetwear &amp; Casuals
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Heavyweight oversized graphic tees, utility cargo denim, relaxed hoodies,
              and modern youth fashion curated exclusively at Shingar NX on Motibaug
              Road.
            </p>
          </div>

          <div className="border border-stone-200 p-7 space-y-3 bg-white">
            <p className="text-xs font-mono text-stone-700">03. Family &amp; Institutional</p>
            <h3 className="font-serif text-2xl text-stone-950">
              Kids&apos; Wear, Festive &amp; School Uniforms
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Complete festive clothing, party frocks, boys&apos; ethnic sets, bridal
              lehengas, sarees, and durable daily school uniforms for prominent Junagadh
              schools.
            </p>
          </div>
        </div>
      </section>

      {/* Two Junagadh Showroom Branches */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-stone-200">
        <div className="mb-12">
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">
            Junagadh Store Directory
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Our Two Showrooms in Junagadh
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SHINGAAR_BRANCHES.map((branch) => (
            <div
              key={branch.id}
              className="border border-stone-200 p-6 sm:p-8 bg-stone-50 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-stone-600">
                  {branch.city}
                </p>
                <h3 className="font-serif text-2xl text-stone-950">{branch.name}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {branch.specialties}
                </p>
              </div>

              <div className="space-y-2.5 text-sm text-stone-700 pt-4 border-t border-stone-200">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span className="font-mono text-xs sm:text-sm">{branch.phone}</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">{branch.hours}</span>
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={branch.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
                >
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Section */}
      <BranchLocatorSection />
    </main>
  );
};
