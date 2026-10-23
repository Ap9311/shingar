/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Home,
  Grid,
  Camera,
  Tag,
  Info,
  MapPin,
} from 'lucide-react';
import { useAtelier, AUTHORIZED_ADMIN_EMAIL } from '../context/AtelierContext';

const NAV_LINKS = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/collection', label: 'Collection', icon: Grid },
  { path: '/lookbook', label: 'Lookbook', icon: Camera },
  { path: '/offers', label: 'Offers', icon: Tag },
  { path: '/about', label: 'About', icon: Info },
  { path: '/contact', label: 'Contact', icon: MapPin },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isSigningIn, signInWithGoogle, signOutUser } = useAtelier();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/home' && (location.pathname === '/' || location.pathname === '/home')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const isAuthorizedAdminUser =
    Boolean(user?.email) &&
    user!.email!.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/home"
            className="font-serif text-2xl sm:text-[28px] font-medium tracking-tight text-stone-950 whitespace-nowrap shrink-0"
          >
            Shingar Dresses
          </Link>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-8"
          >
            {NAV_LINKS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-stone-950'
                      : 'text-stone-500 hover:text-stone-950'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-rose-900" />
                  )}
                </Link>
              );
            })}
            <Link
              to="/admin"
              className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/admin')
                  ? 'text-rose-900'
                  : 'text-stone-500 hover:text-stone-950'
              }`}
            >
              Admin
              {location.pathname.startsWith('/admin') && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-rose-900" />
              )}
            </Link>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                {isAuthorizedAdminUser && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-rose-900 hover:bg-rose-950 transition-colors whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Customer'}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-medium">
                      {(user.displayName || user.email || 'S')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-stone-800 max-w-[130px] truncate">
                    {user.displayName || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOutUser()}
                    title="Sign Out"
                    className="p-1.5 text-stone-400 hover:text-rose-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={isSigningIn}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-stone-950 hover:bg-rose-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{isSigningIn ? 'Signing In...' : 'Sign In with Google'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-stone-900 hover:bg-stone-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-5 py-6 space-y-5 shadow-xl">
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 text-sm font-medium border transition-colors ${
                      active
                        ? 'bg-stone-950 text-white border-stone-950'
                        : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-col gap-3">
              {user ? (
                <div className="flex items-center justify-between bg-stone-50 px-3.5 py-3 border border-stone-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Customer'}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">
                        {(user.displayName || 'S')[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {user.displayName || 'Valued Customer'}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      signOutUser();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-rose-900 border border-stone-200 bg-white"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    signInWithGoogle();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isSigningIn}
                  className="w-full py-3 bg-stone-950 text-white text-xs font-medium flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{isSigningIn ? 'Signing In...' : 'Sign In with Google'}</span>
                </button>
              )}

              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 border border-stone-300 text-stone-800 text-xs font-medium flex items-center justify-center gap-2 hover:bg-stone-50"
              >
                <ShieldCheck className="w-4 h-4 text-rose-900" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Compact Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-1 py-1 flex items-center justify-around"
      >
        {NAV_LINKS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 text-[10px] font-medium transition-colors ${
                active ? 'text-rose-900 font-semibold' : 'text-stone-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-stone-200 border-t border-stone-800 pb-20 lg:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          <div className="space-y-4">
            <Link
              to="/home"
              className="font-serif text-2xl font-medium text-white tracking-tight block"
            >
              Shingar Dresses
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Indian bridal couture, handloom Banarasi silks, royal Anarkalis, and
              contemporary festive wear showcased across our physical flagship stores.
            </p>
            <p className="text-xs text-stone-500">
              In-Store Showcase Only · No Online Ordering
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-400">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link to="/home" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/collection" className="hover:text-white transition-colors">
                  Clothing Collection
                </Link>
              </li>
              <li>
                <Link to="/lookbook" className="hover:text-white transition-colors">
                  Fashion Lookbook
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Promotional Offers
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Brand Story & Stores
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Store Hours
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-400">
              Showroom Branches
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <strong className="text-stone-200 font-medium">Mumbai Flagship:</strong> 14
                Rampart Row, Kala Ghoda, Fort
              </li>
              <li>
                <strong className="text-stone-200 font-medium">New Delhi:</strong> Ambawatta
                One, Kalka Das Marg, Mehrauli
              </li>
              <li>
                <strong className="text-stone-200 font-medium">Jaipur:</strong> 88 Haldiyon
                Ka Rasta, Johari Bazaar
              </li>
              <li>
                <strong className="text-stone-200 font-medium">Surat:</strong> Level 2,
                Heritage Textile Plaza, Ring Road
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-400">
              Store Concierge
            </h3>
            <p className="text-sm text-stone-300">+91 22 2284 7900</p>
            <p className="text-sm text-stone-400">concierge@shingardresses.com</p>
            <p className="text-xs text-stone-500">
              Open Daily: 11:00 AM – 8:30 PM IST
            </p>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>Store Admin Portal</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Shingar Dresses. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-stone-300 transition-colors">
              About Shingar
            </Link>
            <Link to="/collection" className="hover:text-stone-300 transition-colors">
              Catalog
            </Link>
            <Link to="/contact" className="hover:text-stone-300 transition-colors">
              Store Locator
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
