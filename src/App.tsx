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
} from 'react-router-dom';
import { AtelierProvider } from './context/AtelierContext';
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

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
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
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/lookbook" element={<LookbookPage />} />
              <Route path="/offers" element={<OffersPage />} />
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
