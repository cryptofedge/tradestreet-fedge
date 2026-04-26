# Portfolio Simulator — Design Brief
**Product:** TradeStreet  
**Feature:** Portfolio Sim (v1)  
**Status:** Draft — for design handoff  
**Last updated:** April 26, 2026

---

## Overview

The Portfolio Sim is a paper trading environment where TradeStreet users practice buying and selling stocks and ETFs with $10,000 in virtual cash. The primary entry point is the Academy — users are prompted to open the Sim immediately after completing a module or quiz.

This brief covers the full screen inventory, key user flows, UX principles, and open design decisions for v1.

---

## Design Principles

**Practice feels real, stakes feel safe.** The sim should feel like a real trading app — real tickers, real charts, real price movements — while making it unmistakably clear that no real money is involved. Never let users feel confused about whether they're trading real funds.

**Academy and Sim are one journey, not two tabs.** The transition from module → practice should feel seamless. The sim isn't a separate product; it's where the lesson becomes experience.

**Confidence through clarity.** Beginner users are anxious about making mistakes. Every action should have a clear confirmation step, undo-friendly design, and forgiving empty states. Error messages explain what happened and what to do next — never just "Error."

**Numbers that teach.** P&L figures should be legible at a glance. Color-coding (green/red) is table stakes, but the sim should also contextualize numbers where possible ("You're up 12% — that's better than the S&P 500 this month").

---

## Screen Inventory

### 1. Portfolio Home
The main hub. Users land here from the bottom nav "Sim" tab.

**States:**
- Empty (no portfolio created yet)
- Active (portfolio exists, positions held or not)

**Empty state:**
- Headline: "Start your practice portfolio"
- Sub: "Trade with $10,000 in virtual cash — no real money involved"
- Single CTA: "Create my portfolio"
- Optional: short animated illustration of a rising chart

**Active state — sections:**
1. **Portfolio summary card** (top) — total value (large, prominent), starting balance, P&L in dollar and percent. P&L has a color indicator and a subtle trend spark line.
2. **Cash available** — shown below summary, clearly labeled "Virtual cash"
3. **Holdings list** — card or list rows; each shows ticker + company name, shares held, current price, unrealized P&L. Tapping a row opens Security Detail.
4. **Empty holdings state** — "No positions yet. Search for a stock to make your first trade."
5. **Floating or pinned CTA** — "Trade" button navigates to Search.
6. **Trade history link** — small text link or icon at top right navigating to trade log.

**Pull-to-refresh** updates all prices.

---

### 2. Security Search
Accessible via "Trade" button or search icon in Portfolio Home header.

**Default state:** shows a "Recent searches" list (empty on first use) and/or a "Watchlist" section if the user has saved tickers.

**Active search:** type-ahead results list — each row shows ticker, company name, current price, 1D change% (color-coded).

**No results state:** "We couldn't find '[query]'. Try a ticker or company name."

---

### 3. Security Detail
Full-screen view for a single stock or ETF.

**Sections (top to bottom):**
1. Header — ticker, company name, back arrow
2. Price block — current price (large), 1D change ($ and %, color-coded)
3. Chart — line chart with time range toggles: 1D · 1W · 1M · 3M · 1Y. Chart color matches P&L direction (green if up from range start, red if down).
4. Your position (conditional) — card showing shares held, avg cost basis, unrealized P&L. Hidden if no position.
5. Action buttons — "Buy" (always visible) and "Sell" (grayed out / hidden if no position held)

---

### 4. Trade Entry Sheet
Bottom sheet (modal) that slides up from Security Detail.

**Step 1 — Entry:**
- Pre-filled: ticker + action (Buy/Sell toggle at top)
- Input: "Number of shares" (numeric keyboard)
- Live calculation: "Estimated total: $X,XXX" and "Cash remaining: $X,XXX"
- Inline error if total > cash: "You don't have enough virtual cash for this trade"
- CTA: "Review order"

**Step 2 — Confirmation:**
- Summary: Action · Ticker · Shares · Est. price · Est. total
- Disclaimer line: "This is a paper trade — no real money involved"
- CTA: "Confirm trade" (primary) + "Edit" (secondary)

**Step 3 — Success:**
- Checkmark animation
- "Trade executed" headline
- Brief summary of what was bought/sold
- CTA: "Back to portfolio" + "Trade again"

