# Leaderboard — Feature Spec
**Product:** TradeStreet  
**Feature:** Leaderboard (v1)  
**Status:** Draft  
**Author:** Fellito / TradeStreet PM  
**Prerequisite:** Portfolio Sim must be live (tradestreet-portfolio-sim-prd.md)  
**Last updated:** April 26, 2026

---

## Problem Statement

Once users have a paper portfolio, they have no social context for their performance — no way to know if a 12% return is good, bad, or average relative to peers. Without a competitive layer, the sim becomes a solo exercise with limited staying power. Users need a reason to return daily, make deliberate decisions, and care about their portfolio beyond their own curiosity. A leaderboard converts individual portfolio performance into a social competitive mechanic, turning TradeStreet from a personal practice tool into a community platform. It is also the primary growth lever for the post-Sim phase: competitive rankings drive word-of-mouth, push notification opt-ins, and daily habit formation.

---

## Goals

1. **Drive daily active usage** — Leaderboard users return to the app at least 5x/week, up from 3x/week for Sim-only users.
2. **Increase push notification opt-in** — 60% of leaderboard users opt into "Your rank changed" push notifications within 7 days of enabling the feature.
3. **Generate organic sharing** — 15% of leaderboard users share their rank or portfolio result externally (screenshot, share sheet) within the first 30 days.
4. **Extend sim engagement** — Average sim sessions per week increase by 40% for users enrolled in a leaderboard vs. non-enrolled sim users.
5. **Support future monetization** — The leaderboard schema and competition structure supports future paid entry tournaments without a redesign.

---

## Non-Goals

**v1 does not include:**

- **Global all-time leaderboard** — A single global ranking across all users with no time boundary is dominated by early users and early joiners, discouraging newcomers. All v1 competitions are time-boxed. Global all-time rankings are a v2 consideration after we understand ranking psychology in our user base.
- **Cash prizes or real-money rewards** — Incentivized competitions with real-money prizes require regulatory review (potentially money transmission licenses). Out of scope entirely until legal signs off.
- **Team or group competitions** — Squad-based trading challenges are compelling but add significant design and engineering complexity. Single-user rankings only in v1.
- **Portfolio composition visibility** — Showing other users' exact holdings (what stocks they own) raises competitive gaming concerns (copycat trading) and privacy questions. v1 shows rank and P&L percentage only, not holdings.
- **Custom competition creation** — User-created private contests (e.g., invite friends to a competition) are a v2 feature. v1 uses platform-managed competitions only.

---

## User Stories

### Competitor (primary persona — active sim user)
- As a competitor, I want to see where I rank among other TradeStreet users this month so that I know how my trading decisions compare to my peers.
- As a competitor, I want to see how many points separate me from the person above me in the rankings so that I know what I need to do to move up.
- As a competitor, I want to receive a notification when my rank changes significantly so that I have a reason to check the app and respond.
- As a competitor, I want to see my rank history over time so that I can track my improvement as a trader.

### Newcomer
- As a newcomer to the leaderboard, I want to see my starting rank when I join a competition so that I have a baseline to measure progress from.
- As a newcomer, I want to understand how ranking is calculated so that I know what to optimize for.

### Top performer
- As a top-ranked user, I want to be recognized for my position (badge, visual indicator) so that my performance feels rewarding and worth sharing.
- As a top performer, I want to share my rank to social media or with friends so that I can show off my trading performance.

---

## How Ranking Works

Rankings are calculated on **portfolio return percentage** (not absolute dollar gain) since the start of the current competition period. This levels the playing field — every user starts with the same $10,000 virtual cash, so % return is the only meaningful differentiator.

**Formula:** `return_pct = (current_portfolio_value - starting_balance) / starting_balance × 100`

Competition periods are calendar-based: **monthly** (resets on the 1st of each month). Each period is a fresh competition — historical rankings are preserved for record-keeping but do not carry over.

Ranking updates every 15 minutes, aligned with the delayed data refresh cadence.

Ties are broken by: earlier date of joining the competition (earlier joiner ranks higher).

---

## Requirements

### Must-Have (P0)

**Competition enrollment**
- Users with an active sim portfolio are automatically eligible to join the current monthly competition.
- Enrollment is opt-in — users must explicitly join to appear on the leaderboard (privacy default).
- Once enrolled, users remain enrolled for all future competitions unless they opt out.
- Acceptance: A user can go from Portfolio Home → join leaderboard → see their initial rank in under 60 seconds.

**Leaderboard view**
- Shows the current monthly competition: competition name (e.g., "April 2026"), start date, days remaining.
- Displays a ranked list of enrolled users: rank number, display name, return % (color-coded), and a trend indicator (moved up / moved down / new entry since last refresh).
- User's own entry is always visible — pinned to the bottom of the viewport if not in the top visible rows, with their rank clearly indicated.
- Shows total number of competitors enrolled.
- Acceptance: Leaderboard loads within 2 seconds. User's own rank is always visible without scrolling.

**Rank display tiers**
- Top 3 — Gold / Silver / Bronze visual treatment (icon or medal badge).
- Top 10% — "Top 10%" badge on user's own entry card.
- All others — rank number only.

**Past competition results**
- Users can view their results for previous monthly competitions: rank, return %, total competitors.
- At minimum, last 3 months of history.

