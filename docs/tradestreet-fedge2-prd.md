# Fedge 2.0 — AI Trading Coach Spec
**Product:** TradeStreet  
**Feature:** Fedge 2.0 (AI Trading Coach)  
**Status:** Draft  
**Author:** Fellito / TradeStreet PM  
**Last updated:** April 26, 2026

---

## What Is Fedge 2.0?

Fedge 2.0 is TradeStreet's AI trading coach — a persistent, personalized mentor that learns from each user's actual trading behavior and delivers targeted feedback, analysis, and guidance. Unlike static educational content, Fedge 2.0 responds to what *you* specifically did: why your trade worked, why it didn't, what pattern your decisions are forming, and what to do differently.

Fedge 2.0 is the feature that separates TradeStreet from every other trading app and every other trading education platform. It is the moat. No one else offers a coach that knows your exact portfolio history and speaks to you personally.

Fedge 2.0 is also TradeStreet's premium tier anchor — the primary reason users pay for a subscription.

---

## Problem Statement

Users who finish Academy modules and start paper trading have no feedback loop beyond P&L. They know their portfolio went up or down, but they don't know *why* or *what to change*. Without a coach, most users repeat the same behavioral mistakes — panic selling, chasing momentum, over-concentrating — indefinitely. The result is that TradeStreet builds confident-feeling but not actually improving traders, which undermines the product's core promise. Fedge 2.0 closes the gap between "I know the theory" (Academy) and "I'm actually improving" (sim + coach feedback), making TradeStreet the only platform that doesn't just teach trading — it makes you better at it.

---

## Goals

1. **Drive premium conversion** — 25% of active sim users (≥5 trades/month) upgrade to a paid tier to access Fedge 2.0 within 90 days of launch.
2. **Improve trading outcomes** — Users with Fedge 2.0 active show measurably better sim P&L month-over-month compared to users without it (target: +15% improvement rate).
3. **Increase session depth** — Fedge 2.0 users average 2+ interactions with coach content per session vs. 0 for non-Fedge users.
4. **Reduce churn** — 90-day retention for Fedge 2.0 users is ≥70% vs. ≤45% for free-tier users.
5. **Build the moat** — Fedge 2.0 becomes the #1 cited reason users recommend TradeStreet (measured via NPS open-text and app store reviews).

---

## Non-Goals

- **Fedge 2.0 does not give buy/sell recommendations on real stocks.** It coaches on strategy, behavior, and reasoning — not specific investment advice. This is both a legal requirement and a product boundary. Every Fedge response includes a disclaimer where relevant.
- **Fedge 2.0 is not a chatbot.** It does not support open-ended freeform chat in v1. It surfaces structured, proactive insights at defined moments in the user journey. A conversational Q&A mode is a v2 consideration.
- **Fedge 2.0 does not analyze real-money portfolios.** Sim-only in v1. Brokerage account integration is a future consideration.
- **Fedge 2.0 is not a financial advisor.** It is explicitly a paper trading coach. All outputs must be framed as educational analysis, not financial advice.

---

## User Stories

### Learner (primary)
- As a learner, I want to understand why a trade I made lost money so that I can avoid making the same mistake.
- As a learner, I want Fedge to tell me what my trading patterns look like from the outside so that I can see blind spots I can't see myself.
- As a learner, I want a weekly summary of how I'm improving (or not) so that I have a sense of progress beyond just my P&L number.
- As a learner, I want Fedge to recommend which Academy module to do next based on my actual trades so that I learn what's relevant to me right now.

### Active trader
- As an active trader, I want to ask Fedge to review a trade I'm thinking about before I place it so that I can sanity-check my reasoning.
- As an active trader, I want Fedge to flag when I'm making a decision that contradicts my own stated strategy so that I can catch emotional trading before it happens.

### Premium subscriber
- As a premium subscriber, I want access to Fedge's full analysis so that I feel my subscription is worth paying for every month.

---

## Core Fedge 2.0 Moments

Fedge 2.0 is not always-on. It surfaces at five defined high-value moments:

### Moment 1 — Post-trade debrief
**Trigger:** 30 seconds after a trade executes.  
**What Fedge does:** Delivers a 3–5 sentence analysis of the trade in context. Covers: what the market was doing at that moment, whether the entry timing was supported by any signals, what risk the trade carries, and what to watch for next.  
**Example:**  
> "You bought NVDA at $118.40, just ahead of the next earnings window. Semiconductor stocks have historically shown elevated volatility ±5% around earnings. If NVDA misses estimates, you could see a quick 8–12% drawdown. Consider setting a mental stop-loss threshold before results come in. Your Academy Module 3 covered this — earnings plays are high-risk, high-reward."

