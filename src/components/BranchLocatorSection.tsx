/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react';
import { SHINGAAR_BRANCHES } from '../data/seedData';
import { ShowroomBranch } from '../types';

export const BranchLocatorSection: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<ShowroomBranch>(
    SHINGAAR_BRANCHES[0]
  );

  return (
    <section className="bg-stone-50 border-t border-stone-200 py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="max-w-2xl mb-8 space-y-2">
          <p className="text-xs text-stone-600 uppercase tracking-widest font-medium">
            Our 2 Shops in Junagadh
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Shop Locations &amp; Google Map
          </h2>
          <p className="text-sm text-stone-600">
            Tap Branch 1 (M.G. Road) or Branch 2 (Shingar NX, Motibaug Road) below to see
            the map, timings, and Google Maps directions.
          </p>
        </div>

        {/* Quick Branch Switcher Buttons for Mobile & Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {SHINGAAR_BRANCHES.map((branch, idx) => {
            const active = selectedBranch.id === branch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => setSelectedBranch(branch)}
                className={`text-left p-4 sm:p-5 border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                  active
                    ? 'bg-stone-950 text-white border-stone-950'
                    : 'bg-white text-stone-900 border-stone-300 hover:border-stone-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 ${
                      active
                        ? 'bg-white text-stone-950 font-semibold'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Branch {idx + 1}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      active ? 'text-stone-300' : 'text-stone-600'
                    }`}
                  >
                    {branch.phone}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-xl sm:text-2xl">{branch.name}</h3>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      active ? 'text-stone-300' : 'text-stone-600'
                    }`}
                  >
                    {branch.address}
                  </p>
                </div>

                <div
                  className={`pt-2 border-t text-xs flex items-center justify-between ${
                    active
                      ? 'border-stone-800 text-stone-200'
                      : 'border-stone-100 text-stone-700'
                  }`}
                >
                  <span>{branch.hours}</span>
                  <span className="font-medium underline shrink-0 ml-2">
                    {active ? 'Showing on Map' : 'Show on Map →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Branch Google Map & Direct Links for Both Branches */}
        <div className="bg-white border border-stone-200 overflow-hidden">
          <div className="w-full h-[320px] sm:h-[420px] bg-stone-100 border-b border-stone-200">
            <iframe
              key={selectedBranch.id}
              title={selectedBranch.name}
              src={selectedBranch.mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 text-xs sm:text-sm text-stone-700">
              <p className="font-serif text-xl text-stone-950 font-medium">
                {selectedBranch.name}
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                <span>{selectedBranch.address}</span>
              </p>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>{selectedBranch.hours}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-stone-900">
                  <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>{selectedBranch.phone}</span>
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={selectedBranch.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open {selectedBranch.name.split('(')[0].trim()} in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Direct button for Shingar NX Google Maps link if currently viewing Branch 1 (and vice versa) */}
              {SHINGAAR_BRANCHES.filter((b) => b.id !== selectedBranch.id).map((other) => (
                <a
                  key={other.id}
                  href={other.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-stone-300 bg-stone-50 text-stone-900 text-xs font-medium hover:border-stone-900 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{other.name.split('(')[0].trim()} Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
