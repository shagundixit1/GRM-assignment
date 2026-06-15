# Mini CRM — AI-Powered Marketing Automation

A full-stack TypeScript mini CRM with AI-generated messages, event-driven architecture, and async channel simulation.

## Architecture

```
mini-crm/
├── crm-backend/       → Express + MongoDB + OpenAI (port 4000)
├── channel-service/   → Message delivery simulator (port 5000)
└── frontend/          → Next.js dashboard (port 3000)
```

**Flow:**
```
Frontend → CRM Backend → AI Service (OpenAI)
                       → Channel Service (async simulate)
                       ← Callback (delivered/opened/clicked)
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) or MongoDB Atlas URI
- OpenAI API key (optional — fallback messages used without it)

## Quick Start

### 1. Clone and install

```bash
cd mini-crm
npm install          # installs concurrently
npm run install:all  # installs all 3 services
```

### 2. Configure environment

```bash
cp crm-backend/.env.example crm-backend/.env
# Edit crm-backend/.env:
#   MONGODB_URI=mongodb://localhost:27017/mini-crm
#   OPENAI_API_KEY=sk-...  (optional)

cp channel-service/.env.example channel-service/.env
cp frontend/.env.example frontend/.env.local
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- 8 sample users (some inactive, some with carts)
- 8 orders (4 abandoned carts, 4 completed)
- Sample events

### 4. Start all services

```bash
npm run dev
```

This starts all three services concurrently:
- **CRM Backend** → http://localhost:4000
- **Channel Service** → http://localhost:5000
- **Frontend** → http://localhost:3000

## Using the Dashboard

Open **http://localhost:3000** in your browser.

### Campaign Types

| Campaign | What it does |
|----------|-------------|
| 🛒 Abandoned Cart | Finds users with `status: 'cart'` orders, generates AI recovery message |
| 😴 Inactive Users | Finds users inactive 30+ days, sends AI win-back message |
| 🎯 Recommendations | Finds users with orders, recommends products by category |

### Message Flow

1. Click **Launch Campaign** on dashboard
2. Backend detects targets from MongoDB
3. AI service generates personalized message per user
4. Message queued in Communication model
5. Sent to channel service (`POST /send`)
6. Channel service simulates async delivery:
   - **80%** delivered, **20%** failed
   - **50%** of delivered → opened
   - **20%** of opened → clicked
7. Callbacks fire to `POST /api/callback`
8. Stats update in real-time (auto-refresh every 8s)

### Without OpenAI

If `OPENAI_API_KEY` is not set or is the placeholder value, the system uses built-in fallback messages. Everything else works identically.

## API Reference

### CRM Backend (port 4000)

```
GET    /api/stats                          → Dashboard stats
GET    /api/campaigns                      → All campaigns
GET    /api/campaigns/:id                  → Campaign + communications
POST   /api/campaigns/trigger/abandoned-cart
POST   /api/campaigns/trigger/inactive-users    { days: 30 }
POST   /api/campaigns/trigger/recommendations
POST   /api/callback                       → Channel service callbacks
```

### Channel Service (port 5000)

```
POST   /send    { messageId, userId, channel, to, message, callbackUrl }
GET    /health
```

## Project Structure

```
crm-backend/src/
├── config/database.ts        → MongoDB connection
├── models/
│   ├── User.ts
│   ├── Order.ts
│   ├── Event.ts
│   ├── Campaign.ts
│   └── Communication.ts
├── routes/
│   ├── campaigns.ts          → Campaign CRUD + triggers
│   ├── callback.ts           → Channel service callbacks
│   ├── users.ts
│   └── stats.ts
├── services/
│   ├── aiService.ts          → OpenAI integration + fallbacks
│   ├── campaignService.ts    → Campaign logic (all 3 types)
│   └── channelClient.ts      → HTTP client for channel service
├── seed.ts                   → Sample data
└── index.ts

channel-service/src/
└── index.ts                  → Delivery simulator with callbacks

frontend/src/
├── app/
│   ├── page.tsx              → Dashboard
│   ├── campaigns/page.tsx    → Campaign list
│   └── campaigns/[id]/page.tsx → Campaign detail
├── components/
│   ├── Sidebar.tsx
│   ├── CampaignTriggerCard.tsx
│   ├── CampaignTable.tsx
│   ├── StatusBadge.tsx
│   └── Toast.tsx
├── lib/api.ts                → API client
└── types/index.ts
```

## Troubleshooting

**MongoDB connection fails:**
```bash
# Start MongoDB locally
mongod --dbpath /data/db
# Or use Docker:
docker run -d -p 27017:27017 mongo
```

**Port already in use:**
Edit `.env` files to change ports and update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

**Callbacks not firing:**
Make sure `CRM_CALLBACK_URL` in `crm-backend/.env` points to where the backend is accessible from the channel service (both localhost in dev).