### Moment 2 — Weekly debrief
**Trigger:** Every Sunday evening.  
**What Fedge does:** Reviews the past 7 days of trading activity. Covers: total P&L vs. the market, best and worst trade, a behavioral pattern observation ("You made 4 trades on down-market days — you may be buying dips reactively"), and one specific thing to focus on next week.  
**Format:** In-app card + optional push notification.

### Moment 3 — Pre-trade check-in (premium)
**Trigger:** User taps "Ask Fedge" button on the trade entry sheet before confirming.  
**What Fedge does:** Reviews the pending trade and gives a structured go/no-go analysis. Covers: how this fits the user's portfolio (concentration, sector balance), recent price action for the ticker, and whether the trade aligns with the user's own trading style.  
**This is the highest-value premium feature.** It creates a habit of deliberate decision-making before every trade.

### Moment 4 — Loss analysis
**Trigger:** A position drops 10% or more, or a user closes a trade at a loss ≥5%.  
**What Fedge does:** Proactively surfaces an analysis: "Your COIN position is down 11.2%. Here's what happened and what your options are." Explains the likely cause (market conditions, sector rotation, company-specific news), contextualizes the loss relative to the user's portfolio, and suggests a decision framework (hold / cut / add) without making a specific recommendation.

### Moment 5 — Trading style report (monthly)
**Trigger:** First of each month, after at least 10 trades in the prior month.  
**What Fedge does:** Classifies the user's trading style based on behavior (momentum trader, contrarian, long-term holder, overtrader, etc.), shows P&L broken down by style behavior, and recommends Academy modules or strategy adjustments. This is the most shareable Fedge output — users will screenshot and post their trading style card.

---

## Requirements

### Must-Have (P0)

**Post-trade debrief (Moment 1)**
- Fires within 60 seconds of every executed sim trade
- Analysis is personalized to the specific ticker, trade size, and timing
- 3–5 sentences; plain English; no jargon without explanation
- Includes a contextual Academy link when relevant ("Module 3 covers this")
- Dismissable; stored in a "Fedge history" log

**Weekly debrief (Moment 2)**
- Fires every Sunday, only if ≥1 trade was placed in the past 7 days
- Covers: P&L summary, best/worst trade, one behavioral observation, one focus for next week
- Available as in-app card and optional push notification
- Stored and browsable (users can review past weekly debriefs)

**Loss analysis (Moment 4)**
- Triggers automatically when a position drops ≥10% or a trade closes at ≥5% loss
- Delivered as a push notification + in-app card
- Must not feel alarmist — framed as coaching, not crisis

**Fedge history log**
- All Fedge outputs stored and browsable from a "Fedge" tab or section
- Users can tap any past debrief to re-read it
- Acceptance: At least 90 days of history retained

**Free vs. premium gating**
- Free users get: post-trade debrief (1 per day, capped), weekly debrief
- Premium users get: unlimited post-trade debriefs, pre-trade check-in, loss analysis, monthly style report, full history
- Free users see a Fedge preview card for gated features with upgrade prompt

### Nice-to-Have (P1)

**Pre-trade check-in (Moment 3)**
- "Ask Fedge" button on trade entry sheet
- Takes ~5 seconds to generate; show a loading state with a single-line teaser while generating
- Response is structured: Portfolio fit / Timing / Risk / Verdict (Go / Caution / Reconsider)

**Monthly trading style report (Moment 5)**
- Requires ≥10 trades in prior month to generate
- Shareable as an image card (name, style label, key stats, TradeStreet branding)
- 6 trading style archetypes: Momentum Rider, Value Hunter, Contrarian, Steady Builder, Overtrader, Emerging Strategist

**Fedge streak**
- Tracks consecutive weeks where the user read their weekly debrief and placed at least one trade
- Shown as a small badge on the Fedge icon

**Academy recommendations**
- Each Fedge debrief surfaces a contextual module suggestion based on the trade topic
- "Based on this trade, Module 2 (Diversification) might be useful for you right now"

### Future Considerations (P2)

- **Conversational Fedge** — Freeform Q&A: "Fedge, why is my portfolio underperforming the market?"
- **Real account coaching** — Connect a brokerage account and get Fedge analysis on real trades
- **Group coaching sessions** — Weekly live (or async) Fedge-generated market commentary for the TradeStreet community
- **Fedge challenges** — "This week Fedge challenges you to: make 3 trades without panic selling." Personalized behavioral challenges.
- **Voice mode** — Fedge delivers weekly debrief as a 60-second audio summary

---

## AI / Technical Considerations

**Model:** Fedge 2.0 runs on a Claude API integration (claude-sonnet-4-6 recommended for latency/cost balance on post-trade debriefs; claude-opus-4-6 for monthly style reports where depth matters more than speed).

