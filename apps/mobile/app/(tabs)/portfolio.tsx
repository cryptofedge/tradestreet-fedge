// ============================================
// FEDGE 2.O — PortfolioScreen
// apps/mobile/app/(tabs)/portfolio.tsx
// ============================================

import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import {
  colors, typography, fontSize, spacing, radius,
  pnlColor, riskColor,
} from '../../src/theme';
import { useStore } from '../../src/store';
import type { Position, PortfolioSummary } from '@tradestreet/types';

// ── Mock data for demo ──────────────────────────────────────────────────────
const MOCK_SUMMARY: PortfolioSummary = {
  totalValue: 28_450.32,
  cash: 4_210.80,
  buyingPower: 8_421.60,
  dayPnl: { amount: 342.18, percent: 1.22 },
  totalPnl: { amount: 3_450.32, percent: 13.78 },
  positionsCount: 6,
  platform: 'alpaca',
  lastSynced: new Date().toISOString(),
};

const MOCK_POSITIONS: Position[] = [
  {
    id: '1', symbol: 'AAPL', assetClass: 'stocks',
    qty: 10, marketValue: 2_138.00, avgEntryPrice: 198.40, currentPrice: 213.80,
    unrealizedPnl: 154.00, unrealizedPnlPct: 7.76,
    fedgeRiskScore: 22, fedgeCommentary: 'Healthy position. Momentum favors upside.',
    platform: 'alpaca',
  },
  {
    id: '2', symbol: 'NVDA', assetClass: 'stocks',
    qty: 15, marketValue: 1_807.50, avgEntryPrice: 128.30, currentPrice: 120.50,
    unrealizedPnl: -117.00, unrealizedPnlPct: -6.08,
    fedgeRiskScore: 58, fedgeCommentary: 'Mild drawdown. Hold — AI cycle intact.',
    platform: 'alpaca',
  },
  {
    id: '3', symbol: 'BTC', assetClass: 'crypto',
    qty: 0.12, marketValue: 11_646.00, avgEntryPrice: 82_000, currentPrice: 97_050,
    unrealizedPnl: 1_806.00, unrealizedPnlPct: 18.35,
    fedgeRiskScore: 71, fedgeCommentary: 'Strong gain. Consider taking 25% off the table.',
    platform: 'alpaca',
  },
  {
    id: '4', symbol: 'SPY', assetClass: 'etf',
    qty: 5, marketValue: 2_607.50, avgEntryPrice: 505.00, currentPrice: 521.50,
    unrealizedPnl: 82.50, unrealizedPnlPct: 3.27,
    fedgeRiskScore: 18, fedgeCommentary: 'Safe anchor. No action needed.',
    platform: 'alpaca',
  },
  {
    id: '5', symbol: 'TSLA', assetClass: 'stocks',
    qty: 8, marketValue: 3_376.00, avgEntryPrice: 455.20, currentPrice: 422.00,
    unrealizedPnl: -265.60, unrealizedPnlPct: -7.29,
    fedgeRiskScore: 82, fedgeCommentary: '⚠ High risk. Stop-loss at $395 recommended.',
    platform: 'alpaca',
  },
];

function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score < 35) return 'LOW';
  if (score < 65) return 'MEDIUM';
  return 'HIGH';
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

interface PositionCardProps { position: Position }

function PositionCard({ position: p }: PositionCardProps) {
  const pnlPositive = p.unrealizedPnl >= 0;
  const riskLvl = getRiskLevel(p.fedgeRiskScore);

  return (
    <View style={styles.posCard}>
      {/* Top */}
      <View style={styles.posTop}>
        <View>
          <View style={styles.posSymbolRow}>
            <Text style={styles.posSymbol}>{p.symbol}</Text>
            <View style={styles.posAssetTag}>
              <Text style={styles.posAssetText}>{p.assetClass.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.posQty}>{p.qty} shares · ${fmt(p.currentPrice)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.posValue}>${fmt(p.marketValue)}</Text>
          <Text style={[styles.posPnl, { color: pnlColor(p.unrealizedPnl) }]}>
            {pnlPositive ? '+' : ''}{fmt(p.unrealizedPnl)} ({pnlPositive ? '+' : ''}{fmt(p.unrealizedPnlPct)}%)
          </Text>
        </View>
      </View>

      {/* Risk bar */}
      <View style={styles.riskRow}>
        <View style={styles.riskBarTrack}>
          <View style={[
            styles.riskBarFill,
            {
              width: `${p.fedgeRiskScore}%` as any,
              backgroundColor: riskColor(riskLvl),
            },
          ]} />
        </View>
        <View style={[styles.riskTag, { borderColor: riskColor(riskLvl) + '55', backgroundColor: riskColor(riskLvl) + '15' }]}>
          <Text style={[styles.riskTagText, { color: riskColor(riskLvl) }]}>{riskLvl}</Text>
        </View>
      </View>

      {/* FEDGE commentary */}
      <Text style={styles.fedgeCommentary}>🤖 {p.fedgeCommentary}</Text>
    </View>
  );
}

