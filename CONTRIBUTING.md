# FEDGE 2.O — Developer Guide

## Project Setup

### 1. Clone & Install

```bash
git clone https://github.com/eclatuniverse/tradestreet.git
cd tradestreet
pnpm install
```

### 2. Generate JWT Keys

```bash
mkdir -p keys
openssl genpkey -algorithm RSA -out keys/private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in keys/private.pem -out keys/public.pem
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env — minimum required:
# - DATABASE_URL
# - REDIS_URL
# - ANTHROPIC_API_KEY
# - ALPACA_API_KEY + ALPACA_API_SECRET
# - JWT_PRIVATE_KEY_PATH=./keys/private.pem
# - JWT_PUBLIC_KEY_PATH=./keys/public.pem
```

### 4. Start Infrastructure

```bash
docker-compose up -d postgres redis
```

### 5. Run Database Migrations

```bash
pnpm db:migrate
```

### 6. Start API

```bash
pnpm --filter @tradestreet/api dev
# API running at http://localhost:3000
# Health check: GET http://localhost:3000/health
```

### 7. Start Mobile App

```bash
pnpm --filter @tradestreet/mobile start
# Press i for iOS simulator
# Press a for Android emulator
# Scan QR for Expo Go on physical device
```

---

## Architecture Decisions

### Why Fastify over Express?
Fastify is ~2x faster, has built-in schema validation, and first-class TypeScript support. The plugin system maps cleanly to our service dependencies.

### Why Zustand over Redux?
Redux is overkill for a mobile app this size. Zustand gives us typed, slice-based state without boilerplate. React Query handles server state; Zustand handles UI/client state.

### Why Alpaca over Robinhood/others?
Alpaca has a developer-first REST + WebSocket API, commission-free trading, OAuth support, and paper trading for dev. Other brokerages (Robinhood, Schwab) don't offer public APIs for third-party apps.

### Why Redis sorted sets for leaderboards?
ZADD/ZRANGEBYSCORE on Redis sorted sets gives O(log N) updates and O(log N + M) range queries — perfect for real-time leaderboards. Postgres would need a full table scan for weekly rankings.

### Why claude-sonnet-4 for FEDGE Brain?
Best balance of intelligence, speed, and cost for our use case. claude-opus is too slow for real-time signal commentary; claude-haiku lacks the reasoning depth for portfolio analysis.

---

## Signal Generation Pipeline

```
Every 4 hours (market hours):
  For each ticker in WATCHLIST:
    1. Fetch 4H OHLCV bars from Alpaca
    2. Send to FEDGE Brain (Claude) with price data
    3. Parse signal JSON response
    4. Store in PostgreSQL + Redis (4h TTL)
    5. Push to connected users via WS pub/sub
    6. Rate limit: 1.2s between tickers
```

Run manually:
```bash
pnpm --filter @tradestreet/api tsx src/workers/signalWorker.ts
```

Schedule via cron (add to crontab):
```
0 9,13,16,20 * * 1-5  cd /app && pnpm --filter @tradestreet/api tsx src/workers/signalWorker.ts
```

---

## XP & Level Formula

```
Level = floor(sqrt(xp / 100)) + 1
XP to next level = level² × 100

Level 1 → 2:  100 XP
Level 2 → 3:  400 XP
Level 5 → 6:  2500 XP
Level 10 → 11: 10000 XP
```

XP Sources:
| Action | XP |
|---|---|
| Daily login (streak) | +10 |
| Mission completed (easy) | +50 |
| Mission completed (medium) | +100 |
| Mission completed (hard) | +200 |
| Trade executed | +10 |
| Signal followed | +25 |
| First profitable trade | +500 |
| Streak milestone (7, 14, 30 days) | +100/+250/+500 |

---

## Deployment

### API (Production)

```bash
# Build Docker image
docker build -t eclatuniverse/fedge-api:latest ./apps/api

# Push to registry
docker push eclatuniverse/fedge-api:latest

# Deploy (example with docker-compose)
docker-compose -f docker-compose.prod.yml up -d
```

### Mobile (EAS Build)

```bash
cd apps/mobile

# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Both
eas build --platform all --profile production
```

### Environment Variables for Production

All secrets must be set in your deployment environment (not in .env files):
- `ANTHROPIC_API_KEY`
- `ALPACA_API_KEY` + `ALPACA_API_SECRET`
- `ENCRYPTION_KEY` + `ENCRYPTION_IV`
- `JWT_PRIVATE_KEY_PATH` / actual key content

---

## Brand Guidelines

### Colors
- Primary Orange: `#FF6200`
- Dark BG: `#080808`, `#0e0e0e`, `#141414`
- Text: `#e8e8e8`, `#999999`, `#555555`
- Green (profit): `#22c55e`
- Red (loss): `#ef4444`

### Fonts
- Display/Code: IBM Plex Mono (weights: 400, 500, 600, 700)
- Body/UI: IBM Plex Sans (weights: 400, 500, 600, 700)

### Voice
- Direct, confident, NYC street-smart
- No fluff, no disclaimers, no "as an AI"
- Speaks in present tense
- Credits Rafael Fellito Rodriguez Jr. as creator
- Never reveals Claude/Anthropic under the hood

---

© 2025 Eclat Universe — Rafael Fellito Rodriguez Jr. All rights reserved.
