// ============================================
// FEDGE 2.O — AcademyScreen
// apps/mobile/app/(tabs)/academy.tsx
// ============================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Animated,
} from 'react-native';
import { colors, typography, fontSize, spacing, radius } from '../../src/theme';
import { useStore } from '../../src/store';

// ── Types ────────────────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  title: string;
  duration: string;
  xp: number;
  completed: boolean;
  content: string[];
}

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
}

interface Module {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  xpReward: number;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

// ── Content ──────────────────────────────────────────────────────────────────
const MODULES: Module[] = [
  {
    id: 'markets101',
    icon: '📈',
    title: 'Markets 101',
    subtitle: 'Stocks, crypto & ETFs explained',
    color: colors.green,
    xpReward: 150,
    lessons: [
      {
        id: 'm1l1', title: 'What is a Stock?', duration: '2 min', xp: 25, completed: true,
        content: [
          "A stock represents a small ownership stake in a company.",
          "When you buy Apple stock, you literally own a tiny piece of Apple Inc.",
          "Stocks go up when the company grows and earns more money. They go down when the company struggles.",
          "Traders buy stocks to profit from price movements — either buying low and selling high, or selling short when they expect a drop.",
          "💡 Key terms: ticker symbol (AAPL), share price, market cap, volume.",
        ],
      },
      {
        id: 'm1l2', title: 'Crypto Basics', duration: '2 min', xp: 25, completed: true,
        content: [
          "Crypto is digital money that runs on blockchain technology — a decentralized ledger with no central bank.",
          "Bitcoin (BTC) is the original and most valuable. Ethereum (ETH) powers smart contracts. Thousands of altcoins exist.",
          "Crypto trades 24/7 unlike stocks. Much higher volatility — bigger gains AND bigger losses.",
          "FEDGE tracks BTC, ETH, and select altcoins for signal generation.",
          "💡 Key terms: blockchain, wallet, exchange, gas fees, market cap.",
        ],
      },
      {
        id: 'm1l3', title: 'What are ETFs?', duration: '2 min', xp: 25, completed: false,
        content: [
          "An ETF (Exchange-Traded Fund) is a basket of assets bundled into one tradeable ticker.",
          "SPY tracks the S&P 500 — the top 500 US companies. When the market goes up, SPY goes up.",
          "ETFs give you instant diversification. Instead of picking individual stocks, you own a slice of many.",
          "Perfect for lower-risk positions in your portfolio. FEDGE uses SPY as a 'safe anchor' asset.",
          "💡 Key terms: S&P 500, NAV, expense ratio, diversification.",
        ],
      },
      {
        id: 'm1l4', title: 'How Markets Move', duration: '3 min', xp: 25, completed: false,
        content: [
          "Markets move based on supply and demand. More buyers = price goes up. More sellers = price goes down.",
          "Key drivers: earnings reports, economic data (jobs, inflation), Fed interest rate decisions, news events.",
          "Sentiment matters as much as fundamentals. Fear causes panic selling. Greed causes bubbles.",
          "Pre-market (4–9:30am ET) and after-hours (4–8pm ET) trading happens but with lower volume.",
          "💡 FEDGE analyzes all these signals to generate BUY/SELL/HOLD recommendations.",
        ],
      },
    ],
    quiz: [
      { q: 'What does buying a stock represent?', options: ['A loan to the company', 'Ownership in the company', 'A futures contract', 'Currency exchange'], correct: 1 },
      { q: 'What makes crypto different from stocks?', options: ['Lower risk', 'Trades 24/7 on blockchain', 'Backed by gold', 'Government issued'], correct: 1 },
      { q: 'SPY is an ETF that tracks:', options: ['Bitcoin price', 'Top 500 US companies', 'Nasdaq tech stocks', 'Gold futures'], correct: 1 },
    ],
  },
  {
    id: 'signals',
    icon: '⚡',
    title: 'Reading Signals',
    subtitle: 'How to interpret FEDGE signals',
    color: colors.orange,
    xpReward: 150,
    lessons: [
      {
        id: 's1l1', title: 'What is a Signal?', duration: '2 min', xp: 25, completed: true,
        content: [
          "A trading signal is an alert that tells you when to potentially buy, sell, or hold an asset.",
          "FEDGE generates signals by analyzing price action, volume, momentum, and macro conditions simultaneously.",
          "Every signal has a type (BUY/SELL/HOLD), a confidence score (0–100), and a time horizon.",
          "High confidence = FEDGE is very sure. Low confidence = monitor closely but don't act impulsively.",
          "💡 Never act on a signal without considering your own position and risk tolerance.",
        ],
      },
      {
        id: 's1l2', title: 'BUY Signals', duration: '2 min', xp: 25, completed: false,
        content: [
          "A BUY signal means FEDGE sees bullish conditions — price is likely to go UP.",
          "Key triggers: price breaking above resistance, volume surge, positive momentum, bullish news catalysts.",
          "A BUY with 90%+ confidence is a strong setup. 60–70% means conditions are favorable but watch for confirmation.",
          "Always look at entry price, target price, and suggested stop-loss before executing.",
          "💡 Don't chase a BUY signal if the price has already moved 5%+ since the alert.",
        ],
      },
      {
        id: 's1l3', title: 'SELL & HOLD Signals', duration: '2 min', xp: 25, completed: false,
        content: [
          "SELL signal = take profits or cut losses. Price is likely heading down.",
          "HOLD signal = no action needed. Position is healthy but not yet at a key decision point.",
          "FEDGE issues SELL signals when: price hits resistance, momentum fades, or risk increases sharply.",
          "HOLD is often the hardest discipline — resisting the urge to over-trade is a key skill.",
          "💡 A SELL on a losing position (stop-loss) is just as important as a SELL on a winning one.",
        ],
      },
      {
        id: 's1l4', title: 'Confidence Scores', duration: '2 min', xp: 25, completed: false,
        content: [
          "Confidence score = how strong the signal is based on FEDGE's analysis (0–100%).",
          "90–100%: Very high conviction. Strong alignment across multiple indicators.",
          "70–89%: Good setup. Worth acting on with proper position sizing.",
          "50–69%: Moderate. Proceed with caution, smaller size.",
          "Below 50%: Weak signal. FEDGE will mark these as PRO-only — extra context needed.",
          "💡 Free tier gets signals 75%+. PRO gets all signals including early alerts.",
        ],
      },
    ],
    quiz: [
      { q: 'A BUY signal with 92% confidence means:', options: ['Guaranteed profit', 'Very strong bullish setup', 'Risk-free trade', 'Sell immediately'], correct: 1 },
      { q: 'What does a HOLD signal mean?', options: ['Sell everything', 'Close position now', 'No action needed yet', 'Buy more'], correct: 2 },
      { q: 'Free tier users get signals at:', options: ['Any confidence', '75%+ confidence', '50%+ confidence', 'PRO signals only'], correct: 1 },
    ],
  },
  {
    id: 'risk',
    icon: '🛡️',
    title: 'Risk Management',
    subtitle: 'Protect your capital like a pro',
    color: colors.yellow,
    xpReward: 200,
    lessons: [
      {
        id: 'r1l1', title: 'The 1% Rule', duration: '2 min', xp: 30, completed: false,
        content: [
          "The 1% Rule: never risk more than 1% of your total portfolio on a single trade.",
          "If your portfolio is $10,000 — max loss per trade is $100.",
          "This means even 10 losing trades in a row only costs you 10% of your portfolio.",
          "Professional traders survive long-term because they protect capital first, chase gains second.",
          "💡 FEDGE calculates suggested position sizes for you based on this principle.",
        ],
      },
      {
        id: 'r1l2', title: 'Stop-Losses', duration: '2 min', xp: 30, completed: false,
        content: [
          "A stop-loss is an automatic sell order that triggers when price drops to a set level.",
          "Example: You buy TSLA at $450. You set a stop-loss at $420. If it drops to $420, it auto-sells.",
          "This caps your downside and removes emotion from the decision.",
          "Trailing stops move up as the price rises — locking in profits while protecting against reversal.",
          "💡 FEDGE's risk score tells you when a stop-loss is urgently needed on your positions.",
        ],
      },
      {
        id: 'r1l3', title: 'Position Sizing', duration: '3 min', xp: 30, completed: false,
        content: [
          "Position sizing = how much money you put into each trade.",
          "Don't go all-in on one position. Spread risk across 5–10 positions max.",
          "Bigger conviction = slightly larger position. More risk = smaller position.",
          "Example: 40% cash, 30% in core holdings (SPY), 30% in active trades.",
          "💡 The portfolio screen shows your allocation. FEDGE flags over-concentration.",
        ],
      },
      {
        id: 'r1l4', title: 'Risk vs. Reward', duration: '2 min', xp: 30, completed: false,
        content: [
          "Every trade should have a clear risk/reward ratio — how much you risk vs. how much you can make.",
          "A 1:3 ratio means you risk $100 to potentially make $300.",
          "Most professional traders only take trades with at least 1:2 risk/reward.",
          "If a trade risks $200 to make $100 — skip it. The math doesn't work long-term.",
          "💡 FEDGE calculates risk/reward on every signal so you never enter a bad trade blind.",
        ],
      },
    ],
    quiz: [
      { q: 'The 1% Rule means:', options: ['Profit 1% daily', 'Risk max 1% per trade', 'Hold 1% in crypto', 'Pay 1% in fees'], correct: 1 },
      { q: 'A stop-loss order does what?', options: ['Buys more on dip', 'Auto-sells at a set price', 'Alerts you to signals', 'Calculates your taxes'], correct: 1 },
      { q: 'A good minimum risk/reward ratio is:', options: ['1:0.5', '1:1', '1:2', '1:10'], correct: 2 },
    ],
  },
  {
    id: 'gameplay',
    icon: '🎮',
    title: 'How to Play',
    subtitle: 'Master the FEDGE game mechanics',
    color: colors.purple,
    xpReward: 100,
    lessons: [
      {
        id: 'g1l1', title: 'XP & Leveling Up', duration: '2 min', xp: 20, completed: false,
        content: [
          "XP (Experience Points) are earned by completing missions, trades, streaks, and lessons.",
          "Your level = floor(√(XP ÷ 100)) + 1. Each level requires more XP than the last.",
          "Higher levels unlock: more signal slots, advanced analytics, squad leadership roles.",
          "XP never resets. Every action in the game builds your trader profile.",
          "💡 Check the Ops tab daily to see active missions and how to max your XP.",
        ],
      },
      {
        id: 'g1l2', title: 'Missions & Streaks', duration: '2 min', xp: 20, completed: false,
        content: [
          "Missions are daily/weekly challenges that reward XP for specific actions.",
          "Examples: 'Make 3 trades this week', 'Hold a position 5+ days', 'Research 2 assets'.",
          "Streaks = consecutive days you complete at least one mission. Don't break the chain!",
          "A 7-day streak gives 2x XP multiplier. A 30-day streak? FEDGE gives you the Elite badge.",
          "💡 Streaks are the fastest way to level up. Check in every day.",
        ],
      },
      {
        id: 'g1l3', title: 'Squads', duration: '2 min', xp: 20, completed: false,
        content: [
          "Squads are groups of 3–6 traders who compete together on the Hustle Board.",
          "Your squad's combined weekly return % determines your leaderboard rank.",
          "Benefits: shared strategy sessions, squad XP bonuses, exclusive squad missions.",
          "Create a squad or get invited — share your invite code to bring in your crew.",
          "💡 Strong squads coordinate entries. If 4 members get the same BUY signal, discuss before acting.",
        ],
      },
      {
        id: 'g1l4', title: 'The Hustle Board', duration: '2 min', xp: 20, completed: false,
        content: [
          "The Hustle Board is the global leaderboard — top 100 traders ranked by weekly return %.",
          "Weekly reset every Sunday midnight. Fresh competition every week.",
          "Top 3 traders get featured on the podium and earn bonus XP + exclusive badges.",
          "#1 weekly earns the 👑 Crown badge — the most prestigious in the game.",
          "💡 Consistent small gains beat one big risky trade. Play it smart, not lucky.",
        ],
      },
    ],
    quiz: [
      { q: 'How do you earn XP in TradeStreet?', options: ['Buying Pro', 'Missions, trades & streaks', 'Inviting friends only', 'Watching ads'], correct: 1 },
      { q: 'How many traders can be in one squad?', options: ['2–4', '3–6', '5–10', 'Unlimited'], correct: 1 },
      { q: 'The Hustle Board resets:', options: ['Daily', 'Monthly', 'Every Sunday', 'Never'], correct: 2 },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getModuleProgress(module: Module): number {
  const completed = module.lessons.filter(l => l.completed).length;
  return completed / module.lessons.length;
}

function getModuleXPEarned(module: Module): number {
  return module.lessons.filter(l => l.completed).reduce((sum, l) => sum + l.xp, 0);
}

// ── Components ───────────────────────────────────────────────────────────────
interface ModuleCardProps {
  module: Module;
  onPress: () => void;
}

function ModuleCard({ module: m, onPress }: ModuleCardProps) {
  const progress = getModuleProgress(m);
  const xpEarned = getModuleXPEarned(m);
  const isComplete = progress === 1;

  return (
    <TouchableOpacity style={styles.moduleCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.moduleTop}>
        <View style={[styles.moduleIconWrap, { backgroundColor: m.color + '20' }]}>
          <Text style={styles.moduleIcon}>{m.icon}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.moduleTitle}>{m.title}</Text>
          <Text style={styles.moduleSubtitle}>{m.subtitle}</Text>
        </View>
        {isComplete && (
          <View style={[styles.completeBadge, { backgroundColor: m.color + '20', borderColor: m.color + '55' }]}>
            <Text style={[styles.completeBadgeText, { color: m.color }]}>✓ DONE</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: m.color }]} />
      </View>
      <View style={styles.moduleStats}>
        <Text style={styles.moduleStatText}>
          {m.lessons.filter(l => l.completed).length}/{m.lessons.length} lessons
        </Text>
        <Text style={[styles.moduleStatText, { color: m.color }]}>
          {xpEarned}/{m.xpReward} XP
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface LessonViewProps {
  lesson: Lesson;
  moduleColor: string;
  onComplete: () => void;
  onBack: () => void;
}

function LessonView({ lesson, moduleColor, onComplete, onBack }: LessonViewProps) {
  const [page, setPage] = useState(0);
  const total = lesson.content.length;

  return (
    <View style={styles.lessonRoot}>
      <View style={styles.lessonHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.lessonHeaderTitle}>{lesson.title}</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>+{lesson.xp} XP</Text>
        </View>
      </View>

      {/* Page dots */}
      <View style={styles.pageDots}>
        {lesson.content.map((_, i) => (
          <View key={i} style={[styles.dot, i <= page && { backgroundColor: moduleColor }]} />
        ))}
      </View>

      {/* Content card */}
      <View style={[styles.contentCard, { borderColor: moduleColor + '44' }]}>
        <Text style={styles.contentText}>{lesson.content[page]}</Text>
      </View>

      {/* Nav */}
      <View style={styles.lessonNav}>
        {page > 0 ? (
          <TouchableOpacity style={styles.navBtnSecondary} onPress={() => setPage(p => p - 1)}>
            <Text style={styles.navBtnSecondaryText}>← Prev</Text>
          </TouchableOpacity>
        ) : <View style={{ flex: 1 }} />}

        {page < total - 1 ? (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: moduleColor }]}
            onPress={() => setPage(p => p + 1)}
          >
            <Text style={styles.navBtnText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: moduleColor }]}
            onPress={onComplete}
          >
            <Text style={styles.navBtnText}>Complete ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

interface QuizViewProps {
  quiz: QuizQuestion[];
  moduleColor: string;
  xpReward: number;
  onFinish: (passed: boolean) => void;
  onBack: () => void;
}

function QuizView({ quiz, moduleColor, xpReward, onFinish, onBack }: QuizViewProps) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function handleAnswer(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === quiz[qIdx].correct) setScore(s => s + 1);
  }

  function handleNext() {
    if (qIdx < quiz.length - 1) {
      setQIdx(q => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setDone(true);
    }
  }

  const passed = score >= Math.ceil(quiz.length * 0.67);

  if (done) {
    return (
      <View style={styles.quizDone}>
        <Text style={styles.quizDoneIcon}>{passed ? '🎉' : '📚'}</Text>
        <Text style={styles.quizDoneTitle}>{passed ? 'QUIZ PASSED!' : 'KEEP STUDYING'}</Text>
        <Text style={styles.quizDoneScore}>{score}/{quiz.length} correct</Text>
        {passed && (
          <View style={[styles.xpEarnedBadge, { backgroundColor: moduleColor + '20', borderColor: moduleColor }]}>
            <Text style={[styles.xpEarnedText, { color: moduleColor }]}>+{xpReward} XP EARNED</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: passed ? moduleColor : colors.bg3, marginTop: spacing.xl, paddingHorizontal: spacing.xxxl }]}
          onPress={() => onFinish(passed)}
        >
          <Text style={styles.navBtnText}>{passed ? 'Claim XP' : 'Try Again'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const q = quiz[qIdx];
  return (
    <View style={styles.lessonRoot}>
      <View style={styles.lessonHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.lessonHeaderTitle}>QUIZ</Text>
        <Text style={styles.quizProgress}>{qIdx + 1}/{quiz.length}</Text>
      </View>

      <View style={[styles.contentCard, { borderColor: moduleColor + '44', marginBottom: spacing.xl }]}>
        <Text style={styles.quizQuestion}>{q.q}</Text>
      </View>

      <View style={styles.optionsList}>
        {q.options.map((opt, i) => {
          let bg = colors.bg3;
          let border = colors.border2;
          let textColor = colors.text;
          if (answered) {
            if (i === q.correct) { bg = colors.green + '20'; border = colors.green; textColor = colors.green; }
            else if (i === selected && i !== q.correct) { bg = colors.red + '20'; border = colors.red; textColor = colors.red; }
          } else if (selected === i) {
            bg = moduleColor + '20'; border = moduleColor;
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleAnswer(i)}
            >
              <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: moduleColor, alignSelf: 'flex-end', marginTop: spacing.xl }]}
          onPress={handleNext}
        >
          <Text style={styles.navBtnText}>{qIdx < quiz.length - 1 ? 'Next →' : 'See Results'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
type View = 'modules' | 'moduleDetail' | 'lesson' | 'quiz';

export default function AcademyScreen() {
  const user = useStore(s => s.user);
  const [modules, setModules] = useState(MODULES);
  const [view, setView] = useState<View>('modules');
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Total XP earned
  const totalXP = modules.reduce((sum, m) => sum + getModuleXPEarned(m), 0);
  const totalPossible = modules.reduce((sum, m) => sum + m.xpReward, 0);

  function openModule(mod: Module) {
    setActiveModule(mod);
    setView('moduleDetail');
  }

  function openLesson(lesson: Lesson) {
    setActiveLesson(lesson);
    setView('lesson');
  }

  function completeLesson() {
    if (!activeLesson || !activeModule) return;
    setModules(prev => prev.map(m => {
      if (m.id !== activeModule.id) return m;
      return { ...m, lessons: m.lessons.map(l => l.id === activeLesson.id ? { ...l, completed: true } : l) };
    }));
    setView('moduleDetail');
  }

  function startQuiz() {
    setView('quiz');
  }

  function finishQuiz(passed: boolean) {
    setView('moduleDetail');
  }

  // ── Render: Module List ──────────────────────────────────────────────────
  if (view === 'modules') {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerBrand}>FEDGE 2.O</Text>
            <Text style={styles.headerTitle}>ACADEMY</Text>
          </View>
          <View style={styles.xpTotalBadge}>
            <Text style={styles.xpTotalText}>{totalXP}/{totalPossible} XP</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Learn to trade. Level up your game.</Text>
            <Text style={styles.heroSubtitle}>
              Complete all 4 modules to unlock the <Text style={{ color: colors.orange }}>SCHOLAR</Text> badge and earn 600 XP.
            </Text>
            {/* Overall progress */}
            <View style={styles.heroProgressTrack}>
              <View style={[styles.heroProgressFill, { width: `${(totalXP / totalPossible) * 100}%` }]} />
            </View>
            <Text style={styles.heroProgressLabel}>{Math.round((totalXP / totalPossible) * 100)}% complete</Text>
          </View>

          {/* Modules */}
          <Text style={styles.sectionTitle}>MODULES</Text>
          {modules.map(mod => (
            <ModuleCard key={mod.id} module={mod} onPress={() => openModule(mod)} />
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Render: Module Detail ────────────────────────────────────────────────
  if (view === 'moduleDetail' && activeModule) {
    const mod = modules.find(m => m.id === activeModule.id) || activeModule;
    const allLessonsComplete = mod.lessons.every(l => l.completed);

    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('modules')}>
            <Text style={styles.backBtn}>← ACADEMY</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Module hero */}
          <View style={[styles.moduleHero, { borderColor: mod.color + '44' }]}>
            <Text style={styles.moduleHeroIcon}>{mod.icon}</Text>
            <Text style={styles.moduleHeroTitle}>{mod.title}</Text>
            <Text style={styles.moduleHeroSubtitle}>{mod.subtitle}</Text>
            <View style={[styles.xpBadge, { backgroundColor: mod.color + '20', borderColor: mod.color + '55' }]}>
              <Text style={[styles.xpBadgeText, { color: mod.color }]}>{mod.xpReward} XP</Text>
            </View>
          </View>

          {/* Lessons */}
          <Text style={styles.sectionTitle}>LESSONS</Text>
          {mod.lessons.map((lesson, i) => (
            <TouchableOpacity
              key={lesson.id}
              style={[styles.lessonRow, lesson.completed && { opacity: 0.7 }]}
              onPress={() => openLesson(lesson)}
            >
              <View style={[styles.lessonNum, lesson.completed && { backgroundColor: mod.color }]}>
                <Text style={styles.lessonNumText}>{lesson.completed ? '✓' : i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonRowTitle}>{lesson.title}</Text>
                <Text style={styles.lessonRowMeta}>{lesson.duration} · +{lesson.xp} XP</Text>
              </View>
              <Text style={styles.lessonArrow}>→</Text>
            </TouchableOpacity>
          ))}

          {/* Quiz CTA */}
          <View style={[styles.quizCTA, { borderColor: mod.color + '44', opacity: allLessonsComplete ? 1 : 0.4 }]}>
            <Text style={styles.quizCTATitle}>MODULE QUIZ</Text>
            <Text style={styles.quizCTADesc}>
              {allLessonsComplete
                ? `Complete the quiz to earn ${mod.xpReward} XP and unlock your badge.`
                : `Finish all lessons to unlock the quiz.`}
            </Text>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: allLessonsComplete ? mod.color : colors.bg4 }]}
              onPress={startQuiz}
              disabled={!allLessonsComplete}
            >
              <Text style={styles.navBtnText}>START QUIZ →</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Render: Lesson ───────────────────────────────────────────────────────
  if (view === 'lesson' && activeLesson && activeModule) {
    const mod = modules.find(m => m.id === activeModule.id) || activeModule;
    return (
      <LessonView
        lesson={activeLesson}
        moduleColor={mod.color}
        onComplete={completeLesson}
        onBack={() => setView('moduleDetail')}
      />
    );
  }

  // ── Render: Quiz ─────────────────────────────────────────────────────────
  if (view === 'quiz' && activeModule) {
    const mod = modules.find(m => m.id === activeModule.id) || activeModule;
    return (
      <QuizView
        quiz={mod.quiz}
        moduleColor={mod.color}
        xpReward={mod.xpReward}
        onFinish={finishQuiz}
        onBack={() => setView('moduleDetail')}
      />
    );
  }

  return null;
}

// ── Styles ────────────────────────────────────────────────────────────────────
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
  xpTotalBadge: {
    backgroundColor: colors.orange + '20',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.orange + '55',
  },
  xpTotalText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 1,
  },

  scrollContent: { padding: spacing.lg },

  // Hero
  heroCard: {
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  heroTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.lg,
    color: colors.white,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  heroSubtitle: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  heroProgressTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 2,
  },
  heroProgressLabel: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },

  sectionTitle: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },

  // Module card
  moduleCard: {
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  moduleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moduleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleIcon: { fontSize: 22 },
  moduleTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.md,
    color: colors.white,
    marginBottom: 2,
  },
  moduleSubtitle: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  completeBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  completeBadgeText: {
    fontFamily: typography.mono.bold,
    fontSize: 8,
    letterSpacing: 1,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleStatText: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },

  // Module hero
  moduleHero: {
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  moduleHeroIcon: { fontSize: 48, marginBottom: spacing.md },
  moduleHeroTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xl,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  moduleHeroSubtitle: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  // Lesson rows
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  lessonNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lessonNumText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.white,
  },
  lessonRowTitle: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: 2,
  },
  lessonRowMeta: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  lessonArrow: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.md,
    color: colors.textDim,
  },

