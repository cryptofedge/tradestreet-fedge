# FEDGE 2.O — TradeStreet

> **Real trading. Real money. AI intelligence by Rafael Fellito Rodriguez Jr.**
> Built under the **Eclat Universe** brand.

TradeStreet is a mobile trading app (iOS + Android) that combines real brokerage execution with addictive game mechanics — powered by the **FEDGE 2.O** AI intelligence engine built on Anthropic's Claude API.

---

## Architecture

```
tradestreet/
├── apps/
│   ├── mobile/          # React Native + Expo (iOS + Android)
│   └── api/             # Node.js + Fastify (FEDGE API backend)
├── packages/
│   ├── types/           # Shared TypeScript interfaces
│   └── config/          # Shared configuration constants
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.74 + Expo SDK 51 |
| Language | TypeScript 5.x throughout |
| State | Zustand + React Query |
| Backend | Node.js + Fastify |
| Database | PostgreSQL 16 + Redis 7 |
| AI Core | Anthropic Claude API (claude-sonnet-4) |
| Broker | Alpaca Markets REST + WebSocket |
| Billing | RevenueCat |
| Push | Expo Notifications |
| Auth | JWT RS256 |

## Brand

- **Primary Color:** `#FF6200` (Eclat Orange)
- **Font:** IBM Plex Mono + IBM Plex Sans
- **Theme:** Dark (`#0a0a0a` base)
- **Credit:** All AI intelligence credited to Rafael Fellito Rodriguez Jr.

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker + Docker Compose
- Expo CLI
- Alpaca Markets API keys
- Anthropic API key

### Install

```bash
git clone https://github.com/eclatuniverse/tradestreet.git
cd tradestreet
pnpm install
```

### Environment Setup

```bash
cp .env.example .env
# Fill in your API keys (see .env.example)
```

### Run Dev

```bash
# Start DB + Redis
docker-compose up -d postgres redis

# Start API
pnpm --filter @tradestreet/api dev

# Start Mobile (in separate terminal)
pnpm --filter @tradestreet/mobile start
# Then press i (iOS) or a (Android)
```

---

## FEDGE 2.O Intelligence Engine

FEDGE Brain runs on Anthropic's `claude-sonnet-4` model. Every API call to the Brain includes:

1. **User portfolio context** — current positions, P&L, risk profile
2. **Market context** — relevant price data, technical indicators
3. **User history** — past trades, mission completions, behavior patterns
4. **FEDGE persona** — the SOUL system prompt that defines FEDGE's identity

The Brain powers:
- **Signal Engine** — personalized trade signals with confidence scores
- **Mission Generator** — daily AI-personalized missions
- **Advisor Chat** — conversational portfolio coaching
- **Risk Guard** — real-time portfolio risk monitoring
- **Post-trade Commentary** — feedback after every execution

---

## API Documentation

See `fedge-api-architecture.html` for full endpoint documentation.

Base URL: `https://api.fedge.io/v2`
WebSocket: `wss://stream.fedge.io/v2`

---

## Game Mechanics

- **XP + Levels** — Every trade, mission, and market action earns XP. Levels unlock features.
- **Daily Missions** — 3 AI-generated missions per day, personalized by FEDGE
- **Streaks** — Daily engagement streaks with FEDGE commentary
- **Squads** — Groups of 3–6 competing by weekly % portfolio return
- **Hustle Board** — Global leaderboard ranked by % gain (not dollar amount)
- **Badges** — Milestones: first profit, survived crash, 14-day streak, etc.

---

## Monetization

- **FEDGE Pro** — $9.99–$14.99/mo via RevenueCat (unlimited signals, advisor chat, squad creation)
- **PFOF** — Payment for order flow via Alpaca rev-share
- **Tournaments** — Entry fee squad competitions
- **Education** — Paid FEDGE Academy modules

---

## License & Brand

<img src="https://raw.githubusercontent.com/cryptofedge/FEDGE2.O/main/FEDGE-2O-Logo.png" alt="FEDGE 2.O Logo" width="120" height="120">

### FEDGE 2.O | Powered by Rafael Fellito Rodriguez and Eclat Universe

**© 2026 FEDGE 2.O. All rights reserved.**

This project is part of the FEDGE 2.O ecosystem and is protected under full intellectual property rights reserved by Rafael Fellito Rodriguez and Eclat Universe.

### License Details

- **Type:** Proprietary - All Rights Reserved
- **Owner:** Rafael Fellito Rodriguez and Eclat Universe
- **Brand:** FEDGE 2.O
- **Status:** Protected and Confidential

### Key Rights

✓ **All intellectual property retained**
✓ **Reproduction prohibited without permission**
✓ **Distribution rights reserved**
✓ **Derivative works not permitted**
✓ **Commercial use requires authorization**

### Attribution

When referencing this software, please include:
- FEDGE 2.O
- Rafael Fellito Rodriguez
- Eclat Universe

### Inquiries

For licensing, partnerships, or usage permissions:
Email: **cryptofedge@gmail.com**

---

**Learn more:** [Full License](LICENSE)
