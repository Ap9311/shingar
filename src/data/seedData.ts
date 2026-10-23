/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollectionItem, OfferPoster, ShowroomBranch, ClothingCategory } from '../types';

export const HERO_BANNER_IMAGE = '/images/hero-mens-ethnic.jpg';
export const ABOUT_BOUTIQUE_IMAGE = '/images/about-boutique.jpg';

export interface HeroSlide {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaLink: string;
  secondaryLabel: string;
  secondaryLink: string;
  tag: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-mens-kurta',
    kicker: 'Shingar Dresses · Junagadh · Since 1987',
    title: "Men's Kurta-Pyjamas & Wedding Wear",
    subtitle:
      'Quality silk kurta-pyjamas, ethnic jackets, and readymade menswear at our M.G. Road and Motibaug Road shops.',
    imageUrl: '/images/hero-mens-ethnic.jpg',
    ctaLabel: 'See Clothes',
    ctaLink: `/collection?category=${encodeURIComponent("Men's Readymade & Kurta-Pyjamas")}`,
    secondaryLabel: 'Open Lookbook',
    secondaryLink: '/lookbook',
    tag: 'M.G. Road & Motibaug Road, Junagadh',
  },
  {
    id: 'slide-streetwear-nx',
    kicker: 'Shingar NX · Motibaug Road',
    title: 'Shingar NX Streetwear & Casuals',
    subtitle:
      'Latest t-shirts, overshirts, jeans, cargos, and daily wear for youth at Shingar NX (Above Bata Showroom).',
    imageUrl: '/images/hero-streetwear-nx.jpg',
    ctaLabel: 'See Streetwear',
    ctaLink: `/collection?category=${encodeURIComponent('Trending Streetwear (Shingar NX)')}`,
    secondaryLabel: 'Store Offers',
    secondaryLink: '/offers',
    tag: 'Open Daily 10 AM – 10 PM',
  },
  {
    id: 'slide-kids-festive',
    kicker: 'Family & School Shop',
    title: "Kids' Wear, Fancy Dresses & School Uniforms",
    subtitle:
      'Festival clothes for children, stage fancy dresses, and complete school uniforms in all sizes.',
    imageUrl: '/images/hero-bridal.jpg',
    ctaLabel: 'See All Clothes',
    ctaLink: '/collection',
    secondaryLabel: 'About Our Shop',
    secondaryLink: '/about',
    tag: 'Trusted Since 1987',
  },
];

export const SHINGAR_CONTACT_DETAILS = {
  businessName: 'Shingar Dresses & Shingar NX',
  establishedYear: 1987,
  yearsInOperation: '39+ Years',
  ownerName: 'Ashvin A. Shah',
  ownerPhone: '+91 94282 41901',
  whatsappNumbers: [
    { label: 'Phone / WhatsApp 1', number: '+91 98251 21298', raw: '919825121298' },
    { label: 'Phone / WhatsApp 2 (Shingar NX)', number: '+91 98251 21598', raw: '919825121598' },
    { label: 'Phone / WhatsApp 3', number: '+91 91735 38556', raw: '919173538556' },
  ],
  landline: '+91 285 2651406 (0285-2651406)',
  instagramHandles: [
    {
      handle: '@shingar_dresses',
      url: 'https://www.instagram.com/shingar_dresses/',
      label: 'Shingar Dresses Instagram',
    },
    {
      handle: '@shingar__nx',
      url: 'https://www.instagram.com/shingar__nx/',
      label: 'Shingar NX Instagram',
    },
  ],
};

const PHOTO_POOL = [
  '/images/hero-mens-ethnic.jpg',
  '/images/mens-streetwear.jpg',
  '/images/kids-festive.jpg',
  '/images/dress-crimson-lehenga.jpg',
  '/images/school-uniform.jpg',
  '/images/hero-streetwear-nx.jpg',
  '/images/dress-ivory-anarkali.jpg',
  '/images/dress-festive-sharara.jpg',
];

const SKU_PHOTO_MAP: Record<string, string> = {
  'SHG-KP-101': '/images/hero-mens-ethnic.jpg',
  'SHG-NX-204': '/images/mens-streetwear.jpg',
  'SHG-KD-309': '/images/kids-festive.jpg',
  'SHG-FT-412': '/images/dress-crimson-lehenga.jpg',
  'SHG-SU-508': '/images/school-uniform.jpg',
  'SHG-NX-108': '/images/hero-streetwear-nx.jpg',
  'SHINGAR-FESTIVE-26': '/images/hero-mens-ethnic.jpg',
  'SHINGAR-NX-DROP': '/images/hero-streetwear-nx.jpg',
  'SHINGAR-SCHOOL-26': '/images/school-uniform.jpg',
};

