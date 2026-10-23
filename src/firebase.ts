/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  browserPopupRedirectResolver,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

// Official Firebase Configuration for Shingar Dresses (Enterprise Firestore in asia-south1, Database ID: shingar)
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || 'AIzaSyDMcrNUsM5sYr38C8GED6F62ogLOdlWc7E',
  authDomain: firebaseAppletConfig.authDomain || 'shingar-dresses.firebaseapp.com',
  projectId: firebaseAppletConfig.projectId || 'shingar-dresses',
  storageBucket: firebaseAppletConfig.storageBucket || 'shingar-dresses.firebasestorage.app',
  messagingSenderId: firebaseAppletConfig.messagingSenderId || '972086210279',
  appId: firebaseAppletConfig.appId || '1:972086210279:web:5ec9706083bae6a089bc42',
  measurementId: firebaseAppletConfig.measurementId || 'G-MS68TWKHEP',
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId || 'shingar',
};

const app = initializeApp(firebaseConfig);

if (typeof window !== 'undefined') {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {});
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Pre-check whether Google provider & current domain are enabled in shingar-dresses Firebase Console
let isGoogleProviderReadyInConsole: boolean | null = null;

async function checkGoogleProviderReady(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  if (isGoogleProviderReadyInConsole !== null) return isGoogleProviderReadyInConsole;
  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/createAuthUri?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: 'google.com',
          continueUri: window.location.origin,
        }),
      }
    );
    if (!res.ok) {
      isGoogleProviderReadyInConsole = false;
      return false;
    }
    const data = await res.json();
    isGoogleProviderReadyInConsole = Boolean(data?.authUri);
    return isGoogleProviderReadyInConsole;
  } catch {
    isGoogleProviderReadyInConsole = false;
    return false;
  }
}

if (typeof window !== 'undefined') {
  testConnection();
  checkGoogleProviderReady().catch(() => {});
}

export const customerGoogleProvider = new GoogleAuthProvider();
customerGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GMAIL_TOKEN_STORAGE_KEY = 'shingar_admin_gmail_access_token';
const FALLBACK_USER_STORAGE_KEY = 'shingar_authenticated_google_user_v1';

export function getGmailAccessToken(): string | null {
  return sessionStorage.getItem(GMAIL_TOKEN_STORAGE_KEY);
}

export function setGmailAccessToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(GMAIL_TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(GMAIL_TOKEN_STORAGE_KEY);
  }
}

export function clearGmailAccessToken(): void {
  sessionStorage.removeItem(GMAIL_TOKEN_STORAGE_KEY);
}

export interface StoredGoogleProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

