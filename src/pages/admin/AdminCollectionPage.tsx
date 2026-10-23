/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Check,
  X,
  FolderPlus,
} from 'lucide-react';
import { useAtelier } from '../../context/AtelierContext';
import { CollectionItem, ClothingCategory } from '../../types';
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

export const AdminCollectionPage: React.FC = () => {
  const {
    collections,
    categories,
    categoryNames,
    saveCollectionItem,
    deleteCollectionItem,
    saveCategory,
    deleteCategory,
  } = useAtelier();

  // Category Management State
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Clothing Item Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(
    categoryNames[0] || 'Bridal Lehengas'
  );
  const [priceInput, setPriceInput] = useState<string>('');
  const [fabric, setFabric] = useState('');
  const [silhouette, setSilhouette] = useState('');
  const [occasion, setOccasion] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(true);
  const [lookbookChapter, setLookbookChapter] = useState(
    '01. The Royal Sindoor Trousseau'
  );
  const [sku, setSku] = useState('');
  const [availableBranches, setAvailableBranches] = useState(
    'Mumbai (Kala Ghoda Flagship), New Delhi (Mehrauli), Jaipur (Johari Bazaar)'
  );

  const [savingItem, setSavingItem] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetItemForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory(categoryNames[0] || 'Bridal Lehengas');
    setPriceInput('');
    setFabric('');
    setSilhouette('');
    setOccasion('');
    setDescription('');
    setImageUrl('');
    setFeatured(true);
    setLookbookChapter('01. The Royal Sindoor Trousseau');
    setSku('');
    setAvailableBranches(
      'Mumbai (Kala Ghoda Flagship), New Delhi (Mehrauli), Jaipur (Johari Bazaar)'
    );
  };

  const handleEditItem = (item: CollectionItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setPriceInput(item.price > 0 ? String(item.price) : '');
    setFabric(item.fabric);
    setSilhouette(item.silhouette);
    setOccasion(item.occasion);
    setDescription(item.description);
    setImageUrl(item.imageUrl);
    setFeatured(item.featured);
    setLookbookChapter(item.lookbookChapter);
    setSku(item.sku);
    setAvailableBranches(
      item.availableBranches ||
        'Mumbai (Kala Ghoda Flagship), New Delhi (Mehrauli), Jaipur (Johari Bazaar)'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file);
      setImageUrl(dataUrl);
    } catch {
      setErrorMessage('Could not process selected image file.');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const numericPrice = priceInput.trim() === '' ? 0 : Number(priceInput);
      await saveCollectionItem(
        {
          title,
          category,
          price: Number.isFinite(numericPrice) && numericPrice >= 0 ? numericPrice : 0,
          fabric: fabric || 'Pure Handloom Silk',
          silhouette: silhouette || 'Tailored Fit',
          occasion: occasion || 'Bridal & Festive',
          description,
          imageUrl: imageUrl || '/images/dress-crimson-lehenga.jpg',
          featured,
          lookbookChapter: lookbookChapter || '01. The Royal Sindoor Trousseau',
          sku: sku || `SHG-${Date.now().toString().slice(-4)}`,
          availableBranches,
        },
        editingId || undefined
      );
      setStatusMessage(
        editingId
          ? `Updated "${title}" in the clothing showcase.`
          : `Added "${title}" to the clothing showcase.`
      );
      resetItemForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save clothing item.'
      );
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item: CollectionItem) => {
    setDeletingId(item.id);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await deleteCollectionItem(item.id);
      setStatusMessage(`Deleted "${item.title}" from the catalog.`);
      if (editingId === item.id) resetItemForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to delete clothing item.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCategory(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await saveCategory(
        {
          name: catName.trim(),
          description: catDescription.trim(),
          order: categories.length + 1,
        },
        editingCatId || undefined
      );
      setStatusMessage(
        editingCatId
          ? `Updated category "${catName}".`
          : `Added category "${catName}".`
      );
      setCatName('');
      setCatDescription('');
      setEditingCatId(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save category.'
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const handleEditCategory = (cat: ClothingCategory) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDescription(cat.description);
  };

  const handleDeleteCategory = async (cat: ClothingCategory) => {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await deleteCategory(cat.id);
      setStatusMessage(`Removed category "${cat.name}".`);
      if (editingCatId === cat.id) {
        setEditingCatId(null);
        setCatName('');
        setCatDescription('');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to delete category.'
      );
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <p className="text-xs text-rose-900 uppercase tracking-widest font-medium mb-1">
          Catalog &amp; Taxonomy Management
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
          Manage Clothing &amp; Categories
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
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Clothing Categories Manager */}
      <section className="bg-white border border-stone-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl text-stone-950">
              Clothing Categories ({categories.length})
            </h2>
            <p className="text-xs text-stone-500">
              Add, rename, or remove clothing categories displayed on /home and
              /collection.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSaveCategory}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Designer Kurtis, Bridal Lehengas"
              className="w-full px-3.5 py-2 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Category Description (Optional)
            </label>
            <input
              type="text"
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              placeholder="Short description shown on the home page"
              className="w-full px-3.5 py-2 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>
          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={savingCategory}
              className="flex-1 py-2.5 px-4 bg-stone-950 text-white text-xs font-medium hover:bg-rose-900 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{editingCatId ? 'Update Category' : 'Add Category'}</span>
            </button>
            {editingCatId && (
              <button
                type="button"
                onClick={() => {
                  setEditingCatId(null);
                  setCatName('');
                  setCatDescription('');
                }}
                className="py-2.5 px-3 border border-stone-300 text-xs text-stone-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="border border-stone-200 p-3.5 flex items-center justify-between gap-3 bg-stone-50"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-900 truncate">
                  {cat.name}
                </p>
                {cat.description && (
                  <p className="text-[11px] text-stone-500 truncate">
                    {cat.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEditCategory(cat)}
                  title="Edit Category"
                  className="p-1.5 text-stone-500 hover:text-stone-950 border border-stone-200 bg-white"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  title="Delete Category"
                  className="p-1.5 text-stone-500 hover:text-rose-900 border border-stone-200 bg-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Add / Edit Clothing Item Form */}
      <section className="bg-white border border-stone-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl text-stone-950">
              {editingId ? 'Edit Clothing Item' : 'Add New Clothing Item'}
            </h2>
            <p className="text-xs text-stone-500">
              Upload a product photo or enter an image URL. Price is optional (leave
              blank for &ldquo;Price on Request&rdquo;).
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetItemForm}
              className="px-3.5 py-2 border border-stone-300 text-xs font-medium text-stone-700 hover:border-stone-900"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveItem} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Clothing Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Arundhati Sindoor Zardozi Lehenga"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm bg-white focus:outline-none focus:border-stone-900"
              >
                {categoryNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Optional Price in INR (Leave blank for Price on Request)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="e.g. 125000 (or leave empty)"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm font-mono focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Fabric &amp; Work
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Pure Katan Silk & Zardozi"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Silhouette / Cut
              </label>
              <input
                type="text"
                value={silhouette}
                onChange={(e) => setSilhouette(e.target.value)}
                placeholder="e.g. 24-Kali Flared Lehenga"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Reference Code (SKU)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SHG-BL-109"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm font-mono focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Occasion
              </label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Wedding Ceremony & Reception"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Lookbook Chapter
              </label>
              <input
                type="text"
                value={lookbookChapter}
                onChange={(e) => setLookbookChapter(e.target.value)}
                placeholder="01. The Royal Sindoor Trousseau"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Showroom Availability
              </label>
              <input
                type="text"
                value={availableBranches}
                onChange={(e) => setAvailableBranches(e.target.value)}
                placeholder="Mumbai, New Delhi, Jaipur, Surat"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Product Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the garment's craftsmanship, embroidery, and styling details..."
              className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Product Image URL or Upload Photo
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/dress-crimson-lehenga.jpg or https://..."
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="md:col-span-3 pt-4">
              <label className="w-full py-2.5 px-4 border border-stone-300 bg-stone-50 text-xs font-medium text-stone-800 hover:border-stone-900 inline-flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-3 pt-4 flex items-center gap-2">
              <input
                id="featured-toggle"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-rose-900"
              />
              <label
                htmlFor="featured-toggle"
                className="text-xs font-medium text-stone-800 cursor-pointer"
              >
                Feature on Home Page
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingItem}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-white text-xs font-medium hover:bg-rose-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              {editingId ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{savingItem ? 'Saving Changes...' : 'Update Clothing Item'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{savingItem ? 'Adding Item...' : 'Add Clothing to Showcase'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 3: Existing Clothing Items Grid */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-stone-950">
          Current Clothing Catalog ({collections.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 flex flex-col justify-between"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
                <CoutureArtwork
                  src={item.imageUrl}
                  alt={item.title}
                  title={item.title}
                  subtitle={item.category}
                  sku={item.sku}
                  className="w-full h-full"
                />
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{item.category}</span>
                    <span className="font-mono">{item.sku}</span>
                  </div>
                  <h3 className="font-serif text-xl text-stone-950">{item.title}</h3>
                  <p className="text-sm font-mono tabular-nums font-medium text-rose-900">
                    {item.price > 0
                      ? `₹${item.price.toLocaleString('en-IN')}`
                      : 'Price on Request'}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditItem(item)}
                    className="flex-1 py-2 px-3 border border-stone-300 text-xs font-medium text-stone-800 hover:border-stone-900 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item)}
                    disabled={deletingId === item.id}
                    className="py-2 px-3 border border-rose-200 text-xs font-medium text-rose-900 hover:bg-rose-50 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === item.id ? 'Deleting...' : 'Delete'}</span>
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
