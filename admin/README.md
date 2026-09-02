# Precise Timing Admin

Dashboard for website, chatbot, Yelp, and Thumbtack leads.

## Local

```bash
cd admin
npm install
npm run dev
```

Opens at http://localhost:5174 and proxies `/api` to the server on port 3001.

Sign in with `admin@gmail.com` and the password in `ADMIN_PASSWORD` (`server/.env`).

## Vercel

| Setting | Value |
|--------|--------|
| Root Directory | `admin` |
| Framework | Vite |
| Env | `VITE_API_URL=https://precise-timing-ai-assistant-production.up.railway.app` |

Also set `ADMIN_SECRET` on the **server** project (same value you type at login).
