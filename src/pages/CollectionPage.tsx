/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { CollectionItem } from '../types';
import { CoutureArtwork } from '../components/CoutureArtwork';
import { SHINGAAR_BRANCHES } from '../data/seedData';

export const CollectionPage: React.FC = () => {
  const { collections, categoryNames } = useAtelier();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setActiveCategory(catParam);
    }
    const pieceParam = searchParams.get('piece');
    if (pieceParam) {
      const found = collections.find((c) => c.id === pieceParam || c.sku === pieceParam);
      if (found) setSelectedItem(found);
    }
  }, [searchParams, collections]);

  const filterTabs = useMemo(() => ['All', ...categoryNames], [categoryNames]);

  const filteredItems = useMemo(() => {
    return collections.filter((item) => {
      const matchesCat =
        activeCategory === 'All' || item.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.fabric.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [collections, activeCategory, searchQuery]);

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <main className="bg-white min-h-screen text-stone-900">
      {/* Header */}
      <section className="bg-stone-50 border-b border-stone-200 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs text-stone-500">
                Shingar Dresses &amp; Shingar NX · In-Store Showcase
              </p>
              <h1 className="font-serif text-3xl sm:text-5xl text-stone-950 tracking-tight">
                Our Clothes Collection
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl">
                See our latest clothes and prices below. Visit our M.G. Road or Motibaug
                Road shop in Junagadh to try and buy.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-72 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clothes..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="mt-6 pt-5 border-t border-stone-200 flex items-center gap-2 overflow-x-auto pb-1">
            {filterTabs.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-stone-950 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-900 hover:text-stone-950'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clothes Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 text-xs text-stone-500">
          <span>
            Showing <strong className="text-stone-900 font-mono">{filteredItems.length}</strong>{' '}
            {filteredItems.length === 1 ? 'item' : 'items'}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </span>
          <span>Tap any cloth to see full details &amp; shop map</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="border border-stone-200 bg-stone-50 p-10 text-center space-y-4">
            <p className="font-serif text-2xl text-stone-900">
              No clothes found for this filter.
            </p>
            <button
              type="button"
              onClick={() => {
                handleSelectCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-stone-950 text-white text-xs font-medium cursor-pointer"
            >
              Show All Clothes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group border border-stone-200 bg-white flex flex-col justify-between cursor-pointer hover:border-stone-950 transition-all duration-200"
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
                    <p className="text-xs text-stone-500">{item.category}</p>
                    <h2 className="font-serif text-2xl text-stone-950 group-hover:text-stone-600 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">Shop Price</span>
                      <span className="text-sm font-mono tabular-nums font-semibold text-stone-950">
                        {item.price > 0
                          ? `₹${item.price.toLocaleString('en-IN')}`
                          : 'Ask Price in Shop'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="truncate max-w-[210px]">
                        Shop: {item.availableBranches || 'M.G. Road & Shingar NX'}
                      </span>
                      <span className="text-stone-900 font-medium whitespace-nowrap">
                        See Details →
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Cloth Detail Modal (In-Store Showcase + Both Branch Google Maps Links) */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white border border-stone-200 max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:col-span-6 aspect-[3/4] md:aspect-auto md:min-h-[500px] bg-stone-100">
              <CoutureArtwork
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                title={selectedItem.title}
                subtitle={selectedItem.category}
                sku={selectedItem.sku}
                className="w-full h-full"
              />
            </div>

            <div className="md:col-span-6 p-5 sm:p-8 flex flex-col justify-between space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs text-stone-500">{selectedItem.category}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    aria-label="Close"
                    className="p-1.5 text-stone-500 hover:text-stone-950 border border-stone-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-950 leading-tight">
                    {selectedItem.title}
                  </h2>
                  <p className="mt-2 text-lg font-mono tabular-nums font-semibold text-stone-900">
                    {selectedItem.price > 0
                      ? `₹${selectedItem.price.toLocaleString('en-IN')}`
                      : 'Ask Price at Shop'}
                  </p>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed">
                  {selectedItem.description}
                </p>

                <dl className="border-t border-b border-stone-200 py-4 space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-stone-500">Cloth / Fabric</dt>
                    <dd className="col-span-2 text-stone-900 font-medium">
                      {selectedItem.fabric}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-stone-500">Fit / Style</dt>
                    <dd className="col-span-2 text-stone-900 font-medium">
                      {selectedItem.silhouette}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-stone-500">Good For</dt>
                    <dd className="col-span-2 text-stone-900 font-medium">
                      {selectedItem.occasion}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-stone-500">Where to Buy</dt>
                    <dd className="col-span-2 text-stone-900 font-medium">
                      {selectedItem.availableBranches ||
                        'Main Shop (M.G. Road) & Shingar NX (Motibaug Road), Junagadh'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3 pt-1">
                <p className="text-xs text-stone-500">
                  Visit our shop in Junagadh to try and buy this item:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={SHINGAAR_BRANCHES[0].directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-stone-300 text-stone-900 text-xs font-medium hover:border-stone-950 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-stone-700" />
                    <span>M.G. Road Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={SHINGAAR_BRANCHES[1].directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-stone-300 text-stone-900 text-xs font-medium hover:border-stone-950 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-stone-700" />
                    <span>Shingar NX Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <Link
                  to={`/contact?dress=${encodeURIComponent(selectedItem.title)}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
                >
                  <span>Ask About This Cloth</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
