// ============================================
// FEDGE 2.O — AdvisorScreen
// apps/mobile/app/(tabs)/advisor.tsx
// ============================================

import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, fontSize, spacing, radius } from '../../src/theme';
import { useStore } from '../../src/store';
import type { AdvisorMessage } from '@tradestreet/types';

type AIProvider = 'claude' | 'gemini';

// ── Mock conversations per provider ─────────────────────────────────────────
const MOCK_MESSAGES: Record<AIProvider, AdvisorMessage[]> = {
  claude: [
    {
      id: 'c1', role: 'assistant',
      content: "Yo. FEDGE online.\n\nPortfolio's up 13.78% overall. You're in 5 positions — TSLA's the weak link right now. BTC is printing. What do you want to work on?",
      timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
    },
    {
      id: 'c2', role: 'user',
      content: "Should I trim my BTC?",
      timestamp: new Date(Date.now() - 4 * 60_000).toISOString(),
    },
    {
      id: 'c3', role: 'assistant',
      content: "BTC's up 18.3% from your entry at $82k. That's a solid gain.\n\nHere's how I see it: You're sitting at $97k. Next key resistance is $98.5k — if it breaks, momentum could push toward $105k.\n\nMy read: Take 20-25% off the table here. Lock in ~$450 profit on that portion. Keep the rest running with a trailing stop at $92k.\n\nDon't sell everything. Let the trade breathe.",
      timestamp: new Date(Date.now() - 3 * 60_000).toISOString(),
    },
  ],
  gemini: [
    {
      id: 'g1', role: 'assistant',
      content: "FEDGE online — Gemini core active.\n\nI've analyzed your 5-position portfolio: +13.78% overall. Cross-referencing 90-day momentum, volatility surfaces, and macro signals. BTC is the standout. TSLA shows mean-reversion risk. Ready to go deep on any position.",
      timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
    },
    {
      id: 'g2', role: 'user',
      content: "Should I trim my BTC?",
      timestamp: new Date(Date.now() - 4 * 60_000).toISOString(),
    },
    {
      id: 'g3', role: 'assistant',
      content: "BTC at $97k — 18.3% above your $82k entry. Here's the multi-factor read:\n\n📊 On-chain: Whale accumulation steady, exchange outflows elevated (bullish).\n📈 Technical: RSI at 68 — not overbought. $98.5k is key resistance.\n🌐 Macro: Dollar weakening, risk-on sentiment intact.\n\nRecommendation: Scale out 25% here ($97k). Set a re-entry alert at $93.5k. Keep the remainder with a hard stop at $91k. Probability-weighted upside still favors holding majority.",
      timestamp: new Date(Date.now() - 3 * 60_000).toISOString(),
    },
  ],
};

const QUICK_PROMPTS = [
  'What\'s my biggest risk?',
  'Analyze my TSLA position',
  'Best signal to act on?',
  'How\'s my streak going?',
];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

interface MessageBubbleProps { message: AdvisorMessage }