**Prompt architecture:**
- System prompt establishes Fedge's persona: direct, knowledgeable, encouraging but honest, never preachy
- Each request injects: user's full trade history (last 90 days), current portfolio state, ticker context (price action, sector, recent news summary), and the specific moment type
- Outputs are structured (not freeform) to ensure consistent length and tone

**Latency targets:**
- Post-trade debrief: ≤8 seconds end-to-end
- Pre-trade check-in: ≤6 seconds
- Weekly/monthly reports: async generation (pre-generated Sunday night, delivered on open)

**Cost model:**
- Estimate ~$0.02–0.05 per post-trade debrief at current API pricing
- At 10 trades/month per active user, ~$0.20–0.50/user/month in API costs
- Premium pricing must cover this margin; free tier cap (1 debrief/day) controls cost exposure

**Guardrails:**
- Fedge must never say "buy X" or "sell X" as a direct instruction
- All outputs reviewed against a financial advice classifier before delivery
- If a ticker has regulatory concerns (e.g., meme stocks during a squeeze), Fedge adds a volatility caveat automatically

---

## Fedge Persona & Voice

Fedge 2.0 is not a robot and not a cheerleader. It's a sharp, experienced trading mentor who respects the user's intelligence and tells them the truth — including when they made a bad call.

**Tone:** Direct. Warm but not soft. Specific, never vague. Never condescending.

**Does:** Names the mistake plainly. Explains the reasoning. Gives one clear focus. References the user's own history ("Last time you made a similar trade...").

**Doesn't:** Use jargon without explanation. Give generic tips. Say "great job!" when the trade was a bad idea. Moralize about losses.

**Voice examples:**

✅ "You bought at the top of a 3-day run-up. The entry timing worked against you — the momentum was already priced in. Next time, look for a pullback to the 10-day moving average before entering."

❌ "Great trade attempt! Markets can be unpredictable. Remember to always do your research before trading!"

✅ "Your portfolio is 60% tech. That worked great this month, but you're running a concentrated bet. One bad earnings cycle and you'll feel it hard."

❌ "Consider diversifying your portfolio to manage risk across asset classes."

---

## Success Metrics

### Leading indicators (30 days post-launch)

| Metric | Target | Measurement |
|---|---|---|
| Fedge debrief open rate | ≥70% of delivered debriefs opened | Event: `fedge_debrief_opened` |
| Pre-trade check-in usage (premium) | ≥40% of premium trades use "Ask Fedge" | Event: `fedge_pretrade_requested` |
| Premium conversion from Fedge gate | ≥15% of free users who hit a Fedge gate upgrade within 7 days | Funnel |
| Weekly debrief push opt-in | ≥60% of Fedge users opt into Sunday push | Settings analytics |

### Lagging indicators (90 days post-launch)

| Metric | Target | Measurement |
|---|---|---|
| Premium subscriber retention (D90) | ≥70% | Cohort |
| Trading improvement rate (Fedge vs. non-Fedge) | +15% better month-over-month P&L trend | Cohort comparison |
| NPS — Fedge users vs. non-Fedge | +20 NPS points | In-app survey |
| Style report share rate | ≥20% of style report recipients share externally | Event: `style_report_shared` |

---

## Open Questions

| Question | Owner | Blocking? |
|---|---|---|
| What is the legal review process for AI-generated trading commentary? Do outputs need a compliance review layer? | Legal | Yes |
| What is the premium price point? ($9.99/mo? $14.99/mo?) | PM + Finance | Yes — affects conversion target calibration |
| Should free users get Fedge at all, or is full Fedge premium-only? | PM | Yes — gating strategy affects growth vs. monetization balance |
| How do we prevent Fedge from hallucinating financial data (e.g., citing incorrect price history)? | Engineering | Yes — need a grounding strategy (RAG or structured data injection) |
| What happens to Fedge analysis if the data provider is down and price data is stale? | Engineering | No |

---

## Timeline

**Prerequisites:**
- Portfolio Sim Phase 1 must be live (Fedge needs trade history to analyze)
- Claude API integration and legal sign-off on AI-generated financial commentary

**Suggested phasing:**

**Fedge 2.0 Alpha (~8 weeks after Sim ships)**  
Post-trade debrief only. Small beta group (100–500 users). Validate tone, accuracy, and latency. Iterate on prompts.

**Fedge 2.0 v1 (~4 weeks after alpha)**  
Post-trade debrief + weekly debrief. Free tier cap. Premium gate introduced. Full launch.

**Fedge 2.0 v1.5 (~6 weeks after v1)**  
Pre-trade check-in, loss analysis, monthly style report. Premium fully unlocked.

**Fedge 2.0 v2 (future)**  
Conversational mode, voice, real account coaching.