export function resolveFashionImageUrl(rawUrl: string, codeOrSku?: string): string {
  const cleanKey = (codeOrSku || '').toUpperCase().trim();
  if (rawUrl && !rawUrl.startsWith('data:image/svg+xml')) {
    return rawUrl;
  }
  if (cleanKey && SKU_PHOTO_MAP[cleanKey]) {
    return SKU_PHOTO_MAP[cleanKey];
  }
  let hash = 0;
  for (let i = 0; i < cleanKey.length; i++) {
    hash = (hash * 31 + cleanKey.charCodeAt(i)) % PHOTO_POOL.length;
  }
  return PHOTO_POOL[Math.abs(hash) % PHOTO_POOL.length];
}

export const SHINGAAR_BRANCHES: ShowroomBranch[] = [
  {
    id: 'junagadh-mg-road',
    city: 'Branch 1 · M.G. Road, Junagadh',
    name: 'Shingar Dresses (M.G. Road Main Shop)',
    address:
      'Jenellie (Jenili) Shopping Centre, M.G. Road, Near Ranavav Chowk / Vanzari Chowk, Mullawada, Junagadh, Gujarat - 362001',
    phone: '+91 98251 21298 · 0285-2651406',
    hours:
      'Mon – Sat: 10:00 AM – 8:00 PM (Break: 2:00 PM – 3:00 PM) · Sun: 9:00 AM – 3:00 PM',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Shingar+Dresses,+Jenili+Shopping+Centre,+MG+Road,+Ranavav+Chowk,+Junagadh,+Gujarat+362001&hl=en&z=17&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Shingar+Dresses+Jenili+Shopping+Centre+MG+Road+Ranavav+Chowk+Junagadh+Gujarat+362001',
    specialties:
      "Men's Readymade Clothes, Kurta-Pyjamas, Kids' Wear, Fancy Dresses & School Uniforms",
  },
  {
    id: 'junagadh-motibaug-nx',
    city: 'Branch 2 · Motibaug Road, Junagadh',
    name: 'Shingar NX (Motibaug Road)',
    address:
      'Shingar NX, Motibagh Road, Above Bata Showroom, Junagadh, Gujarat - 362001',
    phone: '+91 98251 21598 · +91 91735 38556',
    hours: 'Open Every Day (Mon – Sun): 10:00 AM – 10:00 PM',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Shingar+NX,+Motibagh+Road,+Above+Bata+Showroom,+Junagadh,+Gujarat+362001&hl=en&z=17&output=embed',
    directionsUrl: 'https://maps.app.goo.gl/js1D81DuKayVUxC77',
    specialties:
      'Youth Streetwear, T-Shirts, Jeans, Cargos, Casual Shirts & Festive Kurta Sets',
  },
];

export const INITIAL_CATEGORIES: Omit<
  ClothingCategory,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    name: "Men's Readymade & Kurta-Pyjamas",
    description:
      'Wedding kurta-pyjamas, ethnic jackets, shirts, and trousers for men.',
    order: 1,
  },
  {
    name: 'Trending Streetwear (Shingar NX)',
    description:
      'Latest t-shirts, overshirts, cargo jeans, and daily casuals at Shingar NX.',
    order: 2,
  },
  {
    name: "Kids' Wear & Fancy Dresses",
    description:
      'Festival clothes for boys and girls, plus school function fancy dresses.',
    order: 3,
  },
  {
    name: 'Festive & Traditional Clothing',
    description:
      'Navratri garba dresses, wedding outfits, and traditional family wear.',
    order: 4,
  },
  {
    name: 'School Uniforms',
    description:
      'Complete school uniforms, blazers, house t-shirts, ties, and belts for Junagadh schools.',
    order: 5,
  },
];

