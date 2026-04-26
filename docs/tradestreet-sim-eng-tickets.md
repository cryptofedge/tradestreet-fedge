# Portfolio Sim — Engineering Ticket Breakdown
**Product:** TradeStreet  
**Parent spec:** tradestreet-portfolio-sim-prd.md  
**Last updated:** April 26, 2026

Estimates are in points (1pt ≈ half a day for one engineer). Tickets are ordered by dependency — items earlier in each phase should be started first.

---

## Phase 1 — Core Sim (~6 weeks)

### Data & Infrastructure

---

**SIM-001 · Data provider integration**  
*~5 pts · Backend*

Select, contract, and integrate a US equity + ETF data provider (recommend Polygon.io). Implement a thin data service layer that abstracts the provider so it can be swapped later.

Acceptance criteria:
- [ ] GET `/market/quote/:ticker` returns last price, change, change%, volume (15-min delayed)
- [ ] GET `/market/search?q=` returns ticker + company name matches (≤1s response)
- [ ] GET `/market/chart/:ticker?range=1D|1W|1M|3M|1Y` returns OHLC series
- [ ] Service returns a clean error if ticker is not found or provider is down
- [ ] Provider costs confirmed and within budget at 10k MAU

Blocked by: Legal clearance on delayed data use (open question)

---

**SIM-002 · Academy completion event instrumentation**  
*~2 pts · Backend + Analytics*

Ensure `academy_module_completed` and `academy_quiz_passed` events are firing to the analytics pipeline with `user_id`, `module_id`, and `timestamp`. These events gate the Sim CTA placement (SIM-007).

Acceptance criteria:
- [ ] Events fire in production for all 4 Academy modules
- [ ] Events visible in analytics dashboard within 60 seconds of trigger
- [ ] Backfill historical events if possible

---

### Portfolio Core

---

**SIM-003 · Portfolio data model**  
*~3 pts · Backend*

Design and implement the database schema for paper portfolios.

Schema:
- `portfolios` — id, user_id, name, starting_balance, cash_balance, created_at, reset_count, last_reset_at
- `positions` — id, portfolio_id, ticker, quantity, avg_cost_basis, created_at, updated_at
- `trades` — id, portfolio_id, ticker, action (buy/sell), quantity, price_at_execution, executed_at

Acceptance criteria:
- [ ] Schema supports one portfolio per user (enforce at DB level)
- [ ] `avg_cost_basis` updates correctly on partial buys (weighted average)
- [ ] Position is removed when quantity reaches zero (sell all)
- [ ] Starting balance defaults to $10,000 if not specified

---

**SIM-004 · Portfolio API — CRUD**  
*~4 pts · Backend*

Implement REST endpoints for portfolio management.

Endpoints:
- `POST /sim/portfolio` — create portfolio (idempotent; returns existing if already created)
- `GET /sim/portfolio` — fetch portfolio summary (value, P&L, cash, positions)
- `GET /sim/portfolio/trades` — paginated trade history
- `POST /sim/portfolio/reset` — reset portfolio (rate-limit: once per 7 days)

Acceptance criteria:
- [ ] Portfolio value = cash + sum(position.quantity × current_price)
- [ ] P&L = current value − starting balance
- [ ] Reset clears positions and trades, restores starting balance, increments reset_count
- [ ] Reset endpoint returns 429 if called within 7 days of last reset
- [ ] All endpoints require auth; users cannot access other users' portfolios

---

**SIM-005 · Trade execution API**  
*~4 pts · Backend*

Implement the order execution logic.

Endpoints:
- `POST /sim/portfolio/trade` — body: `{ ticker, action, quantity, order_type: "market" }`

Acceptance criteria:
- [ ] Market orders execute at the current delayed price
- [ ] Buy: fails if `quantity × price > cash_balance` (return 400 with clear message)
- [ ] Sell: fails if `quantity > position.quantity` (return 400)
- [ ] Short selling returns 400 with message "Short selling is not supported"
- [ ] On success, updates positions, cash balance, and appends to trades table
- [ ] Returns trade confirmation with executed price and timestamp

---

### Frontend

---

**SIM-006 · Portfolio tab — main view**  
*~5 pts · Frontend*

Build the primary Portfolio Sim screen.

Sections:
1. Summary card — total value, starting balance, total P&L ($ and %)
2. Holdings list — ticker, shares, avg cost, current price, unrealized P&L ($ and %)
3. Cash balance row
4. "Trade" CTA button

Acceptance criteria:
- [ ] Empty state shows when no positions held ("Make your first trade")
- [ ] P&L values are color-coded (green = positive, red = negative)
- [ ] Tapping a holding navigates to that security's detail screen
- [ ] Pull-to-refresh updates prices
- [ ] Skeleton loading state on first load

