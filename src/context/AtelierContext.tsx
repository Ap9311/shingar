/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  signInCustomerWithGoogle,
  signInAdminWithGmailAccess,
  getGmailAccessToken,
  clearGmailAccessToken,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  CollectionItem,
  ClothingCategory,
  OfferPoster,
  UserDirectoryRecord,
  AtelierInquiry,
  DressCategory,
  DEFAULT_CATEGORIES,
} from '../types';
import {
  INITIAL_COLLECTIONS,
  INITIAL_CATEGORIES,
  INITIAL_OFFERS,
  resolveFashionImageUrl,
} from '../data/seedData';

export const AUTHORIZED_ADMIN_EMAILS = [
  'akshatpopat9311@gmail.com',
  'support.obsidian@gmail.com',
];
export const AUTHORIZED_ADMIN_EMAIL = AUTHORIZED_ADMIN_EMAILS.join(' / ');

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

interface AtelierContextValue {
  user: User | null;
  authReady: boolean;
  isSigningIn: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<User | null>;
  signInAdminWithGoogle: () => Promise<{ user: User | null; accessToken: string | null }>;
  connectAdminGmail: () => Promise<string | null>;
  gmailAccessToken: string | null;
  signOutUser: () => Promise<void>;

  // Admin state (Firebase Auth + Server-Side Token Verification)
  isServerAdminAuthenticated: boolean;
  isFirestoreAdminGranted: boolean;
  isAdminUnlocked: boolean;
  isAuthorizingAdmin: boolean;
  adminServerToken: string | null;
  adminAuthError: string | null;
  authorizeAdminWithServer: (firebaseUser?: User | null) => Promise<boolean>;
  logoutAdminServerSide: () => Promise<void>;

  // Live Catalog, Categories, Offers, Users & Inquiries
  collections: CollectionItem[];
  categories: ClothingCategory[];
  categoryNames: string[];
  offers: OfferPoster[];
  usersDirectory: UserDirectoryRecord[];
  inquiries: AtelierInquiry[];
  isLoadingCatalog: boolean;

