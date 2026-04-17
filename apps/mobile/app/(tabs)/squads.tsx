// ============================================
// FEDGE 2.O — SquadsScreen
// apps/mobile/app/(tabs)/squads.tsx
// ============================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { colors, typography, fontSize, spacing, radius } from '../../src/theme';
import { useStore } from '../../src/store';
import type { LeaderboardEntry } from '@tradestreet/types';

// ── Mock data for demo ──────────────────────────────────────────────────────
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, displayName: 'Trader #001', weekReturnPct: 14.82, badge: 'STREAK_30', isCurrentUser: false },
  { rank: 2, displayName: 'Trader #047', weekReturnPct: 11.34, badge: 'SQUAD_WINNER', isCurrentUser: false },
  { rank: 3, displayName: 'Trader #219', weekReturnPct: 9.67, badge: 'FIRST_PROFIT', isCurrentUser: false },
  { rank: 4, displayName: 'YOU', weekReturnPct: 7.44, badge: 'STREAK_7', isCurrentUser: true },
  { rank: 5, displayName: 'Trader #088', weekReturnPct: 6.91, badge: null, isCurrentUser: false },
  { rank: 6, displayName: 'Trader #304', weekReturnPct: 5.23, badge: 'FIRST_TRADE', isCurrentUser: false },
  { rank: 7, displayName: 'Trader #156', weekReturnPct: 4.18, badge: null, isCurrentUser: false },
  { rank: 8, displayName: 'Trader #072', weekReturnPct: 3.55, badge: null, isCurrentUser: false },
];

const MOCK_SQUAD_MEMBERS = [
  { name: 'YOU', returnPct: 7.44, rank: 1, isMe: true },
  { name: 'Trader #B', returnPct: 5.12, rank: 2, isMe: false },
  { name: 'Trader #C', returnPct: 3.88, rank: 3, isMe: false },
  { name: 'Trader #D', returnPct: -1.22, rank: 4, isMe: false },
];

const BADGE_ICONS: Record<string, string> = {
  STREAK_30: '👑',
  SQUAD_WINNER: '🏆',
  FIRST_PROFIT: '💰',
  STREAK_7: '🔥',
  FIRST_TRADE: '⚡',
};

type Tab = 'leaderboard' | 'squad';

