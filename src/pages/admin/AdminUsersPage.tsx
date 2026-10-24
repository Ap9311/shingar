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
    });
  }
  return 'Signed In';
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
        u.email.toLowerCase().includes(q)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <p className="text-xs text-stone-500 mb-1">Google Sign-In List</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
            Customers ({usersDirectory.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            People who signed in with Google on your website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            placeholder="Search customer name or email..."
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
                ? 'Unselect All'
                : 'Select All'}
            </span>
          </button>
        )}
      </div>

      {/* Customers List */}
      <div className="bg-white border border-stone-200 overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Users className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="font-serif text-2xl text-stone-900">No customers found</p>
            <p className="text-xs text-stone-500">
              When customers sign in with Google on the website, their name and email
              will show here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="py-3 px-4 w-10">Pick</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-right">Email</th>
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
                    <td className="py-3.5 px-4">
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

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {customer.photoURL ? (
                          <img
                            src={customer.photoURL}
                            alt={customer.displayName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-medium shrink-0">
                            {(customer.displayName || customer.email || 'C')[0].toUpperCase()}
                          </div>
                        )}
                        <p className="font-semibold text-stone-900">
                          {customer.displayName}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-800">
                      {customer.email}
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">
                      {formatTimestamp(customer.lastLoginAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
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
