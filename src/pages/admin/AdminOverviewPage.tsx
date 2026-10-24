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
      setSyncNotice('Default clothes and offers restored.');
    } catch (err) {
      setSyncNotice(
        err instanceof Error ? err.message : 'Could not restore default clothes.'
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <p className="text-xs text-stone-500 mb-1">Shop Control Panel</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Admin Home
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncCatalog}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-stone-300 bg-white text-xs font-medium text-stone-800 hover:border-stone-900 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Restoring...' : 'Reset Default Clothes'}</span>
          </button>
          <Link
            to="/admin/email"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email to Customers</span>
          </Link>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 bg-white border border-stone-300 text-xs text-stone-800">
          {syncNotice}
        </div>
      )}

      {/* 5 Big Simple Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <Link
          to="/admin/collection"
          className="bg-white border border-stone-200 p-5 hover:border-stone-950 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
            <span>1. Clothes &amp; Categories</span>
            <Shirt className="w-4 h-4 text-stone-900" />
          </div>
          <p className="font-mono text-3xl font-semibold text-stone-950 mt-3 tabular-nums">
            {collections.length}
          </p>
          <p className="text-xs text-stone-600 mt-2">
            Add, edit, or delete clothes →
          </p>
        </Link>

        <Link
          to="/admin/offers"
          className="bg-white border border-stone-200 p-5 hover:border-stone-950 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
            <span>2. Store Offers &amp; Sales</span>
            <Tag className="w-4 h-4 text-stone-900" />
          </div>
          <p className="font-mono text-3xl font-semibold text-stone-950 mt-3 tabular-nums">
            {offers.length}
          </p>
          <p className="text-xs text-stone-600 mt-2">
            {activeOffersCount} active sale offers →
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white border border-stone-200 p-5 hover:border-stone-950 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
            <span>3. Signed-In Customers</span>
            <Users className="w-4 h-4 text-stone-900" />
          </div>
          <p className="font-mono text-3xl font-semibold text-stone-950 mt-3 tabular-nums">
            {usersDirectory.length}
          </p>
          <p className="text-xs text-stone-600 mt-2">
            See customer names &amp; emails →
          </p>
        </Link>

        <Link
          to="/admin/messages"
          className="bg-white border border-stone-200 p-5 hover:border-stone-950 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
            <span>4. Contact Messages</span>
            <MessageSquare className="w-4 h-4 text-stone-900" />
          </div>
          <p className="font-mono text-3xl font-semibold text-stone-950 mt-3 tabular-nums">
            {inquiries.length}
          </p>
          <p className="text-xs text-stone-600 mt-2">
            Messages from /contact →
          </p>
        </Link>

        <Link
          to="/admin/email"
          className="bg-white border border-stone-200 p-5 hover:border-stone-950 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
            <span>5. Send Gmail</span>
            <Mail className="w-4 h-4 text-stone-900" />
          </div>
          <p className="font-serif text-2xl font-medium text-stone-950 mt-3">
            Send Emails
          </p>
          <p className="text-xs text-stone-600 mt-2">
            Email one or all customers →
          </p>
        </Link>
      </div>

      {/* Customer Messages & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-stone-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-stone-800" />
              <h2 className="font-serif text-xl sm:text-2xl text-stone-950">
                Customer Messages from /contact ({inquiries.length})
              </h2>
            </div>
            <Link
              to="/admin/messages"
              className="text-xs font-medium text-stone-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Open All &amp; Reply</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              No customer messages yet. Messages sent from the &ldquo;Send Us a
              Message&rdquo; form on the Contact page will appear here.
            </p>
          ) : (
            <div className="divide-y divide-stone-200">
              {inquiries.slice(0, 6).map((inq) => (
                <div key={inq.id} className="py-3.5 space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-stone-900">
                      {inq.name} ({inq.email})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-stone-600">{inq.phone}</span>
                      {inq.email && (
                        <Link
                          to={`/admin/email?mode=individual&recipients=${encodeURIComponent(
                            inq.email
                          )}`}
                          className="px-2.5 py-1 bg-stone-950 text-white text-[11px] font-medium hover:bg-stone-800"
                        >
                          Reply by Email
                        </Link>
                      )}
                    </div>
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

        <div className="lg:col-span-5 bg-white border border-stone-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-stone-800" />
              <h2 className="font-serif text-xl sm:text-2xl text-stone-950">
                Categories ({categories.length})
              </h2>
            </div>
            <Link
              to="/admin/collection"
              className="text-xs font-medium text-stone-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Edit</span>
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
                  </div>
                  <span className="font-mono tabular-nums text-stone-600 shrink-0">
                    {itemCount} {itemCount === 1 ? 'cloth' : 'clothes'}
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