  // Quiz CTA
  quizCTA: {
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  quizCTATitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.white,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  quizCTADesc: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },

  // Lesson view
  lessonRoot: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  lessonHeaderTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.md,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  backBtn: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.sm,
    color: colors.orange,
  },
  xpBadge: {
    backgroundColor: colors.orange + '20',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.orange + '55',
  },
  xpBadgeText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
  },
  pageDots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border2,
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  contentText: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 26,
  },
  lessonNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxxl,
    gap: spacing.md,
  },
  navBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  navBtnText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.white,
    letterSpacing: 0.5,
  },
  navBtnSecondary: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  navBtnSecondaryText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Quiz
  quizQuestion: {
    fontFamily: typography.mono.semiBold,
    fontSize: fontSize.md,
    color: colors.white,
    lineHeight: 24,
  },
  quizProgress: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  optionsList: { gap: spacing.sm },
  optionBtn: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  optionText: {
    fontFamily: typography.sans.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },

  // Quiz done
  quizDone: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  quizDoneIcon: { fontSize: 64, marginBottom: spacing.xl },
  quizDoneTitle: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.xxl,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  quizDoneScore: {
    fontFamily: typography.mono.regular,
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  xpEarnedBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  xpEarnedText: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.md,
    letterSpacing: 1,
  },
});
