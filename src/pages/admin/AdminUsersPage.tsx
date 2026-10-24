/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Mail, Users, CheckSquare, Square } from 'lucide-react';
import { useAtelier } from '../../context/AtelierContext';

function formatTimestamp(ts: unknown): string {
  if (!ts) return 'Recent';
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    const sec = Number((ts as { seconds: number }).seconds);
    return new Date(sec * 1000).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return 'Verified via Google';
}

export const AdminUsersPage: React.FC = () => {
  const { usersDirectory } = useAtelier();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return usersDirectory;
    return usersDirectory.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
    );
  }, [usersDirectory, searchQuery]);

  const toggleSelectEmail = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === filteredUsers.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredUsers.map((u) => u.email).filter(Boolean));
    }
  };

  const handleEmailSelected = () => {
    if (selectedEmails.length === 0) return;
    navigate(
      `/admin/email?mode=selected&recipients=${encodeURIComponent(
        selectedEmails.join(',')
      )}`
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-xs text-stone-600 uppercase tracking-widest font-medium mb-1">
            Google Sign-In Customer Registry
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Registered Customers ({usersDirectory.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            View customer names, verified Google email addresses, profile photos, and
            account activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedEmails.length > 0 && (
            <button
              type="button"
              onClick={handleEmailSelected}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 text-white text-xs font-medium hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Selected ({selectedEmails.length})</span>
            </button>
          )}
          <Link
            to="/admin/email?mode=all"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email All Customers</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by customer name, email, or UID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
          />
        </div>

        {filteredUsers.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-stone-950 cursor-pointer"
          >
            {selectedEmails.length === filteredUsers.length ? (
              <CheckSquare className="w-4 h-4 text-stone-950" />
            ) : (
              <Square className="w-4 h-4 text-stone-400" />
            )}
            <span>
              {selectedEmails.length === filteredUsers.length
                ? 'Deselect All'
                : 'Select All Shown'}
            </span>
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-stone-200 overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="font-serif text-2xl text-stone-900">
              No matching customer accounts found
            </p>
            <p className="text-xs text-stone-500">
              Customers who sign in with Google on the website automatically appear in
              this directory.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4 w-10">Select</th>
                <th className="py-3.5 px-4">Customer Profile</th>
                <th className="py-3.5 px-4">Verified Email</th>
                <th className="py-3.5 px-4">Account UID</th>
                <th className="py-3.5 px-4">Last Sign-In</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-xs">
              {filteredUsers.map((customer) => {
                const isSelected = selectedEmails.includes(customer.email);
                return (
                  <tr
                    key={customer.uid}
                    className={`hover:bg-stone-50 transition-colors ${
                      isSelected ? 'bg-stone-100' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => toggleSelectEmail(customer.email)}
                        className="text-stone-500 hover:text-stone-900 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-stone-950" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {customer.photoURL ? (
                          <img
                            src={customer.photoURL}
                            alt={customer.displayName}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center font-medium shrink-0">
                            {(customer.displayName || customer.email || 'C')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-stone-900">
                            {customer.displayName}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Google Authenticated
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-stone-800">
                      {customer.email}
                    </td>

                    <td className="py-4 px-4 font-mono text-stone-500 tabular-nums">
                      {customer.uid}
                    </td>

                    <td className="py-4 px-4 text-stone-600 tabular-nums">
                      {formatTimestamp(customer.lastLoginAt)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/admin/email?mode=individual&recipients=${encodeURIComponent(
                          customer.email
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white text-stone-800 hover:border-stone-900 font-medium"
                      >
                        <Mail className="w-3.5 h-3.5 text-stone-800" />
                        <span>Send Email</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
