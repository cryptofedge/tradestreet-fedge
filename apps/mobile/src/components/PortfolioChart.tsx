// ============================================
// FEDGE 2.O — Portfolio Chart (Animated Draw-On)
// apps/mobile/src/components/PortfolioChart.tsx
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, typography, spacing, fontSize, pnlColor } from '../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - spacing.lg * 2;
const CHART_H = 160;
const PAD = { top: 16, bottom: 24, left: 0, right: 0 };

interface DataPoint { timestamp: string; value: number; }

interface Props {
  data: DataPoint[];
  currentValue: number;
  totalPnlAmount: number;
  totalPnlPct: number;
}

function buildPath(data: DataPoint[], w: number, h: number): { path: string; length: number } {
  if (data.length < 2) return { path: '', length: 0 };

  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const drawH = h - PAD.top - PAD.bottom;
  const stepX = w / (data.length - 1);

  const toX = (i: number) => i * stepX;
  const toY = (v: number) => PAD.top + drawH - ((v - minV) / range) * drawH;

  let d = `M ${toX(0).toFixed(1)} ${toY(values[0]).toFixed(1)}`;
  for (let i = 1; i < data.length; i++) {
    const cpX = (toX(i - 1) + toX(i)) / 2;
    d += ` C ${cpX.toFixed(1)} ${toY(values[i - 1]).toFixed(1)}, ${cpX.toFixed(1)} ${toY(values[i]).toFixed(1)}, ${toX(i).toFixed(1)} ${toY(values[i]).toFixed(1)}`;
  }

  // Approximate path length
  const length = data.length * stepX * 1.05;
  return { path: d, length };
}

export function PortfolioChart({ data, currentValue, totalPnlAmount, totalPnlPct }: Props) {
  const progress = useSharedValue(0);
  const [pathData, setPathData] = useState({ path: '', length: 0 });
  const [counterVal, setCounterVal] = useState(0);

  const pnlC = pnlColor(totalPnlAmount);
  const pnlStr = `${totalPnlAmount >= 0 ? '+' : ''}$${Math.abs(totalPnlAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pnlPctStr = `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`;

  useEffect(() => {
    const { path, length } = buildPath(data, CHART_W, CHART_H);
    setPathData({ path, length });

    progress.value = 0;
    progress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }, () => {
      runOnJS(setCounterVal)(currentValue);
    });

    // Animate counter
    let start = 0;
    const steps = 40;
    const increment = currentValue / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= currentValue) { setCounterVal(currentValue); clearInterval(timer); }
      else setCounterVal(Math.round(start));
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [data]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: pathData.length * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      {/* Counter */}
      <View style={styles.header}>
        <Text style={styles.totalLabel}>PORTFOLIO VALUE</Text>
        <Text style={styles.totalValue}>
          ${counterVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.pnlRow}>
          <Text style={[styles.pnlText, { color: pnlC }]}>{pnlStr}</Text>
          <Text style={[styles.pnlPct, { color: pnlC }]}> ({pnlPctStr})</Text>
        </View>
      </View>

      {/* Chart */}
      {pathData.path ? (
        <Svg width={CHART_W} height={CHART_H}>
          <Defs>
            <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.orange} />
              <Stop offset="1" stopColor={colors.green} />
            </LinearGradient>
          </Defs>
          <AnimatedPath
            d={pathData.path}
            stroke="url(#lineGrad)"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={pathData.length}
            animatedProps={animatedProps}
          />
        </Svg>
      ) : (
        <View style={{ height: CHART_H }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  header: { marginBottom: spacing.md },
  totalLabel: { fontFamily: typography.mono.regular, fontSize: fontSize.tiny, color: colors.textDim, letterSpacing: 2, marginBottom: spacing.xs },
  totalValue: { fontFamily: typography.mono.bold, fontSize: fontSize.xxxl, color: colors.white },
  pnlRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  pnlText: { fontFamily: typography.mono.medium, fontSize: fontSize.md },
  pnlPct: { fontFamily: typography.mono.regular, fontSize: fontSize.sm },
});
