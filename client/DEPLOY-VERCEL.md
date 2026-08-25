# Client (widget preview) — Vercel

## Project settings

| Setting | Value |
|--------|--------|
| **Root Directory** | `client` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

## What this deploy is

A **center-mode preview** of the chat widget at:

https://precise-timing-ai-assistant-client.vercel.app/

It talks to:

https://precise-timing-ai-assistant-server.vercel.app/

## Embed bundle for the website

```bash
cd client
npm run build:embed
```

This writes `embed.js` into `website/public/embed.js` (used by the marketing site).

`vercel.json` rewrites all routes → `index.html` so refreshes never 404.
