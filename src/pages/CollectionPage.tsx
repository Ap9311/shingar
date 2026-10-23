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
      <section className="bg-stone-50 border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Shingar Dresses Showcase</span>
                <span aria-hidden="true">·</span>
                <span>In-Store Viewing Only</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl text-stone-950 tracking-tight">
                Clothing Collection
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl">
                Browse our complete showcase of bridal lehengas, royal Anarkalis, handloom
                sarees, and festive ensembles. All garments are tailored and sold
                exclusively at our physical showrooms.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, fabric, SKU..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* Interactive Category Filter Bar */}
          <div className="mt-8 pt-6 border-t border-stone-200 flex items-center gap-2 overflow-x-auto pb-1">
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

      {/* Catalog Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8 text-xs text-stone-500">
          <span>
            Showing <strong className="text-stone-900 font-mono">{filteredItems.length}</strong>{' '}
            {filteredItems.length === 1 ? 'garment' : 'garments'}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </span>
          <span>Click any garment for fabric specifications &amp; store availability</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="border border-stone-200 bg-stone-50 p-12 text-center space-y-4">
            <p className="font-serif text-2xl text-stone-900">
              No clothing items match your current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                handleSelectCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-stone-950 text-white text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group border border-stone-200 bg-white flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>{item.category}</span>
                      <span className="font-mono">{item.sku}</span>
                    </div>

                    <h2 className="font-serif text-2xl text-stone-950 group-hover:text-stone-600 transition-colors">
                      {item.title}
                    </h2>

                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">Indicative Price</span>
                      <span className="text-sm font-mono tabular-nums font-semibold text-stone-950">
                        {item.price > 0
                          ? `₹${item.price.toLocaleString('en-IN')}`
                          : 'Price on Request'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="truncate max-w-[210px]">
                        In-Store: {item.availableBranches || 'All Flagship Showrooms'}
                      </span>
                      <span className="text-stone-900 font-medium whitespace-nowrap">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Inspection Modal (Showcase Only — No Cart/Checkout) */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white border border-stone-200 max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:col-span-6 aspect-[3/4] md:aspect-auto md:min-h-[540px] bg-stone-100">
              <CoutureArtwork
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                title={selectedItem.title}
                subtitle={selectedItem.category}
                sku={selectedItem.sku}
                className="w-full h-full"
              />
            </div>

            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-xs text-stone-500">
                    <span>{selectedItem.category}</span>
                    <span className="mx-1.5">·</span>
                    <span className="font-mono">{selectedItem.sku}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    aria-label="Close modal"
                    className="p-1.5 text-stone-400 hover:text-stone-900 border border-stone-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h2 className="font-serif text-3xl text-stone-950 leading-tight">
                    {selectedItem.title}
                  </h2>
                  <p className="mt-2 text-lg font-mono tabular-nums font-medium text-stone-900">
                    {selectedItem.price > 0
                      ? `₹${selectedItem.price.toLocaleString('en-IN')} (Indicative Showroom Price)`
                      : 'Price on Request at Showroom'}
                  </p>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed">
                  {selectedItem.description}
                </p>

                <dl className="border-t border-b border-stone-200 py-4 space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-stone-500">Fabric &amp; Craft</dt>
                    <dd className="col-span-2 text-stone-900 font-medium">
                      {selectedItem.fabric}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-stone-500">Silhouette</dt>
                    <dd className="col-span-2 text-stone-900 font-medium">
                      {selectedItem.silhouette}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-stone-500">Occasion</dt>
                    <dd className="col-span-2 text-stone-900 font-medium">
                      {selectedItem.occasion}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-stone-500">Available At</dt>
                    <dd className="col-span-2 text-stone-900 font-medium">
                      {selectedItem.availableBranches ||
                        'Shingar Dresses (M.G. Road) & Shingar NX (Motibaug Road), Junagadh'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[11px] text-stone-500">
                  Shingar Dresses is an in-store showcase. Visit our showrooms or book a
                  private viewing appointment for custom measurements.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/contact?dress=${encodeURIComponent(
                      `${selectedItem.title} (${selectedItem.sku})`
                    )}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors whitespace-nowrap"
                  >
                    <span>Inquire About This Piece</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href={SHINGAAR_BRANCHES[0].directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-stone-300 text-stone-900 text-xs font-medium hover:border-stone-900 transition-colors whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5 text-stone-700" />
                    <span>Store Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
