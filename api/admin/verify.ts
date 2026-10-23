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

function verifyAdminSessionToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };
    const [encoded, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    if (signature !== expectedSig) return { valid: false };
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (Date.now() > decoded.expiresAt) return { valid: false };
    if (!isAuthorizedAdminEmail(decoded.email)) {
      return { valid: false };
    }
    return { valid: true, email: decoded.email, uid: decoded.uid };
  } catch {
    return { valid: false };
  }
}

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const authHeader = req.headers?.authorization;
  const bodyToken = req.body?.token;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : typeof bodyToken === 'string'
      ? bodyToken
      : '';

  const result = verifyAdminSessionToken(token);
  if (!result.valid) {
    res.status(401).json({ authorized: false });
    return;
  }

  res.status(200).json({
    authorized: true,
    email: result.email,
    uid: result.uid,
  });
}
