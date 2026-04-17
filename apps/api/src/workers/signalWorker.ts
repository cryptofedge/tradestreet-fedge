// ============================================
// FEDGE 2.O — Signal Generation Worker
// apps/api/src/workers/signalWorker.ts
//
// Runs on a cron schedule to generate fresh
// signals for all active users.
// ============================================

import { Pool } from 'pg';
import { createClient } from 'redis';
import { AlpacaService } from '../services/alpaca';
import { FedgeBrainService } from '../services/fedgeBrain';
import { nanoid } from 'nanoid';
import 'dotenv/config';

// Tickers to analyze (expand this list over time)
const WATCHLIST = [
  // Mega caps
  'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA',
  // High volatility
  'PLTR', 'SOFI', 'MSTR', 'SMCI', 'AMD',
  // ETFs
  'SPY', 'QQQ', 'ARKK',
  // Crypto (via Alpaca)
  'BTC/USD', 'ETH/USD', 'SOL/USD',
];

async function run() {
  console.log('[Signal Worker] Starting...');

  const db = new Pool({ connectionString: process.env.DATABASE_URL });
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();

  const alpaca = new AlpacaService(process.env.ALPACA_API_KEY!, process.env.ALPACA_API_SECRET!);
  const brain = new FedgeBrainService();

  // Get all pro users with connected platforms
  const { rows: users } = await db.query(
    `SELECT id, tier FROM users WHERE platform_connected = true ORDER BY tier DESC`
  );

  console.log(`[Signal Worker] Generating signals for ${WATCHLIST.length} tickers`);

  const generatedSignals: any[] = [];

  for (const ticker of WATCHLIST) {
    try {
      // Get price data
      const bars = await alpaca.getBars(ticker.replace('/', ''), '4H', 50);
      if (bars.length < 10) continue;

      const priceDataStr = bars.slice(-20).map(b =>
        `${b.timestamp.slice(0, 16)} O:${b.open.toFixed(2)} H:${b.high.toFixed(2)} L:${b.low.toFixed(2)} C:${b.close.toFixed(2)} V:${b.volume}`
      ).join('\n');

      // Minimal context for signal gen (no user-specific portfolio)
      const mockContext = {
        portfolio: { totalValue: 25000, cash: 5000, buyingPower: 10000, dayPnl: { amount: 0, percent: 0 }, totalPnl: { amount: 0, percent: 0 }, positionsCount: 3, platform: 'alpaca' as const, lastSynced: new Date().toISOString() },
        positions: [],
        recentSignals: [],
        userProfile: { xp: 0, level: 5, streakDays: 0, badges: [] as any[] },
      };

      const signal = await brain.generateSignal(ticker, priceDataStr, mockContext);

      const signalId = `sig_${nanoid(12)}`;
      const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hour expiry

      const fullSignal = {
        id: signalId,
        ...signal,
        generatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        tier: 'free' as const,
      };

      // Store in Redis (4h TTL)
      await redis.set(`signal:${signalId}`, JSON.stringify(fullSignal), { EX: 4 * 3600 });

      // Save to DB
      await db.query(
        `INSERT INTO signals (id, ticker, asset_class, action, confidence, risk_level, reasoning,
                              entry_low, entry_high, stop_loss, target_price, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [
          signalId, signal.ticker, signal.assetClass, signal.action,
          signal.confidence, signal.riskLevel, signal.reasoning,
          signal.entryRange.low, signal.entryRange.high,
          signal.stopLoss, signal.targetPrice, expiresAt.toISOString(),
        ]
      );

      generatedSignals.push(fullSignal);

      // Only generate signals for high confidence (>= 0.65)
      if (signal.confidence >= 0.65) {
        // Push to all connected users via Redis pub/sub
        for (const user of users) {
          const userSignals = await redis.get(`signals:${user.id}`);
          const signals = userSignals ? JSON.parse(userSignals) : [];
          signals.unshift(fullSignal);
          await redis.set(`signals:${user.id}`, JSON.stringify(signals.slice(0, 50)), { EX: 4 * 3600 });

          // Push WS notification
          await redis.publish(`ws:${user.id}`, JSON.stringify({
            type: 'signal.new',
            payload: fullSignal,
            timestamp: new Date().toISOString(),
          }));
        }
      }

      console.log(`[Signal Worker] ${ticker}: ${signal.action} (${(signal.confidence * 100).toFixed(0)}% confidence)`);

      // Rate limit — don't hammer Claude
      await new Promise(resolve => setTimeout(resolve, 1200));

    } catch (err: any) {
      console.error(`[Signal Worker] Error for ${ticker}: ${err.message}`);
    }
  }

  console.log(`[Signal Worker] Done. Generated ${generatedSignals.length} signals.`);

  await redis.quit();
  await db.end();
  process.exit(0);
}

run().catch(err => {
  console.error('[Signal Worker] Fatal:', err);
  process.exit(1);
});
