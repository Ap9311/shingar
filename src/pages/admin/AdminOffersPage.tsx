/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Check, X } from 'lucide-react';
import { useAtelier } from '../../context/AtelierContext';
import { OfferPoster } from '../../types';
import { CoutureArtwork } from '../../components/CoutureArtwork';

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => resolve(String(reader.result));
      img.src = String(reader.result);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export const AdminOffersPage: React.FC = () => {
  const { offers, saveOfferPoster, deleteOfferPoster } = useAtelier();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [privilegeBadge, setPrivilegeBadge] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setPrivilegeBadge('');
    setValidUntil('');
    setDescription('');
    setPosterUrl('');
    setActive(true);
  };

  const handleEdit = (offer: OfferPoster) => {
    setEditingId(offer.id);
    setTitle(offer.title);
    setSubtitle(offer.subtitle);
    setPrivilegeBadge(offer.privilegeBadge);
    setValidUntil(offer.validUntil);
    setDescription(offer.description);
    setPosterUrl(offer.posterUrl);
    setActive(offer.active);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file);
      setPosterUrl(dataUrl);
    } catch {
      setErrorMessage('Could not load photo.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await saveOfferPoster(
        {
          title,
          subtitle,
          privilegeBadge: privilegeBadge || 'In-Store Sale',
          validUntil: validUntil || 'Available at Our Junagadh Shops',
          description,
          posterUrl: posterUrl || '/images/hero-mens-ethnic.jpg',
          privilegeCode: editingId || `SALE-${Date.now().toString().slice(-4)}`,
          active,
        },
        editingId || undefined
      );
      setStatusMessage(
        editingId ? `Saved offer "${title}".` : `Added new offer "${title}".`
      );
      resetForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not save offer.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offer: OfferPoster) => {
    setDeletingId(offer.id);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await deleteOfferPoster(offer.id);
      setStatusMessage(`Deleted offer "${offer.title}".`);
      if (editingId === offer.id) resetForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not delete offer.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs text-stone-500 mb-1">In-Store Sales &amp; Offers</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
          Add or Edit Store Offers
        </h1>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-stone-100 border border-stone-300 text-xs text-stone-900 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Simple Offer Form (No Coupon Code Field) */}
      <section className="bg-white border border-stone-200 p-5 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl text-stone-950">
              {editingId ? 'Edit Offer' : '1. Add a New Store Offer'}
            </h2>
            <p className="text-xs text-stone-500">
              Tell customers about sales going on at your M.G. Road or Motibaug Road
              shop.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-2 border border-stone-300 text-xs font-medium text-stone-700 cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Offer Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Festival & Wedding Family Sale"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Short Line *
              </label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Discount on Men's Kurta-Pyjamas & Kids' Wear"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Discount / Sale Badge *
              </label>
              <input
                type="text"
                required
                value={privilegeBadge}
                onChange={(e) => setPrivilegeBadge(e.target.value)}
                placeholder="e.g. 15% Off In-Store Sale"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Where / Until When *
              </label>
              <input
                type="text"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                placeholder="e.g. Going on at Both Junagadh Branches"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Offer Details *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write which shop branch customers should visit to buy..."
              className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <label className="w-full py-3 px-4 border border-stone-900 bg-stone-100 text-xs font-semibold text-stone-950 hover:bg-stone-200 inline-flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Offer Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-5">
              <input
                type="text"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="Or paste photo link here..."
                className="w-full px-3.5 py-2.5 border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <input
                id="active-offer-toggle"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-stone-950"
              />
              <label
                htmlFor="active-offer-toggle"
                className="text-xs font-medium text-stone-800 cursor-pointer"
              >
                Show Offer on Website
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-white text-xs sm:text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {editingId ? (
              <>
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Offer Changes'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{saving ? 'Adding...' : 'Add Offer to Website'}</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* Current Offers List */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-stone-950">
          2. Current Offers ({offers.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-stone-200 flex flex-col justify-between"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <CoutureArtwork
                  src={offer.posterUrl}
                  alt={offer.title}
                  title={offer.title}
                  subtitle={offer.privilegeBadge}
                  sku={offer.privilegeCode}
                  className="w-full h-full"
                />
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-900 font-semibold">
                      {offer.privilegeBadge}
                    </span>
                    <span className="text-stone-500">
                      {offer.active ? 'Showing' : 'Hidden'}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-stone-950">{offer.title}</h3>
                  <p className="text-xs text-stone-500">{offer.validUntil}</p>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(offer)}
                    className="flex-1 py-2 px-3 border border-stone-300 text-xs font-medium text-stone-800 hover:border-stone-900 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(offer)}
                    disabled={deletingId === offer.id}
                    className="py-2 px-3 border border-stone-300 text-xs font-medium text-stone-800 hover:bg-stone-100 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === offer.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
