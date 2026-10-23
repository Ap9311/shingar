/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shirt,
  Tag,
  Users,
  Mail,
  ArrowRight,
  RefreshCw,
  FolderKanban,
  MessageSquare,
} from 'lucide-react';
import { useAtelier } from '../../context/AtelierContext';

export const AdminOverviewPage: React.FC = () => {
  const {
    collections,
    categories,
    offers,
    usersDirectory,
    inquiries,
    seedInitialAtelierData,
  } = useAtelier();
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const activeOffersCount = offers.filter((o) => o.active).length;

  const handleSyncCatalog = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      await seedInitialAtelierData();
      setSyncNotice('Default showcase items and photographs synced with Firestore.');
    } catch (err) {
      setSyncNotice(
        err instanceof Error ? err.message : 'Unable to sync default catalog.'
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-xs text-stone-600 uppercase tracking-widest font-medium mb-1">
            Store Management Overview
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Shingar Dresses Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSyncCatalog}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-stone-300 bg-white text-xs font-medium text-stone-800 hover:border-stone-900 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Firestore...' : 'Restore Default Catalog'}</span>
          </button>
          <Link
            to="/admin/email"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Open Email Composer</span>
          </Link>
        </div>
      </div>

      {syncNotice && (
        <div className="p-4 bg-white border border-stone-300 text-xs text-stone-800">
          {syncNotice}
        </div>
      )}

      {/* Live Firestore Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/collection"
          className="bg-white border border-stone-200 p-6 hover:border-stone-900 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Clothing Items</span>
            <Shirt className="w-4 h-4 text-stone-800" />
          </div>
          <p className="font-mono text-3xl font-semibold text-stone-950 mt-4 tabular-nums">
            {collections.length}
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Across {categories.length} clothing categories →
          </p>
        </Link>

        <Link
          to="/admin/offers"
          className="bg-white border border-stone-200 p-6 hover:border-stone-900 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Promotional Offers</span>
            <Tag className="w-4 h-4 text-stone-800" />
          </div>
          <p className="font-mono text-3xl font-semibold text-stone-950 mt-4 tabular-nums">
            {offers.length}
          </p>
          <p className="text-xs text-stone-500 mt-2">
            {activeOffersCount} currently active in stores →
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white border border-stone-200 p-6 hover:border-stone-900 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Registered Customers</span>
            <Users className="w-4 h-4 text-stone-800" />
          </div>
          <p className="font-mono text-3xl font-semibold text-stone-950 mt-4 tabular-nums">
            {usersDirectory.length}
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Signed in via Google Authentication →
          </p>
        </Link>

        <Link
          to="/admin/email"
          className="bg-white border border-stone-200 p-6 hover:border-stone-900 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Customer Communications</span>
            <Mail className="w-4 h-4 text-stone-800" />
          </div>
          <p className="font-serif text-2xl font-medium text-stone-950 mt-4">
            Email Composer
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Send individual or broadcast emails →
          </p>
        </Link>
      </div>

      {/* Quick Management Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Store Inquiries */}
        <div className="lg:col-span-7 bg-white border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-stone-800" />
              <h2 className="font-serif text-2xl text-stone-950">
                Customer Store Inquiries ({inquiries.length})
              </h2>
            </div>
            <Link
              to="/contact"
              className="text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              View Public Form →
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <p className="text-xs text-stone-500 py-8 text-center">
              No showroom inquiries submitted yet. Inquiries submitted on /contact appear
              here in real time.
            </p>
          ) : (
            <div className="divide-y divide-stone-200">
              {inquiries.slice(0, 6).map((inq) => (
                <div key={inq.id} className="py-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">
                      {inq.name} ({inq.email})
                    </span>
                    <span className="font-mono text-stone-500">{inq.phone}</span>
                  </div>
                  <p className="text-stone-800 font-medium">
                    {inq.dressReference} · {inq.preferredDate}
                  </p>
                  <p className="text-stone-600">{inq.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Overview */}
        <div className="lg:col-span-5 bg-white border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-stone-800" />
              <h2 className="font-serif text-2xl text-stone-950">
                Clothing Categories ({categories.length})
              </h2>
            </div>
            <Link
              to="/admin/collection"
              className="text-xs font-medium text-stone-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-stone-200">
            {categories.map((cat) => {
              const itemCount = collections.filter(
                (item) => item.category === cat.name
              ).length;
              return (
                <div
                  key={cat.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <p className="font-semibold text-stone-900">{cat.name}</p>
                    {cat.description && (
                      <p className="text-stone-500 line-clamp-1">{cat.description}</p>
                    )}
                  </div>
                  <span className="font-mono tabular-nums text-stone-600 shrink-0">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
