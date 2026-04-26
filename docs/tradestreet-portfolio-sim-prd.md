# Portfolio Simulator — Feature Spec
**Product:** TradeStreet  
**Feature:** Portfolio Sim (v1)  
**Status:** Draft  
**Author:** Fellito / TradeStreet PM  
**Last updated:** April 26, 2026

---

## Problem Statement

TradeStreet's Academy gives users trading knowledge but no safe place to apply it. Users who finish all four modules have learned the concepts but have never executed a trade — creating a gap between education and confidence that causes them to disengage or go practice elsewhere (Robinhood, Webull paper trading). Without a practice environment native to TradeStreet, the Academy is a leaky bucket: we educate users and hand them off to competitors. A paper trading simulator closes that loop and transforms TradeStreet from a learning tool into a practicing platform.

---

## Goals

1. **Activate Academy completers** — 50% of users who finish an Academy module open the Portfolio Sim within 7 days of completion.
2. **Increase weekly retention** — Users with an active sim portfolio return to the app at least 3x/week vs. a baseline of 1x/week for Academy-only users.
3. **Extend session depth** — Average session length increases from ~4 min (Academy) to ~10 min (Sim).
4. **Create a foundation for the leaderboard** — Sim portfolios produce a standardized P&L metric usable as a leaderboard score within 60 days of Sim launch.
5. **Reduce churn at "I finished Academy, now what?"** — 30-day retention for users who complete Academy modules increases by 20% within 60 days of Sim launch.

---

## Non-Goals

**v1 does not include:**

- **Backtesting** — Running strategies against historical data requires significantly more data infrastructure and a more complex UI. Valuable for intermediate/advanced users; not the right first step for Academy graduates. Revisit in v2.
- **Options or derivatives** — Too complex for the target user (beginners). Adds significant data cost and UI complexity. Explicitly out of scope until the core sim is validated.
- **Real-money trading integration** — TradeStreet is an education product. Brokerage integrations require regulatory compliance (FINRA, SEC) that is out of scope. Do not design v1 in a way that implies real money is at stake.
- **Social portfolio sharing** — Sharing public portfolio links is a v2 feature tied to the leaderboard. Building sharing infrastructure now would be premature.
- **Real-time price streaming** — Delayed data (15-min delay) is sufficient for a learning context and dramatically cheaper. Real-time feeds are a v2 consideration after we validate usage.

---

## User Stories

### Academy Graduate (primary persona)
- As an Academy graduate, I want to start a paper portfolio with virtual cash so that I can practice the concepts I just learned without risking real money.
- As an Academy graduate, I want to search for and "buy" a stock so that I can experience the mechanics of placing a trade.
- As an Academy graduate, I want to see my portfolio's current value and P&L so that I can track how my decisions are performing over time.
- As an Academy graduate, I want to see a price chart for any stock I'm looking at so that I can apply what I learned in the Academy modules about reading charts.
- As an Academy graduate, I want to reset my portfolio to the starting amount so that I can try a different strategy without starting a new account.

### Returning User
- As a returning user, I want to see how my portfolio changed since my last visit so that I get an immediate reason to engage each time I open the app.
- As a returning user, I want to see which of my holdings are up or down today so that I understand where my gains and losses are coming from.

### Power User (intermediate trader)
- As a power user, I want to set a limit order (not just market) so that I can practice more realistic trade execution.
- As a power user, I want to see my full trade history so that I can review past decisions and learn from them.

---

## Requirements

### Must-Have (P0)

**Portfolio creation**
- Users can create one paper portfolio per account with a configurable starting balance (default: $10,000 virtual USD).
- Portfolio creation is surfaced as a CTA on Academy module completion screens.
- Acceptance: A new user can go from Academy completion → first portfolio → first trade in under 3 minutes.

**Watchlist + search**
- Users can search for any US-listed stock or ETF by ticker or company name.
- Search returns results within 1 second using 15-minute delayed price data.
- Users can add securities to a watchlist before buying.

**Buy and sell**
- Users can place market orders to buy or sell any supported security.
- Orders execute at the delayed price at time of submission (no fill simulation complexity in v1).
- The system prevents users from buying more shares than their cash balance supports.
- Short selling is not supported in v1.

