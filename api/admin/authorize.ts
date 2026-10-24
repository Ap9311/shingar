import crypto from 'crypto';

const AUTHORIZED_ADMIN_EMAILS = [
  'akshatpopat9311@gmail.com',
  'support.obsidian@gmail.com',
];

function isAuthorizedAdminEmail(email: string): boolean {
  return AUTHORIZED_ADMIN_EMAILS.includes(String(email || '').toLowerCase().trim());
}

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || 'shingar-dresses-admin-hmac-secret-2026';
const ALLOWED_FIREBASE_PROJECTS = [
  'gen-lang-client-0355457647',
  'shingar-dresses',
  'obsidian-507319',
];

function verifyFirebaseIdTokenPayload(idToken: string) {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < nowSec - 60) return null;
    const aud = String(payload.aud || '');
    const iss = String(payload.iss || '');
    const validProject = ALLOWED_FIREBASE_PROJECTS.some(
      (proj) => aud === proj && iss.includes(proj)
    );
    if (!validProject) {
      return null;
    }

    const email = String(payload.email || '').toLowerCase();
    const uid = String(payload.user_id || payload.sub || '');
    const emailVerified = Boolean(payload.email_verified);

    if (!uid || !email || !emailVerified) return null;
    return { uid, email, emailVerified };
  } catch {
    return null;
  }
}

function createAdminSessionToken(email: string, uid: string): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 1000 * 60 * 60 * 12;
  const payload = JSON.stringify({ email: email.toLowerCase(), uid, issuedAt, expiresAt });
  const encoded = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const authHeader = req.headers?.authorization;
  const idToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : typeof req.body?.idToken === 'string'
      ? req.body.idToken
      : '';

  const verifiedUser = verifyFirebaseIdTokenPayload(idToken);
  if (!verifiedUser) {
    res.status(401).json({
      authorized: false,
      error: 'Valid Firebase Authentication token required.',
    });
    return;
  }

  if (!isAuthorizedAdminEmail(verifiedUser.email)) {
    res.status(403).json({
      authorized: false,
      email: verifiedUser.email,
      error: `Access denied. Only ${AUTHORIZED_ADMIN_EMAILS.join(' or ')} are authorised to access the Shingar Dresses Admin Panel.`,
    });
    return;
  }

  const sessionToken = createAdminSessionToken(verifiedUser.email, verifiedUser.uid);
  res.status(200).json({
    authorized: true,
    email: verifiedUser.email,
    uid: verifiedUser.uid,
    token: sessionToken,
    verifiedAt: new Date().toISOString(),
  });
}
