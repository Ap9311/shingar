import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'shingar';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shingar123';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'shingaar-atelier-hmac-secret-2026';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { username, password, uid } = req.body || {};
  const cleanUser = typeof username === 'string' ? username.trim() : '';
  const cleanPass = typeof password === 'string' ? password : '';

  if (cleanUser === ADMIN_USERNAME && cleanPass === ADMIN_PASSWORD) {
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 1000 * 60 * 60 * 12;
    const payload = JSON.stringify({ username: cleanUser, uid: uid || '', issuedAt, expiresAt });
    const encoded = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');

    res.status(200).json({
      authenticated: true,
      username: cleanUser,
      token: `${encoded}.${signature}`,
      verifiedAt: new Date().toISOString(),
    });
    return;
  }

  res.status(401).json({
    authenticated: false,
    error: 'Invalid atelier administrator username or password.',
  });
}
