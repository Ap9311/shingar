/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from 'react-router-dom';
import { Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { AtelierProvider, useAtelier } from './context/AtelierContext';
import { Navbar, Footer } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { LookbookPage } from './pages/LookbookPage';
import { OffersPage } from './pages/OffersPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminCollectionPage } from './pages/admin/AdminCollectionPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminEmailPage } from './pages/admin/AdminEmailPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

// Protects /collection, /lookbook, and /offers so visitors must sign in with Google first
const RequireCustomerSignIn: React.FC<{
  pageName: string;
  children: React.ReactNode;
}> = ({ pageName, children }) => {
  const { user, authReady, isSigningIn, authError, signInWithGoogle } = useAtelier();

  if (!authReady) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
        <p className="text-sm text-stone-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-stone-200 max-w-md w-full p-6 sm:p-8 text-center space-y-5">
          <div className="w-11 h-11 bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-stone-800" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-950">
              Sign In to View {pageName}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Please sign in with your Google account to see our{' '}
              {pageName.toLowerCase()}, photos, and store offers.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-stone-100 border border-stone-300 text-xs text-stone-900">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            disabled={isSigningIn}
            className="w-full py-3.5 px-6 bg-stone-950 text-white text-xs sm:text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UserIcon className="w-4 h-4" />
            <span>
              {isSigningIn ? 'Signing In...' : 'Sign In with Google'}
            </span>
          </button>

          <div className="pt-3 border-t border-stone-200">
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-950"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home Page</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AtelierProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white text-stone-900">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route
                path="/collection"
                element={
                  <RequireCustomerSignIn pageName="Collection">
                    <CollectionPage />
                  </RequireCustomerSignIn>
                }
              />
              <Route
                path="/lookbook"
                element={
                  <RequireCustomerSignIn pageName="Lookbook">
                    <LookbookPage />
                  </RequireCustomerSignIn>
                }
              />
              <Route
                path="/offers"
                element={
                  <RequireCustomerSignIn pageName="Offers">
                    <OffersPage />
                  </RequireCustomerSignIn>
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Secured Admin Dashboard Routes */}
              <Route
                path="/admin"
                element={
                  <AdminLayout>
                    <AdminOverviewPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/collection"
                element={
                  <AdminLayout>
                    <AdminCollectionPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/offers"
                element={
                  <AdminLayout>
                    <AdminOffersPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminLayout>
                    <AdminUsersPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <AdminLayout>
                    <AdminMessagesPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/email"
                element={
                  <AdminLayout>
                    <AdminEmailPage />
                  </AdminLayout>
                }
              />

              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AtelierProvider>
  );
}
