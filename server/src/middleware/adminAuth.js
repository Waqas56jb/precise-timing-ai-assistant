export function getAdminSecret() {
  return (process.env.ADMIN_SECRET || '').trim();
}

function bearerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return '';
}

export function requireAdmin(req, res, next) {
  const secret = getAdminSecret();
  if (!secret) {
    return res.status(503).json({ error: 'Admin is not configured (ADMIN_SECRET missing)' });
  }
  if (bearerToken(req) !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/** Admin panel or Vercel Cron (Authorization: Bearer CRON_SECRET). */
export function requireAdminOrCron(req, res, next) {
  const admin = getAdminSecret();
  const cron = (process.env.CRON_SECRET || '').trim();
  const token = bearerToken(req);
  if (admin && token === admin) return next();
  if (cron && token === cron) return next();
  if (req.headers['x-vercel-cron'] === '1' && (admin || cron)) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}
