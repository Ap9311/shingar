/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollectionItem, OfferPoster, ShowroomBranch, ClothingCategory } from '../types';

export const HERO_BANNER_IMAGE = '/images/hero-bridal.jpg';
export const ABOUT_BOUTIQUE_IMAGE = '/images/about-boutique.jpg';

const PHOTO_POOL = [
  '/images/dress-crimson-lehenga.jpg',
  '/images/dress-ivory-anarkali.jpg',
  '/images/dress-banarasi-saree.jpg',
  '/images/dress-indowestern-cape.jpg',
  '/images/dress-festive-sharara.jpg',
  '/images/dress-emerald-lehenga.jpg',
  '/images/dress-silk-gown.jpg',
  '/images/dress-velvet-trousseau.jpg',
];

const SKU_PHOTO_MAP: Record<string, string> = {
  'SHG-BL-101': '/images/dress-crimson-lehenga.jpg',
  'SHG-RA-204': '/images/dress-ivory-anarkali.jpg',
  'SHG-HS-309': '/images/dress-banarasi-saree.jpg',
  'SHG-IW-412': '/images/dress-indowestern-cape.jpg',
  'SHG-FS-508': '/images/dress-festive-sharara.jpg',
  'SHG-BL-108': '/images/dress-emerald-lehenga.jpg',
  'SHINGAAR-BRIDAL-26': '/images/dress-crimson-lehenga.jpg',
  'KASHI-LOOM-20': '/images/dress-banarasi-saree.jpg',
  'SANGEET-ATELIER-15': '/images/dress-festive-sharara.jpg',
};

/**
 * Ensures any legacy SVG placeholder previously seeded in Firestore is upgraded
 * to a real clothing photograph while preserving custom admin uploads/URLs.
 */
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
    id: 'mumbai-kala-ghoda',
    city: 'Mumbai',
    name: 'Shingar Dresses — Kala Ghoda Flagship',
    address: '14 Rampart Row, Heritage Precinct, Kala Ghoda, Fort, Mumbai 400001',
    phone: '+91 22 2284 7900',
    hours: 'Mon – Sun · 11:00 AM – 8:30 PM IST',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Kala+Ghoda,+Fort,+Mumbai,+Maharashtra+400001&t=&z=16&ie=UTF8&iwloc=&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Kala+Ghoda+Fort+Mumbai+400001',
    specialties: 'Bridal Lehengas, Custom Zardozi Fittings & Full Seasonal Archive',
  },
  {
    id: 'delhi-mehrauli',
    city: 'New Delhi',
    name: 'Shingar Dresses — Mehrauli Heritage Haveli',
    address: 'Ambawatta One, Kalka Das Marg, Mehrauli, New Delhi 110030',
    phone: '+91 11 2664 5120',
    hours: 'Tue – Sun · 11:00 AM – 8:00 PM IST',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Ambawatta+One,+Mehrauli,+New+Delhi+110030&t=&z=16&ie=UTF8&iwloc=&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Ambawatta+One+Mehrauli+New+Delhi+110030',
    specialties: 'Royal Anarkalis, Velvet Bridal Trousseau & Private Family Consultations',
  },
  {
    id: 'jaipur-johari',
    city: 'Jaipur',
    name: 'Shingar Dresses — Johari Bazaar Couture Salon',
    address: '88 Haldiyon Ka Rasta, Johari Bazaar, Pink City, Jaipur 302003',
    phone: '+91 141 257 8840',
    hours: 'Mon – Sat · 11:00 AM – 8:00 PM IST',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Johari+Bazaar,+Jaipur,+Rajasthan+302003&t=&z=16&ie=UTF8&iwloc=&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Johari+Bazaar+Jaipur+Rajasthan+302003',
    specialties: 'Gota Patti Bridal Wear, Bandhani Silks & Heritage Marwar Craft',
  },
  {
    id: 'surat-ring-road',
    city: 'Surat',
    name: 'Shingar Dresses — Ring Road Silk Gallery',
    address: 'Level 2, Heritage Textile Plaza, Ring Road, Surat, Gujarat 395002',
    phone: '+91 261 234 9910',
    hours: 'Mon – Sat · 10:30 AM – 8:30 PM IST',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Ring+Road,+Surat,+Gujarat+395002&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Ring+Road+Surat+Gujarat+395002',
    specialties: 'Handloom Katan Sarees, Patola Weaves & Festive Shararas',
  },
];

