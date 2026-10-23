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
    categoryNames[0] || "Men's Readymade & Kurta-Pyjamas"
  );
  const [priceInput, setPriceInput] = useState<string>('');
  const [fabric, setFabric] = useState('');
  const [silhouette, setSilhouette] = useState('');
  const [occasion, setOccasion] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(true);
  const [lookbookChapter, setLookbookChapter] = useState(
    '01. Men’s Ethnic & Kurta-Pyjamas'
  );
  const [sku, setSku] = useState('');
  const [availableBranches, setAvailableBranches] = useState(
    'Both Shops: M.G. Road & Shingar NX (Motibaug Road)'
  );

  const [savingItem, setSavingItem] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetItemForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory(categoryNames[0] || "Men's Readymade & Kurta-Pyjamas");
    setPriceInput('');
    setFabric('');
    setSilhouette('');
    setOccasion('');
    setDescription('');
    setImageUrl('');
    setFeatured(true);
    setLookbookChapter('01. Men’s Ethnic & Kurta-Pyjamas');
    setSku('');
    setAvailableBranches('Both Shops: M.G. Road & Shingar NX (Motibaug Road)');
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
        'Both Shops: M.G. Road & Shingar NX (Motibaug Road)'
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
      setErrorMessage('Could not load photo.');
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
          fabric: fabric || 'Cotton & Silk',
          silhouette: silhouette || 'Regular Fit',
          occasion: occasion || 'Festive & Daily Wear',
          description,
          imageUrl: imageUrl || '/images/hero-mens-ethnic.jpg',
          featured,
          lookbookChapter: lookbookChapter || '01. Men’s Ethnic & Kurta-Pyjamas',
          sku: sku || `SHG-${Date.now().toString().slice(-4)}`,
          availableBranches,
        },
        editingId || undefined
      );
      setStatusMessage(
        editingId ? `Saved changes to "${title}".` : `Added "${title}" to website.`
      );
      resetItemForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not save cloth.'
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
      setStatusMessage(`Deleted "${item.title}".`);
      if (editingId === item.id) resetItemForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not delete cloth.'
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
          ? `Saved category "${catName}".`
          : `Added category "${catName}".`
      );
      setCatName('');
      setCatDescription('');
      setEditingCatId(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not save category.'
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
      setStatusMessage(`Deleted category "${cat.name}".`);
      if (editingCatId === cat.id) {
        setEditingCatId(null);
        setCatName('');
        setCatDescription('');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not delete category.'
      );
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs text-stone-500 mb-1">Manage Shop Items</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-950">
          Add or Edit Clothes
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

      {/* SECTION 1: Add / Edit Cloth Form */}
      <section className="bg-white border border-stone-200 p-5 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl text-stone-950">
              {editingId ? 'Edit Cloth Details' : '1. Add a New Cloth'}
            </h2>
            <p className="text-xs text-stone-500">
              Fill the name, choose a category, and upload a photo from your phone or
              computer.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetItemForm}
              className="px-3.5 py-2 border border-stone-300 text-xs font-medium text-stone-700 hover:border-stone-900 cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Cloth Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Silk Kurta-Pyjama Set"
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
                Price in ₹ (Optional — leave empty if no fixed price)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm font-mono focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Fabric / Material (Optional)
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Pure Cotton, Silk, Denim"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Available at Which Shop?
              </label>
              <select
                value={availableBranches}
                onChange={(e) => setAvailableBranches(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm bg-white focus:outline-none focus:border-stone-900"
              >
                <option value="Both Shops: M.G. Road & Shingar NX (Motibaug Road)">
                  Both Shops (M.G. Road &amp; Shingar NX)
                </option>
                <option value="Main Shop (M.G. Road, Near Ranavav Chowk)">
                  Branch 1: Main Shop (M.G. Road)
                </option>
                <option value="Shingar NX (Motibaug Road, Above Bata Showroom)">
                  Branch 2: Shingar NX (Motibaug Road)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Good For / Occasion (Optional)
              </label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Weddings, Daily Wear, School"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Short Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write 1 or 2 simple lines about this cloth..."
              className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <label className="w-full py-3 px-4 border border-stone-900 bg-stone-100 text-xs font-semibold text-stone-950 hover:bg-stone-200 inline-flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Photo from Phone / Computer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-5">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste photo link here..."
                className="w-full px-3.5 py-2.5 border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <input
                id="featured-toggle"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-stone-950"
              />
              <label
                htmlFor="featured-toggle"
                className="text-xs font-medium text-stone-800 cursor-pointer"
              >
                Show on Home Page
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingItem}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-white text-xs sm:text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {editingId ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{savingItem ? 'Saving...' : 'Save Cloth Changes'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{savingItem ? 'Adding...' : 'Add Cloth to Website'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 2: All Current Clothes */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-stone-950">
          2. Current Clothes on Website ({collections.length})
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
                  <p className="text-xs text-stone-500">{item.category}</p>
                  <h3 className="font-serif text-xl text-stone-950">{item.title}</h3>
                  <p className="text-sm font-mono tabular-nums font-semibold text-stone-900">
                    {item.price > 0
                      ? `₹${item.price.toLocaleString('en-IN')}`
                      : 'Ask Price in Shop'}
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
                    className="py-2 px-3 border border-stone-300 text-xs font-medium text-stone-800 hover:bg-stone-100 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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

      {/* SECTION 3: Manage Categories */}
      <section className="bg-white border border-stone-200 p-5 sm:p-8 space-y-5">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="font-serif text-2xl text-stone-950">
            3. Clothing Categories ({categories.length})
          </h2>
          <p className="text-xs text-stone-500">
            Add or rename clothing categories.
          </p>
        </div>

        <form
          onSubmit={handleSaveCategory}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
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
              placeholder="e.g. Men's Kurta-Pyjamas"
              className="w-full px-3.5 py-2 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Short Note (Optional)
            </label>
            <input
              type="text"
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              placeholder="Short note about this category"
              className="w-full px-3.5 py-2 border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>
          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={savingCategory}
              className="flex-1 py-2.5 px-4 bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{editingCatId ? 'Save Category' : 'Add Category'}</span>
            </button>
            {editingCatId && (
              <button
                type="button"
                onClick={() => {
                  setEditingCatId(null);
                  setCatName('');
                  setCatDescription('');
                }}
                className="py-2.5 px-3 border border-stone-300 text-xs text-stone-700 cursor-pointer"
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
                  title="Edit"
                  className="p-1.5 text-stone-500 hover:text-stone-950 border border-stone-200 bg-white cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  title="Delete"
                  className="p-1.5 text-stone-500 hover:text-stone-950 border border-stone-200 bg-white cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
