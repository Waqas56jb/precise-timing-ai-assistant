/**
 * Shared secret check for inbound webhooks / email relays (Zapier, Make, partner hooks).
 * Header: X-Webhook-Secret  OR  Authorization: Bearer <secret>
 */
export function requireWebhookSecret(secretEnvKeys) {
  const keys = Array.isArray(secretEnvKeys) ? secretEnvKeys : [secretEnvKeys];

  return (req, res, next) => {
    const configured = keys
      .map((k) => process.env[k])
      .find((v) => typeof v === 'string' && v.trim().length > 0);

    // Dev-friendly: if no secret configured, allow but warn once per process
    if (!configured) {
      if (!requireWebhookSecret._warned) {
        console.warn(
          `[inbound] No webhook secret set (${keys.join(' / ')}). Accepting requests without auth.`
        );
        requireWebhookSecret._warned = true;
      }
      return next();
    }

    const headerSecret =
      req.get('x-webhook-secret') ||
      (req.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();

    if (!headerSecret || headerSecret !== configured) {
      return res.status(401).json({ error: 'Unauthorized webhook' });
    }

    return next();
  };
}

requireWebhookSecret._warned = false;
