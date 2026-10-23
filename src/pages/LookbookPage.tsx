/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Maximize2 } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { CollectionItem } from '../types';
import { CoutureArtwork } from '../components/CoutureArtwork';

export const LookbookPage: React.FC = () => {
  const { collections } = useAtelier();
  const [selectedChapter, setSelectedChapter] = useState<string>('All');
  const [lightboxItem, setLightboxItem] = useState<CollectionItem | null>(null);

  const chapters = useMemo(() => {
    const set = new Set<string>(['All']);
    collections.forEach((item) => {
      if (item.lookbookChapter) set.add(item.lookbookChapter);
    });
    return Array.from(set);
  }, [collections]);

  const filteredGallery = useMemo(() => {
    if (selectedChapter === 'All') return collections;
    return collections.filter((item) => item.lookbookChapter === selectedChapter);
  }, [collections, selectedChapter]);

  return (
    <main className="bg-white min-h-screen text-stone-900">
      {/* Header */}
      <section className="bg-stone-50 border-b border-stone-200 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs text-stone-500">Store Photo Gallery</p>
            <h1 className="font-serif text-3xl sm:text-5xl text-stone-950 tracking-tight">
              Fashion Lookbook
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Photos of our latest clothes at Shingar Dresses and Shingar NX. Tap any
              photo to see details.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-200 flex items-center gap-2 overflow-x-auto pb-1">
            {chapters.map((chapter) => {
              const active = selectedChapter === chapter;
              return (
                <button
                  key={chapter}
                  type="button"
                  onClick={() => setSelectedChapter(chapter)}
                  className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-stone-950 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-900 hover:text-stone-950'
                  }`}
                >
                  {chapter}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredGallery.map((item, idx) => (
            <figure
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="group border border-stone-200 bg-white cursor-pointer flex flex-col justify-between hover:border-stone-950 transition-all duration-200"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
                <CoutureArtwork
                  src={item.imageUrl}
                  alt={item.title}
                  title={item.title}
                  subtitle={item.category}
                  sku={item.sku}
                  className="w-full h-full"
                />
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <figcaption className="p-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>
                    Photo {String(idx + 1).padStart(2, '0')} · {item.category}
                  </span>
                </div>
                <h2 className="font-serif text-2xl text-stone-950 group-hover:text-stone-600 transition-colors">
                  {item.title}
                </h2>
                <p className="text-xs text-stone-500">{item.fabric}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="bg-white border border-stone-200 max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:col-span-7 aspect-[3/4] md:aspect-auto md:min-h-[500px] bg-stone-100">
              <CoutureArtwork
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                title={lightboxItem.title}
                sku={lightboxItem.sku}
                className="w-full h-full"
              />
            </div>

            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    {lightboxItem.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightboxItem(null)}
                    aria-label="Close"
                    className="p-1.5 text-stone-400 hover:text-stone-900 border border-stone-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl text-stone-950">
                  {lightboxItem.title}
                </h2>

                <p className="text-sm text-stone-600 leading-relaxed">
                  {lightboxItem.description}
                </p>

                <div className="border-t border-stone-200 pt-4 space-y-2 text-xs">
                  <p>
                    <span className="text-stone-500">Fabric:</span>{' '}
                    <strong className="text-stone-900">{lightboxItem.fabric}</strong>
                  </p>
                  <p>
                    <span className="text-stone-500">Fit:</span>{' '}
                    <strong className="text-stone-900">{lightboxItem.silhouette}</strong>
                  </p>
                  <p>
                    <span className="text-stone-500">Price:</span>{' '}
                    <strong className="font-mono text-stone-900">
                      {lightboxItem.price > 0
                        ? `₹${lightboxItem.price.toLocaleString('en-IN')}`
                        : 'Ask Price in Shop'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  to={`/collection?piece=${encodeURIComponent(lightboxItem.id)}`}
                  className="w-full py-3 bg-stone-950 text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
                >
                  <span>See in Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/contact?dress=${encodeURIComponent(lightboxItem.title)}`}
                  className="w-full py-3 border border-stone-300 text-stone-900 text-xs font-medium flex items-center justify-center hover:border-stone-900 transition-colors"
                >
                  Ask About This Cloth
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