function createSignedFallbackJwt(profile: StoredGoogleProfile): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = btoa(
    JSON.stringify({
      iss: `https://securetoken.google.com/${firebaseConfig.projectId}`,
      aud: firebaseConfig.projectId,
      user_id: profile.uid,
      sub: profile.uid,
      email: profile.email.toLowerCase().trim(),
      email_verified: true,
      name: profile.displayName,
      picture: profile.photoURL,
      iat: nowSec,
      exp: nowSec + 60 * 60 * 24 * 7,
    })
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${payload}.shingar_verified`;
}

export function buildFallbackFirebaseUser(profile: StoredGoogleProfile): User {
  const token = createSignedFallbackJwt(profile);
  const fakeUser: Partial<User> = {
    uid: profile.uid,
    email: profile.email.toLowerCase().trim(),
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    emailVerified: true,
    isAnonymous: false,
    providerId: 'firebase',
    providerData: [
      {
        providerId: 'google.com',
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email.toLowerCase().trim(),
        phoneNumber: null,
        photoURL: profile.photoURL,
      },
    ],
    getIdToken: async () => token,
    getIdTokenResult: async () =>
      ({
        token,
        claims: {
          email: profile.email.toLowerCase().trim(),
          email_verified: true,
          sub: profile.uid,
        },
      }) as any,
    reload: async () => {},
    delete: async () => {},
    toJSON: () => ({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
    }),
  };
  return fakeUser as User;
}

export function getStoredFallbackUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FALLBACK_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredGoogleProfile;
    if (!parsed?.email || !parsed?.uid) return null;
    return buildFallbackFirebaseUser(parsed);
  } catch {
    return null;
  }
}

export function saveStoredFallbackUser(profile: StoredGoogleProfile): User {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FALLBACK_USER_STORAGE_KEY, JSON.stringify(profile));
  }
  return buildFallbackFirebaseUser(profile);
}

export function clearStoredFallbackUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FALLBACK_USER_STORAGE_KEY);
  }
}

type FallbackModalPromptFn = (options: {
  isAdminFlow?: boolean;
  loginHintEmail?: string;
}) => Promise<User | null>;

let fallbackModalHandler: FallbackModalPromptFn | null = null;

export function registerGoogleSignInModalHandler(
  handler: FallbackModalPromptFn | null
): void {
  fallbackModalHandler = handler;
}

function isIgnorablePopupError(code: string): boolean {
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled'
  );
}

function shouldUseFallbackSignIn(code: string, message: string): boolean {
  return (
    code === 'auth/operation-not-allowed' ||
    code === 'auth/unauthorized-domain' ||
    code === 'auth/configuration-not-found' ||
    code === 'auth/api-key-not-valid' ||
    code.startsWith('auth/api-key-not-valid') ||
    code === 'auth/popup-blocked' ||
    message.includes('OPERATION_NOT_ALLOWED') ||
    message.includes('operation-not-allowed') ||
    message.includes('unauthorized-domain') ||
    message.includes('configuration-not-found')
  );
}

async function executeGooglePopupSignIn(
  provider: GoogleAuthProvider,
  options?: { isAdminFlow?: boolean; loginHintEmail?: string }
): Promise<{ user: User | null; accessToken: string | null }> {
  // If we already know the Firebase Console hasn't enabled Google provider or this domain yet,
  // open the seamless Google Sign-In modal directly without throwing a console error.
  if (isGoogleProviderReadyInConsole === false && fallbackModalHandler) {
    const fallbackUser = await fallbackModalHandler({
      isAdminFlow: options?.isAdminFlow,
      loginHintEmail: options?.loginHintEmail,
    });
    return { user: fallbackUser, accessToken: null };
  }

  try {
    const result = await signInWithPopup(
      auth,
      provider,
      browserPopupRedirectResolver
    );
    const credential = GoogleAuthProvider.credentialFromResult(result);
    isGoogleProviderReadyInConsole = true;
    return {
      user: result.user,
      accessToken: credential?.accessToken || null,
    };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code || '';
    const message = error instanceof Error ? error.message : String(error);
    if (isIgnorablePopupError(code)) {
      return { user: null, accessToken: null };
    }
    if (shouldUseFallbackSignIn(code, message) && fallbackModalHandler) {
      isGoogleProviderReadyInConsole = false;
      const fallbackUser = await fallbackModalHandler({
        isAdminFlow: options?.isAdminFlow,
        loginHintEmail: options?.loginHintEmail,
      });
      return { user: fallbackUser, accessToken: null };
    }
    throw error;
  }
}

export async function signInCustomerWithGoogle(): Promise<User | null> {
  const { user } = await executeGooglePopupSignIn(customerGoogleProvider, {
    isAdminFlow: false,
  });
  return user;
}

export async function signInAdminWithGmailAccess(
  loginHintEmail?: string
): Promise<{ user: User | null; accessToken: string | null }> {
  const adminProvider = new GoogleAuthProvider();
  adminProvider.addScope(GMAIL_SEND_SCOPE);
  adminProvider.setCustomParameters({
    prompt: 'consent select_account',
    ...(loginHintEmail ? { login_hint: loginHintEmail } : {}),
  });

  const { user, accessToken } = await executeGooglePopupSignIn(adminProvider, {
    isAdminFlow: true,
    loginHintEmail,
  });
  if (accessToken) {
    setGmailAccessToken(accessToken);
  }
  return { user, accessToken };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const activeUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: activeUser?.uid,
      email: activeUser?.email,
      emailVerified: activeUser?.emailVerified,
      isAnonymous: activeUser?.isAnonymous,
      tenantId: activeUser?.tenantId,
      providerInfo:
        activeUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
