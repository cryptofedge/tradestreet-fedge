// ============================================
// FEDGE 2.O — Leaderboard Row
// apps/mobile/src/components/LeaderboardItem.tsx
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { colors, typography, spacing, radius, fontSize } from '../theme';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  weekReturnPct: number;
  isCurrentUser: boolean;
  badge?: string | null;
}

interface Props {
  entry: LeaderboardEntry;
  index: number;
}

const MEDAL: Record<number, { color: string; label: string }> = {
  1: { color: '#FFD700', label: '01' },
  2: { color: '#C0C0C0', label: '02' },
  3: { color: '#CD7F32', label: '03' },
};

export function LeaderboardItem({ entry, index }: Props) {
  const { rank, displayName, weekReturnPct, isCurrentUser } = entry;
  const medal = MEDAL[rank];
  const returnColor = weekReturnPct >= 0 ? colors.green : colors.red;
  const returnStr = `${weekReturnPct >= 0 ? '+' : ''}${weekReturnPct.toFixed(1)}%`;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 40).duration(250)}
      style={[styles.row, isCurrentUser && styles.currentUser]}
    >
      {/* Current user orange left bar */}
      {isCurrentUser && <View style={styles.currentBar} />}

      {/* Rank */}
      <View style={styles.rankCell}>
        {medal ? (
          <Text style={[styles.medalRank, { color: medal.color }]}>
            #{medal.label}
          </Text>
        ) : (
          <Text style={[styles.rank, rank <= 10 ? styles.rankTop : null]}>
            #{String(rank).padStart(2, '0')}
          </Text>
        )}
      </View>

      {/* Avatar dot */}
      <View style={[
        styles.avatar,
        { backgroundColor: isCurrentUser ? colors.orange + '33' : colors.bg4 },
        { borderColor: isCurrentUser ? colors.orange : colors.border },
      ]}>
        <Text style={[styles.avatarLetter, { color: isCurrentUser ? colors.orange : colors.textMuted }]}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Name */}
      <Text style={[styles.name, isCurrentUser && styles.nameCurrent]} numberOfLines={1}>
        {isCurrentUser ? 'YOU' : displayName}
      </Text>

      {/* Return */}
      <View style={[styles.returnBadge, { backgroundColor: returnColor + '18' }]}>
        <Text style={[styles.returnText, { color: returnColor }]}>{returnStr}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: 3,
    backgroundColor: colors.bg3,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden',
  },
  currentUser: {
    borderColor: colors.orange + '55',
    backgroundColor: colors.orange + '08',
  },
  currentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.orange,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  rankCell: { width: 36 },
  rank: { fontFamily: typography.mono.medium, fontSize: fontSize.sm, color: colors.textMuted },
  rankTop: { color: colors.text },
  medalRank: { fontFamily: typography.mono.bold, fontSize: fontSize.sm },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: typography.mono.bold, fontSize: fontSize.sm },
  name: {
    flex: 1,
    fontFamily: typography.mono.medium,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  nameCurrent: { color: colors.orange },
  returnBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  returnText: { fontFamily: typography.mono.bold, fontSize: fontSize.sm },
});