**Error state:** If execution fails (e.g., price moved and funds are now insufficient), show a clear inline error with explanation. Do not silently fail.

---

### 5. Trade History
Full-screen list view, accessible from Portfolio Home.

Each row: ticker badge · BUY or SELL label · quantity · price · date  
Sorted newest first. Paginated.

Empty state: "No trades yet. Make your first trade to start building your history."

---

### 6. Academy → Sim CTA (entry point)
This is the most important acquisition surface for the Sim.

Placement: Academy module completion screen and quiz results screen.

Design: A card or banner below the completion message. Should feel celebratory — this is a win, and the sim is the next exciting step.

Copy example:  
**"Put it into practice"**  
"You just learned about diversification. Try building a diversified portfolio in the Sim."  
[**Open Portfolio Sim →**]

The CTA should feel contextually relevant to the module just completed — not a generic "Check out the Sim" prompt.

---

## Key User Flows

### Flow A — First-time user, Academy → Sim
1. User completes Academy module → completion screen with "Open Portfolio Sim" CTA
2. Taps CTA → Portfolio Home (empty state)
3. Taps "Create my portfolio" → portfolio created, empty active state
4. Taps "Trade" → Security Search
5. Types ticker → selects result → Security Detail
6. Taps "Buy" → Trade Entry Sheet → confirms → success state
7. Returns to Portfolio Home — first position visible

Target time: under 3 minutes from step 1 to step 7.

### Flow B — Returning user
1. Opens app → navigates to Sim tab → Portfolio Home (active)
2. Sees updated prices + P&L since last visit
3. Pulls to refresh if desired
4. Taps a holding → Security Detail → decides to buy more or sell
5. Places trade → returns to portfolio

### Flow C — Portfolio reset
1. User opens Portfolio Home
2. Taps overflow menu (⋯) → "Reset portfolio"
3. Confirmation modal: "This will clear all your positions and trades. Your cash will return to $10,000."
4. Confirm → portfolio resets
5. If reset was used within last 7 days, show: "You can reset again in X days"

---

## UX & Copy Guidelines

**Virtual cash labeling:** Always call it "virtual cash" or "paper trading cash" — never just "cash" or "balance" without qualification. The risk of users thinking real money is involved is too high.

**P&L colors:** Green for positive, red for negative — standard convention users expect. Do not invert.

**Numbers:** Use commas for thousands. Show 2 decimal places for prices under $100, round to nearest cent above $100. P&L percentages to 2 decimal places.

**Empty states** should always tell the user what to do next, not just what's missing.

**Error messages** should explain what went wrong in plain language ("You need $1,200 more in virtual cash to buy 10 shares") not technical codes.

**Confirmation step on trades** is mandatory — do not allow one-tap trade execution.

---

## Open Design Questions

| Question | Notes |
|---|---|
| Should the portfolio summary show a spark line of portfolio value over time on the home card, or is a full chart better saved for a detail view? | Spark line is lower effort for v1; full chart is Phase 2 |
| Should "Sell" be hidden or visually disabled if the user has no position? | Disabled is probably safer than hidden — helps users understand the button exists |
| Should the time range selector on the chart be pills or a segmented control? | Either works — match existing Academy UI component style for consistency |
| Is "virtual cash" the right terminology, or does the product have an established name for it (e.g., "TradeStreet Dollars", "Paper Cash")? | PM to confirm; design should use a consistent term throughout |
| How should the app handle price data being unavailable (e.g., market closed, provider outage)? | Show last known price with a "Prices as of [timestamp]" label rather than hiding data |

---

## Accessibility Notes

- All P&L indicators must use both color AND a text/icon indicator (not color alone) for colorblind users.
- Tap targets minimum 44×44pt.
- Chart must have an accessible text alternative (e.g., "Portfolio value: $10,842, up $842 since start").
- All interactive elements must have accessible labels for screen readers.

---

## Phase 2 Design Additions (out of scope for v1 handoff)

- Limit order flow (additional fields in trade sheet: order type toggle, limit price input, expiration)
- Portfolio performance chart (full-screen, value over time)
- News feed module on Security Detail screen
- "Try it in the Sim" contextual prompts within Academy lesson body
