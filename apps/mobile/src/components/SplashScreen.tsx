// ============================================
// FEDGE 2.O — Boot / Splash Screen
// apps/mobile/src/components/SplashScreen.tsx
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

const SUBTITLE = 'TRADING INTELLIGENCE ONLINE';
const BOOT_LINES = [
  'INITIALIZING FEDGE CORE v2.0.1...',
  'CONNECTING TO MARKETS...',
  'LOADING SIGNAL ENGINE...',
  'ALPACA PAPER TRADING: READY',
  'FEDGE BRAIN: ONLINE',
];

interface Props { onDone?: () => void; duration?: number; }

function TypewriterText({ text, startDelay = 0, color = colors.textMuted, style }: {
  text: string; startDelay?: number; color?: string; style?: any;
}) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, 38);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, startDelay]);

  return <Text style={[{ color, fontFamily: typography.mono.regular }, style]}>{displayed}</Text>;
}

function ScanLine() {
  const translateY = useSharedValue(-H * 0.6);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(H * 0.6, { duration: 2200, easing: Easing.linear }),
      -1,
      false
    );
    translateY.value = -H * 0.6;
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.scanLine, style]} pointerEvents="none" />
  );
}

export function SplashScreen({ onDone, duration = 3800 }: Props) {
  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const glowOpacity = useSharedValue(0);
  const [bootIndex, setBootIndex] = useState(0);

  useEffect(() => {
    // Logo reveal
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    logoScale.value = withDelay(200, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    glowOpacity.value = withDelay(500, withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.4, { duration: 1200 })
      ), -1, false
    ));

    // Boot lines ticker
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setBootIndex(idx);
      if (idx >= BOOT_LINES.length) clearInterval(interval);
    }, 500);

    // Auto-exit
    const exitTimeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400 }, () => {
        if (onDone) runOnJS(onDone)();
      });
    }, duration);

    return () => { clearInterval(interval); clearTimeout(exitTimeout); };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScanLine />

      {/* Corner decorations */}
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerBR]} />

      {/* Center content */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        {/* Glow behind logo */}
        <Animated.View style={[styles.logoGlow, glowStyle]} />

        <Text style={styles.logoText}>FEDGE 2.O</Text>
        <View style={styles.divider} />
        <TypewriterText
          text={SUBTITLE}
          startDelay={700}
          color={colors.orange}
          style={styles.subtitle}
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

      {/* Version */}
      <Text style={styles.version}>v2.0.1 · ECLAT UNIVERSE</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    inset: 0,
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
    opacity: 0.06,
    zIndex: 1,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.orange,
    opacity: 0.4,
  },
  cornerTL: { top: 40, left: 24, borderTopWidth: 1, borderLeftWidth: 1 },
  cornerBR: { bottom: 40, right: 24, borderBottomWidth: 1, borderRightWidth: 1 },
  logoWrap: { alignItems: 'center', zIndex: 2 },
  logoGlow: {
    position: 'absolute',
    width: 240,
    height: 80,
    backgroundColor: colors.orange,
    opacity: 0.06,
    borderRadius: 40,
    filter: [{ blur: 40 }] as any,
  },
  logoText: {
    fontFamily: typography.mono.bold,
    fontSize: 52,
    color: colors.white,
    letterSpacing: 6,
  },
  divider: {
    width: 180,
    height: 1,
    backgroundColor: colors.orange,
    opacity: 0.4,
    marginVertical: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.tiny,
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
