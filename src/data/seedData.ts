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
    kicker: 'Shingar Dresses · Junagadh · Established 1987',
    title: 'Royal Kurta-Pyjamas & Festive Menswear.',
    subtitle:
      'Over 39 years of dressing Junagadh in fine silk kurta-pyjamas, wedding Indo-Western ensembles, and tailored festive readymade garments.',
    imageUrl: '/images/hero-mens-ethnic.jpg',
    ctaLabel: "Explore Men's Collection",
    ctaLink: `/collection?category=${encodeURIComponent("Men's Readymade & Kurta-Pyjamas")}`,
    secondaryLabel: 'Open Lookbook',
    secondaryLink: '/lookbook',
    tag: 'M.G. Road & Motibaug Road',
  },
  {
    id: 'slide-streetwear-nx',
    kicker: 'Shingar NX · Motibaug Road Showroom',
    title: 'Trending Streetwear & Modern Everyday Style.',
    subtitle:
      'Discover contemporary overshirts, relaxed denim, structured jackets, and fresh urban streetwear drops curated at Shingar NX.',
    imageUrl: '/images/hero-streetwear-nx.jpg',
    ctaLabel: 'Browse Shingar NX Streetwear',
    ctaLink: `/collection?category=${encodeURIComponent('Trending Streetwear (Shingar NX)')}`,
    secondaryLabel: 'Current Offers',
    secondaryLink: '/offers',
    tag: 'Open Daily 10 AM – 10 PM',
  },
  {
    id: 'slide-kids-festive',
    kicker: 'Complete Family & Institutional Wardrobe',
    title: "Kids' Wear, Fancy Dresses & School Uniforms.",
    subtitle:
      'From vibrant Navratri and wedding traditional wear to cultural fancy dresses and durable school uniforms for Junagadh institutions.',
    imageUrl: '/images/hero-bridal.jpg',
    ctaLabel: 'Explore All Categories',
    ctaLink: '/collection',
    secondaryLabel: 'Our Heritage Since 1987',
    secondaryLink: '/about',
    tag: '39+ Years of Trust',
  },
];

export const SHINGAR_CONTACT_DETAILS = {
  businessName: 'Shingar Dresses (Also operates under Shingar NX)',
  establishedYear: 1987,
  yearsInOperation: '39+ Years',
  ownerName: 'Ashvin A. Shah',
  ownerPhone: '+91 94282 41901',
  whatsappNumbers: [
    { label: 'Official Mobile 1 / WhatsApp', number: '+91 98251 21298', raw: '919825121298' },
    { label: 'Official Mobile 2 / WhatsApp', number: '+91 98251 21598', raw: '919825121598' },
    { label: 'Official Mobile 3 / WhatsApp', number: '+91 91735 38556', raw: '919173538556' },
  ],
  landline: '+91 285 2651406 (0285-2651406)',
  instagramHandles: [
    {
      handle: '@shingar_dresses',
      url: 'https://www.instagram.com/shingar_dresses/',
      label: 'Shingar Dresses Official Instagram',
    },
    {
      handle: '@shingar__nx',
      url: 'https://www.instagram.com/shingar__nx/',
      label: 'Shingar NX Official Instagram',
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
    city: 'Junagadh · M.G. Road',
    name: 'Branch 1: Main Store (M.G. Road)',
    address:
      'Jenellie (Jenili) Shopping Centre, M.G. Road, Near Ranavav Chowk / Vanzari Chowk, Mullawada, Junagadh, Gujarat - 362001',
    phone: '+91 98251 21298 · 0285-2651406',
    hours:
      'Mon – Sat: 10:00 AM – 08:00 PM (Afternoon Break: 02:00 PM – 03:00 PM) · Sun: 09:00 AM – 03:00 PM',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Jenili+Shopping+Centre,+MG+Road,+Ranavav+Chowk,+Junagadh,+Gujarat+362001&t=&z=16&ie=UTF8&iwloc=&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Shingar+Dresses+Jenili+Shopping+Centre+MG+Road+Ranavav+Chowk+Junagadh+Gujarat+362001',
    specialties:
      "Men's Readymade Garments, Kurta-Pyjamas, Kids' Wear, Fancy Dresses & School Uniforms",
  },
  {
    id: 'junagadh-motibaug-nx',
    city: 'Junagadh · Motibaug Road',
    name: 'Branch 2: Shingar NX (Motibaug Road)',
    address:
      'Shingar NX, Motibagh Road, Above Bata Showroom, Junagadh, Gujarat - 362001',
    phone: '+91 98251 21598 · +91 91735 38556',
    hours: 'Monday to Sunday: 10:00 AM – 10:00 PM (No Afternoon Break)',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Motibaug+Road,+Above+Bata+Showroom,+Junagadh,+Gujarat+362001&t=&z=16&ie=UTF8&iwloc=&output=embed',
    directionsUrl: 'https://maps.app.goo.gl/js1D81DuKayVUxC77',
    specialties:
      'Trending Streetwear, Men’s Casuals, Designer Kurta Sets & Festive Celebration Wear',
  },
];

export const INITIAL_CATEGORIES: Omit<
  ClothingCategory,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    name: "Men's Readymade & Kurta-Pyjamas",
    description:
      'Royal wedding kurta-pyjamas, bandhgalas, ethnic jackets, and tailored men’s readymade wear.',
    order: 1,
  },
  {
    name: 'Trending Streetwear (Shingar NX)',
    description:
      'Contemporary overshirts, relaxed denim, cargos, and modern streetwear curated at Shingar NX.',
    order: 2,
  },
  {
    name: "Kids' Wear & Fancy Dresses",
    description:
      'Festive outfits for boys and girls, cultural fancy dresses, and school stage costumes.',
    order: 3,
  },
  {
    name: 'Festive & Traditional Clothing',
    description:
      'Navratri garba ensembles, traditional celebration outfits, and family festive wear.',
    order: 4,
  },
  {
    name: 'School Uniforms',
    description:
      'Complete, durable school uniforms, winter blazers, house t-shirts, ties, and belts.',
    order: 5,
  },
];

