// ============================================
// FEDGE 2.O — MissionsScreen
// apps/mobile/app/(tabs)/missions.tsx
// ============================================

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, fontSize, spacing, radius } from '../../src/theme';
import { useStore } from '../../src/store';
import type { Mission } from '@tradestreet/types';

// ── Mock data for demo ──────────────────────────────────────────────────────
const MOCK_MISSIONS: Mission[] = [
  {
    id: '1', userId: 'u1', type: 'TRADE',
    title: 'Execute the Signal',
    description: 'Buy at least 1 share of AAPL based on today\'s BUY signal from FEDGE.',
    xpReward: 150, status: 'ACTIVE', progress: 0,
    expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
    completedAt: null, generatedBy: 'FEDGE Brain v2',
  },
  {
    id: '2', userId: 'u1', type: 'HOLD',
    title: 'Diamond Hands',
    description: 'Hold your BTC position through end of day without selling.',
    xpReward: 100, status: 'ACTIVE', progress: 65,
    expiresAt: new Date(Date.now() + 6 * 3600_000).toISOString(),
    completedAt: null, generatedBy: 'FEDGE Brain v2',
  },
  {
    id: '3', userId: 'u1', type: 'RESEARCH',
    title: 'Study the Market',
    description: 'Review all 5 signals in your feed before market close.',
    xpReward: 75, status: 'COMPLETED', progress: 100,
    expiresAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    generatedBy: 'FEDGE Brain v2',
  },
];

const MOCK_BADGES = ['FIRST_TRADE', 'STREAK_7', 'FIRST_PROFIT'];

const MISSION_TYPE_COLORS: Record<string, string> = {
  TRADE: colors.orange,
  HOLD: colors.blue,
  RESEARCH: colors.purple,
  DIVERSIFY: colors.green,
  LEARN: colors.yellow,
};

const MISSION_TYPE_ICONS: Record<string, string> = {
  TRADE: '⚡',
  HOLD: '💎',
  RESEARCH: '🔍',
  DIVERSIFY: '🌐',
  LEARN: '📚',
};

