/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const DATABASE_ID =
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId ||
  'ai-studio-8d67d777-a297-4845-86c4-0aa372caa579';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, DATABASE_ID);
export const auth = getAuth(app);

// Workspace OAuth Scopes (used when Admin connects Gmail to dispatch customer emails)
export const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Standard customer Google provider (basic profile & email only, no Gmail inbox/send access)
export const googleCustomerProvider = new GoogleAuthProvider();

// Admin Google provider (includes Gmail send permission for sending personalized customer emails)
export const googleAdminProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => googleAdminProvider.addScope(scope));

// In-memory cache for the Admin's Gmail OAuth access token (never stored in localStorage/sessionStorage)
let isSigningIn = false;
let cachedGmailAccessToken: string | null = null;

onAuthStateChanged(auth, (user: User | null) => {
  if (!user && !isSigningIn) {
    cachedGmailAccessToken = null;
  }
});

export const AUTHORIZED_ADMIN_EMAILS = [
  'akshatpopat9311@gmail.com',
  'support.obsidian@gmail.com',
];

export const signInCustomerWithGoogle = async (): Promise<User | null> => {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const signedInEmail = result.user.email?.toLowerCase().trim() || '';
    if (
      credential?.accessToken &&
      AUTHORIZED_ADMIN_EMAILS.includes(signedInEmail)
    ) {
      cachedGmailAccessToken = credential.accessToken;
    }
    return result.user;
  } finally {
    isSigningIn = false;
  }
};

export const signInAdminWithGmailAccess = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    SCOPES.forEach((scope) => provider.addScope(scope));
    const currentEmail = auth.currentUser?.email?.toLowerCase().trim() || '';
    if (currentEmail && AUTHORIZED_ADMIN_EMAILS.includes(currentEmail)) {
      provider.setCustomParameters({
        login_hint: currentEmail,
        prompt: 'consent',
      });
    } else {
      provider.setCustomParameters({
        prompt: 'consent select_account',
      });
    }
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error(
        'Gmail permission was not granted during sign-in. Please approve the Gmail send permission on the Google consent screen.'
      );
    }
    cachedGmailAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedGmailAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getGmailAccessToken = (): string | null => {
  return cachedGmailAccessToken;
};

export const clearGmailAccessToken = (): void => {
  cachedGmailAccessToken = null;
};

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'collections', 'connection_probe'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
