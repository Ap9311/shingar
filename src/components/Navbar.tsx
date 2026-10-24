/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  User as UserIcon,
  LogOut,
  Home,
  Grid,
  Camera,
  Tag,
  Info,
  MapPin,
  Phone,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { SHINGAR_CONTACT_DETAILS, SHINGAAR_BRANCHES } from '../data/seedData';

const NAV_LINKS = [
  { path: '/home', label: 'Home', subtitle: 'Showcase & Highlights', icon: Home },
  { path: '/collection', label: 'Collection', subtitle: 'Readymade, Ethnic & NX', icon: Grid },
  { path: '/lookbook', label: 'Lookbook', subtitle: 'Fashion Editorial Gallery', icon: Camera },
  { path: '/offers', label: 'Offers', subtitle: 'In-Store Privileges', icon: Tag },
  { path: '/about', label: 'About', subtitle: 'Brand Story & Showrooms', icon: Info },
  { path: '/contact', label: 'Contact', subtitle: 'M.G. Road & Motibaug Stores', icon: MapPin },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isSigningIn, authError, signInWithGoogle, signOutUser } = useAtelier();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu automatically on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/home' && (location.pathname === '/' || location.pathname === '/home')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const activeNavItem =
    NAV_LINKS.find((item) => isActive(item.path)) || NAV_LINKS[0];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark + Current Page Indicator */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/home"
              className="flex items-center shrink-0 group"
            >
              <span className="font-serif text-2xl sm:text-[28px] font-medium tracking-tight text-stone-950 leading-none group-hover:text-stone-600 transition-colors">
                Shingar Dresses
              </span>
            </Link>

            {/* Clear Current Page Location Badge */}
            <div
              aria-label="Current Page Indicator"
              className="hidden sm:inline-flex items-center gap-1.5 pl-4 border-l border-stone-200 text-xs text-stone-500"
            >
              <Compass className="w-3.5 h-3.5 text-stone-700" />
              <span className="font-mono uppercase tracking-wider text-[10px] text-stone-400">
                Page:
              </span>
              <span className="font-medium text-stone-950">
                {activeNavItem.label}
              </span>
            </div>
          </div>

          {/* Zone 2: Desktop Navigation Links (No public Admin link) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {NAV_LINKS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-2 text-sm transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-stone-950 font-semibold'
                      : 'text-stone-500 font-medium hover:text-stone-950'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-950"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Customer Google Sign-In & Animated Clothing-Store Menu Button */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="hidden sm:flex items-center gap-2.5 pl-2">
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
                <span className="text-xs font-medium text-stone-800 max-w-[140px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  title="Sign Out"
                  className="p-1.5 text-stone-400 hover:text-stone-950 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={isSigningIn}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-stone-950 hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{isSigningIn ? 'Signing In...' : 'Sign In with Google'}</span>
              </button>
            )}

            {/* Mobile Current Page Pill + Animated Menu Button */}
            <span className="sm:hidden text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 bg-stone-100 text-stone-800 border border-stone-200">
              {activeNavItem.label}
            </span>

            {/* Animated Fashion Atelier Hamburger / Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden relative inline-flex items-center gap-2 px-3 py-2 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-950 transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-mono uppercase tracking-widest font-medium">
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </span>
              <div className="relative w-5 h-4 flex flex-col justify-between items-end">
                <motion.span
                  animate={
                    mobileMenuOpen
                      ? { rotate: 45, y: 7, width: '20px' }
                      : { rotate: 0, y: 0, width: '20px' }
                  }
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="block h-[1.5px] bg-stone-950 origin-center"
                />
                <motion.span
                  animate={
                    mobileMenuOpen
                      ? { opacity: 0, width: '0px' }
                      : { opacity: 1, width: '14px' }
                  }
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="block h-[1.5px] bg-stone-600"
                />
                <motion.span
                  animate={
                    mobileMenuOpen
                      ? { rotate: -45, y: -7, width: '20px' }
                      : { rotate: 0, y: 0, width: '18px' }
                  }
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="block h-[1.5px] bg-stone-950 origin-center"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Auth Error Toast Banner if popup was blocked or closed */}
        {authError && (
          <div className="bg-stone-100 border-t border-stone-300 px-4 py-2 text-center text-xs text-stone-900">
            {authError}
          </div>
        )}

        {/* Smooth Animated Clothing-Shop Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 top-16 sm:top-20 bg-black/40 backdrop-blur-xs z-30"
              />
              <motion.div
                key="drawer-panel"
                initial={{ opacity: 0, y: -16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -12, height: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="lg:hidden relative z-40 border-t border-stone-200 bg-white overflow-hidden shadow-2xl"
              >
                <div className="px-5 py-6 space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {NAV_LINKS.map((item, idx) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.24 }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-4 py-3.5 border transition-colors ${
                              active
                                ? 'bg-stone-950 text-white border-stone-950'
                                : 'bg-stone-50 text-stone-900 border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  active ? 'text-stone-300' : 'text-stone-700'
                                }`}
                              />
                              <div>
                                <p className="text-sm font-medium leading-none">
                                  {item.label}
                                </p>
                                <p
                                  className={`text-[11px] mt-1 ${
                                    active ? 'text-stone-300' : 'text-stone-500'
                                  }`}
                                >
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                            <ArrowUpRight
                              className={`w-4 h-4 ${
                                active ? 'text-stone-300' : 'text-stone-400'
                              }`}
                            />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Customer Account Box in Mobile Drawer */}
                  <div className="pt-4 border-t border-stone-200 flex flex-col gap-3">
                    {user ? (
                      <div className="flex items-center justify-between bg-stone-50 px-4 py-3 border border-stone-200">
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
                            <p className="text-[11px] text-stone-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            signOutUser();
                            setMobileMenuOpen(false);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-stone-900 border border-stone-200 bg-white cursor-pointer"
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
                        className="w-full py-3.5 bg-stone-950 text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>
                          {isSigningIn ? 'Signing In...' : 'Sign In with Google'}
                        </span>
                      </button>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span>M.G. Road &amp; Motibaug Road, Junagadh</span>
                      <a
                        href={`tel:+${SHINGAR_CONTACT_DETAILS.whatsappNumbers[0].raw}`}
                        className="font-mono text-stone-900 font-medium inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-stone-700" />
                        <span>{SHINGAR_CONTACT_DETAILS.whatsappNumbers[0].number}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Touch-Friendly Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-1 py-1 flex items-center justify-around"
      >
        {NAV_LINKS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[52px] py-1.5 text-[10px] font-medium transition-colors ${
                active
                  ? 'text-stone-950 font-semibold border-t-2 border-stone-950 -mt-[2px]'
                  : 'text-stone-500'
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <Link
              to="/home"
              className="font-serif text-2xl font-medium text-white tracking-tight block"
            >
              Shingar Dresses
            </Link>
            <div className="pt-1 flex flex-wrap gap-2">
              {SHINGAR_CONTACT_DETAILS.instagramHandles.map((ig) => (
                <a
                  key={ig.handle}
                  href={ig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-stone-900 border border-stone-800 hover:border-stone-600 text-xs text-stone-200 inline-flex items-center gap-1 transition-colors"
                >
                  <span>{ig.handle}</span>
                  <ArrowUpRight className="w-3 h-3 text-stone-400" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-400">
              Explore Showcase
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
                  Brand Story &amp; Branches
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Store Hours
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-400">
              Junagadh Showrooms
            </h3>
            <ul className="space-y-3 text-sm text-stone-400">
              {SHINGAAR_BRANCHES.map((branch) => (
                <li key={branch.id} className="leading-relaxed">
                  <strong className="text-stone-200 font-medium block">
                    {branch.name}
                  </strong>
                  <span className="text-xs text-stone-400">{branch.address}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
