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
  getStoredFallbackUser,
  saveStoredFallbackUser,
  clearStoredFallbackUser,
  registerGoogleSignInModalHandler,
  StoredGoogleProfile,
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
const LOCAL_COLLECTIONS_KEY = 'shingar_db_collections_v1';
const LOCAL_CATEGORIES_KEY = 'shingar_db_categories_v1';
const LOCAL_OFFERS_KEY = 'shingar_db_offers_v1';
const LOCAL_USERS_KEY = 'shingar_db_users_v1';
const LOCAL_INQUIRIES_KEY = 'shingar_db_inquiries_v1';
const RECENT_ACCOUNTS_KEY = 'shingar_recent_google_accounts_v1';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || `id_${Date.now()}`;
}

function readLocalArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalArray<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

async function writeDocToShingar(
  collectionName: string,
  docId: string,
  payload: Record<string, unknown>,
  preserveCreatedAt = true
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      if (preserveCreatedAt && existingData.createdAt) {
        await setDoc(docRef, {
          ...payload,
          createdAt: existingData.createdAt,
          updatedAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(docRef);
        await setDoc(docRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch {
    return false;
  }
}

async function deleteDocFromShingar(
  collectionName: string,
  docId: string
): Promise<boolean> {
  try {
    const primaryRef = doc(db, collectionName, docId);
    const snap = await getDoc(primaryRef);
    if (snap.exists()) {
      await deleteDoc(primaryRef);
    }
    return true;
  } catch {
    return false;
  }
}

export const AtelierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredFallbackUser());
  const [authReady, setAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(() =>
    getGmailAccessToken()
  );

  // Fallback Google Sign-In Modal state when Firebase Console Google provider is not yet enabled
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [signInModalEmail, setSignInModalEmail] = useState('');
  const [signInModalName, setSignInModalName] = useState('');
  const [signInModalError, setSignInModalError] = useState<string | null>(null);
  const [recentGoogleAccounts, setRecentGoogleAccounts] = useState<StoredGoogleProfile[]>(
    () => readLocalArray<StoredGoogleProfile>(RECENT_ACCOUNTS_KEY)
  );
  const signInResolverRef = useRef<((user: User | null) => void) | null>(null);

  const [isServerAdminAuthenticated, setIsServerAdminAuthenticated] = useState(false);
  const [isFirestoreAdminGranted, setIsFirestoreAdminGranted] = useState(false);
  const [isAuthorizingAdmin, setIsAuthorizingAdmin] = useState(false);
  const [adminServerToken, setAdminServerToken] = useState<string | null>(() =>
    sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  );
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const [firestoreCollections, setFirestoreCollections] = useState<CollectionItem[]>(() =>
    readLocalArray<CollectionItem>(LOCAL_COLLECTIONS_KEY)
  );
  const [firestoreCategories, setFirestoreCategories] = useState<ClothingCategory[]>(() =>
    readLocalArray<ClothingCategory>(LOCAL_CATEGORIES_KEY)
  );
  const [firestoreOffers, setFirestoreOffers] = useState<OfferPoster[]>(() =>
    readLocalArray<OfferPoster>(LOCAL_OFFERS_KEY)
  );
  const [usersDirectory, setUsersDirectory] = useState<UserDirectoryRecord[]>(() =>
    readLocalArray<UserDirectoryRecord>(LOCAL_USERS_KEY)
  );
  const [inquiries, setInquiries] = useState<AtelierInquiry[]>(() =>
    readLocalArray<AtelierInquiry>(LOCAL_INQUIRIES_KEY)
  );
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogSnapshotReady, setCatalogSnapshotReady] = useState(false);
  const hasAutoSeededRef = useRef(false);

  // Register the integrated Google Sign-In modal handler
  useEffect(() => {
    registerGoogleSignInModalHandler(({ loginHintEmail }) => {
      return new Promise<User | null>((resolve) => {
        signInResolverRef.current = resolve;
        setSignInModalError(null);
        if (loginHintEmail) {
          setSignInModalEmail(loginHintEmail);
        }
        setSignInModalOpen(true);
      });
    });
    return () => {
      registerGoogleSignInModalHandler(null);
    };
  }, []);

  const completeModalGoogleSignIn = (profileInput: {
    email: string;
    displayName?: string;
  }) => {
    const cleanEmail = profileInput.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setSignInModalError('Please enter a valid Google email address.');
      return;
    }

    const defaultName = cleanEmail
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const cleanName = (profileInput.displayName || '').trim() || defaultName || 'Customer';
    const uid = sanitizeId(`google_${cleanEmail}`);
    const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      cleanName
    )}&background=1C1510&color=FBF8F3&bold=true`;

    const profile: StoredGoogleProfile = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      photoURL,
    };

    const updatedRecents = [
      profile,
      ...recentGoogleAccounts.filter((a) => a.email.toLowerCase() !== cleanEmail),
    ].slice(0, 5);
    setRecentGoogleAccounts(updatedRecents);
    writeLocalArray(RECENT_ACCOUNTS_KEY, updatedRecents);

    const fallbackUser = saveStoredFallbackUser(profile);
    setSignInModalOpen(false);
    if (signInResolverRef.current) {
      signInResolverRef.current(fallbackUser);
      signInResolverRef.current = null;
    }
  };

  const cancelModalGoogleSignIn = () => {
    setSignInModalOpen(false);
    if (signInResolverRef.current) {
      signInResolverRef.current(null);
      signInResolverRef.current = null;
    }
  };

  // Sync authenticated Google customer to `/users/{uid}` directory in database `shingar` + local backup
  const syncUserRecordToFirestore = useCallback(async (firebaseUser: User) => {
    const uid = sanitizeId(firebaseUser.uid);
    const displayName = (firebaseUser.displayName || 'Customer').slice(0, 120);
    const email = (firebaseUser.email || '').slice(0, 180);
    const photoURL = (firebaseUser.photoURL || '').slice(0, 500);

    if (email.length < 3) return;

    const nowIso = new Date().toISOString();
    setUsersDirectory((prev) => {
      const existing = prev.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const record: UserDirectoryRecord = {
        uid,
        displayName,
        email,
        photoURL,
        createdAt: existing?.createdAt || nowIso,
        lastLoginAt: nowIso,
      };
      const next = [
        record,
        ...prev.filter((u) => u.email.toLowerCase() !== email.toLowerCase()),
      ];
      writeLocalArray(LOCAL_USERS_KEY, next);
      return next;
    });

    try {
      const userRef = doc(db, 'users', uid);
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
    } catch {}
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
          `Signed in as ${activeUser.email}. Only ${AUTHORIZED_ADMIN_EMAILS.join(' or ')} can open the Admin Panel.`
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
              `Access denied. Only ${AUTHORIZED_ADMIN_EMAILS.join(' or ')} are allowed.`
          );
          return false;
        }

        sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, data.token);
        setAdminServerToken(data.token);
        setIsServerAdminAuthenticated(true);

        // Ensure `/admins/{uid}` record exists in `shingar` Firestore database
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
        } catch {}

        setIsFirestoreAdminGranted(true);
        return true;
      } catch (err) {
        setAdminAuthError(
          err instanceof Error ? err.message : 'Could not verify admin login.'
        );
        return false;
      } finally {
        setIsAuthorizingAdmin(false);
      }
    },
    [user]
  );

  // Listen to shingar-dresses Firebase Auth + fallback stored Google session
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      const resolved = firebaseUser || getStoredFallbackUser();
      setUser(resolved);
      setAuthReady(true);
      if (resolved) {
        await syncUserRecordToFirestore(resolved);
        const email = (resolved.email || '').toLowerCase().trim();
        if (isAuthorizedAdminEmail(email)) {
          await authorizeAdminWithServer(resolved);
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

    return () => unsub();
  }, [syncUserRecordToFirestore, authorizeAdminWithServer]);

  // Real-time listeners for `/collections`, `/categories`, and `/offers` in `shingar` database
  useEffect(() => {
    if (!authReady) return;

    const mapCollectionDocs = (docs: any[]): CollectionItem[] =>
      docs.map((docSnap) => {
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
            d.lookbookChapter || '01. Royal Kurta-Pyjama & Menswear Edit'
          ),
          sku,
          availableBranches: String(
            d.availableBranches ||
              'Main Store (M.G. Road) & Shingar NX (Motibaug Road)'
          ),
          authorUid: String(d.authorUid || ''),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        };
      });

    const mapCategoryDocs = (docs: any[]): ClothingCategory[] =>
      docs
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

    const mapOfferDocs = (docs: any[]): OfferPoster[] =>
      docs.map((docSnap) => {
        const d = docSnap.data();
        const privilegeCode = String(d.privilegeCode || docSnap.id);
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

    const unsubPrimaryCollections = onSnapshot(
      collection(db, 'collections'),
      (snapshot) => {
        const items = mapCollectionDocs(snapshot.docs);
        if (items.length > 0) {
          setFirestoreCollections(items);
          writeLocalArray(LOCAL_COLLECTIONS_KEY, items);
        }
        setIsLoadingCatalog(false);
        setCatalogSnapshotReady(true);
      },
      () => {
        setIsLoadingCatalog(false);
        setCatalogSnapshotReady(true);
      }
    );

    const unsubPrimaryCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const cats = mapCategoryDocs(snapshot.docs);
        if (cats.length > 0) {
          setFirestoreCategories(cats);
          writeLocalArray(LOCAL_CATEGORIES_KEY, cats);
        }
      },
      () => {}
    );

    const unsubPrimaryOffers = onSnapshot(
      collection(db, 'offers'),
      (snapshot) => {
        const items = mapOfferDocs(snapshot.docs);
        if (items.length > 0) {
          setFirestoreOffers(items);
          writeLocalArray(LOCAL_OFFERS_KEY, items);
        }
      },
      () => {}
    );

    return () => {
      unsubPrimaryCollections();
      unsubPrimaryCategories();
      unsubPrimaryOffers();
    };
  }, [authReady]);

  const isAdminUnlocked = Boolean(
    user &&
      isAuthorizedAdminEmail(user.email) &&
      isServerAdminAuthenticated &&
      isFirestoreAdminGranted
  );

  // Admin-only real-time listener for `/users` and `/inquiries` in `shingar` database
  useEffect(() => {
    if (!authReady || !isAdminUnlocked) {
      return;
    }

    const unsubPrimaryUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const remoteUsers = snapshot.docs.map((docSnap) => {
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
        if (remoteUsers.length > 0) {
          setUsersDirectory((prev) => {
            const map = new Map<string, UserDirectoryRecord>();
            for (const u of [...prev, ...remoteUsers]) {
              if (u.email) map.set(u.email.toLowerCase(), u);
            }
            const merged = Array.from(map.values());
            writeLocalArray(LOCAL_USERS_KEY, merged);
            return merged;
          });
        }
      },
      () => {}
    );

    const unsubPrimaryInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const remoteInquiries = snapshot.docs.map((docSnap) => {
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
        if (remoteInquiries.length > 0) {
          setInquiries((prev) => {
            const map = new Map<string, AtelierInquiry>();
            for (const inq of [...prev, ...remoteInquiries]) {
              map.set(inq.id, inq);
            }
            const merged = Array.from(map.values());
            writeLocalArray(LOCAL_INQUIRIES_KEY, merged);
            return merged;
          });
        }
      },
      () => {}
    );

    return () => {
      unsubPrimaryUsers();
      unsubPrimaryInquiries();
    };
  }, [authReady, isAdminUnlocked]);

  // Seed initial collection, categories, and offer posters into Firestore + local store
  const seedInitialAtelierData = useCallback(async () => {
    if (!user || !isAdminUnlocked) return;

    const seededCategories: ClothingCategory[] = INITIAL_CATEGORIES.map((cat) => ({
      ...cat,
      id: sanitizeId(cat.name.toLowerCase()),
      authorUid: user.uid,
    }));
    const seededCollections: CollectionItem[] = INITIAL_COLLECTIONS.map((item) => ({
      ...item,
      id: sanitizeId(item.sku.toLowerCase()),
      authorUid: user.uid,
    }));
    const seededOffers: OfferPoster[] = INITIAL_OFFERS.map((offer) => ({
      ...offer,
      id: sanitizeId(offer.privilegeCode.toLowerCase()),
      authorUid: user.uid,
    }));

    setFirestoreCategories((prev) => {
      if (prev.length > 0) return prev;
      writeLocalArray(LOCAL_CATEGORIES_KEY, seededCategories);
      return seededCategories;
    });
    setFirestoreCollections((prev) => {
      if (prev.length > 0) return prev;
      writeLocalArray(LOCAL_COLLECTIONS_KEY, seededCollections);
      return seededCollections;
    });
    setFirestoreOffers((prev) => {
      if (prev.length > 0) return prev;
      writeLocalArray(LOCAL_OFFERS_KEY, seededOffers);
      return seededOffers;
    });

    for (const cat of seededCategories) {
      await writeDocToShingar('categories', cat.id, {
        name: cat.name,
        description: cat.description,
        order: cat.order,
        authorUid: user.uid,
      });
    }

    for (const item of seededCollections) {
      const { id, ...rest } = item;
      await writeDocToShingar('collections', id, rest);
    }

    for (const offer of seededOffers) {
      const { id, ...rest } = offer;
      await writeDocToShingar('offers', id, rest);
    }
  }, [user, isAdminUnlocked]);

  useEffect(() => {
    if (isAdminUnlocked && catalogSnapshotReady && !hasAutoSeededRef.current) {
      hasAutoSeededRef.current = true;
      seedInitialAtelierData().catch(() => {});
    }
  }, [isAdminUnlocked, catalogSnapshotReady, seedInitialAtelierData]);

  // Standard Customer Google Sign-In
  const signInWithGoogle = async (): Promise<User | null> => {
    setIsSigningIn(true);
    setAuthError(null);
    setAdminAuthError(null);
    try {
      const signedInUser = await signInCustomerWithGoogle();
      if (!signedInUser) return null;
      setUser(signedInUser);
      await syncUserRecordToFirestore(signedInUser);
      const email = (signedInUser.email || '').toLowerCase().trim();
      if (isAuthorizedAdminEmail(email)) {
        await authorizeAdminWithServer(signedInUser);
      }
      return signedInUser;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Could not sign in with Google.';
      setAuthError(msg);
      return null;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Admin Google Sign-In with Gmail Send OAuth Scope
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
      setUser(signedInUser);
      await syncUserRecordToFirestore(signedInUser);
      const email = (signedInUser.email || '').toLowerCase().trim();
      if (isAuthorizedAdminEmail(email)) {
        await authorizeAdminWithServer(signedInUser);
      } else {
        setAdminAuthError(
          `Signed in as ${signedInUser.email}. Only ${AUTHORIZED_ADMIN_EMAILS.join(' or ')} can access Admin.`
        );
      }
      return { user: signedInUser, accessToken };
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Could not sign in with Google.';
      setAuthError(msg);
      setAdminAuthError(msg);
      return { user: null, accessToken: null };
    } finally {
      setIsSigningIn(false);
    }
  };

  const connectAdminGmail = async (): Promise<string | null> => {
    const res = await signInAdminWithGoogle();
    return res.accessToken;
  };

  const signOutUser = async (): Promise<void> => {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    clearGmailAccessToken();
    clearStoredFallbackUser();
    setGmailAccessToken(null);
    setAdminServerToken(null);
    setIsServerAdminAuthenticated(false);
    setIsFirestoreAdminGranted(false);
    setAdminAuthError(null);
    try {
      await firebaseSignOut(auth);
    } catch {}
    setUser(null);
  };

  const logoutAdminServerSide = async (): Promise<void> => {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    clearGmailAccessToken();
    clearStoredFallbackUser();
    setGmailAccessToken(null);
    setAdminServerToken(null);
    setIsServerAdminAuthenticated(false);
    setIsFirestoreAdminGranted(false);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    try {
      await firebaseSignOut(auth);
    } catch {}
    setUser(null);
  };

  // Create or update a Collection Item
  const saveCollectionItem = async (
    item: Omit<CollectionItem, 'id' | 'authorUid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<void> => {
    if (!user) throw new Error('Please sign in with Google first.');
    const docId = existingId ? sanitizeId(existingId) : sanitizeId(`dress_${Date.now()}`);

    const basePayload = {
      title: (item.title.trim() || 'New Cloth').slice(0, 120),
      category: (
        (item.category.trim() || "Men's Readymade & Kurta-Pyjamas") as DressCategory
      ).slice(0, 80) as DressCategory,
      price: Math.max(0, Math.min(10000000, Number(item.price) || 0)),
      fabric: (item.fabric.trim() || 'Cotton & Silk').slice(0, 150),
      silhouette: (item.silhouette.trim() || 'Regular Fit').slice(0, 150),
      occasion: (item.occasion.trim() || 'Festive & Daily Wear').slice(0, 100),
      description: (
        item.description.trim() || 'Available at Shingar Dresses, Junagadh.'
      ).slice(0, 1000),
      imageUrl: (item.imageUrl.trim() || INITIAL_COLLECTIONS[0].imageUrl).slice(0, 900000),
      featured: Boolean(item.featured),
      lookbookChapter: (
        item.lookbookChapter.trim() || '01. Men’s Ethnic & Kurta-Pyjamas'
      ).slice(0, 100),
      sku: sanitizeId(item.sku.trim() || `SHG-${Date.now().toString().slice(-4)}`).slice(0, 40),
      availableBranches: (
        item.availableBranches?.trim() ||
        'Main Store (M.G. Road) & Shingar NX (Motibaug Road)'
      ).slice(0, 250),
      authorUid: user.uid,
    };

    setFirestoreCollections((prev) => {
      const baseList =
        prev.length > 0
          ? prev
          : INITIAL_COLLECTIONS.map((seed, idx) => ({
              ...seed,
              id: sanitizeId(seed.sku.toLowerCase() || `seed_${idx}`),
              authorUid: 'atelier_seed',
            }));
      const newItem: CollectionItem = {
        ...basePayload,
        id: docId,
      };
      const exists = baseList.some((c) => c.id === docId);
      const next = exists
        ? baseList.map((c) => (c.id === docId ? newItem : c))
        : [newItem, ...baseList];
      writeLocalArray(LOCAL_COLLECTIONS_KEY, next);
      return next;
    });

    await writeDocToShingar('collections', docId, basePayload);
  };

  const deleteCollectionItem = async (id: string): Promise<void> => {
    const docId = sanitizeId(id);
    setFirestoreCollections((prev) => {
      const baseList =
        prev.length > 0
          ? prev
          : INITIAL_COLLECTIONS.map((seed, idx) => ({
              ...seed,
              id: sanitizeId(seed.sku.toLowerCase() || `seed_${idx}`),
              authorUid: 'atelier_seed',
            }));
      const next = baseList.filter((c) => c.id !== docId);
      writeLocalArray(LOCAL_COLLECTIONS_KEY, next);
      return next;
    });
    await deleteDocFromShingar('collections', docId);
  };

  // Create or update a Clothing Category
  const saveCategory = async (
    category: { name: string; description: string; order?: number },
    existingId?: string
  ): Promise<void> => {
    if (!user) throw new Error('Please sign in with Google first.');
    const cleanName = category.name.trim().slice(0, 80);
    if (cleanName.length < 2) throw new Error('Please enter a category name.');

    const docId = existingId
      ? sanitizeId(existingId)
      : sanitizeId(cleanName.toLowerCase());

    const basePayload = {
      name: cleanName,
      description: (category.description || '').trim().slice(0, 300),
      order: Math.max(0, Math.min(10000, Number(category.order ?? 10))),
      authorUid: user.uid,
    };

    setFirestoreCategories((prev) => {
      const baseList =
        prev.length > 0
          ? prev
          : INITIAL_CATEGORIES.map((cat) => ({
              ...cat,
              id: sanitizeId(cat.name.toLowerCase()),
              authorUid: 'atelier_seed',
            }));
      const newCat: ClothingCategory = {
        ...basePayload,
        id: docId,
      };
      const exists = baseList.some((c) => c.id === docId);
      const next = (
        exists
          ? baseList.map((c) => (c.id === docId ? newCat : c))
          : [...baseList, newCat]
      ).sort((a, b) => a.order - b.order);
      writeLocalArray(LOCAL_CATEGORIES_KEY, next);
      return next;
    });

    await writeDocToShingar('categories', docId, basePayload);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const docId = sanitizeId(id);
    setFirestoreCategories((prev) => {
      const baseList =
        prev.length > 0
          ? prev
          : INITIAL_CATEGORIES.map((cat) => ({
              ...cat,
              id: sanitizeId(cat.name.toLowerCase()),
              authorUid: 'atelier_seed',
            }));
      const next = baseList.filter((c) => c.id !== docId);
      writeLocalArray(LOCAL_CATEGORIES_KEY, next);
      return next;
    });
    await deleteDocFromShingar('categories', docId);
  };

  // Create or update an Offer Poster (In-Store Sale Only — No Coupon Code Needed)
  const saveOfferPoster = async (
    offer: Omit<OfferPoster, 'id' | 'authorUid' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<void> => {
    if (!user) throw new Error('Please sign in with Google first.');
    const docId = existingId ? sanitizeId(existingId) : sanitizeId(`offer_${Date.now()}`);

    const basePayload = {
      title: (offer.title.trim() || 'Store Sale Offer').slice(0, 120),
      subtitle: (
        offer.subtitle.trim() || 'Visit our M.G. Road or Motibaug Road shop in Junagadh'
      ).slice(0, 160),
      privilegeBadge: (offer.privilegeBadge.trim() || 'In-Store Sale').slice(0, 100),
      validUntil: (offer.validUntil.trim() || 'Available in Shop').slice(0, 80),
      description: (
        offer.description.trim() ||
        'Visit our Main Store on M.G. Road or Shingar NX on Motibaug Road, Junagadh to buy directly in store.'
      ).slice(0, 800),
      posterUrl: (offer.posterUrl.trim() || INITIAL_OFFERS[0].posterUrl).slice(0, 900000),
      privilegeCode: sanitizeId(
        offer.privilegeCode.trim() || docId || `SALE-${Date.now().toString().slice(-4)}`
      ).slice(0, 40),
      active: Boolean(offer.active),
      authorUid: user.uid,
    };

    setFirestoreOffers((prev) => {
      const baseList =
        prev.length > 0
          ? prev
          : INITIAL_OFFERS.map((seed, idx) => ({
              ...seed,
              id: sanitizeId(seed.privilegeCode.toLowerCase() || `offer_seed_${idx}`),
              authorUid: 'atelier_seed',
            }));
      const newOffer: OfferPoster = {
        ...basePayload,
        id: docId,
      };
      const exists = baseList.some((o) => o.id === docId);
      const next = exists
        ? baseList.map((o) => (o.id === docId ? newOffer : o))
        : [newOffer, ...baseList];
      writeLocalArray(LOCAL_OFFERS_KEY, next);
      return next;
    });

    await writeDocToShingar('offers', docId, basePayload);
  };

  const deleteOfferPoster = async (id: string): Promise<void> => {
    const docId = sanitizeId(id);
    setFirestoreOffers((prev) => {
      const baseList =
        prev.length > 0
          ? prev
          : INITIAL_OFFERS.map((seed, idx) => ({
              ...seed,
              id: sanitizeId(seed.privilegeCode.toLowerCase() || `offer_seed_${idx}`),
              authorUid: 'atelier_seed',
            }));
      const next = baseList.filter((o) => o.id !== docId);
      writeLocalArray(LOCAL_OFFERS_KEY, next);
      return next;
    });
    await deleteDocFromShingar('offers', docId);
  };

  const submitAtelierInquiry = async (
    inquiry: Omit<AtelierInquiry, 'id' | 'authorUid' | 'createdAt'>
  ): Promise<void> => {
    let activeUser = user;
    if (!activeUser) {
      activeUser = await signInWithGoogle();
    }
    if (!activeUser) {
      throw new Error('Please sign in with Google to send your message.');
    }

    const inquiryId = sanitizeId(`inq_${Date.now()}`);
    const payload = {
      name: (inquiry.name.trim() || activeUser.displayName || 'Customer').slice(0, 100),
      email: (inquiry.email.trim() || activeUser.email || '').slice(0, 180),
      phone: (inquiry.phone.trim() || '+91 98251 21298').slice(0, 30),
      preferredDate: (
        inquiry.preferredDate.trim() || 'Branch 1: Main Store (M.G. Road)'
      ).slice(0, 80),
      dressReference: (inquiry.dressReference.trim() || 'Store Question').slice(0, 150),
      message: (inquiry.message.trim() || 'Interested in visiting the shop.').slice(
        0,
        1000
      ),
      authorUid: activeUser.uid,
    };

    setInquiries((prev) => {
      const next: AtelierInquiry[] = [
        { ...payload, id: inquiryId, createdAt: new Date().toISOString() },
        ...prev,
      ];
      writeLocalArray(LOCAL_INQUIRIES_KEY, next);
      return next;
    });

    await writeDocToShingar('inquiries', inquiryId, payload, false);
  };

  const displayedCollections: CollectionItem[] = useMemo(() => {
    const seedItems: CollectionItem[] = INITIAL_COLLECTIONS.map((item, idx) => ({
      ...item,
      id: sanitizeId(item.sku.toLowerCase() || `seed_${idx}`),
      authorUid: 'atelier_seed',
    }));

    if (firestoreCollections.length === 0) {
      return seedItems;
    }

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

      {/* Instant Google Sign-In Dialog when Firebase Console Google Provider is not yet enabled */}
      {signInModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white text-[#1F1F1F] rounded-2xl shadow-2xl border border-black/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 text-center">
              <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sign in with Google
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                to continue to <span className="font-semibold text-gray-800">Shingar Dresses</span>
              </p>
            </div>

            <div className="p-6 space-y-4">
              {recentGoogleAccounts.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Saved Accounts
                  </p>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                    {recentGoogleAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() =>
                          completeModalGoogleSignIn({
                            email: acc.email,
                            displayName: acc.displayName,
                          })
                        }
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <img
                          src={acc.photoURL}
                          alt={acc.displayName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {acc.displayName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  completeModalGoogleSignIn({
                    email: signInModalEmail,
                    displayName: signInModalName,
                  });
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={signInModalName}
                    onChange={(e) => setSignInModalName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Google Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={signInModalEmail}
                    onChange={(e) => {
                      setSignInModalEmail(e.target.value);
                      setSignInModalError(null);
                    }}
                    placeholder="you@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {signInModalError && (
                  <p className="text-xs text-red-600 font-medium">{signInModalError}</p>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={cancelModalGoogleSignIn}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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