**Push notifications**
- "Your rank changed" notification triggers when a user's rank shifts by ≥5 positions (up or down).
- "Competition ending soon" notification fires 24 hours before the end of each monthly period.
- All notifications are opt-in and configurable in settings.
- Acceptance: Notifications fire within 30 minutes of the triggering rank change.

**Share rank**
- Users can share their current rank and return % via the native share sheet (image card or text).
- Share card shows: rank, return %, competition name, TradeStreet branding.
- Acceptance: Share sheet opens from a "Share my rank" button on the user's leaderboard entry.

### Nice-to-Have (P1)

**Display name + avatar**
- Users can set a display name and optional avatar for leaderboard appearance (separate from account name for privacy).
- If no display name is set, show anonymized default ("Trader #4821").

**Leaderboard notifications — "You've been passed"**
- Notification when a specific user overtakes you (requires following / rival mechanic — complex; P1 only if simple to implement).

**Competition recap card**
- At end of each monthly period, users receive an in-app recap: final rank, return %, best trade of the month, worst trade of the month.
- Shareable as an image card.

**Filter by time-in-app segment**
- Users can filter the leaderboard to see rankings among users who joined TradeStreet around the same time as them (e.g., "joined in the last 30 days"), reducing intimidation for newcomers.

**Streaks**
- Track consecutive months a user finishes in the top 25%. Show streak badge on user profile.

### Future Considerations (P2)

- **Private friend leagues** — Create invite-only competitions among a small group.
- **Paid entry tournaments** — Optional buy-in competitions with prize pools (requires legal sign-off).
- **Strategy categories** — Separate leaderboards for different trading styles (e.g., "value stocks only," "ETFs only").
- **Global all-time hall of fame** — Cumulative leaderboard recognizing all-time top performers.
- **Holdings transparency toggle** — Allow users to optionally share their portfolio composition for visibility/copying.

---

## Success Metrics

### Leading indicators (2 weeks post-launch)

| Metric | Target | Measurement |
|---|---|---|
| Leaderboard enrollment rate (sim users) | ≥40% of active sim users enroll within 14 days | Event: `leaderboard_enrolled` |
| Push notification opt-in | ≥60% of enrolled users opt in | Settings analytics |
| D7 retention (leaderboard users vs sim-only) | +30% lift | Cohort comparison |
| Share events | ≥10% of enrolled users share within 14 days | Event: `rank_shared` |

### Lagging indicators (60 days post-launch)

| Metric | Target | Measurement |
|---|---|---|
| Weekly sessions (leaderboard users) | ≥5 sessions/week | Event frequency |
| D30 retention uplift (leaderboard vs sim-only) | +25% | Cohort |
| New user acquisition via share links | ≥5% of new signups attributable to share cards | Attribution |
| Competition completion rate | ≥70% of enrolled users place at least one trade during the competition period | Funnel |

---

## Open Questions

| Question | Owner | Blocking? |
|---|---|---|
| Should enrollment be opt-in (privacy default) or opt-out (engagement default)? | PM + Legal | Yes — affects launch enrollment numbers significantly |
| What is the display name policy? Can users choose any name, or do we need moderation? | PM + Trust & Safety | Yes — need moderation plan before launch |
| Do we notify users when the monthly competition resets, and how? | PM + Design | No |
| Should the leaderboard be visible to non-enrolled users (read-only view) to drive enrollment? | PM + Design | No — good growth mechanic, worth discussing |
| At what user scale does the ranking query become expensive? What's the DB strategy (materialized view, caching)? | Engineering | No — but needs to be answered before Phase 1 launch |
| Does showing return % publicly create any regulatory concern (implied endorsement of trading returns)? | Legal | Yes |

---

## Timeline Considerations

### Hard dependencies
- **Portfolio Sim Phase 1 must be live** before leaderboard work begins. Leaderboard reads from the `portfolios` table and requires the `sim_trade_executed` event.
- **SIM-020 (P&L scoring schema standardization)** from the Sim eng tickets must be complete — this ensures the ranking query is clean and consistent.
- **Display name / avatar system** may require a new user profile concept if TradeStreet doesn't already have one.

### Suggested phasing

**Phase 1 — Core leaderboard (~5 weeks after Sim Phase 1 ships)**  
Enrollment, monthly competition, ranked list, user's own rank pinned, top 3 treatment, past results, push notifications (rank change + competition ending), share rank.

**Phase 2 — Engagement layer (4 weeks after Phase 1)**  
Display name + avatar, competition recap card, newcomer filter, streaks.

**Phase 3 — Growth & monetization (separate initiative)**  
Private leagues, paid tournaments, strategy categories.

---

## Appendix — Full TradeStreet Feature Roadmap Context

| Phase | Feature | Status |
|---|---|---|
| Shipped | Academy (4 modules + quizzes) | ✅ Live |
| Next | Portfolio Sim — Phase 1 | 🔨 In spec |
| +4 weeks | Portfolio Sim — Phase 2 (limit orders, perf chart) | 📋 Planned |
| +6 weeks | Leaderboard — Phase 1 | 📋 Planned |
| +10 weeks | Leaderboard — Phase 2 (recap, avatars, streaks) | 💡 Proposed |
| Future | Live data feed, private leagues, paid tournaments | 🔮 Future |