  // Admin CRUD Operations
  saveCollectionItem: (
    item: Omit<CollectionItem, 'id' | 'authorUid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<void>;
  deleteCollectionItem: (id: string) => Promise<void>;
  saveCategory: (
    category: { name: string; description: string; order?: number },
    existingId?: string
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveOfferPoster: (
    offer: Omit<OfferPoster, 'id' | 'authorUid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<void>;
  deleteOfferPoster: (id: string) => Promise<void>;
  seedInitialAtelierData: () => Promise<void>;

  // Visitor Inquiry Submission
  submitAtelierInquiry: (
    inquiry: Omit<AtelierInquiry, 'id' | 'authorUid' | 'createdAt'>
  ) => Promise<void>;
}

const AtelierContext = createContext<AtelierContextValue | undefined>(undefined);

const ADMIN_TOKEN_STORAGE_KEY = 'shingar_admin_session_token';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || `id_${Date.now()}`;
}

export const AtelierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(() =>
    getGmailAccessToken()
  );

  const [isServerAdminAuthenticated, setIsServerAdminAuthenticated] = useState(false);
  const [isFirestoreAdminGranted, setIsFirestoreAdminGranted] = useState(false);
  const [isAuthorizingAdmin, setIsAuthorizingAdmin] = useState(false);
  const [adminServerToken, setAdminServerToken] = useState<string | null>(() =>
    sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  );
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const [firestoreCollections, setFirestoreCollections] = useState<CollectionItem[]>([]);
  const [firestoreCategories, setFirestoreCategories] = useState<ClothingCategory[]>([]);
  const [firestoreOffers, setFirestoreOffers] = useState<OfferPoster[]>([]);
  const [usersDirectory, setUsersDirectory] = useState<UserDirectoryRecord[]>([]);
  const [inquiries, setInquiries] = useState<AtelierInquiry[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogSnapshotReady, setCatalogSnapshotReady] = useState(false);
  const hasAutoSeededRef = useRef(false);

  // Sync authenticated Google customer to `/users/{uid}` directory
  const syncUserRecordToFirestore = useCallback(async (firebaseUser: User) => {
    if (!firebaseUser.emailVerified) return;
    const uid = sanitizeId(firebaseUser.uid);
    const userRef = doc(db, 'users', uid);
    const displayName = (firebaseUser.displayName || 'Valued Customer').slice(0, 120);
    const email = (firebaseUser.email || '').slice(0, 180);
    const photoURL = (firebaseUser.photoURL || '').slice(0, 500);

    if (email.length < 3) return;

    try {
      const existingSnap = await getDoc(userRef);
      if (!existingSnap.exists()) {
        await setDoc(userRef, {
          uid,
          displayName,
          email,
          photoURL,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        const existingData = existingSnap.data();
        await setDoc(userRef, {
          uid: existingData.uid || uid,
          displayName,
          email,
          photoURL,
          createdAt: existingData.createdAt || serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.warn('Customer profile sync notice:', error);
    }
  }, []);

  // Authorize admin via Firebase ID Token against `/api/admin/authorize` and Firestore `/admins/{uid}`
  const authorizeAdminWithServer = useCallback(
    async (targetUser?: User | null): Promise<boolean> => {
      const activeUser = targetUser ?? user;
      if (!activeUser) {
        setIsServerAdminAuthenticated(false);
        setIsFirestoreAdminGranted(false);
        return false;
      }

      const email = (activeUser.email || '').toLowerCase().trim();
      const uid = sanitizeId(activeUser.uid);

      if (!isAuthorizedAdminEmail(email)) {
        setIsServerAdminAuthenticated(false);
        setIsFirestoreAdminGranted(false);
        setAdminServerToken(null);
        sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        setAdminAuthError(
          `Signed in as ${activeUser.email}. Only ${AUTHORIZED_ADMIN_EMAILS.join(' or ')} are authorised to access the Shingar Dresses Admin Panel.`
        );
        return false;
      }

      setIsAuthorizingAdmin(true);
      setAdminAuthError(null);

      try {
        const idToken = await activeUser.getIdToken();
        const res = await fetch('/api/admin/authorize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ idToken }),
        });

        const data = await res.json();
        if (!res.ok || !data?.authorized) {
          setIsServerAdminAuthenticated(false);
          setIsFirestoreAdminGranted(false);
          setAdminAuthError(
            data?.error ||
              `Server authorization denied. Only ${AUTHORIZED_ADMIN_EMAILS.join(' or ')} are permitted.`
          );
          return false;
        }

        sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, data.token);
        setAdminServerToken(data.token);
        setIsServerAdminAuthenticated(true);

        // Ensure `/admins/{uid}` record exists in Firestore
        try {
          const adminDocRef = doc(db, 'admins', uid);
          const snap = await getDoc(adminDocRef);
          if (!snap.exists()) {
            await setDoc(adminDocRef, {
              uid,
              email: activeUser.email || AUTHORIZED_ADMIN_EMAILS[0],
              username: 'shingar',
              grantedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.warn('Firestore admin record sync notice:', err);
        }

        setIsFirestoreAdminGranted(true);
        return true;
      } catch (err) {
        setAdminAuthError(
          err instanceof Error
            ? err.message
            : 'Unable to verify administrator token with server.'
        );
        return false;
      } finally {
        setIsAuthorizingAdmin(false);
      }
    },
    [user]
  );

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        await syncUserRecordToFirestore(currentUser);
        const email = (currentUser.email || '').toLowerCase().trim();
        if (isAuthorizedAdminEmail(email)) {
          await authorizeAdminWithServer(currentUser);
        } else {
          setIsServerAdminAuthenticated(false);
          setIsFirestoreAdminGranted(false);
          setAdminServerToken(null);
          sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        }
      } else {
        setIsServerAdminAuthenticated(false);
        setIsFirestoreAdminGranted(false);
        setAdminServerToken(null);
        clearGmailAccessToken();
        setGmailAccessToken(null);
        sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        setAdminAuthError(null);
      }
    });
    return () => unsubscribe();
  }, [syncUserRecordToFirestore, authorizeAdminWithServer]);

  // Public real-time listeners for `/collections`, `/categories`, and `/offers`
  // Never throw uncaught errors on public listeners so signed-in customers can always browse all pages smoothly
  useEffect(() => {
    if (!authReady) return;

    const unsubCollections = onSnapshot(
      collection(db, 'collections'),
      (snapshot) => {
        const items: CollectionItem[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const sku = String(d.sku || 'SHG-001');
          return {
            id: docSnap.id,
            title: String(d.title || ''),
            category: (d.category as DressCategory) || "Men's Readymade & Kurta-Pyjamas",
            price: Number(d.price ?? 0),
            fabric: String(d.fabric || ''),
            silhouette: String(d.silhouette || ''),
            occasion: String(d.occasion || ''),
            description: String(d.description || ''),
            imageUrl: resolveFashionImageUrl(String(d.imageUrl || ''), sku),
            featured: Boolean(d.featured),
            lookbookChapter: String(
              d.lookbookChapter || '01. Royal Ethnic & Festive Kurta Edit'
            ),
            sku,
            availableBranches: String(
              d.availableBranches ||
                'Shingar Dresses (M.G. Road, Junagadh), Shingar NX (Motibaug Road, Junagadh)'
            ),
            authorUid: String(d.authorUid || ''),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          };
        });
        setFirestoreCollections(items);
        setIsLoadingCatalog(false);
        setCatalogSnapshotReady(true);
      },
      (error) => {
        console.warn('Collections snapshot fallback active:', error);
        setIsLoadingCatalog(false);
        setCatalogSnapshotReady(true);
      }
    );

    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const cats: ClothingCategory[] = snapshot.docs
          .map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              name: String(d.name || ''),
              description: String(d.description || ''),
              order: Number(d.order ?? 10),
              authorUid: String(d.authorUid || ''),
              createdAt: d.createdAt,
              updatedAt: d.updatedAt,
            };
          })
          .sort((a, b) => a.order - b.order);
        setFirestoreCategories(cats);
      },
      (error) => {
        console.warn('Categories snapshot fallback active:', error);
      }
    );

    const unsubOffers = onSnapshot(
      collection(db, 'offers'),
      (snapshot) => {
        const items: OfferPoster[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const privilegeCode = String(d.privilegeCode || '');
          return {
            id: docSnap.id,
            title: String(d.title || ''),
            subtitle: String(d.subtitle || ''),
            privilegeBadge: String(d.privilegeBadge || ''),
            validUntil: String(d.validUntil || ''),
            description: String(d.description || ''),
            posterUrl: resolveFashionImageUrl(String(d.posterUrl || ''), privilegeCode),
            privilegeCode,
            active: Boolean(d.active),
            authorUid: String(d.authorUid || ''),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          };
        });
        setFirestoreOffers(items);
      },
      (error) => {
        console.warn('Offers snapshot fallback active:', error);
      }
    );

    return () => {
      unsubCollections();
      unsubCategories();
      unsubOffers();
    };
  }, [authReady]);

  const isAdminUnlocked = Boolean(
    user &&
      isAuthorizedAdminEmail(user.email) &&
      isServerAdminAuthenticated &&
      isFirestoreAdminGranted
  );

  // Admin-only real-time listener for `/users` and `/inquiries`
  useEffect(() => {
    if (!authReady || !isAdminUnlocked) {
      setUsersDirectory([]);
      setInquiries([]);
      return;
    }

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list: UserDirectoryRecord[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            uid: String(d.uid || docSnap.id),
            displayName: String(d.displayName || 'Customer'),
            email: String(d.email || ''),
            photoURL: String(d.photoURL || ''),
            createdAt: d.createdAt,
            lastLoginAt: d.lastLoginAt,
          };
        });
        setUsersDirectory(list);
      },
      (error) => {
        console.warn('Admin users listener notice:', error);
      }
    );

    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const list: AtelierInquiry[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: String(d.name || ''),
            email: String(d.email || ''),
            phone: String(d.phone || ''),
            preferredDate: String(d.preferredDate || ''),
            dressReference: String(d.dressReference || ''),
            message: String(d.message || ''),
            authorUid: String(d.authorUid || ''),
            createdAt: d.createdAt,
          };
        });
        setInquiries(list);
      },
      (error) => {
        console.warn('Admin inquiries listener notice:', error);
      }
    );

    return () => {
      unsubUsers();
      unsubInquiries();
    };
  }, [authReady, isAdminUnlocked]);

  // Seed initial collection, categories, and offer posters into Firestore
  const seedInitialAtelierData = useCallback(async () => {
    if (!user || !isAdminUnlocked) return;

    try {
      for (let i = 0; i < INITIAL_CATEGORIES.length; i++) {
        const cat = INITIAL_CATEGORIES[i];
        const docId = sanitizeId(cat.name.toLowerCase());
        const docRef = doc(db, 'categories', docId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, {
            ...cat,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      for (let i = 0; i < INITIAL_COLLECTIONS.length; i++) {
        const item = INITIAL_COLLECTIONS[i];
        const docId = sanitizeId(item.sku.toLowerCase());
        const docRef = doc(db, 'collections', docId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, {
            ...item,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      for (let i = 0; i < INITIAL_OFFERS.length; i++) {
        const offer = INITIAL_OFFERS[i];
        const docId = sanitizeId(offer.privilegeCode.toLowerCase());
        const docRef = doc(db, 'offers', docId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, {
            ...offer,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.warn('Seed notice:', error);
    }
  }, [user, isAdminUnlocked]);

  useEffect(() => {
    if (isAdminUnlocked && catalogSnapshotReady && !hasAutoSeededRef.current) {
      hasAutoSeededRef.current = true;
      seedInitialAtelierData().catch((err) => console.warn('Initial seed notice:', err));
    }
  }, [isAdminUnlocked, catalogSnapshotReady, seedInitialAtelierData]);

  // Standard Customer Google Sign-In (basic profile & email only; no Gmail scope)
  const signInWithGoogle = async (): Promise<User | null> => {
    setIsSigningIn(true);
    setAuthError(null);
    setAdminAuthError(null);
    try {
      const signedInUser = await signInCustomerWithGoogle();
      if (!signedInUser) return null;
      await syncUserRecordToFirestore(signedInUser);
      const email = (signedInUser.email || '').toLowerCase().trim();
      if (isAuthorizedAdminEmail(email)) {
        await authorizeAdminWithServer(signedInUser);
      }
      return signedInUser;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Unable to complete Google Sign-In.';
      setAuthError(msg);
      return null;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Admin Google Sign-In with Gmail Send OAuth Scope requested in the Google Sign-In consent screen
  const signInAdminWithGoogle = async (): Promise<{
    user: User | null;
    accessToken: string | null;
  }> => {
    setIsSigningIn(true);
    setAuthError(null);
    setAdminAuthError(null);
    try {
      const { user: signedInUser, accessToken } = await signInAdminWithGmailAccess();
      if (accessToken) {
        setGmailAccessToken(accessToken);
      }
      if (!signedInUser) {
        return { user: null, accessToken };
      }
      await syncUserRecordToFirestore(signedInUser);
      const email = (signedInUser.email || '').toLowerCase().trim();
      if (isAuthorizedAdminEmail(email)) {
        await authorizeAdminWithServer(signedInUser);
      } else {
        setAdminAuthError(
          `Signed in as ${signedInUser.email}. Only ${AUTHORIZED_ADMIN_EMAILS.join(' or ')} are authorised to access the Shingar Dresses Admin Panel.`
        );
      }
      return { user: signedInUser, accessToken };
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Unable to complete Admin Google Sign-In with Gmail permission.';
      setAuthError(msg);
      setAdminAuthError(msg);
      return { user: null, accessToken: null };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Re-consent or connect Gmail token for Admin Email Composer
  const connectAdminGmail = async (): Promise<string | null> => {
    const res = await signInAdminWithGoogle();
    return res.accessToken;
  };

  const signOutUser = async (): Promise<void> => {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    clearGmailAccessToken();
    setGmailAccessToken(null);
    setAdminServerToken(null);
    setIsServerAdminAuthenticated(false);
    setIsFirestoreAdminGranted(false);
    setAdminAuthError(null);
    await firebaseSignOut(auth);
  };

  const logoutAdminServerSide = async (): Promise<void> => {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    clearGmailAccessToken();
    setGmailAccessToken(null);
    setAdminServerToken(null);
    setIsServerAdminAuthenticated(false);
    setIsFirestoreAdminGranted(false);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    await firebaseSignOut(auth);
  };

  // Create or update a Collection Item
  const saveCollectionItem = async (
    item: Omit<CollectionItem, 'id' | 'authorUid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<void> => {
    if (!user) throw new Error('Please sign in with Google to save changes.');
    const docId = existingId ? sanitizeId(existingId) : sanitizeId(`dress_${Date.now()}`);
    const docRef = doc(db, 'collections', docId);

    const basePayload = {
      title: (item.title.trim() || 'Untitled Garment').slice(0, 120),
      category: (
        item.category.trim() || "Men's Readymade & Kurta-Pyjamas"
      ).slice(0, 80),
      price: Math.max(0, Math.min(10000000, Number(item.price) || 0)),
      fabric: (item.fabric.trim() || 'Premium Woven Cotton & Silk').slice(0, 150),
      silhouette: (item.silhouette.trim() || 'Tailored Fit').slice(0, 150),
      occasion: (item.occasion.trim() || 'Festive & Casual').slice(0, 100),
      description: (item.description.trim() || 'Showcased at Shingar Dresses, Junagadh.').slice(
        0,
        1000
      ),
      imageUrl: (item.imageUrl.trim() || INITIAL_COLLECTIONS[0].imageUrl).slice(0, 900000),
      featured: Boolean(item.featured),
      lookbookChapter: (
        item.lookbookChapter.trim() || '01. Royal Ethnic & Festive Kurta Edit'
      ).slice(0, 100),
      sku: sanitizeId(item.sku.trim() || `SHG-${Date.now()}`).slice(0, 40),
      availableBranches: (
        item.availableBranches?.trim() ||
        'Shingar Dresses (M.G. Road, Junagadh), Shingar NX (Motibaug Road, Junagadh)'
      ).slice(0, 250),
    };

    try {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        if (existingData.createdAt) {
          await setDoc(docRef, {
            ...basePayload,
            authorUid: user.uid,
            createdAt: existingData.createdAt,
            updatedAt: serverTimestamp(),
          });
        } else {
          await deleteDoc(docRef);
          await setDoc(docRef, {
            ...basePayload,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        await setDoc(docRef, {
          ...basePayload,
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingId ? OperationType.UPDATE : OperationType.CREATE,
        `collections/${docId}`
      );
    }
  };

  const deleteCollectionItem = async (id: string): Promise<void> => {
    const docId = sanitizeId(id);
    const docRef = doc(db, 'collections', docId);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await deleteDoc(docRef);
      } else if (user) {
        hasAutoSeededRef.current = true;
        for (const item of INITIAL_COLLECTIONS) {
          const seedId = sanitizeId(item.sku.toLowerCase());
          if (seedId !== docId) {
            const seedRef = doc(db, 'collections', seedId);
            const seedSnap = await getDoc(seedRef);
            if (!seedSnap.exists()) {
              await setDoc(seedRef, {
                ...item,
                authorUid: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `collections/${docId}`);
    }
  };

  // Create or update a Clothing Category
  const saveCategory = async (
    category: { name: string; description: string; order?: number },
    existingId?: string
  ): Promise<void> => {
    if (!user) throw new Error('Please sign in with Google to manage categories.');
    const cleanName = category.name.trim().slice(0, 80);
    if (cleanName.length < 2) throw new Error('Category name must be at least 2 characters.');

    const docId = existingId
      ? sanitizeId(existingId)
      : sanitizeId(cleanName.toLowerCase());
    const docRef = doc(db, 'categories', docId);

    const basePayload = {
      name: cleanName,
      description: (category.description || '').trim().slice(0, 300),
      order: Math.max(0, Math.min(10000, Number(category.order ?? 10))),
    };

    try {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        if (existingData.createdAt) {
          await setDoc(docRef, {
            ...basePayload,
            authorUid: user.uid,
            createdAt: existingData.createdAt,
            updatedAt: serverTimestamp(),
          });
        } else {
          await deleteDoc(docRef);
          await setDoc(docRef, {
            ...basePayload,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        await setDoc(docRef, {
          ...basePayload,
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingId ? OperationType.UPDATE : OperationType.CREATE,
        `categories/${docId}`
      );
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const docId = sanitizeId(id);
    const docRef = doc(db, 'categories', docId);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await deleteDoc(docRef);
      } else if (user) {
        for (const cat of INITIAL_CATEGORIES) {
          const seedId = sanitizeId(cat.name.toLowerCase());
          if (seedId !== docId) {
            const seedRef = doc(db, 'categories', seedId);
            const seedSnap = await getDoc(seedRef);
            if (!seedSnap.exists()) {
              await setDoc(seedRef, {
                ...cat,
                authorUid: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${docId}`);
    }
  };

  // Create or update an Offer Poster
  const saveOfferPoster = async (
    offer: Omit<OfferPoster, 'id' | 'authorUid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<void> => {
    if (!user) throw new Error('Please sign in with Google to save changes.');
    const docId = existingId ? sanitizeId(existingId) : sanitizeId(`offer_${Date.now()}`);
    const docRef = doc(db, 'offers', docId);

    const basePayload = {
      title: (offer.title.trim() || 'Seasonal Store Offer').slice(0, 120),
      subtitle: (
        offer.subtitle.trim() || 'In-Store Privilege at M.G. Road & Shingar NX'
      ).slice(0, 160),
      privilegeBadge: (offer.privilegeBadge.trim() || '15% In-Store Privilege').slice(0, 100),
      validUntil: (offer.validUntil.trim() || 'Limited Period').slice(0, 80),
      description: (
        offer.description.trim() ||
        'Present this code at Shingar Dresses (M.G. Road) or Shingar NX (Motibaug Road), Junagadh.'
      ).slice(0, 800),
      posterUrl: (offer.posterUrl.trim() || INITIAL_OFFERS[0].posterUrl).slice(0, 900000),
      privilegeCode: sanitizeId(offer.privilegeCode.trim() || `SHG-${Date.now()}`).slice(0, 40),
      active: Boolean(offer.active),
    };

    try {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        if (existingData.createdAt) {
          await setDoc(docRef, {
            ...basePayload,
            authorUid: user.uid,
            createdAt: existingData.createdAt,
            updatedAt: serverTimestamp(),
          });
        } else {
          await deleteDoc(docRef);
          await setDoc(docRef, {
            ...basePayload,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        await setDoc(docRef, {
          ...basePayload,
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingId ? OperationType.UPDATE : OperationType.CREATE,
        `offers/${docId}`
      );
    }
  };

  const deleteOfferPoster = async (id: string): Promise<void> => {
    const docId = sanitizeId(id);
    const docRef = doc(db, 'offers', docId);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await deleteDoc(docRef);
      } else if (user) {
        hasAutoSeededRef.current = true;
        for (const offer of INITIAL_OFFERS) {
          const seedId = sanitizeId(offer.privilegeCode.toLowerCase());
          if (seedId !== docId) {
            const seedRef = doc(db, 'offers', seedId);
            const seedSnap = await getDoc(seedRef);
            if (!seedSnap.exists()) {
              await setDoc(seedRef, {
                ...offer,
                authorUid: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `offers/${docId}`);
    }
  };

  const submitAtelierInquiry = async (
    inquiry: Omit<AtelierInquiry, 'id' | 'authorUid' | 'createdAt'>
  ): Promise<void> => {
    let activeUser = user;
    if (!activeUser) {
      activeUser = await signInWithGoogle();
    }
    if (!activeUser) {
      throw new Error('Please sign in with Google to submit your inquiry.');
    }

    const inquiryId = sanitizeId(`inq_${Date.now()}`);
    const docRef = doc(db, 'inquiries', inquiryId);
    try {
      await setDoc(docRef, {
        name: (inquiry.name.trim() || activeUser.displayName || 'Customer').slice(0, 100),
        email: (inquiry.email.trim() || activeUser.email || '').slice(0, 180),
        phone: (inquiry.phone.trim() || '+91 98251 21298').slice(0, 30),
        preferredDate: (
          inquiry.preferredDate.trim() || 'Shingar Dresses — M.G. Road Main Store'
        ).slice(0, 80),
        dressReference: (inquiry.dressReference.trim() || 'General Store Inquiry').slice(0, 150),
        message: (inquiry.message.trim() || 'Requesting an in-store visit at Junagadh.').slice(
          0,
          1000
        ),
        authorUid: activeUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `inquiries/${inquiryId}`);
    }
  };

  // Merge or prioritize authentic Junagadh catalog items; if Firestore only has legacy Mumbai seed IDs, include the authentic Junagadh items
  const displayedCollections: CollectionItem[] = useMemo(() => {
    const seedItems: CollectionItem[] = INITIAL_COLLECTIONS.map((item, idx) => ({
      ...item,
      id: sanitizeId(item.sku.toLowerCase() || `seed_${idx}`),
      authorUid: 'atelier_seed',
    }));

    if (firestoreCollections.length === 0) {
      return seedItems;
    }

    // Filter out old placeholder Mumbai/Delhi/Jaipur demo items unless edited by admin, and ensure authentic Junagadh items appear
    const nonLegacyFirestore = firestoreCollections.filter(
      (item) => !item.availableBranches?.includes('Mumbai (Kala Ghoda')
    );

    if (nonLegacyFirestore.length > 0) {
      return nonLegacyFirestore;
    }

    return seedItems;
  }, [firestoreCollections]);

  const displayedCategories: ClothingCategory[] = useMemo(() => {
    const seedCats: ClothingCategory[] = INITIAL_CATEGORIES.map((cat) => ({
      ...cat,
      id: sanitizeId(cat.name.toLowerCase()),
      authorUid: 'atelier_seed',
    }));

    if (firestoreCategories.length === 0) {
      return seedCats;
    }

    const hasJunagadhCategories = firestoreCategories.some((c) =>
      DEFAULT_CATEGORIES.includes(c.name)
    );
    return hasJunagadhCategories ? firestoreCategories : seedCats;
  }, [firestoreCategories]);

  const categoryNames = useMemo(() => {
    const set = new Set<string>();
    for (const c of displayedCategories) {
      if (c.name) set.add(c.name);
    }
    for (const item of displayedCollections) {
      if (item.category) set.add(item.category);
    }
    if (set.size === 0) {
      DEFAULT_CATEGORIES.forEach((c) => set.add(c));
    }
    return Array.from(set);
  }, [displayedCategories, displayedCollections]);

  const displayedOffers: OfferPoster[] = useMemo(() => {
    const seedOffers: OfferPoster[] = INITIAL_OFFERS.map((offer, idx) => ({
      ...offer,
      id: sanitizeId(offer.privilegeCode.toLowerCase() || `offer_seed_${idx}`),
      authorUid: 'atelier_seed',
    }));

    if (firestoreOffers.length === 0) {
      return seedOffers;
    }

    const nonLegacyOffers = firestoreOffers.filter(
      (o) => !o.description.includes('Mumbai, New Delhi')
    );
    return nonLegacyOffers.length > 0 ? nonLegacyOffers : seedOffers;
  }, [firestoreOffers]);

  return (
    <AtelierContext.Provider
      value={{
        user,
        authReady,
        isSigningIn,
        authError,
        signInWithGoogle,
        signInAdminWithGoogle,
        connectAdminGmail,
        gmailAccessToken,
        signOutUser,
        isServerAdminAuthenticated,
        isFirestoreAdminGranted,
        isAdminUnlocked,
        isAuthorizingAdmin,
        adminServerToken,
        adminAuthError,
        authorizeAdminWithServer,
        logoutAdminServerSide,
        collections: displayedCollections,
        categories: displayedCategories,
        categoryNames,
        offers: displayedOffers,
        usersDirectory,
        inquiries,
        isLoadingCatalog,
        saveCollectionItem,
        deleteCollectionItem,
        saveCategory,
        deleteCategory,
        saveOfferPoster,
        deleteOfferPoster,
        seedInitialAtelierData,
        submitAtelierInquiry,
      }}
    >
      {children}
    </AtelierContext.Provider>
  );
};

export function useAtelier(): AtelierContextValue {
  const ctx = useContext(AtelierContext);
  if (!ctx) {
    throw new Error('useAtelier must be used inside an AtelierProvider');
  }
  return ctx;
}
