/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { SHINGAAR_BRANCHES } from '../data/seedData';
import { ShowroomBranch } from '../types';

export const BranchLocatorSection: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<ShowroomBranch>(
    SHINGAAR_BRANCHES[0]
  );

  return (
    <section className="bg-stone-50 border-t border-stone-200 py-16 sm:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="max-w-2xl mb-10 space-y-2">
          <p className="text-xs text-stone-600 uppercase tracking-widest font-medium">
            Interactive Store Locator
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Visit a Shingar Dresses Showroom
          </h2>
          <p className="text-sm text-stone-600">
            Select a showroom below to view the store address, opening hours, and live
            interactive map.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Branch Selector Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {SHINGAAR_BRANCHES.map((branch) => {
              const active = selectedBranch.id === branch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedBranch(branch)}
                  className={`text-left p-5 border transition-colors cursor-pointer ${
                    active
                      ? 'bg-stone-950 text-white border-stone-950'
                      : 'bg-white text-stone-900 border-stone-200 hover:border-stone-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-mono uppercase tracking-wider ${
                        active ? 'text-stone-300' : 'text-stone-600'
                      }`}
                    >
                      {branch.city}
                    </span>
                    <span
                      className={`text-[11px] ${
                        active ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {branch.phone}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl">{branch.name}</h3>
                  <p
                    className={`text-xs mt-1.5 leading-relaxed ${
                      active ? 'text-stone-300' : 'text-stone-600'
                    }`}
                  >
                    {branch.address}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right: Active Branch Map & Details */}
          <div className="lg:col-span-7 bg-white border border-stone-200 flex flex-col justify-between overflow-hidden">
            <div className="w-full h-[340px] sm:h-[400px] bg-stone-100 border-b border-stone-200">
              <iframe
                key={selectedBranch.id}
                title={selectedBranch.name}
                src={selectedBranch.mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs text-stone-600">
                <p className="font-semibold text-sm text-stone-950">
                  {selectedBranch.name}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                  <span>{selectedBranch.address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{selectedBranch.hours}</span>
                  <span>·</span>
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{selectedBranch.phone}</span>
                </p>
              </div>

              <a
                href={selectedBranch.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
