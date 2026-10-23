/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Clock } from 'lucide-react';
import { ABOUT_BOUTIQUE_IMAGE, HERO_BANNER_IMAGE, SHINGAAR_BRANCHES } from '../data/seedData';
import { BranchLocatorSection } from '../components/BranchLocatorSection';

export const AboutPage: React.FC = () => {
  return (
    <main className="bg-white text-stone-900">
      {/* Brand Story Hero */}
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Our Heritage &amp; Craft</span>
              <span aria-hidden="true">·</span>
              <span>Established in Mumbai</span>
            </div>

            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-stone-950 leading-[1.1] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              The House of Shingar Dresses.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Founded with a dedication to preserving India’s royal textile lineages,
              Shingar Dresses brings together master zardozi embroiderers, Varanasi Katan
              silk weavers, and contemporary silhouette pattern-makers under one roof.
            </p>

            <p className="text-sm text-stone-600 leading-relaxed">
              Unlike mass-produced online fast fashion, every Shingar Dresses garment is
              showcased in-person across our physical salons in Mumbai, New Delhi, Jaipur,
              and Surat—allowing brides and families to experience the weight of pure
              mulberry silk, the lustre of antique metallic zari, and custom 3-stage
              tailoring firsthand.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-rose-900 transition-colors"
              >
                <span>Explore Clothing Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 bg-white text-stone-900 text-xs font-medium hover:border-stone-900 transition-colors"
              >
                <span>Book a Store Visit</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden bg-stone-200 border border-stone-200">
              <img
                src={ABOUT_BOUTIQUE_IMAGE}
                alt="Shingar Dresses Boutique Showcase"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden bg-stone-200 border border-stone-200 mt-8">
              <img
                src={HERO_BANNER_IMAGE}
                alt="Shingar Dresses Bridal Craftsmanship"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars of Craftsmanship */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-stone-200">
        <div className="max-w-2xl mb-12">
          <p className="text-xs text-rose-900 uppercase tracking-widest font-medium mb-2">
            Atelier Philosophy
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Crafted for Heirloom Permanence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-stone-200 p-8 space-y-3 bg-white">
            <p className="text-xs font-mono text-rose-900">01. Handloom Provenance</p>
            <h3 className="font-serif text-2xl text-stone-950">
              Pure Katan, Chanderi &amp; Paithani
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              We partner directly with weaving clusters in Varanasi, Chanderi, and Patan
              to source unblended mulberry silk, hand-spun organza, and real-zari brocades.
            </p>
          </div>

          <div className="border border-stone-200 p-8 space-y-3 bg-white">
            <p className="text-xs font-mono text-rose-900">02. Surface Ornamentation</p>
            <h3 className="font-serif text-2xl text-stone-950">
              Authentic Zardozi &amp; Gota Patti
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Each bridal lehenga and festive sharara is hand-framed on traditional wooden
              addas by master karigars specializing in dabka, nakshi, resham, and Jaipur
              gota work.
            </p>
          </div>

          <div className="border border-stone-200 p-8 space-y-3 bg-white">
            <p className="text-xs font-mono text-rose-900">03. Personalised Salon Fitting</p>
            <h3 className="font-serif text-2xl text-stone-950">
              Bespoke Draping &amp; Tailoring
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every customer visiting a Shingar Dresses showroom receives dedicated
              measurements, blouse customization, and drape finishing by our senior master
              tailors.
            </p>
          </div>
        </div>
      </section>

      {/* Store Information Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24 border-b border-stone-200">
        <div className="mb-12">
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">
            Store Directory
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Our Flagship Showrooms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SHINGAAR_BRANCHES.map((branch) => (
            <div
              key={branch.id}
              className="border border-stone-200 p-6 sm:p-8 bg-stone-50 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-rose-900">
                  {branch.city}
                </p>
                <h3 className="font-serif text-2xl text-stone-950">{branch.name}</h3>
                <p className="text-xs text-stone-500">{branch.specialties}</p>
              </div>

              <div className="space-y-2 text-sm text-stone-700 pt-3 border-t border-stone-200">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-900 shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{branch.phone}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{branch.hours}</span>
                </p>
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
