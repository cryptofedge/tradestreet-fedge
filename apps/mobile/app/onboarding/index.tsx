// ============================================
// FEDGE 2.O — OnboardingScreen
// apps/mobile/app/onboarding/index.tsx
// ============================================

import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, fontSize, spacing, radius } from '../../src/theme';
import { useStore } from '../../src/store';
import type { Platform } from '@tradestreet/types';

const { width: SCREEN_W } = Dimensions.get('window');

const PLATFORMS: { id: Platform; name: string; icon: string; available: boolean }[] = [
  { id: 'alpaca',    name: 'Alpaca',    icon: '🦙', available: true  },
  { id: 'robinhood', name: 'Robinhood', icon: '🏹', available: false },
  { id: 'webull',    name: 'Webull',    icon: '🐂', available: false },
  { id: 'schwab',    name: 'Schwab',    icon: '🏦', available: false },
  { id: 'ibkr',      name: 'IBKR',      icon: '📈', available: false },
  { id: 'coinbase',  name: 'Coinbase',  icon: '🔵', available: false },
  { id: 'kraken',    name: 'Kraken',    icon: '🐙', available: false },
];

type Step = 'welcome' | 'platform' | 'oauth' | 'scanning' | 'ready';

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const setShowOnboarding = useStore(s => s.setShowOnboarding);

  function startScan() {
    setStep('scanning');
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: false,
    }).start(() => setStep('ready'));
  }

  function finish() {
    setShowOnboarding(false);
    router.replace('/(tabs)');
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>

      {/* ── WELCOME ── */}
      {step === 'welcome' && (
        <View style={styles.screen}>
          <View style={styles.heroSection}>
            <Text style={styles.fedgeBadge}>FEDGE 2.O</Text>
            <Text style={styles.heroTitle}>TRADE{'\n'}STREET</Text>
            <Text style={styles.heroSub}>Real money. Real AI. Real edge.</Text>
          </View>

          <View style={styles.featureList}>
            {[
              ['⚡', 'AI signals on 17 tickers, every 4 hours'],
              ['🎯', 'Daily missions powered by your portfolio'],
              ['🏆', 'Squad leaderboards. Hustle board. Badges.'],
              ['🤖', 'FEDGE Advisor — your AI trading partner'],
            ].map(([icon, text]) => (
              <View key={text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{icon}</Text>
                <Text style={styles.featureText}>{text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.ctaButton} onPress={() => setStep('platform')}>
            <Text style={styles.ctaText}>CONNECT YOUR BROKER</Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            By continuing you agree to our Terms of Service.{'\n'}
            Powered by Eclat Universe · Built by Rafael Fellito Rodriguez Jr.
          </Text>
        </View>
      )}

      {/* ── PLATFORM PICKER ── */}
      {step === 'platform' && (
        <View style={styles.screen}>
          <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
          <Text style={styles.stepTitle}>Pick your{'\n'}brokerage</Text>
          <Text style={styles.stepSub}>FEDGE connects via secure OAuth. We never store your password.</Text>

          <View style={styles.platformGrid}>
            {PLATFORMS.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.platformCard,
                  selectedPlatform === p.id && styles.platformCardSelected,
                  !p.available && styles.platformCardDisabled,
                ]}
                onPress={() => p.available && setSelectedPlatform(p.id)}
                activeOpacity={p.available ? 0.7 : 1}
              >
                <Text style={styles.platformIcon}>{p.icon}</Text>
                <Text style={[styles.platformName, !p.available && styles.platformNameDisabled]}>
                  {p.name}
                </Text>
                {!p.available && <Text style={styles.comingSoon}>SOON</Text>}
                {selectedPlatform === p.id && <View style={styles.selectedDot} />}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.ctaButton, !selectedPlatform && styles.ctaButtonDisabled]}
            onPress={() => selectedPlatform && setStep('oauth')}
            disabled={!selectedPlatform}
          >
            <Text style={styles.ctaText}>CONTINUE WITH {selectedPlatform?.toUpperCase() ?? '—'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── OAUTH ── */}
      {step === 'oauth' && (
        <View style={styles.screen}>
          <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
          <Text style={styles.stepTitle}>Connect{'\n'}{selectedPlatform}</Text>
          <Text style={styles.stepSub}>
            You'll be taken to {selectedPlatform}'s secure login page.
            FEDGE only requests read + trade permissions.
          </Text>

          <View style={styles.permissionBox}>
            <Text style={styles.permissionTitle}>FEDGE will be able to:</Text>
            {[
              '✓  Read your portfolio & positions',
              '✓  Execute trades on your behalf',
              '✓  Stream real-time price data',
              '✗  Withdraw funds (never requested)',
            ].map(line => (
              <Text key={line} style={[styles.permissionLine, line.startsWith('✗') && styles.permissionNo]}>
                {line}
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.ctaButton} onPress={startScan}>
            <Text style={styles.ctaText}>AUTHORIZE {selectedPlatform?.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep('platform')} style={styles.backButton}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── SCANNING ── */}
      {step === 'scanning' && (
        <View style={styles.screen}>
          <Text style={styles.scanTitle}>FEDGE IS WAKING UP</Text>
          <ActivityIndicator size="large" color={colors.orange} style={{ marginVertical: spacing.xxl }} />

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          <View style={styles.scanSteps}>
            {[
              'Authenticating with broker...',
              'Reading portfolio positions...',
              'Loading market context...',
              'Generating first signals...',
              'FEDGE online.',
            ].map((line, i) => (
              <Text key={i} style={[styles.scanLine, { opacity: 0.4 + i * 0.15 }]}>{line}</Text>
            ))}
          </View>
        </View>
      )}

      {/* ── READY ── */}
      {step === 'ready' && (
        <View style={styles.screen}>
          <Text style={styles.readyTag}>ACCESS GRANTED</Text>
          <Text style={styles.readyTitle}>FEDGE{'\n'}IS LIVE</Text>
          <Text style={styles.readySub}>
            Your portfolio is loaded.{'\n'}First signal is ready.
          </Text>

          <View style={styles.snapshotBox}>
            <Text style={styles.snapshotLabel}>PORTFOLIO CONNECTED</Text>
            <Text style={styles.snapshotPlatform}>
              {selectedPlatform?.toUpperCase()} · PAPER MODE
            </Text>
            <View style={styles.snapshotDivider} />
            <Text style={styles.snapshotSignal}>⚡ SIGNAL READY: AAPL · BUY · 87% CONFIDENCE</Text>
          </View>

          <TouchableOpacity style={styles.ctaButton} onPress={finish}>
            <Text style={styles.ctaText}>ENTER TRADESTREET →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 72,
    paddingBottom: 40,
  },

  // Welcome
  heroSection: {
    marginBottom: spacing.xxxl,
  },
  fedgeBadge: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontFamily: typography.mono.bold,
    fontSize: 56,
    color: colors.white,
    lineHeight: 58,
    letterSpacing: -1,
  },
  heroSub: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  featureList: {
    gap: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },

  // CTA
  ctaButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: 'auto',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.bg4,
  },
  ctaText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.base,
    color: colors.white,
    letterSpacing: 1,
  },
  legalText: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 16,
  },

  // Platform
  stepLabel: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  stepTitle: {
    fontFamily: typography.mono.bold,
    fontSize: 36,
    color: colors.white,
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  stepSub: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  platformCard: {
    width: (SCREEN_W - spacing.xl * 2 - spacing.md * 2) / 3,
    aspectRatio: 1,
    backgroundColor: colors.bg3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  platformCardSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeGlow,
  },
  platformCardDisabled: {
    opacity: 0.4,
  },
  platformIcon: {
    fontSize: 28,
  },
  platformName: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.text,
    letterSpacing: 0.5,
  },
  platformNameDisabled: {
    color: colors.textDim,
  },
  comingSoon: {
    fontFamily: typography.mono.bold,
    fontSize: 8,
    color: colors.textDim,
    letterSpacing: 1,
  },
  selectedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },

  // OAuth
  permissionBox: {
    backgroundColor: colors.bg3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  permissionTitle: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  permissionLine: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.green,
    lineHeight: 22,
  },
  permissionNo: {
    color: colors.textDim,
  },
  backButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backText: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 1,
  },

  // Scanning
  scanTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xl,
    color: colors.orange,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 80,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: spacing.xxxl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
  },
  scanSteps: {
    gap: spacing.lg,
  },
  scanLine: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: 0.5,
  },

  // Ready
  readyTag: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  readyTitle: {
    fontFamily: typography.mono.bold,
    fontSize: 56,
    color: colors.white,
    lineHeight: 58,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  readySub: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.lg,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  snapshotBox: {
    backgroundColor: colors.bg3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border2,
    padding: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  snapshotLabel: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  snapshotPlatform: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.lg,
    color: colors.white,
    marginTop: spacing.xs,
  },
  snapshotDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  snapshotSignal: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.sm,
    color: colors.orange,
    letterSpacing: 0.5,
  },
});
