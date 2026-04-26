# TradeStreet — Master Product Roadmap
**Last updated:** April 26, 2026  
**Status:** Living document

---

## Vision

TradeStreet is the platform that takes someone from knowing nothing about trading to becoming a confident, improving trader — through learning, practice, competition, and AI coaching. Every feature serves one of four verbs: **Learn. Practice. Compete. Improve.**

---

## Feature Map

| Feature | Verb | Tier | Status |
|---|---|---|---|
| Academy (4 modules + quizzes) | Learn | Free | ✅ Shipped |
| Portfolio Sim — Phase 1 | Practice | Free | 🔨 In build |
| Portfolio Sim — Phase 2 | Practice | Free | 📋 Planned |
| Leaderboard — Phase 1 | Compete | Free | 📋 Planned |
| Leaderboard — Phase 2 | Compete | Free | 📋 Planned |
| Fedge 2.0 Alpha | Improve | Premium | 📋 Planned |
| Fedge 2.0 v1 | Improve | Premium | 📋 Planned |
| Fedge 2.0 v1.5 | Improve | Premium | 📋 Planned |
| Scenario Challenges | Practice + Learn | Free | 💡 Proposed |
| Progression System (XP + Levels) | All | Free | 💡 Proposed |
| Daily Missions | All | Free | 💡 Proposed |
| Social Feed | Compete | Free | 💡 Proposed |
| Weekly Themed Events | Compete | Free | 💡 Proposed |
| Clone a Legend | Practice + Learn | Free | 💡 Proposed |
| Achievements + Badge Cabinet | All | Free | 💡 Proposed |
| Daily Market Briefing (push) | Practice | Free | 💡 Proposed |
| Trading Style System | Improve | Free / Premium | 💡 Proposed |
| "What If" Time Machine | Learn | Free | 💡 Proposed |
| Brokerage Graduation Path | — | Free (referral) | 💡 Proposed |
| Fedge 2.0 v2 (conversational) | Improve | Premium | 🔮 Future |
| Private Friend Leagues | Compete | Premium | 🔮 Future |
| Paid Entry Tournaments | Compete | Premium | 🔮 Future |
| Real Account Coaching (Fedge) | Improve | Premium | 🔮 Future |
| Fedge Voice Mode | Improve | Premium | 🔮 Future |

---

## Phased Timeline

### Phase 0 — Shipped ✅
**Academy** — 4 modules, quizzes, completion events.

---

### Phase 1 — Now (~6 weeks)
**Portfolio Sim — Core**

The foundation everything else is built on. No other feature makes sense without it.

Delivers: portfolio creation, search, market orders, portfolio view, price charts, trade history, Academy → Sim CTA.

Spec: `tradestreet-portfolio-sim-prd.md`  
Eng tickets: `tradestreet-sim-eng-tickets.md`  
Design brief: `tradestreet-sim-design-brief.md`

---

### Phase 2 — ~4 weeks after Phase 1
**Portfolio Sim — Engagement Layer + Early Gamification**

Extends the sim with features that drive return visits and start building the habit loop.

Delivers:
- Limit orders
- Portfolio performance chart (value over time)
- Academy "Try it" contextual CTAs
- Portfolio reset with rate limiting
- **Daily Missions** (3 tasks/day, XP reward, streak counter) ← new
- **Progression System foundations** (XP model, level schema) ← new

Rationale for adding Daily Missions here: this is the cheapest high-impact retention mechanic available. It should ship as soon as there's something meaningful for users to do daily (which is after Phase 1 sim exists).

---

### Phase 3 — ~5 weeks after Phase 2
**Leaderboard — Phase 1 + Social Layer**

Converts individual sim performance into community competition.

Delivers:
- Monthly competition with rankings
- Top 3 medals, Top 10% badge
- Push notifications (rank change, competition ending)
- Share my rank (image card)
- Past competition results
- **Social Feed** (activity stream: trades, rank moves, milestones) ← new
- **Achievements + Badge Cabinet** ← new

Spec: `tradestreet-leaderboard-prd.md`

Rationale for adding Social Feed and Achievements here: the leaderboard launch is the moment community energy peaks. Social Feed captures that energy and keeps it visible. Achievements give users a parallel progression goal alongside rank.

---

### Phase 4 — ~4 weeks after Phase 3
**Leaderboard Phase 2 + Scenario Challenges**

Deepens competition and introduces the most differentiated learning mechanic.

