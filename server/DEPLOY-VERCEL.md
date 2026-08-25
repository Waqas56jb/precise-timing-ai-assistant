# Deploy server to Vercel

This Express API is adapted for Vercel serverless via `api/index.js` + `vercel.json`.

## 1. Project settings

In the Vercel project for the **backend**:

| Setting | Value |
|--------|--------|
| **Root Directory** | `server` |
| Framework Preset | Other |
| Build Command | leave empty / default |
| Output Directory | leave empty |
| Install Command | `npm install` |
| Node.js | 18.x or 20.x |

> If Root Directory is the repo root (not `server`), the function will crash.

## 2. Environment variables

Copy from `server/.env` into Vercel → Settings → Environment Variables (Production + Preview):

**Required for chat**
- `OPENAI_API_KEY`
- `DATABASE_URL` or `DATABASE_POOLER_URL` (prefer the Supabase **pooler** URL on port `6543`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**QuickBooks (optional until you use QB)**
- `QB_CLIENT_ID`
- `QB_CLIENT_SECRET`
- `QB_REDIRECT_URI` → `https://YOUR-VERCEL-DOMAIN/api/quickbooks/callback`
- `QB_ENVIRONMENT` → `sandbox` or `production`

**Lead notification emails (required for contact form + chatbot lead emails)**
- `EMAIL_USER` → `precisetimingtransports@gmail.com`
- `EMAIL_APP_PASSWORD` → the Gmail App Password (16 chars, no spaces)
- `EMAIL_NOTIFY_TO` → where notifications land (defaults to `EMAIL_USER`)

**Inbound leads (optional)**
- `LEAD_INGEST_SECRET` / `YELP_WEBHOOK_SECRET` / `THUMBTACK_WEBHOOK_SECRET`

Do **not** set `EMAIL_WORKER_ENABLED=true` on Vercel — IMAP polling needs a always-on host (VPS), not serverless.

## 3. Redeploy

After pushing these files and setting env vars, Redeploy from the Vercel dashboard.

## 4. Smoke test

Open:

```text
https://YOUR-VERCEL-DOMAIN/health
```

Expected:

```json
{ "ok": true, "service": "precise-timing-server" }
```

Then point the website widget at this URL:

```env
# website/.env
VITE_CHAT_API_URL=https://YOUR-VERCEL-DOMAIN
```

Rebuild the website after changing that.

## Why you saw `FUNCTION_INVOCATION_FAILED`

1. Express was calling `app.listen()` (not valid on Vercel serverless).
2. Missing env vars triggered `process.exit(1)` at boot → instant 500.
3. Root Directory may not have been set to `server`.

Those are fixed in this folder. After env vars + Root Directory + redeploy, `/health` should work.