export const INITIAL_CATEGORIES: Omit<
  ClothingCategory,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    name: 'Bridal Lehengas',
    description: 'Hand-embroidered silk and velvet bridal ensembles crafted for wedding ceremonies.',
    order: 1,
  },
  {
    name: 'Royal Anarkalis',
    description: 'Floor-skimming multi-kali silhouettes in Chanderi, raw silk, and organza.',
    order: 2,
  },
  {
    name: 'Handloom Sarees',
    description: 'Pure Katan Banarasi, Paithani, and double-ikat Patola heritage drapes.',
    order: 3,
  },
  {
    name: 'Indo-Western Couture',
    description: 'Contemporary draped gowns, structured capes, and modern reception silhouettes.',
    order: 4,
  },
  {
    name: 'Festive Shararas',
    description: 'Heirloom gota patti and mirror-work sharara sets for sangeet and festive celebrations.',
    order: 5,
  },
];

export const INITIAL_COLLECTIONS: Omit<
  CollectionItem,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    title: 'Arundhati Sindoor Zardozi Lehenga',
    category: 'Bridal Lehengas',
    price: 285000,
    fabric: 'Pure Katan Mulberry Silk & Antique Real-Zari Dabka',
    silhouette: '24-Kali Architectural Flared Lehenga with Double Organza Dupatta',
    occasion: 'Royal Wedding Ceremony & Pheras',
    description:
      'Hand-embroidered over 640 artisan hours in our Mumbai atelier, featuring heritage Marwar architectural motifs in antique gold tilla, dabka, and nakshi across deep sindoor crimson silk.',
    imageUrl: '/images/dress-crimson-lehenga.jpg',
    featured: true,
    lookbookChapter: '01. The Royal Sindoor Trousseau',
    sku: 'SHG-BL-101',
    availableBranches:
      'Mumbai (Kala Ghoda Flagship), New Delhi (Mehrauli), Jaipur (Johari Bazaar)',
  },
  {
    title: 'Mehrunissa Ivory Chanderi Anarkali',
    category: 'Royal Anarkalis',
    price: 118000,
    fabric: 'Hand-Spun Chanderi Silk Tissue & Resham Badla Work',
    silhouette: 'Floor-Skimming 32-Kali Ghera Anarkali with Sculpted Yoke',
    occasion: 'Nikah, Engagement & Reception Soiree',
    description:
      'Whisper-light ivory Chanderi silk illuminated with delicate Mughal botanical trellis embroidery, freshwater pearl tassels, and a hand-scratched gold tissue border.',
    imageUrl: '/images/dress-ivory-anarkali.jpg',
    featured: true,
    lookbookChapter: '02. Noor-e-Chanderi Ivory Edit',
    sku: 'SHG-RA-204',
    availableBranches: 'Mumbai (Kala Ghoda Flagship), New Delhi (Mehrauli)',
  },
  {
    title: 'Kashi Ratna Kadhwa Banarasi Saree',
    category: 'Handloom Sarees',
    price: 94500,
    fabric: 'Pure Katan Silk with Meenakari Kadhwa Brocade',
    silhouette: 'Six-Yard Heirloom Drape with Unstitched Brocade Blouse Piece',
    occasion: 'Festive Puja, Muhurtham & Trousseau',
    description:
      'Woven on traditional pit-looms in Varanasi using the centuries-old Kadhwa technique—zero float threads on the reverse, adorned with shikargah motifs and rich gold zari pallu.',
    imageUrl: '/images/dress-banarasi-saree.jpg',
    featured: true,
    lookbookChapter: '01. The Royal Sindoor Trousseau',
    sku: 'SHG-HS-309',
    availableBranches: 'Mumbai (Kala Ghoda Flagship), Surat (Ring Road)',
  },
  {
    title: 'Zoya Sculpted Cape & Draped Skirt Ensemble',
    category: 'Indo-Western Couture',
    price: 142000,
    fabric: 'Crushed Metallic Silk Crepe & Hand-Cut Sequins',
    silhouette: 'Asymmetric Draped Dhoti Skirt with Floor-Length Organza Cape',
    occasion: 'Cocktail Night & Sangeet Gala',
    description:
      'Engineered for effortless movement on the sangeet floor, pairing a hand-pleated rose-gold silk skirt with a structured geometric zardozi bustier and sheer trailing cape.',
    imageUrl: '/images/dress-indowestern-cape.jpg',
    featured: true,
    lookbookChapter: '03. Midnight Sangeet Architecture',
    sku: 'SHG-IW-412',
    availableBranches: 'Mumbai (Kala Ghoda Flagship), New Delhi (Mehrauli)',
  },
  {
    title: 'Rajwada Gota-Patti Gharara Set',
    category: 'Festive Shararas',
    price: 86000,
    fabric: 'Pure Georgette Silk & Jaipur Hand-Beaten Gota Patti',
    silhouette: 'Short Peplum Kurti with Wide-Leg Flared Gharara &Jaali Dupatta',
    occasion: 'Mehendi, Haldi & Festive Celebrations',
    description:
      'Vibrant heirloom jewel tones brought to life with traditional Jaipur kasab, dori, and mirror-work across the knee-joint band and scalloped organza odhani.',
    imageUrl: '/images/dress-festive-sharara.jpg',
    featured: false,
    lookbookChapter: '03. Midnight Sangeet Architecture',
    sku: 'SHG-FS-508',
    availableBranches: 'Jaipur (Johari Bazaar), Surat (Ring Road), Mumbai (Kala Ghoda Flagship)',
  },
  {
    title: 'Devika Velvet Marwar Bridal Lehenga',
    category: 'Bridal Lehengas',
    price: 340000,
    fabric: 'Micro-Silk Velvet & Antique Gold Pitta Work',
    silhouette: 'Royal Heritage Lehenga with Archway Motif Hemline',
    occasion: 'Winter Palace Wedding',
    description:
      'Inspired by the frescoed courtyards of Udaipur, crafted in plush jewel-toned velvet with three-dimensional zardozi peacocks, real silver-gilt kora, and double bridal veils.',
    imageUrl: '/images/dress-emerald-lehenga.jpg',
    featured: true,
    lookbookChapter: '01. The Royal Sindoor Trousseau',
    sku: 'SHG-BL-108',
    availableBranches:
      'Mumbai (Kala Ghoda Flagship), New Delhi (Mehrauli), Jaipur (Johari Bazaar)',
  },
];