export const INITIAL_COLLECTIONS: Omit<
  CollectionItem,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    title: 'Rajwadi Silk Zari Kurta-Pyjama Set',
    category: "Men's Readymade & Kurta-Pyjamas",
    price: 3450,
    fabric: 'Pure Jacquard Silk Blend with Woven Brocade Placket',
    silhouette: 'Straight-Cut Mandarin Collar Kurta with Churidar Pyjama',
    occasion: 'Weddings, Sangeet & Festival Celebrations',
    description:
      'A signature festive menswear ensemble from Shingar Dresses crafted in breathable jacquard silk with subtle antique metallic threadwork on the collar and cuffs.',
    imageUrl: '/images/hero-mens-ethnic.jpg',
    featured: true,
    lookbookChapter: '01. Royal Kurta-Pyjama & Menswear Edit',
    sku: 'SHG-KP-101',
    availableBranches: 'Main Store (M.G. Road) & Shingar NX (Motibaug Road)',
  },
  {
    title: 'Shingar NX Urban Structured Overshirt & Denim Set',
    category: 'Trending Streetwear (Shingar NX)',
    price: 2690,
    fabric: 'Heavyweight Brushed Cotton Twill & Raw Selvedge Denim',
    silhouette: 'Relaxed Drop-Shoulder Streetwear Fit',
    occasion: 'Everyday Casual, College & Evening Outings',
    description:
      'Curated exclusively at our Shingar NX Motibaug Road showroom, pairing a structured textured overshirt with contemporary relaxed-fit denim.',
    imageUrl: '/images/mens-streetwear.jpg',
    featured: true,
    lookbookChapter: '02. Shingar NX Trending Streetwear',
    sku: 'SHG-NX-204',
    availableBranches: 'Shingar NX (Motibaug Road, Above Bata Showroom)',
  },
  {
    title: "Little Prince Festive Koti & Kurta Set / Fancy Dress",
    category: "Kids' Wear & Fancy Dresses",
    price: 1850,
    fabric: 'Soft Cotton Silk with Embroidered Nehru Jacket (Koti)',
    silhouette: 'Comfort-Lined Kids Festive & Cultural Stage Fit',
    occasion: 'Family Weddings, Annual Day & Cultural Fancy Dress',
    description:
      'Designed with soft breathable cotton lining for all-day comfort—ideal for family weddings, Janmashtami, Republic Day cultural events, and school fancy dress competitions.',
    imageUrl: '/images/kids-festive.jpg',
    featured: true,
    lookbookChapter: "03. Kids' Festive & Fancy Dress Showcase",
    sku: 'SHG-KD-309',
    availableBranches: 'Main Store (M.G. Road, Near Ranavav Chowk)',
  },
  {
    title: 'Girnar Heritage Navratri & Festive Traditional Ensemble',
    category: 'Festive & Traditional Clothing',
    price: 4950,
    fabric: 'Hand-Embroidered Mirror Work & Cotton Silk',
    silhouette: 'Traditional Gujarati Festive Silhouette',
    occasion: 'Navratri Raas-Garba, Diwali & Traditional Ceremonies',
    description:
      'Celebrating Saurashtra’s vibrant textile heritage with authentic mirror embroidery, folk motifs, and rich festive colours.',
    imageUrl: '/images/dress-crimson-lehenga.jpg',
    featured: true,
    lookbookChapter: '01. Royal Kurta-Pyjama & Menswear Edit',
    sku: 'SHG-FT-412',
    availableBranches: 'Main Store (M.G. Road) & Shingar NX (Motibaug Road)',
  },
  {
    title: 'Junagadh Standard Complete School Uniform Set',
    category: 'School Uniforms',
    price: 950,
    fabric: 'Fade-Resistant Poly-Viscose & Combed Breathable Cotton',
    silhouette: 'Standard Institutional Tailored Fit (All Sizes)',
    occasion: 'Daily Academic Wear, Sports House & Winter Assembly',
    description:
      'Trusted by Junagadh parents since 1987 for durable stitching, color-fast fabrics, and complete school uniform sets including shirts, trousers, skirts, blazers, and belts.',
    imageUrl: '/images/school-uniform.jpg',
    featured: false,
    lookbookChapter: "03. Kids' Festive & Fancy Dress Showcase",
    sku: 'SHG-SU-508',
    availableBranches: 'Main Store (M.G. Road, Jenellie Shopping Centre)',
  },
  {
    title: 'Shingar NX Monochrome Street Layering Jacket',
    category: 'Trending Streetwear (Shingar NX)',
    price: 3190,
    fabric: 'Matte Technical Cotton Blend with Metal Snap Hardware',
    silhouette: 'Modern Boxy Streetwear Cut',
    occasion: 'Winter Streetwear & Evening Casuals',
    description:
      'Part of the latest Shingar NX seasonal drop on Motibaug Road, engineered with clean architectural seams and versatile layering proportions.',
    imageUrl: '/images/hero-streetwear-nx.jpg',
    featured: true,
    lookbookChapter: '02. Shingar NX Trending Streetwear',
    sku: 'SHG-NX-108',
    availableBranches: 'Shingar NX (Motibaug Road, Above Bata Showroom)',
  },
];

