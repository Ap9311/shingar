# Security Specification — Shingaar Dresses

## 1. Data Invariants
1. **Collection Catalog (`/collections/{itemId}`)**: Publicly readable (`get` and `list`) so visitors can browse couture dresses without signing in. Only verified administrators (`isAdmin()`) may `create`, `update`, or `delete` documents. `authorUid` must match `request.auth.uid`, `createdAt` must equal `request.time` on creation and remain immutable on update, and `updatedAt` must equal `request.time`.
2. **Offer Posters (`/offers/{offerId}`)**: Publicly readable (`get` and `list`) so visitors can view exhibition posters and privilege codes. Only verified administrators (`isAdmin()`) may `create`, `update`, or `delete` documents. `authorUid` must match `request.auth.uid`, `createdAt` must equal `request.time` on creation and remain immutable on update, and `updatedAt` must equal `request.time`.
3. **User Directory (`/users/{userId}`)**: Contains PII (`email`, `displayName`, `photoURL`). Reading (`get`) is restricted strictly to the document owner (`request.auth.uid == userId`) or a verified administrator (`isAdmin()`). Listing (`list`) is restricted strictly to verified administrators (`isAdmin()`) or owners querying their own `uid`. Users can only `create` or `update` their own profile (`userId == request.auth.uid`) with verified email (`request.auth.token.email_verified == true`), and cannot inject privilege escalation fields.
4. **Atelier Inquiries (`/inquiries/{inquiryId}`)**: Signed-in users with verified email can `create` an inquiry where `authorUid == request.auth.uid` and `createdAt == request.time`. Only the inquiry's author (`resource.data.authorUid == request.auth.uid`) or a verified administrator (`isAdmin()`) can `get`, `list`, or `delete` inquiries.
5. **Admin Registry (`/admins/{adminUid}`)**: Stores verified administrator records. Only readable by the owner (`request.auth.uid == adminUid`) or a verified administrator (`isAdmin()`). Creation is allowed only for the authenticated user's own UID (`request.auth.uid == adminUid`) when `request.auth.token.email_verified == true` and `username == 'shingar'` (after server-side credential verification) or by the bootstrapped admin email (`support.obsidian@gmail.com`).

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Collection Write**: Anonymous user attempts `create` on `/collections/item_1`. -> `PERMISSION_DENIED`
2. **Non-Admin Collection Write**: Standard signed-in user attempts `create` on `/collections/item_1`. -> `PERMISSION_DENIED`
3. **Shadow Field Injection on Collection**: Admin attempts `create` on `/collections/item_1` with extra field `isSuperFeatured: true`. -> `PERMISSION_DENIED`
4. **ID Poisoning Attack**: Admin attempts `create` on `/collections/invalid id with spaces!`. -> `PERMISSION_DENIED`
5. **Timestamp Forgery on Offer**: Admin attempts `create` on `/offers/offer_1` with a past client-supplied `createdAt`. -> `PERMISSION_DENIED`
6. **Immutable Field Mutation on Collection**: Admin attempts `update` on `/collections/item_1` mutating `createdAt` or `authorUid`. -> `PERMISSION_DENIED`
7. **PII Leak (Horizontal Privilege Escalation)**: Signed-in User A attempts `get` on `/users/user_B`. -> `PERMISSION_DENIED`
8. **Unauthorized User Directory Scraping**: Non-admin signed-in user attempts unconstrained `list` on `/users`. -> `PERMISSION_DENIED`
9. **Spoofed Unverified Email Write**: User with `email_verified: false` attempts `create` on `/users/user_A`. -> `PERMISSION_DENIED`
10. **Self-Assigned Admin Escalation in User Profile**: User attempts `update` on `/users/user_A` adding `role: 'admin'`. -> `PERMISSION_DENIED`
11. **Identity Spoofing on Inquiry**: User A attempts `create` on `/inquiries/inq_1` with `authorUid: 'user_B'`. -> `PERMISSION_DENIED`
12. **Value Poisoning / Oversized Payload**: User attempts `create` on `/inquiries/inq_1` with a 50,000-character `message` string or boolean `name`. -> `PERMISSION_DENIED`