export default function PortfolioScreen() {
  const storePortfolio = useStore(s => s.summary);
  const storePositions = useStore(s => s.positions);
  const user = useStore(s => s.user);

  // Use mock for demo
  const summary = MOCK_SUMMARY;
  const positions = MOCK_POSITIONS;

  const dayPositive = summary.dayPnl.amount >= 0;
  const totalPositive = summary.totalPnl.amount >= 0;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>FEDGE 2.O</Text>
          <Text style={styles.headerTitle}>PORTFOLIO</Text>
        </View>
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>
            {summary.platform.toUpperCase()} · PAPER
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL VALUE</Text>
          <Text style={styles.summaryValue}>${fmt(summary.totalValue)}</Text>

          <View style={styles.pnlRow}>
            <View style={styles.pnlItem}>
              <Text style={styles.pnlLabel}>TODAY</Text>
              <Text style={[styles.pnlValue, { color: pnlColor(summary.dayPnl.amount) }]}>
                {dayPositive ? '+' : ''}{fmt(summary.dayPnl.amount)}
              </Text>
              <Text style={[styles.pnlPct, { color: pnlColor(summary.dayPnl.amount) }]}>
                {dayPositive ? '+' : ''}{fmt(summary.dayPnl.percent)}%
              </Text>
            </View>
            <View style={styles.pnlDivider} />
            <View style={styles.pnlItem}>
              <Text style={styles.pnlLabel}>ALL TIME</Text>
              <Text style={[styles.pnlValue, { color: pnlColor(summary.totalPnl.amount) }]}>
                {totalPositive ? '+' : ''}{fmt(summary.totalPnl.amount)}
              </Text>
              <Text style={[styles.pnlPct, { color: pnlColor(summary.totalPnl.amount) }]}>
                {totalPositive ? '+' : ''}{fmt(summary.totalPnl.percent)}%
              </Text>
            </View>
            <View style={styles.pnlDivider} />
            <View style={styles.pnlItem}>
              <Text style={styles.pnlLabel}>CASH</Text>
              <Text style={styles.pnlValue}>${fmt(summary.cash)}</Text>
              <Text style={styles.pnlPct}>BP ${fmt(summary.buyingPower)}</Text>
            </View>
          </View>
        </View>

        {/* Positions header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>POSITIONS ({positions.length})</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>+ NEW ORDER</Text>
          </TouchableOpacity>
        </View>

        {/* Positions */}
        {positions.map(pos => (
          <PositionCard key={pos.id} position={pos} />
        ))}

        {/* Risk summary */}
        <View style={styles.riskSummaryCard}>
          <Text style={styles.riskSummaryTitle}>🤖 FEDGE RISK SUMMARY</Text>
          <Text style={styles.riskSummaryText}>
            2 positions need attention: TSLA (HIGH risk) and NVDA (moderate drawdown).
            Consider trimming TSLA before earnings. BTC position showing strong gains — protect profits.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
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
  },
  platformBadge: {
    backgroundColor: colors.bg3,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  platformText: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },

  scrollContent: { padding: spacing.lg, paddingBottom: 100 },

  // Summary
  summaryCard: {
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryLabel: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontFamily: typography.mono.bold,
    fontSize: 40,
    color: colors.white,
    letterSpacing: -1,
    marginBottom: spacing.xl,
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pnlItem: { flex: 1, alignItems: 'center' },
  pnlDivider: { width: 1, height: 40, backgroundColor: colors.border },
  pnlLabel: {
    fontFamily: typography.mono.regular,
    fontSize: 8,
    color: colors.textDim,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  pnlValue: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  pnlPct: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  sectionAction: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 1,
  },

  // Position card
  posCard: {
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  posTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  posSymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 3,
  },
  posSymbol: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  posAssetTag: {
    backgroundColor: colors.bg4,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  posAssetText: {
    fontFamily: typography.mono.regular,
    fontSize: 8,
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  posQty: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  posValue: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  posPnl: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    marginTop: 2,
  },

  // Risk bar
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  riskBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  riskTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  riskTagText: {
    fontFamily: typography.mono.bold,
    fontSize: 8,
    letterSpacing: 1,
  },

  // FEDGE commentary
  fedgeCommentary: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },

  // Risk summary
  riskSummaryCard: {
    backgroundColor: colors.orangeGlow,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.orange + '33',
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  riskSummaryTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.orange,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  riskSummaryText: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 19,
  },
});