export const INITIAL_OFFERS: Omit<
  OfferPoster,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>[] = [
  {
    title: 'The Royal Bridal Trousseau Showcase',
    subtitle: 'Complimentary Custom Veil Embroidery & Private Master-Tailor Fitting',
    privilegeBadge: 'Complimentary Bridal Veil Customization',
    validUntil: 'Valid through 30 November 2026',
    description:
      'Book an in-person bridal appointment at any Shingar Dresses showroom to receive bespoke name/date zardozi inscription on your bridal odhani and priority 3-stage custom tailoring.',
    posterUrl: '/images/dress-crimson-lehenga.jpg',
    privilegeCode: 'SHINGAAR-BRIDAL-26',
    active: true,
  },
  {
    title: 'Heritage Handloom & Banarasi Collector Week',
    subtitle: 'In-Store Patron Privilege on Pure Katan & Paithani Six-Yard Weaves',
    privilegeBadge: '20% Showroom Privilege on 2+ Handloom Sarees',
    validUntil: 'Valid through 15 December 2026',
    description:
      'Celebrate India’s master weavers at our seasonal exhibition. Present this reference code at our Mumbai, New Delhi, Jaipur, or Surat showroom when selecting two or more handloom sarees.',
    posterUrl: '/images/dress-banarasi-saree.jpg',
    privilegeCode: 'KASHI-LOOM-20',
    active: true,
  },
  {
    title: 'Sangeet & Festive Family Styling Suite',
    subtitle: 'Coordinated Couture Privileges for Wedding Families & Bridesmaids',
    privilegeBadge: '15% Family Trousseau Privilege',
    validUntil: 'Valid for Autumn–Winter 2026 Bookings',
    description:
      'Reserve a private family styling session for 3 or more ensembles across our Indo-Western Couture, Royal Anarkalis, and Festive Shararas collections.',
    posterUrl: '/images/dress-festive-sharara.jpg',
    privilegeCode: 'SANGEET-ATELIER-15',
    active: true,
  },
];