function timeLeft(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'EXPIRED';
  const h = Math.floor(diff / 3600_000);
  const m = Math.floor((diff % 3600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

interface MissionCardProps {
  mission: Mission;
  onComplete: (id: string) => void;
}

function MissionCard({ mission: m, onComplete }: MissionCardProps) {
  const typeColor = MISSION_TYPE_COLORS[m.type];
  const typeIcon = MISSION_TYPE_ICONS[m.type];
  const isCompleted = m.status === 'COMPLETED';

  return (
    <View style={[styles.mCard, isCompleted && styles.mCardCompleted]}>
      {/* Header */}
      <View style={styles.mHeader}>
        <View style={[styles.mTypeTag, { backgroundColor: typeColor + '20', borderColor: typeColor + '55' }]}>
          <Text style={styles.mTypeIcon}>{typeIcon}</Text>
          <Text style={[styles.mTypeText, { color: typeColor }]}>{m.type}</Text>
        </View>
        <View style={styles.mHeaderRight}>
          <Text style={styles.mXp}>+{m.xpReward} XP</Text>
          {isCompleted && <Text style={styles.mCheckmark}>✓</Text>}
        </View>
      </View>

      {/* Content */}
      <Text style={[styles.mTitle, isCompleted && styles.mTitleCompleted]}>{m.title}</Text>
      <Text style={styles.mDesc}>{m.description}</Text>

      {/* Progress */}
      {!isCompleted && (
        <>
          <View style={styles.mProgressRow}>
            <View style={styles.mProgressTrack}>
              <View style={[styles.mProgressFill, { width: `${m.progress}%` as any, backgroundColor: typeColor }]} />
            </View>
            <Text style={[styles.mProgressPct, { color: typeColor }]}>{m.progress}%</Text>
          </View>
          <View style={styles.mFooter}>
            <Text style={styles.mTimeLeft}>{timeLeft(m.expiresAt)}</Text>
            <Text style={styles.mGeneratedBy}>{m.generatedBy}</Text>
          </View>
        </>
      )}

      {isCompleted && (
        <View style={styles.mCompletedRow}>
          <Text style={styles.mCompletedText}>COMPLETED · +{m.xpReward} XP EARNED</Text>
        </View>
      )}
    </View>
  );
}

export default function MissionsScreen() {
  const storeMissions = useStore(s => s.daily);
  const completeMission = useStore(s => s.completeMission);
  const gameProfile = useStore(s => s.profile);
  const user = useStore(s => s.user);

  const missions = MOCK_MISSIONS;
  const level = gameProfile?.level ?? user?.level ?? 1;
  const xpCurrent = gameProfile?.xpCurrent ?? user?.xp ?? 340;
  const xpNextLevel = gameProfile?.xpNextLevel ?? 400;
  const streakDays = gameProfile?.streakDays ?? user?.streakDays ?? 3;
  const xpPct = Math.min((xpCurrent / xpNextLevel) * 100, 100);

  const completed = missions.filter(m => m.status === 'COMPLETED').length;
  const total = missions.length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>FEDGE 2.O</Text>
          <Text style={styles.headerTitle}>DAILY OPS</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakNum}>{streakDays}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* XP Progress */}
        <View style={styles.xpCard}>
          <View style={styles.xpTop}>
            <View>
              <Text style={styles.xpLabel}>LEVEL {level}</Text>
              <Text style={styles.xpValue}>{xpCurrent.toLocaleString()} XP</Text>
            </View>
            <View style={styles.xpRight}>
              <Text style={styles.xpNextLabel}>NEXT LEVEL</Text>
              <Text style={styles.xpNext}>{xpNextLevel.toLocaleString()} XP</Text>
            </View>
          </View>
          <View style={styles.xpBarTrack}>
            <View style={[styles.xpBarFill, { width: `${xpPct}%` as any }]} />
          </View>
          <Text style={styles.xpSubtext}>
            {(xpNextLevel - xpCurrent).toLocaleString()} XP to Level {level + 1}
          </Text>
        </View>

        {/* Missions progress */}
        <View style={styles.missionsSummary}>
          <Text style={styles.missionsSummaryText}>
            {completed}/{total} MISSIONS COMPLETE
          </Text>
          <View style={styles.missionsDots}>
            {missions.map((m, i) => (
              <View
                key={i}
                style={[styles.missionDot, m.status === 'COMPLETED' && styles.missionDotDone]}
              />
            ))}
          </View>
        </View>

        {/* Mission cards */}
        {missions.map(m => (
          <MissionCard key={m.id} mission={m} onComplete={completeMission} />
        ))}

        {/* Badges */}
        <View style={styles.badgesSection}>
          <Text style={styles.badgesTitle}>BADGES EARNED</Text>
          <View style={styles.badgesGrid}>
            {[
              { id: 'FIRST_TRADE', icon: '⚡', label: 'First Trade' },
              { id: 'STREAK_7', icon: '🔥', label: '7 Day Streak' },
              { id: 'FIRST_PROFIT', icon: '💰', label: 'First Profit' },
              { id: 'SURVIVED_CRASH', icon: '💎', label: 'Survived Crash', locked: true },
              { id: 'SQUAD_WINNER', icon: '🏆', label: 'Squad Winner', locked: true },
              { id: 'STREAK_30', icon: '👑', label: '30 Day Streak', locked: true },
            ].map(badge => (
              <View key={badge.id} style={[styles.badgeCard, badge.locked && styles.badgeCardLocked]}>
                <Text style={[styles.badgeIcon, badge.locked && { opacity: 0.3 }]}>{badge.icon}</Text>
                <Text style={[styles.badgeLabel, badge.locked && styles.badgeLabelLocked]}>{badge.label}</Text>
                {badge.locked && <Text style={styles.badgeLockIcon}>🔒</Text>}
              </View>
            ))}
          </View>
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg3,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.yellow + '44',
    gap: 4,
  },
  streakFire: { fontSize: 16 },
  streakNum: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.lg,
    color: colors.yellow,
  },

  scrollContent: { padding: spacing.lg, paddingBottom: 100 },

  // XP Card
  xpCard: {
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  xpTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  xpLabel: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 2,
    marginBottom: 2,
  },
  xpValue: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xxxl,
    color: colors.white,
    letterSpacing: -1,
  },
  xpRight: { alignItems: 'flex-end' },
  xpNextLabel: {
    fontFamily: typography.mono.regular,
    fontSize: 8,
    color: colors.textDim,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  xpNext: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  xpBarTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 3,
  },
  xpSubtext: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },

  // Missions summary
  missionsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  missionsSummaryText: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  missionsDots: { flexDirection: 'row', gap: spacing.xs },
  missionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border2,
  },
  missionDotDone: {
    backgroundColor: colors.green,
  },

  // Mission card
  mCard: {
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  mCardCompleted: {
    opacity: 0.6,
  },
  mHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  mTypeIcon: { fontSize: 11 },
  mTypeText: {
    fontFamily: typography.mono.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
  mHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mXp: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.orange,
  },
  mCheckmark: {
    fontSize: 16,
    color: colors.green,
  },
  mTitle: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.lg,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  mTitleCompleted: {
    color: colors.textMuted,
  },
  mDesc: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  mProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  mProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  mProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  mProgressPct: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    width: 32,
    textAlign: 'right',
  },
  mFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mTimeLeft: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  mGeneratedBy: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    opacity: 0.6,
  },
  mCompletedRow: {
    backgroundColor: colors.greenDim,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.green + '33',
  },
  mCompletedText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: 1,
    textAlign: 'center',
  },

  // Badges
  badgesSection: { marginTop: spacing.sm },
  badgesTitle: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeCard: {
    width: '30%',
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIcon: { fontSize: 24 },
  badgeLabel: {
    fontFamily: typography.mono.medium,
    fontSize: 9,
    color: colors.text,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: colors.textDim,
  },
  badgeLockIcon: {
    fontSize: 10,
    position: 'absolute',
    top: 6,
    right: 6,
  },
});