export const INITIAL_OFFERS: Omit<
  OfferPoster,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    title: 'Wedding & Festive Kurta-Pyjama Family Showcase',
    subtitle: 'Special In-Store Privilege on Men’s Readymade & Traditional Festive Sets',
    privilegeBadge: '15% Festive Family Privilege',
    validUntil: 'Valid Across Both Junagadh Branches',
    description:
      'Visit our M.G. Road Main Store or Shingar NX on Motibaug Road with your family to explore our newest wedding kurta-pyjamas, sherwanis, and festive wear.',
    posterUrl: '/images/hero-mens-ethnic.jpg',
    privilegeCode: 'SHINGAR-FESTIVE-26',
    active: true,
  },
  {
    title: 'Shingar NX New Season Streetwear Drop',
    subtitle: 'Latest Overshirts, Cargo Denims & Men’s Casuals at Motibaug Road',
    privilegeBadge: 'New Arrival Showcase · Open Till 10 PM',
    validUntil: 'Available Monday to Sunday (10 AM – 10 PM)',
    description:
      'Experience the newest streetwear and casual menswear collection at Shingar NX (Above Bata Showroom, Motibaug Road, Junagadh). Mention this code at the counter.',
    posterUrl: '/images/hero-streetwear-nx.jpg',
    privilegeCode: 'SHINGAR-NX-DROP',
    active: true,
  },
  {
    title: "Complete School Uniform & Kids' Fancy Dress Counter",
    subtitle: 'All Junagadh School Uniforms & Cultural Stage Dresses Under One Roof',
    privilegeBadge: 'Trusted Since 1987 · All Sizes Ready',
    validUntil: 'Available Year-Round at M.G. Road Main Store',
    description:
      'Get complete school uniform sets, winter blazers, house t-shirts, and kids’ cultural fancy dresses at Jenellie Shopping Centre, M.G. Road, Junagadh.',
    posterUrl: '/images/school-uniform.jpg',
    privilegeCode: 'SHINGAR-SCHOOL-26',
    active: true,
  },
];