export default function SquadsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [inviteCode, setInviteCode] = useState('');
  const user = useStore(s => s.user);
  const gameProfile = useStore(s => s.profile);
  const isPro = user?.tier === 'pro';
  const level = gameProfile?.level ?? user?.level ?? 1;
  const hasSquad = true; // demo: user is in a squad

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>FEDGE 2.O</Text>
          <Text style={styles.headerTitle}>THE STREET</Text>
        </View>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#4 GLOBAL</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['leaderboard', 'squad'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'leaderboard' ? 'HUSTLE BOARD' : 'MY SQUAD'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── LEADERBOARD TAB ── */}
      {activeTab === 'leaderboard' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionSub}>Weekly % return · Anonymized · Top 100</Text>

          {/* Top 3 podium */}
          <View style={styles.podium}>
            {/* 2nd */}
            <View style={[styles.podiumItem, styles.podiumSecond]}>
              <Text style={styles.podiumRank}>#2</Text>
              <Text style={styles.podiumName}>{MOCK_LEADERBOARD[1].displayName}</Text>
              <Text style={[styles.podiumReturn, { color: colors.green }]}>
                +{MOCK_LEADERBOARD[1].weekReturnPct}%
              </Text>
              {MOCK_LEADERBOARD[1].badge && (
                <Text style={styles.podiumBadge}>{BADGE_ICONS[MOCK_LEADERBOARD[1].badge!]}</Text>
              )}
            </View>
            {/* 1st */}
            <View style={[styles.podiumItem, styles.podiumFirst]}>
              <Text style={styles.podiumCrown}>👑</Text>
              <Text style={styles.podiumRank}>#1</Text>
              <Text style={styles.podiumName}>{MOCK_LEADERBOARD[0].displayName}</Text>
              <Text style={[styles.podiumReturn, { color: colors.green }]}>
                +{MOCK_LEADERBOARD[0].weekReturnPct}%
              </Text>
            </View>
            {/* 3rd */}
            <View style={[styles.podiumItem, styles.podiumThird]}>
              <Text style={styles.podiumRank}>#3</Text>
              <Text style={styles.podiumName}>{MOCK_LEADERBOARD[2].displayName}</Text>
              <Text style={[styles.podiumReturn, { color: colors.green }]}>
                +{MOCK_LEADERBOARD[2].weekReturnPct}%
              </Text>
              {MOCK_LEADERBOARD[2].badge && (
                <Text style={styles.podiumBadge}>{BADGE_ICONS[MOCK_LEADERBOARD[2].badge!]}</Text>
              )}
            </View>
          </View>

          {/* Rest of leaderboard */}
          {MOCK_LEADERBOARD.slice(3).map(entry => (
            <View
              key={entry.rank}
              style={[styles.leaderRow, entry.isCurrentUser && styles.leaderRowMe]}
            >
              <Text style={[styles.leaderRank, entry.isCurrentUser && styles.leaderRankMe]}>
                #{entry.rank}
              </Text>
              <View style={styles.leaderInfo}>
                <Text style={[styles.leaderName, entry.isCurrentUser && styles.leaderNameMe]}>
                  {entry.displayName}
                </Text>
                {entry.badge && (
                  <Text style={styles.leaderBadgeIcon}>{BADGE_ICONS[entry.badge]}</Text>
                )}
              </View>
              <Text style={[styles.leaderReturn, {
                color: entry.weekReturnPct >= 0 ? colors.green : colors.red
              }]}>
                {entry.weekReturnPct >= 0 ? '+' : ''}{entry.weekReturnPct}%
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── SQUAD TAB ── */}
      {activeTab === 'squad' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {hasSquad ? (
            <>
              {/* Squad header */}
              <View style={styles.squadCard}>
                <View style={styles.squadCardHeader}>
                  <Text style={styles.squadName}>ALPHA WOLVES 🐺</Text>
                  <View style={styles.squadInviteRow}>
                    <Text style={styles.squadInviteLabel}>INVITE CODE</Text>
                    <Text style={styles.squadInviteCode}>WOLF-X4K2</Text>
                  </View>
                </View>
                <View style={styles.squadStats}>
                  <View style={styles.squadStat}>
                    <Text style={styles.squadStatValue}>4/6</Text>
                    <Text style={styles.squadStatLabel}>MEMBERS</Text>
                  </View>
                  <View style={styles.squadStat}>
                    <Text style={[styles.squadStatValue, { color: colors.green }]}>+6.31%</Text>
                    <Text style={styles.squadStatLabel}>WEEK AVG</Text>
                  </View>
                  <View style={styles.squadStat}>
                    <Text style={styles.squadStatValue}>#12</Text>
                    <Text style={styles.squadStatLabel}>RANK</Text>
                  </View>
                </View>
              </View>

              {/* Members */}
              <Text style={styles.membersTitle}>SQUAD MEMBERS</Text>
              {MOCK_SQUAD_MEMBERS.map((m, i) => (
                <View key={i} style={[styles.memberRow, m.isMe && styles.memberRowMe]}>
                  <View style={styles.memberRankBox}>
                    <Text style={styles.memberRankText}>#{m.rank}</Text>
                  </View>
                  <Text style={[styles.memberName, m.isMe && styles.memberNameMe]}>
                    {m.name}
                  </Text>
                  <Text style={[styles.memberReturn, {
                    color: m.returnPct >= 0 ? colors.green : colors.red
                  }]}>
                    {m.returnPct >= 0 ? '+' : ''}{m.returnPct}%
                  </Text>
                </View>
              ))}

              {/* Add member */}
              <View style={styles.addMemberCard}>
                <Text style={styles.addMemberTitle}>INVITE A TRADER</Text>
                <Text style={styles.addMemberSub}>Share your squad code: WOLF-X4K2</Text>
                <TouchableOpacity style={styles.shareButton}>
                  <Text style={styles.shareButtonText}>SHARE INVITE CODE</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // No squad
            <View style={styles.noSquadContainer}>
              <Text style={styles.noSquadIcon}>🏆</Text>
              <Text style={styles.noSquadTitle}>JOIN THE COMPETITION</Text>
              <Text style={styles.noSquadDesc}>
                Squads are 3–6 traders competing on weekly % returns.
                Create yours at Level 3 + Pro, or join with a code.
              </Text>

              {/* Join with code */}
              <View style={styles.joinBox}>
                <Text style={styles.joinLabel}>JOIN WITH CODE</Text>
                <View style={styles.joinInputRow}>
                  <TextInput
                    style={styles.joinInput}
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    placeholder="XXXX-XXXX"
                    placeholderTextColor={colors.textDim}
                    autoCapitalize="characters"
                    maxLength={9}
                  />
                  <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>JOIN</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Create squad */}
              {level >= 3 && isPro ? (
                <TouchableOpacity style={styles.createButton}>
                  <Text style={styles.createButtonText}>CREATE MY SQUAD</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.createLocked}>
                  <Text style={styles.createLockedText}>
                    🔒 Squad creation unlocks at Level 3 + Pro
                  </Text>
                  <Text style={styles.createLockedSub}>
                    You're Level {level}. {level < 3 ? `${3 - level} more level${3 - level > 1 ? 's' : ''} to go.` : 'Upgrade to Pro to create.'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
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
  rankBadge: {
    backgroundColor: colors.orangeGlow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.orange + '44',
  },
  rankText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 1,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.orange,
  },
  tabText: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 1.5,
  },
  tabTextActive: {
    color: colors.orange,
  },

  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  sectionSub: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 0.5,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },

  // Podium
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  podiumItem: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 3,
  },
  podiumFirst: {
    borderColor: colors.yellow + '66',
    backgroundColor: colors.bg3,
    paddingTop: spacing.xl,
    flex: 1.1,
  },
  podiumSecond: {
    paddingTop: spacing.lg,
  },
  podiumThird: {
    paddingTop: spacing.md,
  },
  podiumCrown: {
    fontSize: 20,
    marginBottom: 2,
  },
  podiumRank: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.yellow,
    letterSpacing: 1,
  },
  podiumName: {
    fontFamily: typography.mono.medium,
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
  },
  podiumReturn: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.md,
  },
  podiumBadge: { fontSize: 12 },

  // Leaderboard rows
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  leaderRowMe: {
    borderColor: colors.orange + '66',
    backgroundColor: colors.orangeGlow,
  },
  leaderRank: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    width: 30,
  },
  leaderRankMe: {
    color: colors.orange,
  },
  leaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  leaderName: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  leaderNameMe: {
    color: colors.orange,
    fontFamily: typography.mono.bold,
  },
  leaderBadgeIcon: { fontSize: 13 },
  leaderReturn: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
  },

  // Squad card
  squadCard: {
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  squadCardHeader: { marginBottom: spacing.xl },
  squadName: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xl,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  squadInviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  squadInviteLabel: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 1,
  },
  squadInviteCode: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.orange,
    letterSpacing: 2,
  },
  squadStats: {
    flexDirection: 'row',
  },
  squadStat: { flex: 1, alignItems: 'center' },
  squadStatValue: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  squadStatLabel: {
    fontFamily: typography.mono.regular,
    fontSize: 8,
    color: colors.textDim,
    letterSpacing: 1.5,
    marginTop: 2,
  },

  // Members
  membersTitle: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  memberRowMe: {
    borderColor: colors.orange + '55',
    backgroundColor: colors.orangeGlow,
  },
  memberRankBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberRankText: {
    fontFamily: typography.mono.bold,
    fontSize: 9,
    color: colors.textMuted,
  },
  memberName: {
    flex: 1,
    fontFamily: typography.mono.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  memberNameMe: {
    color: colors.orange,
    fontFamily: typography.mono.bold,
  },
  memberReturn: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.md,
  },

  // Add member
  addMemberCard: {
    backgroundColor: colors.bg3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border2,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  addMemberTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: 1,
  },
  addMemberSub: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  shareButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.sm,
  },
  shareButtonText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.white,
    letterSpacing: 1,
  },

  // No squad
  noSquadContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  noSquadIcon: { fontSize: 48, marginBottom: spacing.xl },
  noSquadTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xl,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  noSquadDesc: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxxl,
  },
  joinBox: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
  },
  joinLabel: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  joinInput: {
    flex: 1,
    backgroundColor: colors.bg3,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    letterSpacing: 2,
  },
  joinButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.white,
    letterSpacing: 1,
  },
  createButton: {
    alignSelf: 'stretch',
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.base,
    color: colors.white,
    letterSpacing: 1,
  },
  createLocked: {
    alignSelf: 'stretch',
    backgroundColor: colors.bg3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  createLockedText: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  createLockedSub: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    textAlign: 'center',
  },
});
