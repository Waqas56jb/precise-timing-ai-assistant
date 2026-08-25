# Website — Vercel

## Project settings

| Setting | Value |
|--------|--------|
| **Root Directory** | `website` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

## SPA refreshes (no 404)

`vercel.json` rewrites every path to `/index.html`, so refreshing `/blog`, `/moving`, etc. always shows the same React page.

## Chat widget → live API

`website/.env.production` sets:

```env
VITE_CHAT_API_URL=https://precise-timing-ai-assistant-server.vercel.app
```

The floating widget in the bottom-right uses that URL in production.

## Live URLs

| App | URL |
|-----|-----|
| Website | https://precise-timing-ai-assistant-website.vercel.app/ |
| Server | https://precise-timing-ai-assistant-server.vercel.app/ |
| Client preview | https://precise-timing-ai-assistant-client.vercel.app/ |
