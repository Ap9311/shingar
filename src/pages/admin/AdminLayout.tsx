/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  Tag,
  Users,
  Mail,
  MessageSquare,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  useAtelier,
  AUTHORIZED_ADMIN_EMAILS,
  isAuthorizedAdminEmail,
} from '../../context/AtelierContext';

const ADMIN_NAV = [
  { path: '/admin', label: 'Admin Home', icon: LayoutDashboard, exact: true },
  { path: '/admin/collection', label: 'Clothes & Categories', icon: Shirt, exact: false },
  { path: '/admin/offers', label: 'Store Offers', icon: Tag, exact: false },
  { path: '/admin/users', label: 'Customers', icon: Users, exact: false },
  { path: '/admin/messages', label: 'Customer Messages', icon: MessageSquare, exact: false },
  { path: '/admin/email', label: 'Send Email', icon: Mail, exact: false },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const {
    user,
    authReady,
    isSigningIn,
    isAuthorizingAdmin,
    isAdminUnlocked,
    adminAuthError,
    gmailAccessToken,
    inquiries,
    signInAdminWithGoogle,
    connectAdminGmail,
    signOutUser,
    authorizeAdminWithServer,
    logoutAdminServerSide,
  } = useAtelier();

  const isNavActive = (path: string, exact: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  if (!authReady || isAuthorizingAdmin) {
    return (
      <div className="min-h-[75vh] bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white border border-stone-200 p-8 max-w-md w-full text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-stone-900 animate-spin mx-auto" />
          <p className="font-serif text-2xl text-stone-950">Checking Admin Login...</p>
          <p className="text-xs text-stone-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // Gate 1: Not signed in with Google
  if (!user) {
    return (
      <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-stone-200 max-w-md w-full p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-stone-900 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Shop Admin Login</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-stone-950">
              Shingar Dresses Admin
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Sign in with the shop admin Google account (
              <strong className="font-mono text-xs text-stone-900">
                {AUTHORIZED_ADMIN_EMAILS.join(' or ')}
              </strong>
              ) to add clothes, update offers, view customers, and send emails.
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3 bg-stone-100 border border-stone-300 text-xs text-stone-900">
              {adminAuthError}
            </div>
          )}

          <button
            type="button"
            onClick={() => signInAdminWithGoogle()}
            disabled={isSigningIn}
            className="w-full py-3.5 px-6 bg-stone-950 text-white text-xs sm:text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSigningIn ? 'Signing In...' : 'Sign In as Admin with Google'}
            </span>
          </button>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>Admin Only</span>
            <Link to="/home" className="text-stone-900 font-medium hover:underline">
              ← Back to Shop Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Gate 2: Signed in with a non-admin Google account
  const signedInEmail = (user.email || '').toLowerCase().trim();
  const isEmailAuthorized = isAuthorizedAdminEmail(signedInEmail);

  if (!isEmailAuthorized || !isAdminUnlocked) {
    return (
      <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-stone-200 max-w-md w-full p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-stone-900 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Wrong Google Account</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-950">
              Admin Access Only
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              You are signed in as <strong className="text-stone-900">{user.email}</strong>.
              Only{' '}
              <strong className="font-mono text-xs text-stone-900">
                {AUTHORIZED_ADMIN_EMAILS.join(' or ')}
              </strong>{' '}
              can open this Admin page.
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3 bg-stone-100 border border-stone-300 text-xs text-stone-900">
              {adminAuthError}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {isEmailAuthorized ? (
              <button
                type="button"
                onClick={() => authorizeAdminWithServer(user)}
                className="w-full py-3 px-5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            ) : null}
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                await signInAdminWithGoogle();
              }}
              className="w-full py-3 px-5 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Sign In with Admin Google Account
            </button>
            <Link
              to="/home"
              className="w-full py-3 px-5 border border-stone-300 text-stone-800 text-xs font-medium text-center hover:border-stone-900"
            >
              Back to Shop Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Simple Admin Top Bar */}
      <div className="bg-stone-950 text-white border-b border-stone-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-stone-300" />
            <span className="text-xs font-semibold">Shop Admin</span>
            <span className="text-stone-600">·</span>
            <span className="text-xs font-mono text-stone-300">{user.email}</span>
            {gmailAccessToken ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                <span>Gmail Connected</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => connectAdminGmail()}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-[11px] text-white font-medium transition-colors cursor-pointer"
              >
                <Mail className="w-3 h-3" />
                <span>Connect Gmail</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="text-xs text-stone-300 hover:text-white inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Open Shop Website</span>
            </Link>
            <button
              type="button"
              onClick={() => logoutAdminServerSide()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Simple Navigation Tabs */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center gap-1 overflow-x-auto border-t border-stone-800">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.path, item.exact);
            const showCount =
              item.path === '/admin/messages' && inquiries.length > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-white text-white bg-stone-900'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {showCount && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-700 text-white">
                    {inquiries.length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Page Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-10">{children}</div>
    </div>
  );
};
