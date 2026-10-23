/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DressCategory = string;

export const DEFAULT_CATEGORIES: string[] = [
  "Men's Readymade & Kurta-Pyjamas",
  'Trending Streetwear (Shingar NX)',
  "Kids' Wear & Fancy Dresses",
  'Festive & Traditional Clothing',
  'School Uniforms',
];

export interface ClothingCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ShowroomBranch {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapEmbedUrl: string;
  directionsUrl: string;
  specialties: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  category: DressCategory;
  price: number; // 0 indicates optional / price on request in store
  fabric: string;
  silhouette: string;
  occasion: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  lookbookChapter: string;
  sku: string;
  availableBranches?: string;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OfferPoster {
  id: string;
  title: string;
  subtitle: string;
  privilegeBadge: string;
  validUntil: string;
  description: string;
  posterUrl: string;
  privilegeCode: string;
  active: boolean;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserDirectoryRecord {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt?: unknown;
  lastLoginAt?: unknown;
}

export interface AtelierInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  dressReference: string;
  message: string;
  authorUid: string;
  createdAt?: unknown;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  contentBase64: string;
}
