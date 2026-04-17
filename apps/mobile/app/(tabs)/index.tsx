// ============================================
// FEDGE 2.O — HomeScreen (Signal Feed)
// apps/mobile/app/(tabs)/index.tsx
// ============================================

import { useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Animated,
} from 'react-native';
import { router } from 'expo-router';
import {
  colors, typography, fontSize, spacing, radius,
  confidenceColor, riskColor,
} from '../../src/theme';
import { useStore } from '../../src/store';
import type { Signal } from '@tradestreet/types';

// ── Mock data for demo ──────────────────────────────────────────────────────
const MOCK_SIGNALS: Signal[] = [
  {
    id: '1', ticker: 'AAPL', assetClass: 'stocks', action: 'BUY',
    confidence: 0.87, riskLevel: 'LOW',
    reasoning: 'Strong earnings momentum. MACD crossover on daily. Institutional accumulation detected.',
    entryRange: { low: 211.20, high: 213.80 },
    stopLoss: 208.50, targetPrice: 224.00,
    expiresAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
    generatedAt: new Date().toISOString(), tier: 'free',
  },
  {
    id: '2', ticker: 'NVDA', assetClass: 'stocks', action: 'BUY',
    confidence: 0.79, riskLevel: 'MEDIUM',
    reasoning: 'AI infrastructure cycle still early. RSI bounced from 45 support. Volume spike.',
    entryRange: { low: 118.00, high: 121.50 },
    stopLoss: 114.00, targetPrice: 134.00,
    expiresAt: new Date(Date.now() + 6 * 3600_000).toISOString(),
    generatedAt: new Date(Date.now() - 30 * 60_000).toISOString(), tier: 'free',
  },
  {
    id: '3', ticker: 'BTC', assetClass: 'crypto', action: 'WATCH',
    confidence: 0.62, riskLevel: 'HIGH',
    reasoning: 'Consolidating below $97k resistance. Wait for breakout confirmation above $98.5k.',
    entryRange: { low: 97200, high: 98500 },
    stopLoss: 94000, targetPrice: 105000,
    expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
    generatedAt: new Date(Date.now() - 90 * 60_000).toISOString(), tier: 'pro',
  },
  {
    id: '4', ticker: 'TSLA', assetClass: 'stocks', action: 'SELL',
    confidence: 0.73, riskLevel: 'MEDIUM',
    reasoning: 'Delivery miss risk priced in wrong direction. Resistance at $420. Take profits.',
    entryRange: { low: 418.00, high: 422.00 },
    stopLoss: 428.00, targetPrice: 395.00,
    expiresAt: new Date(Date.now() + 3 * 3600_000).toISOString(),
    generatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(), tier: 'pro',
  },
  {
    id: '5', ticker: 'SPY', assetClass: 'etf', action: 'HOLD',
    confidence: 0.55, riskLevel: 'LOW',
    reasoning: 'Neutral — FOMC meeting tomorrow creates uncertainty. Stay positioned, no new entries.',
    entryRange: { low: 519.00, high: 521.00 },
    stopLoss: 512.00, targetPrice: 530.00,
    expiresAt: new Date(Date.now() + 12 * 3600_000).toISOString(),
    generatedAt: new Date(Date.now() - 3 * 3600_000).toISOString(), tier: 'free',
  },
];

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

