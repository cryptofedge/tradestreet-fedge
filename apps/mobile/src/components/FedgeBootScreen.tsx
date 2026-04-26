// ============================================
// FEDGE 2.O — Boot / Splash Screen
// apps/mobile/src/components/FedgeBootScreen.tsx
//
// Renamed from SplashScreen to avoid collision
// with expo-splash-screen import in _layout.tsx
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography, fontSize, spacing } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

const BOOT_LINES = [
  'INITIALIZING FEDGE CORE v2.0.1...',
  'CONNECTING TO MARKETS...',
  'LOADING SIGNAL ENGINE...',
  'ALPACA PAPER TRADING: READY',
  'FEDGE BRAIN: ONLINE',
];

interface Props { onDone?: () => void; duration?: number; }

function TypewriterSubtitle({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, 36);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, startDelay]);
  return (
    <Text style={styles.subtitle}>{displayed}</Text>
  );
}

function ScanLine() {
  const translateY = useSharedValue(-H * 0.6);
  useEffect(() => {
    translateY.value = -H * 0.6;
    translateY.value = withRepeat(
      withTiming(H * 0.6, { duration: 2400, easing: Easing.linear }),
      -1, false
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={[styles.scanLine, style]} pointerEvents="none" />;
}

export function FedgeBootScreen({ onDone, duration = 3800 }: Props) {
  const containerOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);
  const glowOpacity = useSharedValue(0);
  const [bootIndex, setBootIndex] = useState(0);

  useEffect(() => {
    // Content reveal
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    contentY.value = withDelay(300, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    // Orange glow pulse on FEDGE badge
    glowOpacity.value = withDelay(700, withRepeat(
      withSequence(
        withTiming(1, { duration: 1100 }),
        withTiming(0.3, { duration: 1100 })
      ), -1, false
    ));

    // Boot log ticker
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setBootIndex(idx);
      if (idx >= BOOT_LINES.length) clearInterval(interval);
    }, 520);

    // Auto-exit
    const exitTimeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400 }, () => {
        if (onDone) runOnJS(onDone)();
      });
    }, duration);

    return () => { clearInterval(interval); clearTimeout(exitTimeout); };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScanLine />

      {/* Corner brackets */}
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerBR]} />

      {/* Center logo — matches onboarding hierarchy */}
      <Animated.View style={[styles.logoWrap, contentStyle]}>
        {/* FEDGE 2.O — small badge (matches onboarding fedgeBadge style) */}
        <Animated.View style={[styles.fedgeBadgeWrap, glowStyle]}>
          <Text style={styles.fedgeBadge}>FEDGE 2.O</Text>
        </Animated.View>

        {/* TRADESTREET — hero title (matches onboarding heroTitle style) */}
        <Text style={styles.heroTitle}>TRADE{'\n'}STREET</Text>

        <View style={styles.divider} />

        {/* Typewriter subtitle */}
        <TypewriterSubtitle
          text="TRADING INTELLIGENCE ONLINE"
          startDelay={800}
        />
      </Animated.View>

      {/* Boot log */}
      <View style={styles.bootLog}>
        {BOOT_LINES.slice(0, bootIndex).map((line, i) => (
          <Text key={i} style={[
            styles.bootLine,
            i === bootIndex - 1 && styles.bootLineActive,
          ]}>
            {i === bootIndex - 1 ? `> ${line}` : `  ${line}`}
          </Text>
        ))}
      </View>

      <Text style={styles.version}>v2.0.1 · ECLAT UNIVERSE</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: W,
    height: H,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  scanLine: {
    position: 'absolute',
    width: W,
    height: 2,
    backgroundColor: colors.orange,
    opacity: 0.07,
    zIndex: 1,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.orange,
    opacity: 0.35,
  },
  cornerTL: { top: 44, left: 24, borderTopWidth: 1, borderLeftWidth: 1 },
  cornerBR: { bottom: 44, right: 24, borderBottomWidth: 1, borderRightWidth: 1 },
  logoWrap: { alignItems: 'center', zIndex: 2 },
  fedgeBadgeWrap: {
    marginBottom: spacing.md,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
  },
  fedgeBadge: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 4,
  },
  heroTitle: {
    fontFamily: typography.mono.bold,
    fontSize: 56,
    color: colors.white,
    lineHeight: 58,
    letterSpacing: -1,
    textAlign: 'center',
  },
  divider: {
    width: 180,
    height: 1,
    backgroundColor: colors.orange,
    opacity: 0.35,
    marginVertical: spacing.lg,
  },
  subtitle: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.tiny,
    color: colors.orange,
    letterSpacing: 4,
  },
  bootLog: {
    position: 'absolute',
    bottom: 80,
    left: spacing.xxl,
    right: spacing.xxl,
    gap: 4,
  },
  bootLine: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.tiny,
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  bootLineActive: { color: colors.orange },
  version: {
    position: 'absolute',
    bottom: spacing.xxl,
    fontFamily: typography.mono.regular,
    fontSize: fontSize.tiny,
    color: colors.textDim,
    letterSpacing: 2,
  },
});
