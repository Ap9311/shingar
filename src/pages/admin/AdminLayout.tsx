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
  LogOut,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useAtelier, AUTHORIZED_ADMIN_EMAIL } from '../../context/AtelierContext';

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/collection', label: 'Collection & Categories', icon: Shirt, exact: false },
  { path: '/admin/offers', label: 'Promotional Offers', icon: Tag, exact: false },
  { path: '/admin/users', label: 'Registered Customers', icon: Users, exact: false },
  { path: '/admin/email', label: 'Email Composer', icon: Mail, exact: false },
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
    signInWithGoogle,
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
          <RefreshCw className="w-6 h-6 text-rose-900 animate-spin mx-auto" />
          <p className="font-serif text-2xl text-stone-950">
            Verifying Administrator Credentials
          </p>
          <p className="text-xs text-stone-500">
            Checking Firebase Authentication and server-side authorization...
          </p>
        </div>
      </div>
    );
  }

  // Gate 1: Not signed in with Google
  if (!user) {
    return (
      <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white border border-stone-200 max-w-lg w-full p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-2.5 text-rose-900 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Restricted Management Portal</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
              Shingar Dresses Admin
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Access to catalog management, promotional offers, customer directory, and
              outbound email is restricted to the authorised administrator Google account (
              <strong className="font-mono text-xs text-stone-900">
                {AUTHORIZED_ADMIN_EMAIL}
              </strong>
              ).
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-900">
              {adminAuthError}
            </div>
          )}

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            disabled={isSigningIn}
            className="w-full py-3.5 px-6 bg-stone-950 text-white text-xs font-medium hover:bg-rose-900 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSigningIn
                ? 'Authenticating with Google...'
                : `Sign In with Google (${AUTHORIZED_ADMIN_EMAIL})`}
            </span>
          </button>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>Protected by Firebase Auth &amp; Server Verification</span>
            <Link to="/home" className="text-stone-900 font-medium hover:underline">
              ← Return to Showcase
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Gate 2: Signed in with a non-admin Google account or server authorization not granted
  const signedInEmail = (user.email || '').toLowerCase().trim();
  if (signedInEmail !== AUTHORIZED_ADMIN_EMAIL || !isAdminUnlocked) {
    return (
      <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white border border-stone-200 max-w-lg w-full p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-2.5 text-rose-900 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Unauthorised Account</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-stone-950">
              Admin Access Restricted
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              You are currently signed in as{' '}
              <strong className="text-stone-900">{user.email}</strong>. Only the
              authorised administrator Google account (
              <strong className="font-mono text-xs text-stone-900">
                {AUTHORIZED_ADMIN_EMAIL}
              </strong>
              ) has permission to access the Shingar Dresses Admin Panel.
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-900">
              {adminAuthError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {signedInEmail === AUTHORIZED_ADMIN_EMAIL ? (
              <button
                type="button"
                onClick={() => authorizeAdminWithServer(user)}
                className="flex-1 py-3 px-5 bg-stone-950 text-white text-xs font-medium hover:bg-rose-900 transition-colors cursor-pointer"
              >
                Retry Server Verification
              </button>
            ) : null}
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                await signInWithGoogle();
              }}
              className="flex-1 py-3 px-5 bg-stone-950 text-white text-xs font-medium hover:bg-rose-900 transition-colors cursor-pointer"
            >
              Switch Google Account
            </button>
            <Link
              to="/home"
              className="py-3 px-5 border border-stone-300 text-stone-800 text-xs font-medium text-center hover:border-stone-900"
            >
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Admin Top Header Bar */}
      <div className="bg-stone-950 text-white border-b border-stone-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-medium tracking-wide">
              Shingar Dresses Admin Panel
            </span>
            <span className="text-stone-600">·</span>
            <span className="text-xs font-mono text-stone-300">{user.email}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="text-xs text-stone-300 hover:text-white inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Showcase</span>
            </Link>
            <button
              type="button"
              onClick={() => logoutAdminServerSide()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-rose-900 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Module Navigation Tabs */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center gap-1 overflow-x-auto border-t border-stone-800">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-rose-500 text-white bg-stone-900'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Page Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-12">{children}</div>
    </div>
  );
};
