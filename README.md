<p align="center">
  <img src="https://img.shields.io/badge/Precise%20Timing-AI%20Assistant-0f172a?style=for-the-badge&labelColor=0ea5e9" alt="Precise Timing AI Assistant" />
</p>

<h1 align="center">🚚 Precise Timing AI Assistant</h1>

<p align="center">
  <strong>GPT-powered customer assistant</strong> for Precise Timing Transports<br/>
  Quotes · Bookings · Lead capture · 24/7 support — trained on your services, pricing & areas
</p>

<p align="center">
  <a href="#-features"><img src="https://img.shields.io/badge/Features-Ready-22c55e?style=flat-square" alt="Features" /></a>
  <a href="#-architecture"><img src="https://img.shields.io/badge/Stack-Node%20%7C%20React%20%7C%20Supabase%20%7C%20OpenAI-6366f1?style=flat-square" alt="Stack" /></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Setup-Local%20Dev-f59e0b?style=flat-square" alt="Setup" /></a>
  <img src="https://img.shields.io/badge/License-Private-64748b?style=flat-square" alt="License" />
</p>

---

## ✨ Overview

**Precise Timing AI Assistant** is a production-oriented monorepo for a moving & delivery business chatbot. Visitors get instant answers, guided quote collection, and booking help — while leads and estimates sync to your database (and QuickBooks when connected).