function MessageBubble({ message: m, accentColor }: MessageBubbleProps & { accentColor: string }) {
  const isUser = m.role === 'user';
  return (
    <View style={[styles.bubbleWrap, isUser && styles.bubbleWrapUser]}>
      {!isUser && (
        <View style={[styles.fedgeAvatar, { backgroundColor: accentColor }]}>
          <Text style={styles.fedgeAvatarText}>F</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {m.content}
        </Text>
        <Text style={styles.bubbleTime}>{formatTime(m.timestamp)}</Text>
      </View>
    </View>
  );
}

export default function AdvisorScreen() {
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState<AIProvider>('claude');
  const storeMessages = useStore(s => s.messages);
  const isThinking = useStore(s => s.isThinking);
  const addMessage = useStore(s => s.addMessage);
  const user = useStore(s => s.user);
  const isPro = user?.tier === 'pro';
  const flatListRef = useRef<FlatList>(null);

  const isGemini = provider === 'gemini';
  const accentColor = isGemini ? '#4285F4' : colors.orange;

  // Use mock messages for demo
  const messages = MOCK_MESSAGES[provider];
  const msgCount = 3;
  const msgLimit = isPro ? 100 : 0;

  function sendMessage(text: string) {
    if (!text.trim() || !isPro) return;
    const userMsg: AdvisorMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput('');
    // In real app: call API here
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerBrand, { color: accentColor }]}>FEDGE 2.O</Text>
          <Text style={styles.headerTitle}>ADVISOR</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Model toggle */}
          <View style={styles.modelToggle}>
            <TouchableOpacity
              style={[styles.modelBtn, provider === 'claude' && styles.modelBtnActive]}
              onPress={() => setProvider('claude')}
            >
              <Text style={[styles.modelBtnText, provider === 'claude' && { color: colors.orange }]}>⚡ Claude</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modelBtn, provider === 'gemini' && styles.modelBtnActiveGemini]}
              onPress={() => setProvider('gemini')}
            >
              <Text style={[styles.modelBtnText, provider === 'gemini' && { color: '#4285F4' }]}>✦ Gemini</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.onlineDot, { backgroundColor: accentColor }]} />
        </View>
      </View>

      {!isPro ? (
        // Locked state
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>FEDGE ADVISOR</Text>
          <Text style={styles.lockedSubtitle}>PRO EXCLUSIVE</Text>
          <Text style={styles.lockedDesc}>
            Get direct access to FEDGE AI — your NYC street-smart trading partner.
            Ask anything about your portfolio, signals, or market conditions.
          </Text>
          <View style={styles.lockedFeatures}>
            {[
              '100 messages per day',
              'Full portfolio context',
              'Signal execution advice',
              'Real-time market analysis',
            ].map(f => (
              <Text key={f} style={styles.lockedFeature}>✓  {f}</Text>
            ))}
          </View>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeText}>UPGRADE TO PRO — $9.99/mo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Chat */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
              <View style={styles.chatIntro}>
                <Text style={styles.chatIntroText}>
                  {isGemini ? '✦ FEDGE · Gemini core · Portfolio synced' : '⚡ FEDGE AI · Claude core · Portfolio synced'}
                </Text>
              </View>
            }
            renderItem={({ item }) => <MessageBubble message={item} accentColor={accentColor} />}
            ListFooterComponent={
              isThinking ? (
                <View style={[styles.bubbleWrap]}>
                  <View style={[styles.fedgeAvatar, { backgroundColor: accentColor }]}>
                    <Text style={styles.fedgeAvatarText}>F</Text>
                  </View>
                  <View style={styles.thinkingBubble}>
                    <ActivityIndicator size="small" color={accentColor} />
                    <Text style={styles.thinkingText}>thinking...</Text>
                  </View>
                </View>
              ) : null
            }
          />

          {/* Quick prompts */}
          {input.length === 0 && (
            <View style={styles.quickPromptsRow}>
              <FlatList
                horizontal
                data={QUICK_PROMPTS}
                keyExtractor={q => q}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.quickChip}
                    onPress={() => sendMessage(item)}
                  >
                    <Text style={styles.quickChipText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Input */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask FEDGE anything..."
              placeholderTextColor={colors.textDim}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(input)}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: input.trim() ? accentColor : colors.bg4 }]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
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
    backgroundColor: colors.bg,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  msgCountBadge: {
    backgroundColor: colors.bg3,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  msgCountText: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  proBadge: {
    backgroundColor: colors.purpleDim,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.purple + '44',
  },
  proText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.purple,
    letterSpacing: 1,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  modelToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bg3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  modelBtnActive: {
    backgroundColor: colors.orangeGlow,
  },
  modelBtnActiveGemini: {
    backgroundColor: '#4285F422',
  },
  modelBtnText: {
    fontFamily: typography.mono.medium,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 0.5,
  },

  // Chat
  chatContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  chatIntro: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chatIntroText: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 0.5,
  },

  // Message bubbles
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bubbleWrapUser: {
    flexDirection: 'row-reverse',
  },
  fedgeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fedgeAvatarText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  bubbleAssistant: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.orange,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  bubbleTime: {
    fontFamily: typography.mono.regular,
    fontSize: 9,
    color: colors.textDim,
    marginTop: spacing.xs,
    textAlign: 'right',
  },

  // Thinking
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg3,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thinkingText: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },

  // Quick prompts
  quickPromptsRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickChip: {
    backgroundColor: colors.bg3,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  quickChipText: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.bg4,
  },
  sendIcon: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.lg,
    color: colors.white,
  },

  // Locked
  lockedContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    alignItems: 'center',
  },
  lockedIcon: { fontSize: 48, marginBottom: spacing.xl },
  lockedTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xxl,
    color: colors.white,
    letterSpacing: -0.5,
  },
  lockedSubtitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.purple,
    letterSpacing: 3,
    marginBottom: spacing.xl,
  },
  lockedDesc: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  lockedFeatures: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  lockedFeature: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.green,
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
  },
  upgradeText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.base,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
