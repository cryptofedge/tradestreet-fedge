// ============================================
// FEDGE 2.O — Brain Thinking Animation
// apps/mobile/src/components/FedgeBrainAnimation.tsx
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { colors, typography, fontSize, spacing } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const SIZE = Math.min(SCREEN_W - spacing.lg * 2, 320);
const CX = SIZE / 2;
const CY = SIZE / 2;

// Node positions (normalized 0-1, will scale to SIZE)
const NODES = [
  // Center core
  { x: 0.5,  y: 0.5,  r: 10, isCore: true },
  // Inner ring
  { x: 0.5,  y: 0.2,  r: 5,  isCore: false },
  { x: 0.78, y: 0.35, r: 5,  isCore: false },
  { x: 0.78, y: 0.65, r: 5,  isCore: false },
  { x: 0.5,  y: 0.8,  r: 5,  isCore: false },
  { x: 0.22, y: 0.65, r: 5,  isCore: false },
  { x: 0.22, y: 0.35, r: 5,  isCore: false },
  // Outer ring
  { x: 0.5,  y: 0.08, r: 3,  isCore: false },
  { x: 0.87, y: 0.25, r: 3,  isCore: false },
  { x: 0.92, y: 0.6,  r: 3,  isCore: false },
  { x: 0.72, y: 0.92, r: 3,  isCore: false },
  { x: 0.28, y: 0.92, r: 3,  isCore: false },
  { x: 0.08, y: 0.6,  r: 3,  isCore: false },
  { x: 0.13, y: 0.25, r: 3,  isCore: false },
];

// Edges between nodes
const EDGES = [
  [0,1],[0,2],[0,3],[0,4],[0,5],[0,6], // core → inner
  [1,2],[2,3],[3,4],[4,5],[5,6],[6,1], // inner ring
  [1,7],[2,8],[3,9],[4,10],[5,11],[6,12],[1,13], // inner → outer
];

const LOG_LINES = [
  '[FEDGE] MARKET SCAN INITIATED...',
  '[FEDGE] LOADING NVDA 4H BARS...',
  '[FEDGE] PATTERN RECOGNITION ACTIVE',
  '[FEDGE] SIGNAL CONFIDENCE: 82%',
  '[FEDGE] RISK LEVEL: MEDIUM',
  '[FEDGE] ACTION: BUY — ENTRY $118–$121',
];

interface Props { ticker?: string; isAnalyzing?: boolean; }

function PulseNode({ x, y, r, isCore, delay }: { x: number; y: number; r: number; isCore: boolean; delay: number }) {
  const opacity = useSharedValue(isCore ? 1 : 0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(isCore ? 1 : 0.9, { duration: 700 }),
        withTiming(isCore ? 0.5 : 0.25, { duration: 700 })
      ), -1, false
    ));
    if (isCore) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.sine) }),
          withTiming(1, { duration: 800 })
        ), -1, false
      );
    }
  }, []);

  const nodeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    position: 'absolute',
    left: x * SIZE - r,
    top: y * SIZE - r,
    width: r * 2,
    height: r * 2,
    borderRadius: r,
    backgroundColor: isCore ? colors.orange : colors.orange + '99',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isCore ? 0.9 : 0.4,
    shadowRadius: isCore ? 16 : 6,
  }));

  return <Animated.View style={nodeStyle} />;
}

export function FedgeBrainAnimation({ ticker = 'NVDA', isAnalyzing = true }: Props) {
  const [logIndex, setLogIndex] = useState(0);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLogIndex(i => {
        const next = i < LOG_LINES.length - 1 ? i + 1 : i;
        setDisplayedLogs(LOG_LINES.slice(0, next + 1));
        return next;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <View style={styles.container}>
      {/* Neural net canvas */}
      <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
        {/* Edges */}
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <G>
            {EDGES.map(([a, b], i) => (
              <Line
                key={i}
                x1={NODES[a].x * SIZE}
                y1={NODES[a].y * SIZE}
                x2={NODES[b].x * SIZE}
                y2={NODES[b].y * SIZE}
                stroke={colors.orange}
                strokeWidth={0.6}
                opacity={0.2}
              />
            ))}
          </G>
        </Svg>

        {/* Nodes */}
        {NODES.map((n, i) => (
          <PulseNode
            key={i}
            x={n.x}
            y={n.y}
            r={n.r}
            isCore={n.isCore}
            delay={i * 120}
          />
        ))}
      </View>

      {/* Terminal log */}
      <View style={styles.terminal}>
        {displayedLogs.map((line, i) => (
          <Text key={i} style={[styles.logLine, i === displayedLogs.length - 1 && styles.logActive]}>
            {line}
            {i === displayedLogs.length - 1 && <Text style={styles.cursor}>█</Text>}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.lg },
  terminal: {
    width: SIZE,
    backgroundColor: colors.bg2,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  logLine: { fontFamily: typography.mono.regular, fontSize: fontSize.tiny, color: colors.textDim, letterSpacing: 0.5 },
  logActive: { color: colors.orange },
  cursor: { color: colors.orange },
});
