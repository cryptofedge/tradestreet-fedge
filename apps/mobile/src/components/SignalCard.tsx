// ============================================
// FEDGE 2.O — Signal Card
// apps/mobile/src/components/SignalCard.tsx
// ============================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeInRight,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, fontSize, confidenceColor, riskColor } from '../theme';
import type { Signal } from '@tradestreet/types';

interface Props {
  signal: Signal;
  index?: number;
  onPress?: () => void;
}

export function SignalCard({ signal, index = 0, onPress }: Props) {
  const buyGlow = useSharedValue(0.3);
  const badgeScale = useSharedValue(1);

  useEffect(() => {
    if (signal.action === 'BUY' || signal.action === 'SELL') {
      buyGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sine) }),
          withTiming(0.3, { duration: 900, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        false
      );
      badgeScale.value = withRepeat(
        withSequence(
          withDelay(400, withTiming(1.06, { duration: 800 })),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    }
  }, [signal.action]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: buyGlow.value,
    shadowRadius: 12 * buyGlow.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const actionColor = signal.action === 'BUY' ? colors.green
    : signal.action === 'SELL' ? colors.red
    : colors.yellow;

  const confColor = confidenceColor(signal.confidence);

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).duration(280)}
      style={styles.wrapper}
    >
      <Pressable onPress={onPress} style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85 }
      ]}>
        {/* Orange left border accent */}
        <View style={styles.accentBar} />

        <View style={styles.body}>
          {/* Header row */}
          <View style={styles.header}>
            <View>
              <Text style={styles.ticker}>{signal.ticker}</Text>
              <Text style={styles.assetClass}>{signal.assetClass.toUpperCase()}</Text>
            </View>

            {/* Action badge with pulse */}
            <Animated.View style={[
              styles.actionBadge,
              { backgroundColor: actionColor + '22', borderColor: actionColor },
              glowStyle,
              { shadowColor: actionColor },
            ]}>
              <Animated.Text style={[styles.actionText, { color: actionColor }, badgeStyle]}>
                {signal.action}
              </Animated.Text>
            </Animated.View>
          </View>

          {/* Confidence bar */}
          <View style={styles.confRow}>
            <Text style={styles.label}>CONFIDENCE</Text>
            <Text style={[styles.confPct, { color: confColor }]}>
              {Math.round(signal.confidence * 100)}%
            </Text>
          </View>
          <View style={styles.confTrack}>
            <Animated.View
              style={[
                styles.confFill,
                {
                  width: `${signal.confidence * 100}%` as any,
                  backgroundColor: confColor,
                },
              ]}
            />
          </View>

          {/* Price levels */}
          <View style={styles.levels}>
            <PriceCell label="ENTRY" value={`$${signal.entryRange.low}–${signal.entryRange.high}`} color={colors.text} />
            <PriceCell label="STOP" value={`$${signal.stopLoss}`} color={colors.red} />
            <PriceCell label="TARGET" value={`$${signal.targetPrice}`} color={colors.green} />
          </View>

          {/* Risk + reasoning */}
          <View style={styles.footer}>
            <View style={[styles.riskBadge, { borderColor: riskColor(signal.riskLevel) }]}>
              <Text style={[styles.riskText, { color: riskColor(signal.riskLevel) }]}>
                {signal.riskLevel} RISK
              </Text>
            </View>
            <Text style={styles.reasoning} numberOfLines={2}>
              {signal.reasoning}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function PriceCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.priceCell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.priceValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: spacing.lg, marginVertical: spacing.sm },
  card: {
    backgroundColor: colors.bg3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: { width: 3, backgroundColor: colors.orange },
  body: { flex: 1, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  ticker: { fontFamily: typography.mono.bold, fontSize: fontSize.xxl, color: colors.white },
  assetClass: { fontFamily: typography.mono.regular, fontSize: fontSize.tiny, color: colors.textMuted, letterSpacing: 2, marginTop: 2 },
  actionBadge: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    shadowOffset: { width: 0, height: 0 },
  },
  actionText: { fontFamily: typography.mono.bold, fontSize: fontSize.base, letterSpacing: 2 },
  confRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  label: { fontFamily: typography.mono.regular, fontSize: fontSize.tiny, color: colors.textDim, letterSpacing: 1.5 },
  confPct: { fontFamily: typography.mono.bold, fontSize: fontSize.tiny },
  confTrack: { height: 3, backgroundColor: colors.bg4, borderRadius: 2, marginBottom: spacing.md },
  confFill: { height: 3, borderRadius: 2 },
  levels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  priceCell: {},
  priceValue: { fontFamily: typography.mono.medium, fontSize: fontSize.sm, marginTop: 3 },
  footer: { gap: spacing.sm },
  riskBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  riskText: { fontFamily: typography.mono.regular, fontSize: fontSize.tiny, letterSpacing: 1.5 },
  reasoning: { fontFamily: typography.mono.regular, fontSize: fontSize.tiny, color: colors.textMuted, lineHeight: 16 },
});
