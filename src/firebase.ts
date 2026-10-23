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

if (typeof window !== 'undefined') {
  testConnection();
}

export const customerGoogleProvider = new GoogleAuthProvider();
customerGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GMAIL_TOKEN_STORAGE_KEY = 'shingar_admin_gmail_access_token';

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

function isIgnorablePopupError(code: string): boolean {
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled'
  );
}

async function executeGooglePopupSignIn(
  provider: GoogleAuthProvider
): Promise<{ user: User | null; accessToken: string | null }> {
  try {
    const result = await signInWithPopup(
      auth,
      provider,
      browserPopupRedirectResolver
    );
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return {
      user: result.user,
      accessToken: credential?.accessToken || null,
    };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code || '';
    if (isIgnorablePopupError(code)) {
      return { user: null, accessToken: null };
    }
    if (code === 'auth/unauthorized-domain' && typeof window !== 'undefined') {
      throw new Error(
        `Domain "${window.location.hostname}" is not yet added to Firebase Authorized Domains. Please open Firebase Console -> shingar-dresses -> Authentication -> Settings -> Authorized domains and add "${window.location.hostname}".`
      );
    }
    throw error;
  }
}

export async function signInCustomerWithGoogle(): Promise<User | null> {
  const { user } = await executeGooglePopupSignIn(customerGoogleProvider);
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

  const { user, accessToken } = await executeGooglePopupSignIn(adminProvider);
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
