// ============================================
// FEDGE 2.O — XP Level-Up Celebration
// apps/mobile/src/components/XPLevelUp.tsx
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, fontSize, spacing } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

interface Particle { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; }

const PARTICLE_COLORS = [colors.orange, colors.yellow, '#FFD700', colors.green, colors.white];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: W / 2,
    y: H / 2,
    vx: (Math.random() - 0.5) * 280,
    vy: -(Math.random() * 300 + 80),
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    size: Math.random() * 6 + 3,
  }));
}

function ParticleView({ p, trigger }: { p: Particle; trigger: number }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (!trigger) return;
    x.value = 0; y.value = 0; opacity.value = 1; scale.value = 1;
    x.value = withTiming(p.vx, { duration: 900, easing: Easing.out(Easing.cubic) });
    y.value = withTiming(p.vy + 200, { duration: 900, easing: Easing.in(Easing.quad) });
    opacity.value = withDelay(400, withTiming(0, { duration: 500 }));
    scale.value = withTiming(0.3, { duration: 900 });
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: W / 2 - p.size / 2,
    top: H / 2 - p.size / 2,
    width: p.size,
    height: p.size,
    borderRadius: p.size / 2,
    backgroundColor: p.color,
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return <Animated.View style={style} />;
}

interface Props {
  xpAmount: number;
  fromLevel: number;
  toLevel: number;
  visible: boolean;
  onDone?: () => void;
}

export function XPLevelUp({ xpAmount, fromLevel, toLevel, visible, onDone }: Props) {
  const particles = useRef(makeParticles(24)).current;
  const [trigger, setTrigger] = React.useState(0);

  const containerOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.5);
  const badgeRotate = useSharedValue(0);
  const xpBump = useSharedValue(0);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    setTrigger(t => t + 1);

    // Flash
    flashOpacity.value = withSequence(
      withTiming(0.18, { duration: 80 }),
      withTiming(0, { duration: 200 })
    );

    // Container fade in
    containerOpacity.value = withTiming(1, { duration: 200 });

    // Badge shatter → new level
    badgeScale.value = withSequence(
      withTiming(1.25, { duration: 150 }),
      withTiming(0.8, { duration: 120 }),
      withSpring(1, { damping: 8, stiffness: 180 })
    );
    badgeRotate.value = withSequence(
      withTiming(45, { duration: 150 }),
      withTiming(-15, { duration: 120 }),
      withSpring(0, { damping: 10 })
    );

    // XP label bounce
    xpBump.value = withSequence(
      withDelay(100, withTiming(-28, { duration: 200 })),
      withTiming(0, { duration: 300, easing: Easing.bounce })
    );

    // Auto-dismiss
    const t = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 300 }, () => {
        if (onDone) runOnJS(onDone)();
      });
    }, 2800);
    return () => clearTimeout(t);
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }, { rotate: `${badgeRotate.value}deg` }],
  }));
  const xpStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: xpBump.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Screen flash */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />

      {/* Particles */}
      {particles.map(p => <ParticleView key={p.id} p={p} trigger={trigger} />)}

      {/* Center content */}
      <Animated.View style={[styles.center, containerStyle]}>
        <Animated.Text style={[styles.xpLabel, xpStyle]}>
          +{xpAmount} XP
        </Animated.Text>

        <Animated.View style={[styles.badgeWrap, badgeStyle]}>
          <View style={styles.badge}>
            <Text style={styles.badgeLevelLabel}>LEVEL</Text>
            <Text style={styles.badgeLevelNum}>{toLevel}</Text>
          </View>
        </Animated.View>

        <Text style={styles.levelUpText}>LEVEL UP</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flash: { backgroundColor: colors.orange },
  center: {
    position: 'absolute',
    top: H / 2 - 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.md,
  },
  xpLabel: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xxl,
    color: colors.orange,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  badgeWrap: {},
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.bg3,
    borderWidth: 3,
    borderColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  badgeLevelLabel: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.tiny,
    color: colors.textDim,
    letterSpacing: 2,
  },
  badgeLevelNum: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xxxl,
    color: colors.orange,
    lineHeight: 36,
  },
  levelUpText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.base,
    color: colors.textMuted,
    letterSpacing: 6,
  },
});
