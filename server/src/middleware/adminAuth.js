import crypto from 'crypto';

export function getAdminSecret() {
  return (process.env.ADMIN_SECRET || '').trim();
}

export function getTokenSecret() {
  return getAdminSecret() || process.env.EMAIL_APP_PASSWORD || 'precise-timing-admin';
}

function bearerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return '';
}

export function signAdminToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.full_name || 'Admin',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', getTokenSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token) {
  if (!token || !String(token).includes('.')) return null;
  const [payload, sig] = String(token).split('.');
  const expected = crypto.createHmac('sha256', getTokenSecret()).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data?.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function isValidAdminBearer(token) {
  if (!token) return false;
  if (verifyAdminToken(token)) return true;
  const secret = getAdminSecret();
  if (secret && token === secret) return true;
  const cron = (process.env.CRON_SECRET || '').trim();
  if (cron && token === cron) return true;
  return false;
}

export function requireAdmin(req, res, next) {
  const token = bearerToken(req);
  if (!isValidAdminBearer(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.admin = verifyAdminToken(token) || { email: 'admin' };
  next();
}

/** Admin panel or Vercel Cron (Authorization: Bearer CRON_SECRET). */
export function requireAdminOrCron(req, res, next) {
  const token = bearerToken(req);
  if (isValidAdminBearer(token)) return next();
  const cron = (process.env.CRON_SECRET || '').trim();
  if (req.headers['x-vercel-cron'] === '1' && (getAdminSecret() || cron)) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}