export const INITIAL_COLLECTIONS: Omit<
  CollectionItem,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    title: 'Rajwadi Silk Kurta-Pyjama Set',
    category: "Men's Readymade & Kurta-Pyjamas",
    price: 3450,
    fabric: 'Soft Jacquard Silk',
    silhouette: 'Regular Fit Kurta & Pyjama',
    occasion: 'Weddings & Festivals',
    description:
      'Comfortable silk kurta-pyjama set with neat collar embroidery, great for weddings and family functions.',
    imageUrl: '/images/hero-mens-ethnic.jpg',
    featured: true,
    lookbookChapter: '01. Men’s Ethnic & Kurta-Pyjamas',
    sku: 'SHG-KP-101',
    availableBranches: 'Both Shops: M.G. Road & Shingar NX (Motibaug Road)',
  },
  {
    title: 'Shingar NX Overshirt & Relaxed Jeans Set',
    category: 'Trending Streetwear (Shingar NX)',
    price: 2690,
    fabric: 'Heavy Cotton Twill & Denim',
    silhouette: 'Relaxed Youth Fit',
    occasion: 'Daily Casual & Outings',
    description:
      'Stylish cotton overshirt paired with comfortable relaxed-fit jeans, available at Shingar NX on Motibaug Road.',
    imageUrl: '/images/mens-streetwear.jpg',
    featured: true,
    lookbookChapter: '02. Shingar NX Streetwear',
    sku: 'SHG-NX-204',
    availableBranches: 'Shingar NX (Motibaug Road, Above Bata Showroom)',
  },
  {
    title: "Kids' Festive Koti & Kurta Set",
    category: "Kids' Wear & Fancy Dresses",
    price: 1850,
    fabric: 'Soft Cotton Silk with Embroidered Jacket',
    silhouette: 'Comfortable Kids Fit',
    occasion: 'Weddings, Festivals & School Functions',
    description:
      'Soft cotton-lined kurta set with a matching jacket for boys. Great for weddings, festivals, and school stage events.',
    imageUrl: '/images/kids-festive.jpg',
    featured: true,
    lookbookChapter: "03. Kids' Wear & School Uniforms",
    sku: 'SHG-KD-309',
    availableBranches: 'Main Shop (M.G. Road, Near Ranavav Chowk)',
  },
  {
    title: 'Traditional Navratri & Festival Dress',
    category: 'Festive & Traditional Clothing',
    price: 4950,
    fabric: 'Cotton Silk with Mirror Work',
    silhouette: 'Traditional Festive Fit',
    occasion: 'Navratri, Diwali & Weddings',
    description:
      'Traditional Gujarati festival outfit with real mirror work and bright festive colors.',
    imageUrl: '/images/dress-crimson-lehenga.jpg',
    featured: true,
    lookbookChapter: '01. Men’s Ethnic & Kurta-Pyjamas',
    sku: 'SHG-FT-412',
    availableBranches: 'Both Shops: M.G. Road & Shingar NX (Motibaug Road)',
  },
  {
    title: 'Complete School Uniform Set (All Schools)',
    category: 'School Uniforms',
    price: 950,
    fabric: 'Strong, Easy-Wash Cotton Blend',
    silhouette: 'All School Sizes Ready',
    occasion: 'Daily School & Sports Days',
    description:
      'Full school uniform sets for Junagadh schools including shirts, pants, skirts, house t-shirts, blazers, ties, and belts.',
    imageUrl: '/images/school-uniform.jpg',
    featured: false,
    lookbookChapter: "03. Kids' Wear & School Uniforms",
    sku: 'SHG-SU-508',
    availableBranches: 'Main Shop (M.G. Road, Jenellie Shopping Centre)',
  },
  {
    title: 'Shingar NX Casual Street Jacket',
    category: 'Trending Streetwear (Shingar NX)',
    price: 3190,
    fabric: 'Soft Cotton Blend with Metal Buttons',
    silhouette: 'Modern Casual Fit',
    occasion: 'Evening & Winter Wear',
    description:
      'New arrival jacket from Shingar NX on Motibaug Road. Easy to wear over t-shirts and casual shirts.',
    imageUrl: '/images/hero-streetwear-nx.jpg',
    featured: true,
    lookbookChapter: '02. Shingar NX Streetwear',
    sku: 'SHG-NX-108',
    availableBranches: 'Shingar NX (Motibaug Road, Above Bata Showroom)',
  },
];

export const INITIAL_OFFERS: Omit<
  OfferPoster,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    title: 'Wedding & Festival Family Sale',
    subtitle: 'Special In-Store Discount on Kurta-Pyjamas & Festive Clothes',
    privilegeBadge: '15% Off In-Store Sale',
    validUntil: 'Going On at Both Junagadh Shops',
    description:
      'Visit our Main Shop on M.G. Road or Shingar NX on Motibaug Road with your family to buy wedding kurta-pyjamas, sherwanis, and festival clothes on sale.',
    posterUrl: '/images/hero-mens-ethnic.jpg',
    privilegeCode: 'SHINGAR-FESTIVE-26',
    active: true,
  },
  {
    title: 'Shingar NX Youth Streetwear Sale',
    subtitle: 'New T-Shirts, Overshirts & Cargo Jeans at Motibaug Road',
    privilegeBadge: 'In-Store Sale · Open Till 10 PM',
    validUntil: 'Open Daily 10 AM – 10 PM at Shingar NX',
    description:
      'New streetwear and casual clothes are now on sale at Shingar NX (Above Bata Showroom, Motibaug Road, Junagadh). Visit our branch directly to shop.',
    posterUrl: '/images/hero-streetwear-nx.jpg',
    privilegeCode: 'SHINGAR-NX-DROP',
    active: true,
  },
  {
    title: "School Uniforms & Kids' Fancy Dresses Ready",
    subtitle: 'All Junagadh School Uniforms Available in One Place',
    privilegeBadge: 'All Sizes In Stock',
    validUntil: 'Available Daily at M.G. Road Main Shop',
    description:
      'Visit our M.G. Road shop (Jenellie Shopping Centre, near Ranavav Chowk) for complete school uniforms, winter blazers, and kids’ fancy dresses.',
    posterUrl: '/images/school-uniform.jpg',
    privilegeCode: 'SHINGAR-SCHOOL-26',
    active: true,
  },
];