Delivers:
- Display name + avatar system
- Monthly competition recap card (shareable)
- Newcomer segment filter
- Streaks (consecutive months in top 25%)
- Weekly themed events ("Tech Only Week," "Earnings Challenge")
- **Scenario Challenges** ← new: historical market replays (e.g., "Navigate the 2020 crash"), guided situations, leaderboard for each scenario

Rationale for Scenario Challenges here: by Phase 4 users have a portfolio, a rank, and daily habits. Scenario Challenges are the next layer of depth for users who've exhausted the standard sim.

---

### Phase 5 — ~8 weeks after Phase 1 ships (parallel track)
**Fedge 2.0 Alpha**

Runs in parallel with Phase 3/4 work. Alpha is a closed beta (100–500 users).

Delivers:
- Post-trade debrief (core Fedge moment)
- Prompt architecture + persona finalization
- Legal review of AI-generated financial commentary
- Latency and accuracy validation

Prerequisite: Sim Phase 1 live, Claude API integration, legal clearance.

Spec: `tradestreet-fedge2-prd.md`

---

### Phase 6 — ~4 weeks after Alpha
**Fedge 2.0 v1 — Premium Launch**

Full launch with premium tier introduction.

Delivers:
- Post-trade debrief (unlimited for premium, 1/day capped for free)
- Weekly debrief (Sunday evenings)
- Free → Premium gate and upgrade flow
- Premium subscription billing
- **Trading Style System** ← new: style classification (Momentum Rider, Value Hunter, etc.), shown in weekly debrief and as a shareable card
- **Daily Market Briefing** ← new: personalized morning push with portfolio snapshot

Rationale: Fedge v1 is the premium launch moment. Trading Style and Daily Briefing ship here because they're high-shareability, low-cost features that amplify the launch.

---

### Phase 7 — ~6 weeks after Fedge v1
**Fedge 2.0 v1.5 + Growth Features**

Completes the premium feature set and adds the key growth mechanics.

Delivers:
- Pre-trade check-in ("Ask Fedge" before placing a trade)
- Loss analysis (proactive coaching when positions drop ≥10%)
- Monthly trading style report (shareable image card)
- **Clone a Legend** ← new: start a sim portfolio modeled on Buffett, ARK, etc.
- **"What If" Time Machine** ← new: run counterfactual P&L on past decisions
- **Brokerage Graduation Path** ← new: referral partnership for users ready to go real

---

### Phase 8 — Future (timing TBD)
**Fedge 2.0 v2 + Monetization Expansion**

- Conversational Fedge (freeform Q&A)
- Fedge Voice Mode (60-second audio weekly debrief)
- Real account coaching (brokerage integration)
- Private friend leagues
- Paid entry tournaments
- Options support in sim

---

## Engagement Loop (how it all connects)

```
Academy (Learn)
    ↓
Portfolio Sim (Practice)
    ↓  ←————————————————————————————
Daily Missions + Scenario Challenges  |
    ↓                                 |
Leaderboard + Weekly Events (Compete) |
    ↓                                 |
Fedge 2.0 debrief (Improve) ——————————
    ↓
Trading Style Report → Share → New User Acquisition
    ↓
Brokerage Graduation (Monetization)
```

Every feature feeds the next. Academy fills the sim. The sim feeds the leaderboard. The leaderboard creates competition. Fedge closes the loop by turning competition results into learning. Learning drives better sim performance. And so on.

---

## Open Platform Questions

These cut across the roadmap and need alignment before Phase 3:

| Question | Decision needed by |
|---|---|
| What is the premium price point? ($9.99 / $14.99 / $19.99/mo?) | Before Fedge v1 launch |
| What is the free vs. premium feature split? (Current proposal: Sim + Leaderboard free; Fedge premium) | Before Fedge alpha |
| Which brokerage partner(s) for the graduation path? | Phase 7 planning |
| What data provider are we using for market data, and at what cost? | Before Sim Phase 1 build |
| Do we need legal review for AI-generated financial commentary? | Before Fedge alpha |
| What is the moderation strategy for display names and social feed content? | Before Leaderboard Phase 1 |

---

## Document Index

| Document | Description |
|---|---|
| `tradestreet-portfolio-sim-prd.md` | Portfolio Sim feature spec |
| `tradestreet-sim-eng-tickets.md` | Sim engineering ticket breakdown |
| `tradestreet-sim-design-brief.md` | Sim UI design brief |
| `tradestreet-leaderboard-prd.md` | Leaderboard feature spec |
| `tradestreet-fedge2-prd.md` | Fedge 2.0 AI coach spec |
| `tradestreet-master-roadmap.md` | This document |