---

**SIM-007 · Academy → Sim CTA placement**  
*~2 pts · Frontend*

Add a "Practice this in the Sim" CTA on the Academy module completion screen and quiz results screen.

Acceptance criteria:
- [ ] CTA appears after every module completion and every quiz passed
- [ ] CTA deep-links to Portfolio Sim tab (creates portfolio if none exists)
- [ ] If user already has a portfolio, CTA reads "Open your Portfolio"
- [ ] Fires `sim_cta_tapped` analytics event

Depends on: SIM-002

---

**SIM-008 · Security search + detail screen**  
*~4 pts · Frontend*

Build the stock/ETF search and security detail view.

Search:
- Accessible from a search icon in the Portfolio tab header
- Shows recent/watchlist items as default state
- Results show ticker, company name, current price, 1D change%

Detail screen:
- Price + 1D change
- Price chart with 1D / 1W / 1M / 3M / 1Y toggle
- "Buy" and "Sell" buttons (Sell grayed out if no position held)
- Current position summary if held (shares, avg cost, unrealized P&L)

Acceptance criteria:
- [ ] Search returns results within 1 second
- [ ] Chart renders for all 5 time ranges
- [ ] Buy/Sell buttons navigate to trade entry sheet
- [ ] Invalid tickers return "Not found" state

Depends on: SIM-001

---

**SIM-009 · Trade entry sheet**  
*~3 pts · Frontend*

Build the modal/sheet for entering and confirming a trade.

Fields: ticker (pre-filled), action (Buy/Sell toggle), quantity input

Confirmation step shows: action, quantity, ticker, estimated total, cash remaining after trade

Acceptance criteria:
- [ ] Quantity input is numeric; decimals allowed for ETFs, whole numbers for stocks
- [ ] Estimated total updates live as quantity changes
- [ ] "Insufficient funds" error shown inline before submit if total > cash balance
- [ ] Confirmation step required before trade fires
- [ ] Success state shows confirmation with P&L impact
- [ ] Fires `sim_trade_executed` analytics event on success

Depends on: SIM-005

---

**SIM-010 · Trade history screen**  
*~2 pts · Frontend*

Build the trade history list view (accessible from Portfolio tab).

Each row: ticker, action badge (BUY/SELL), quantity, executed price, date/time

Acceptance criteria:
- [ ] Paginated (load more on scroll)
- [ ] Empty state shown when no trades have been placed
- [ ] Sorted newest first

Depends on: SIM-004

---

### QA & Analytics

---

**SIM-011 · Analytics event wiring**  
*~2 pts · Frontend + Backend*

Instrument all required analytics events for funnel tracking.

Events:
- `sim_portfolio_created` — on first portfolio creation
- `sim_cta_tapped` — when Academy CTA is tapped
- `sim_trade_executed` — on every successful trade (properties: ticker, action, quantity, portfolio_value_after)
- `sim_portfolio_reset` — on portfolio reset

---

**SIM-012 · Phase 1 QA pass**  
*~3 pts · QA*

Full regression on all Phase 1 flows: portfolio creation, search, buy/sell, portfolio view, trade history, Academy CTA.

Focus areas: edge cases on insufficient funds, selling more than held, reset rate limiting, empty states.

---

## Phase 2 — Engagement Layer (~4 weeks after Phase 1)

| Ticket | Description | Est. | Depends on |
|---|---|---|---|
| SIM-013 | Limit order support (backend execution logic) | 5 pts | SIM-005 |
| SIM-014 | Limit order UI (order type toggle in trade sheet) | 3 pts | SIM-013 |
| SIM-015 | Portfolio performance chart (value over time) | 4 pts | SIM-003 |
| SIM-016 | Academy "Try it" pre-populated trade prompts | 3 pts | SIM-007 |
| SIM-017 | Portfolio reset UI + rate limit messaging | 2 pts | SIM-004 |
| SIM-018 | News feed per ticker (via data provider) | 3 pts | SIM-001 |
| SIM-019 | Phase 2 QA pass | 2 pts | All above |

---

## Phase 3 — Leaderboard Prep (separate initiative)

| Ticket | Description | Est. |
|---|---|---|
| SIM-020 | Standardize P&L scoring schema for leaderboard use | 3 pts |
| SIM-021 | Leaderboard data export / ranking service | 5 pts |

---

## Total Estimates

| Phase | Points | Rough calendar time (2 engineers) |
|---|---|---|
| Phase 1 | ~39 pts | ~5–6 weeks |
| Phase 2 | ~22 pts | ~3–4 weeks |
| Phase 3 | ~8 pts | ~1–2 weeks |
