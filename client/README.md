# Precise Timing — Website Chat Widget

Embeddable React chat widget (mobile-style UI) that talks to `server/` APIs only.

## Development

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 — widget appears bottom-right.

Ensure `server` is running on port 3001.

## Build embed.js

```bash
npm run build
```

Output: `client/dist/embed.js`

## Install on client website (footer embed)

Paste **before closing `</body>`** or inside **footer**:

```html
<script
  src="https://YOUR-CLIENT-DOMAIN/dist/embed.js"
  data-api-url="https://YOUR-SERVER-API.com"
  defer
></script>
```

Example in footer:

```html
<footer>
  © Precise Timing Transports
  <script
    src="https://your-cdn.com/embed.js"
    data-api-url="https://api.yourdomain.com"
    defer
  ></script>
</footer>
```

Widget auto-appears: **bottom-right chat button** → click → mobile-style panel opens.

## Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-api-url` | `http://localhost:3001` | Backend base URL |
| `data-auto-open` | `false` | Set `true` to open chat on load |
| `data-position` | `bottom-right` | (reserved) |

## Test production build locally

```bash
npm run build
npm run preview
```

Open `/embed-test.html` — uses real `embed.js` like client site.