function expiresIn(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return 'EXPIRED';
  const hours = Math.floor(diff / 3600_000);
  const mins = Math.floor((diff % 3600_000) / 60_000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

const ACTION_COLORS: Record<string, string> = {
  BUY: colors.green,
  SELL: colors.red,
  HOLD: colors.yellow,
  WATCH: colors.blue,
};

interface SignalCardProps {
  signal: Signal;
  isNew?: boolean;
  isPro: boolean;
}

function SignalCard({ signal, isNew, isPro }: SignalCardProps) {
  const isLocked = signal.tier === 'pro' && !isPro;
  const actionColor = ACTION_COLORS[signal.action];
  const confColor = confidenceColor(signal.confidence);

  return (
    <TouchableOpacity
      style={[styles.card, isNew && styles.cardNew]}
      onPress={() => router.push(`/signal/${signal.id}`)}
      activeOpacity={0.8}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View style={[styles.actionBadge, { backgroundColor: actionColor + '22', borderColor: actionColor }]}>
            <Text style={[styles.actionText, { color: actionColor }]}>{signal.action}</Text>
          </View>
          <Text style={styles.ticker}>{signal.ticker}</Text>
          <View style={[styles.assetTag, { backgroundColor: colors.bg4 }]}>
            <Text style={styles.assetText}>{signal.assetClass.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          {signal.tier === 'pro' && (
            <View style={styles.proTag}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
          <Text style={styles.timeAgo}>{timeAgo(signal.generatedAt)}</Text>
        </View>
      </View>

      {isLocked ? (
        <View style={styles.lockedBox}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedText}>PRO SIGNAL — Upgrade to unlock</Text>
        </View>
      ) : (
        <>
          {/* Confidence + Risk */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>CONFIDENCE</Text>
              <Text style={[styles.statValue, { color: confColor }]}>
                {Math.round(signal.confidence * 100)}%
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>RISK</Text>
              <Text style={[styles.statValue, { color: riskColor(signal.riskLevel) }]}>
                {signal.riskLevel}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>TARGET</Text>
              <Text style={styles.statValue}>
                ${signal.targetPrice.toLocaleString()}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>EXPIRES</Text>
              <Text style={[styles.statValue, { color: colors.textMuted }]}>
                {expiresIn(signal.expiresAt)}
              </Text>
            </View>
          </View>

          {/* Confidence bar */}
          <View style={styles.confBar}>
            <View style={[styles.confFill, {
              width: `${signal.confidence * 100}%` as any,
              backgroundColor: confColor,
            }]} />
          </View>

          {/* Reasoning */}
          <Text style={styles.reasoning} numberOfLines={2}>
            {signal.reasoning}
          </Text>

          {/* Entry range */}
          <View style={styles.entryRow}>
            <Text style={styles.entryLabel}>ENTRY</Text>
            <Text style={styles.entryRange}>
              ${signal.entryRange.low} – ${signal.entryRange.high}
            </Text>
            <Text style={styles.entryLabel}>STOP</Text>
            <Text style={[styles.entryRange, { color: colors.red }]}>
              ${signal.stopLoss}
            </Text>
          </View>
        </>
      )}

      {isNew && <View style={styles.newDot} />}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { feed, viewed } = useStore(s => ({ feed: s.feed, viewed: s.viewed }));
  const user = useStore(s => s.user);
  const gameProfile = useStore(s => s.profile);
  const isPro = user?.tier === 'pro';

  // Use mock signals for demo
  const signals = MOCK_SIGNALS;

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>FEDGE 2.O</Text>
          <Text style={styles.headerTitle}>SIGNAL FEED</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <TouchableOpacity style={styles.levelBadge}>
            <Text style={styles.levelText}>
              LVL {gameProfile?.level ?? user?.level ?? 1}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Streak Bar ── */}
      <View style={styles.streakBar}>
        <Text style={styles.streakLabel}>
          🔥 {user?.streakDays ?? 3} day streak
        </Text>
        <Text style={styles.nextSignal}>Next signal in 2h 14m</Text>
      </View>

      {/* ── Feed ── */}
      <FlatList
        data={signals}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.feedContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.feedHeader}>
            <Text style={styles.feedCount}>{signals.length} SIGNALS TODAY</Text>
            {!isPro && (
              <TouchableOpacity style={styles.upgradeChip}>
                <Text style={styles.upgradeText}>⚡ GO PRO</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <SignalCard
            signal={item}
            isNew={!viewed.has(item.id)}
            isPro={isPro}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBrand: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 3,
  },
  headerTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xxl,
    color: colors.white,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.greenDim,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.green + '44',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  liveText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: 1,
  },
  levelBadge: {
    backgroundColor: colors.orangeGlow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.orange + '44',
  },
  levelText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 1,
  },

  // Streak
  streakBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  streakLabel: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.sm,
    color: colors.yellow,
  },
  nextSignal: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },

  // Feed
  feedContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  feedCount: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  upgradeChip: {
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  upgradeText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.white,
    letterSpacing: 1,
  },

  // Signal Card
  card: {
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardNew: {
    borderColor: colors.orange + '55',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  actionText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
  ticker: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xl,
    color: colors.white,
    letterSpacing: -0.5,
  },
  assetTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  assetText: {
    fontFamily: typography.mono.regular,
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  proTag: {
    backgroundColor: colors.purpleDim,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.purple + '55',
  },
  proText: {
    fontFamily: typography.mono.bold,
    fontSize: 8,
    color: colors.purple,
    letterSpacing: 1,
  },
  timeAgo: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontFamily: typography.mono.regular,
    fontSize: 8,
    color: colors.textDim,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },

  // Confidence bar
  confBar: {
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  confFill: {
    height: '100%',
    borderRadius: 1,
  },

  // Reasoning
  reasoning: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },

  // Entry
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryLabel: {
    fontFamily: typography.mono.regular,
    fontSize: 9,
    color: colors.textDim,
    letterSpacing: 1,
  },
  entryRange: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.text,
  },

  // Locked
  lockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg4,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  lockedIcon: { fontSize: 16 },
  lockedText: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // New indicator
  newDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
});
