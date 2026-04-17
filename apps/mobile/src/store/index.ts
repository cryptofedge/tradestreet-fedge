// ============================================
// FEDGE 2.O — Global App Store (Zustand)
// apps/mobile/src/store/index.ts
// ============================================

import { create } from 'zustand';
import type {
  User, PortfolioSummary, Position, Signal,
  Mission, GameProfile, AdvisorMessage
} from '@tradestreet/types';

// ---- AUTH SLICE ----

interface AuthSlice {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// ---- PORTFOLIO SLICE ----

interface PortfolioSlice {
  summary: PortfolioSummary | null;
  positions: Position[];
  lastSynced: string | null;
  isLoading: boolean;
  setSummary: (summary: PortfolioSummary) => void;
  setPositions: (positions: Position[]) => void;
  updatePosition: (symbol: string, updates: Partial<Position>) => void;
}

// ---- SIGNALS SLICE ----

interface SignalsSlice {
  feed: Signal[];
  viewed: Set<string>;
  setFeed: (signals: Signal[]) => void;
  markViewed: (id: string) => void;
  prependSignal: (signal: Signal) => void;
}

// ---- MISSIONS SLICE ----

interface MissionsSlice {
  daily: Mission[];
  setDaily: (missions: Mission[]) => void;
  completeMission: (id: string) => void;
}

// ---- GAME SLICE ----

interface GameSlice {
  profile: GameProfile | null;
  xpAnimation: number; // for XP gain animation
  setProfile: (profile: GameProfile) => void;
  addXp: (amount: number) => void;
  resetXpAnimation: () => void;
}

// ---- ADVISOR SLICE ----

interface AdvisorSlice {
  messages: AdvisorMessage[];
  sessionId: string | null;
  isThinking: boolean;
  addMessage: (message: AdvisorMessage) => void;
  setThinking: (thinking: boolean) => void;
  clearSession: () => void;
}

// ---- UI SLICE ----

interface UISlice {
  activeTab: 'feed' | 'portfolio' | 'missions' | 'squads' | 'advisor';
  showOnboarding: boolean;
  showXpCelebration: boolean;
  setActiveTab: (tab: UISlice['activeTab']) => void;
  setShowOnboarding: (show: boolean) => void;
  triggerXpCelebration: () => void;
  dismissXpCelebration: () => void;
}

// ---- COMBINED STORE ----

type AppStore = AuthSlice & PortfolioSlice & SignalsSlice & MissionsSlice & GameSlice & AdvisorSlice & UISlice;

export const useStore = create<AppStore>((set, get) => ({

  // AUTH
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, refreshToken, user) =>
    set({ token, refreshToken, user, isAuthenticated: true }),
  clearAuth: () =>
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
  updateUser: (updates) =>
    set(state => ({ user: state.user ? { ...state.user, ...updates } : null })),

  // PORTFOLIO
  summary: null,
  positions: [],
  lastSynced: null,
  isLoading: false,
  setSummary: (summary) => set({ summary, lastSynced: new Date().toISOString() }),
  setPositions: (positions) => set({ positions }),
  updatePosition: (symbol, updates) =>
    set(state => ({
      positions: state.positions.map(p => p.symbol === symbol ? { ...p, ...updates } : p),
    })),

  // SIGNALS
  feed: [],
  viewed: new Set(),
  setFeed: (feed) => set({ feed }),
  markViewed: (id) => set(state => ({ viewed: new Set([...state.viewed, id]) })),
  prependSignal: (signal) =>
    set(state => ({ feed: [signal, ...state.feed].slice(0, 50) })),

  // MISSIONS
  daily: [],
  setDaily: (daily) => set({ daily }),
  completeMission: (id) =>
    set(state => ({
      daily: state.daily.map(m => m.id === id ? { ...m, status: 'COMPLETED' as const } : m),
    })),

  // GAME
  profile: null,
  xpAnimation: 0,
  setProfile: (profile) => set({ profile }),
  addXp: (amount) => {
    set(state => ({
      xpAnimation: amount,
      profile: state.profile
        ? { ...state.profile, xpCurrent: state.profile.xpCurrent + amount }
        : null,
    }));
    get().triggerXpCelebration();
  },
  resetXpAnimation: () => set({ xpAnimation: 0 }),

  // ADVISOR
  messages: [],
  sessionId: null,
  isThinking: false,
  addMessage: (message) =>
    set(state => ({ messages: [...state.messages, message] })),
  setThinking: (isThinking) => set({ isThinking }),
  clearSession: () => set({ messages: [], sessionId: null }),

  // UI
  activeTab: 'feed',
  showOnboarding: false,
  showXpCelebration: false,
  setActiveTab: (activeTab) => set({ activeTab }),
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
  triggerXpCelebration: () => {
    set({ showXpCelebration: true });
    setTimeout(() => set({ showXpCelebration: false }), 2000);
  },
  dismissXpCelebration: () => set({ showXpCelebration: false }),
}));

// Typed selectors
export const useAuth = () => useStore(s => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }));
export const usePortfolio = () => useStore(s => ({ summary: s.summary, positions: s.positions }));
export const useSignals = () => useStore(s => ({ feed: s.feed, viewed: s.viewed }));
export const useMissions = () => useStore(s => s.daily);
export const useGame = () => useStore(s => ({ profile: s.profile, xpAnimation: s.xpAnimation }));
export const useAdvisor = () => useStore(s => ({ messages: s.messages, isThinking: s.isThinking, sessionId: s.sessionId }));