| Layer | Role | Status |
|:------|:-----|:------:|
| 🎨 **client/** | Embeddable React chat widget (center preview + float launcher) | ✅ Live |
| ⚙️ **server/** | Express API on [Railway](https://precise-timing-ai-assistant-production.up.railway.app/) | ✅ Live |
| 🗂️ **admin/** | Dashboard for website, chatbot, Yelp & Thumbtack leads | ✅ Live |
| 🌐 **website/** | Marketing site + quote form + chat widget | ✅ Live |

---

## 🌟 Features

<table>
<tr>
<td width="50%">

### 💬 Smart chat
- Concise, professional GPT replies (`gpt-4o-mini`)
- Markdown formatting (bold, bullets)
- Conversation memory + customer lead memory
- One-question-at-a-time quote flow

</td>
<td width="50%">

### 🧲 Lead & quote pipeline
- Background lead extraction (non-blocking)
- Auto upsert into Supabase/Postgres
- Rule-based estimate calculation
- Quote numbers stored per conversation

</td>
</tr>
<tr>
<td width="50%">

### 🔗 Integrations
- **QuickBooks** OAuth (sandbox → production)
- **Supabase** Postgres + service role
- GoDaddy Bookings link (configurable)
- **Thumbtack / Yelp** lead ingest (webhook + email parse)

</td>
<td width="50%">

### 🪟 Widget UX
- Luxury mobile-style UI
- Welcome screen + quick actions
- `center` mode (dev) / `float` mode (embed)
- Single-file `embed.js` for site footer

</td>
</tr>
</table>

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Website / Preview                        │
│              client/  →  embed.js widget                      │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTPS / localhost
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    server/  (Express :3001)                   │
│  /api/chat  ·  /api/leads  ·  /api/quotes  ·  /api/qb …     │
│         OpenAI · prompt builder · lead extractor              │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
                ▼                         ▼
         ┌────────────┐            ┌──────────────┐
         │  Supabase  │            │  QuickBooks  │
         │  Postgres  │            │  Accounting  │
         └────────────┘            └──────────────┘
```

### Repository layout

```text
precise-timing-ai-assistant/
├── 📁 admin/                 # React admin (leads, quotes, Gmail inbox sync)
├── 📁 client/                # React + Vite chat widget
│   ├── src/                  # Widget, API client, markdown, styles
│   ├── dist/embed.js         # Production embed bundle
│   └── index.html            # Local center-mode preview
├── 📁 server/                # Node API + integrations
│   ├── src/                  # Routes, services, config
│   ├── sql/                  # Schema migrations
│   ├── scripts/              # QB connect, migrate, seed, tests
│   └── .env.example          # Environment template
├── 📁 website/               # Public marketing site (React, blue/white)
└── 📄 README.md              # You are here
```

> Root apps: `admin/`, `client/`, `server/`, `website/`, plus `README.md`.

---

## 🛠️ Tech stack

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=black" alt="Supabase" />
  <img src="https://img.shields.io/badge/QuickBooks-2CA01C?style=for-the-badge&logo=intuit&logoColor=white" alt="QuickBooks" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
</p>

| Area | Choices |
|:-----|:--------|
| **API** | Express, Zod validation, CORS |
| **AI** | OpenAI Chat Completions (`OPENAI_MODEL`, default `gpt-4o-mini`) |
| **Data** | Supabase Postgres (`DATABASE_URL` pooler), prefixed tables `precise_timing_ai_assistant_*` |
| **Widget** | React 18, Vite library build → `client/dist/embed.js` |
| **Accounting** | Intuit QuickBooks Online OAuth 2.0 |

---

## 🚀 Quick start

### Prerequisites

- **Node.js** 18+ (recommended 20+)
- **Supabase** project (URL, anon key, service role, Postgres connection string)
- **OpenAI** API key
- *(Optional)* Intuit Developer app for QuickBooks sandbox

### 1️⃣ Server

```bash
cd server
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

Fill `server/.env`:

| Variable | Purpose |
|:---------|:--------|
| `PORT` | API port (default `3001`) |
| `OPENAI_API_KEY` | Chat + lead extraction |
| `OPENAI_MODEL` | Optional override (`gpt-4o-mini`) |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase client |
| `DATABASE_URL` | Postgres (prefer **pooler** URL) |
| `QB_*` | QuickBooks OAuth (see below) |

```bash
npm run db:migrate          # Create prefixed tables
npm run db:seed-pricing     # Seed pricing rules
npm run dev                 # http://localhost:3001
```

Health check: [http://localhost:3001/health](http://localhost:3001/health)

### 2️⃣ Admin dashboard

```bash
cd admin
npm install
npm run dev                 # http://localhost:5174
```

Sign in with `admin@gmail.com` / `admin@123!` (set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`).

Leads from the **website form**, **chatbot**, **Yelp**, and **Thumbtack** all show here. Use **Email inbox → Sync inbox now** to parse Gmail for Yelp/Thumbtack messages.

### 3️⃣ Client (widget preview)

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

Dev preview uses **`data-mode="center"`** and talks to `http://127.0.0.1:3001`.

### 4️⃣ QuickBooks (optional)

1. Create an Intuit app → add redirect URI:  
   `http://localhost:3001/api/quickbooks/callback`
2. Set `QB_CLIENT_ID`, `QB_CLIENT_SECRET`, `QB_REDIRECT_URI`, `QB_ENVIRONMENT=sandbox` in `.env`
3. Connect:

```bash
cd server
npm run qb:connect          # Browser OAuth
npm run qb:test             # Verify company API
npm run qb:refresh          # Refresh tokens
```

---

## 📡 API reference

Base URL (local): `http://127.0.0.1:3001`

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/health` | Liveness + email/imap/admin flags |
| `GET` | `/api/chat/welcome` | Welcome copy + business name |
| `POST` | `/api/chat/message` | Send message → GPT reply |
| `POST` | `/api/contact` | Website quote form (multipart + files) |
| `POST` | `/api/admin/login` | Admin login → `{ token }` |
| `GET` | `/api/leads` | List leads **(admin)** |
| `GET` | `/api/leads/stats` | Counts by source **(admin)** |
| `GET` | `/api/leads/:id` | Lead + chat transcript **(admin)** |
| `PATCH` | `/api/leads/:id` | Update status **(admin)** |
| `GET` | `/api/quotes` | List quotes **(admin)** |
| `POST` | `/api/inbound-email/poll` | Parse Gmail for Yelp/Thumbtack **(admin)** |
| `GET` | `/api/business-settings` | Full settings |
| `GET` | `/api/business-settings/public` | Public settings |
| `PUT` | `/api/business-settings` | Update settings |
| `GET` | `/api/quickbooks/connect` | Start OAuth |
| `GET` | `/api/quickbooks/callback` | OAuth callback |
| `GET` | `/api/quickbooks/status` | Token status |
| `POST` | `/api/quickbooks/refresh` | Refresh tokens |
| `GET` | `/api/quickbooks/company` | Company info |
| `GET` | `/api/thumbtack/status` | Thumbtack ingest status |
| `POST` | `/api/thumbtack/webhook` | Thumbtack/Zapier JSON → lead |
| `POST` | `/api/thumbtack/email` | Thumbtack lead email → lead |
| `GET` | `/api/yelp/status` | Yelp ingest status |
| `POST` | `/api/yelp/webhook` | Yelp/Zapier JSON → lead |
| `POST` | `/api/yelp/email` | Yelp RAQ email → lead |
| `GET` | `/api/yelp/business/:id` | Optional Fusion business lookup |
| `GET` | `/api/yelp/search` | Optional Fusion search |

Lead list filter: `GET /api/leads?source=thumbtack` or `?source=yelp`.

Webhook auth header: `X-Webhook-Secret: <LEAD_INGEST_SECRET or provider secret>`.

### Chat message body

```json
{
  "message": "I need a quote for a 2 bedroom move.",
  "conversationId": null,
  "visitorId": "v_optional_local_id"
}
```

---

## 🧩 Embed on your website

Build the widget:

```bash
cd client
npm run build
```

Production snippet (float launcher, bottom-right):

```html
<script
  src="https://YOUR_CDN_OR_HOST/embed.js"
  data-api-url="https://YOUR_API_HOST"
  data-mode="float"
  defer
></script>
```

| Attribute | Values | Notes |
|:----------|:-------|:------|
| `data-api-url` | Absolute API origin | Required in production |
| `data-mode` | `float` \| `center` | `float` for live sites |
| `data-auto-open` | `true` \| `false` | Optional auto-open |

---

## 🗄️ Database

All app tables use the prefix **`precise_timing_ai_assistant_`** so they never collide with other projects on the same Supabase instance.

Migrations live in `server/sql/` and run via:

```bash
cd server
npm run db:migrate
```

Typical entities: business settings, services, FAQs, pricing rules, service areas, conversations, messages, leads, quotes, integration tokens.

---

## 📜 Useful scripts (`server/`)

| Script | What it does |
|:-------|:-------------|
| `npm run dev` | API with `--watch` |
| `npm run start` | Production start |
| `npm run db:migrate` | Apply SQL schema |
| `npm run db:seed-pricing` | Seed pricing |
| `npm run qb:connect` | QuickBooks OAuth CLI |
| `npm run qb:refresh` | Refresh QB tokens |
| `npm run qb:test` | Smoke-test QB API |
| `npm run qb:migrate-tokens` | File tokens → DB |
| `npm run chat:test` | Chat smoke test |
| `npm run lead:test` | Lead pipeline test |
| `npm run lead:ingest-test` | Thumbtack/Yelp ingest smoke test |

---

## 🧲 Thumbtack & Yelp leads

Official **Thumbtack Partner** and **Yelp Leads** APIs are partner/invite-only. This app automates leads with **code** (no Zapier required):

### Email worker (recommended)

1. Use the inbox that receives Yelp / Thumbtack notification emails  
2. Set IMAP vars in `server/.env` (Gmail → App Password)  
3. Run:

```bash
cd server
npm run email:worker      # one poll
npm run email:watch       # keep polling
```

Or set `EMAIL_WORKER_ENABLED=true` so the API server polls in the background (needs always-on host, not serverless sleep).

Manual API trigger: `POST /api/inbound-email/poll`

1. **Webhook JSON** — optional Zapier / Make → `POST /api/thumbtack/webhook` or `/api/yelp/webhook`
2. **Email parse** — `POST /api/.../email` with `{ subject, text, html }`
3. **Dedup** — same `source` + `metadata.external_id` / Message-ID
4. **Optional** — `YELP_API_KEY` (Fusion) for business search only

```bash
cd server
npm run lead:ingest-test
```

---

## 🗺️ Roadmap

- [x] Chat API + OpenAI prompt system  
- [x] Lead extraction & quote calculation  
- [x] Embeddable React widget  
- [x] QuickBooks OAuth + company API  
- [x] Supabase schema & business settings  
- [x] Thumbtack & Yelp lead ingest (webhook + email)  
- [ ] **Admin dashboard** (`admin/`) — leads, quotes, settings UI  
- [ ] GoDaddy Bookings deep integration  
- [ ] IMAP worker for auto email pickup  
- [ ] Email / SMS / WhatsApp channels  
- [ ] Vercel (or similar) production deploy  

---

## 🔐 Security notes

- Keep secrets **only** in `server/.env` — never commit them  
- Prefer Supabase **pooler** `DATABASE_URL` on restricted networks  
- Rotate any keys that were shared in chat or screenshots  
- Widget talks to your API over HTTPS in production  

---

## 🤝 Contributing / workflow

1. Work only inside `admin/`, `client/`, `server/`, or `website/`  
2. Repo root should stay **only** those four folders plus `README.md` (no root `package.json`)  
3. Railway: set **Root Directory** to `server`, start command `npm start`, and do **not** set `PORT` in Railway variables (Railway injects it)  

```bash
# Terminal A
cd server && npm run dev

# Terminal B
cd client && npm run dev
```

---

<p align="center">
  <img src="https://img.shields.io/badge/Built%20for-Precise%20Timing%20Transports-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="Built for Precise Timing Transports" />
  <br/><br/>
  <sub>Made with care · Quotes that convert · Support that never sleeps</sub>
</p>
