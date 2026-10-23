/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Security Rules Verification Suite for Shingaar Dresses
 * Verifies that all Dirty Dozen attack payloads return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Collection Write',
    collection: 'collections',
    docId: 'item_1',
    operation: 'create',
    auth: null,
    payload: { title: 'Hacked Dress' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-Admin Collection Write',
    collection: 'collections',
    docId: 'item_1',
    operation: 'create',
    auth: { uid: 'regular_user_1', email: 'visitor@example.com', email_verified: true },
    payload: { title: 'Unauthorized Dress' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Collection',
    collection: 'collections',
    docId: 'item_1',
    operation: 'create',
    auth: { uid: 'admin_1', email: 'support.obsidian@gmail.com', email_verified: true },
    payload: { title: 'Valid Title', isSuperFeatured: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'ID Poisoning Attack',
    collection: 'collections',
    docId: 'invalid id with spaces!',
    operation: 'create',
    auth: { uid: 'admin_1', email: 'support.obsidian@gmail.com', email_verified: true },
    payload: { title: 'Valid Title' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Timestamp Forgery on Offer',
    collection: 'offers',
    docId: 'offer_1',
    operation: 'create',
    auth: { uid: 'admin_1', email: 'support.obsidian@gmail.com', email_verified: true },
    payload: { title: 'Fake Timestamp Offer', createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immutable Field Mutation on Collection',
    collection: 'collections',
    docId: 'item_1',
    operation: 'update',
    auth: { uid: 'admin_1', email: 'support.obsidian@gmail.com', email_verified: true },
    payload: { authorUid: 'different_uid' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'PII Leak (Horizontal Privilege Escalation)',
    collection: 'users',
    docId: 'user_B',
    operation: 'get',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Unauthorized User Directory Scraping',
    collection: 'users',
    docId: '*',
    operation: 'list',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Spoofed Unverified Email Write',
    collection: 'users',
    docId: 'user_A',
    operation: 'create',
    auth: { uid: 'user_A', email: 'support.obsidian@gmail.com', email_verified: false },
    payload: { uid: 'user_A', displayName: 'Spoofer', email: 'support.obsidian@gmail.com', photoURL: '' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Self-Assigned Admin Escalation in User Profile',
    collection: 'users',
    docId: 'user_A',
    operation: 'update',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: { role: 'admin', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Identity Spoofing on Inquiry',
    collection: 'inquiries',
    docId: 'inq_1',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: { authorUid: 'user_B', name: 'Spoofed' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Value Poisoning / Oversized Payload',
    collection: 'inquiries',
    docId: 'inq_1',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: { authorUid: 'user_A', name: true, message: 'x'.repeat(2000) },
    expectedResult: 'PERMISSION_DENIED',
  },
];