**Portfolio view**
- Users can see: current portfolio value, starting balance, total P&L (dollar and percent), and a list of all held positions with quantity, avg cost, current price, and unrealized P&L.
- Holdings update automatically when users open the app (pull-to-refresh acceptable for v1; no live push).

**Price charts**
- Users can view a price chart for any security with time range options: 1D, 1W, 1M, 3M, 1Y.
- Charts display OHLC or line chart (line acceptable for v1).

**Trade history**
- Users can view a list of all executed trades with timestamp, security, action (buy/sell), quantity, and price.

### Nice-to-Have (P1)

**Limit orders**
- Users can place limit orders with a target price and expiration (Good for Day / Good Till Cancelled).
- Limit orders execute automatically when the delayed price crosses the limit (checked on next data refresh).

**Portfolio performance chart**
- Users can view a chart of their total portfolio value over time (since inception).

**Academy integration — "Try it" prompts**
- Academy modules surface "Try this in the Sim" CTAs with pre-populated trade ideas relevant to the lesson content (e.g., after a module on diversification, prompt: "Build a portfolio with 5 different sectors").

**Reset portfolio**
- Users can reset their portfolio to the starting balance, clearing all positions and trade history (with a confirmation step). Resets are rate-limited to once per 7 days to prevent gaming.

**News feed per ticker**
- A basic news feed (via a data provider like Polygon.io) on each security's detail page.

### Future Considerations (P2)

- **Backtesting** — Let users test strategies against historical market data.
- **Multiple portfolios** — Users run concurrent portfolios with different strategies.
- **Leaderboard integration** — Portfolio P&L feeds into a community ranking.
- **Real-time prices** — Upgrade from 15-min delay to real-time streaming.
- **Options support** — Paper-trade calls and puts with basic options mechanics.

---

## Success Metrics

### Leading indicators (measure at 2 weeks post-launch)

| Metric | Target | Measurement |
|---|---|---|
| Sim activation rate (Academy completers) | ≥50% open Sim within 7 days | Funnel event: `sim_portfolio_created` |
| First trade completion rate | ≥70% of users who create a portfolio place their first trade | Event: `sim_trade_executed` |
| D7 retention (Sim users) | ≥40% | Standard retention cohort |
| Avg session length (Sim users) | ≥8 min | Session analytics |

### Lagging indicators (measure at 60 days post-launch)

| Metric | Target | Measurement |
|---|---|---|
| D30 retention uplift vs Academy-only | +20% | Cohort comparison |
| Weekly active return rate | ≥3 sessions/week for Sim users | Event frequency |
| Support tickets re: "what do I do after Academy?" | -50% | Support tagging |

---

## Open Questions

| Question | Owner | Blocking? |
|---|---|---|
| Which data provider are we using, and what is the cost at 10k MAU? | Engineering | Yes — affects scope of P0 |
| Do we have a data agreement that permits 15-min delayed data for a free product? | Legal | Yes |
| Should the starting balance be fixed ($10k) or configurable? | PM + Design | No — default to $10k for v1 |
| Does portfolio value persist if a user is inactive for 30+ days? (e.g., do prices update while they're away?) | Engineering | No — confirm behavior but not blocking |
| Do we expose P&L as a raw score usable for future leaderboard, or design the schema fresh when we build leaderboard? | Engineering | No — design with future leaderboard in mind, but don't block |

---

## Timeline Considerations

### Dependencies
- **Data provider** must be selected and contracted before engineering begins (recommend Polygon.io or Alpaca for delayed US equity data).
- **Academy module completion event** must be instrumented if not already (needed for CTA placement and funnel tracking).

### Suggested phasing

**Phase 1 — Core sim (target: ~6 weeks)**  
Portfolio creation, search, market orders, portfolio view, basic chart, trade history.

**Phase 2 — Engagement layer (4 weeks after Phase 1)**  
Limit orders, portfolio performance chart, Academy "Try it" CTAs, portfolio reset.

**Phase 3 — Leaderboard setup (separate initiative)**  
Standardize P&L scoring schema, add leaderboard surface.

---

## Appendix — Feature Sequence Context

This spec covers Phase 1 of a three-part post-Academy roadmap:

1. **Portfolio Sim (now)** — Give users a place to practice.
2. **Leaderboard (4–6 weeks after Sim)** — Give users a reason to compete.
3. **Live Data Feed (future, if warranted)** — Upgrade the sim experience once usage is validated.
