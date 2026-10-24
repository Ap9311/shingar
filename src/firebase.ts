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
import { getFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

// Your web app's Firebase configuration for Shingar Dresses
export const firebaseConfig = {
  apiKey: "AIzaSyDMcrNUsM5sYr38C8GED6F62ogLOdlWc7E",
  authDomain: "shingar-dresses.firebaseapp.com",
  databaseURL: "https://shingar-dresses-default-rtdb.firebaseio.com",
  projectId: "shingar-dresses",
  storageBucket: "shingar-dresses.firebasestorage.app",
  messagingSenderId: "972086210279",
  appId: "1:972086210279:web:5ec9706083bae6a089bc42",
  measurementId: "G-MS68TWKHEP",
  firestoreDatabaseId: "shingar"
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

export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GMAIL_TOKEN_STORAGE_KEY = 'shingar_real_gmail_oauth_token_v3';

export function isValidGoogleAccessToken(
  token: string | null | undefined
): token is string {
  return Boolean(
    token &&
      typeof token === 'string' &&
      token.trim().length > 20 &&
      (token.startsWith('ya29.') || token.length > 30) &&
      !token.startsWith('shingar_gmail_cookie_')
  );
}

function setBrowserCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {}
}

function getBrowserCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  } catch {
    return null;
  }
}

function removeBrowserCookie(name: string): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  } catch {}
}

export function getGmailAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const candidate =
    localStorage.getItem(GMAIL_TOKEN_STORAGE_KEY) ||
    getBrowserCookie(GMAIL_TOKEN_STORAGE_KEY);
  return isValidGoogleAccessToken(candidate) ? candidate : null;
}

export function setGmailAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (isValidGoogleAccessToken(token)) {
    localStorage.setItem(GMAIL_TOKEN_STORAGE_KEY, token);
    setBrowserCookie(GMAIL_TOKEN_STORAGE_KEY, token, 365);
  } else if (token === null) {
    localStorage.removeItem(GMAIL_TOKEN_STORAGE_KEY);
    removeBrowserCookie(GMAIL_TOKEN_STORAGE_KEY);
  }
}

export function clearGmailAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GMAIL_TOKEN_STORAGE_KEY);
  removeBrowserCookie(GMAIL_TOKEN_STORAGE_KEY);
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
    const accessToken = credential?.accessToken || null;
    if (isValidGoogleAccessToken(accessToken)) {
      setGmailAccessToken(accessToken);
    }
    return {
      user: result.user,
      accessToken,
    };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code || '';
    if (isIgnorablePopupError(code)) {
      return { user: null, accessToken: null };
    }
    throw error;
  }
}

export async function signInCustomerWithGoogle(): Promise<{
  user: User | null;
  accessToken: string | null;
}> {
  const provider = new GoogleAuthProvider();
  provider.addScope(GMAIL_SEND_SCOPE);
  provider.setCustomParameters({
    prompt: 'consent select_account',
  });
  return executeGooglePopupSignIn(provider);
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

  return executeGooglePopupSignIn(adminProvider);
}
