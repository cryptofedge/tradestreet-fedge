// ============================================
// FEDGE 2.O — Shared TypeScript Types
// packages/types/src/index.ts
// ============================================

// ---- ENUMS ----

export type UserTier = 'free' | 'pro';
export type Platform = 'alpaca' | 'robinhood' | 'webull' | 'schwab' | 'ibkr' | 'coinbase' | 'kraken';
export type AssetClass = 'stocks' | 'crypto' | 'etf' | 'options';
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'expired';
export type TimeInForce = 'day' | 'gtc' | 'ioc' | 'fok';
export type SignalAction = 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type MissionType = 'HOLD' | 'TRADE' | 'RESEARCH' | 'DIVERSIFY' | 'LEARN';
export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
export type BadgeId =
  | 'FIRST_TRADE'
  | 'FIRST_PROFIT'
  | 'SURVIVED_CRASH'
  | 'STREAK_7'
  | 'STREAK_14'
  | 'STREAK_30'
  | 'FIRST_DIVIDEND'
  | 'DIVERSIFIED'
  | 'SQUAD_WINNER'
  | 'SIGNAL_FOLLOWER';

// ---- CORE MODELS ----

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  platform: Platform | null;
  platformConnected: boolean;
  xp: number;
  level: number;
  streakDays: number;
  badges: BadgeId[];
  unlockedFeatures: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Signal {
  id: string;
  ticker: string;
  assetClass: AssetClass;
  action: SignalAction;
  confidence: number; // 0.0–1.0
  riskLevel: RiskLevel;
  reasoning: string;
  entryRange: { low: number; high: number };
  stopLoss: number;
  targetPrice: number;
  expiresAt: string;
  generatedAt: string;
  tier: UserTier; // minimum tier required
}

export interface Position {
  id: string;
  symbol: string;
  assetClass: AssetClass;
  qty: number;
  marketValue: number;
  avgEntryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  fedgeRiskScore: number; // 0–100
  fedgeCommentary: string;
  platform: Platform;
}

export interface PortfolioSummary {
  totalValue: number;
  cash: number;
  buyingPower: number;
  dayPnl: { amount: number; percent: number };
  totalPnl: { amount: number; percent: number };
  positionsCount: number;
  platform: Platform;
  lastSynced: string;
}

export interface Order {
  id: string;
  clientOrderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  filledQty: number;
  filledAvgPrice: number | null;
  limitPrice: number | null;
  stopPrice: number | null;
  status: OrderStatus;
  timeInForce: TimeInForce;
  submittedAt: string;
  filledAt: string | null;
  platform: Platform;
  fedgeSignalId: string | null; // if trade originated from FEDGE signal
  fedgePostTradeComment: string | null;
}

export interface Mission {
  id: string;
  userId: string;
  type: MissionType;
  title: string;
  description: string;
  xpReward: number;
  status: MissionStatus;
  progress: number; // 0–100
  expiresAt: string;
  completedAt: string | null;
  generatedBy: string; // 'FEDGE Brain v2'
}

export interface GameProfile {
  userId: string;
  level: number;
  xpCurrent: number;
  xpNextLevel: number;
  xpToday: number;
  streakDays: number;
  badges: BadgeId[];
  tier: UserTier;
  unlockedFeatures: string[];
  rank: number; // global Hustle Board rank
  squadId: string | null;
}

export interface Squad {
  id: string;
  name: string;
  members: SquadMember[];
  inviteCode: string;
  weekReturns: Record<string, number>; // userId → pct return
  createdBy: string;
  createdAt: string;
  maxMembers: number;
}

export interface SquadMember {
  userId: string;
  displayName: string; // anonymized (e.g. "Trader #4")
  weekReturnPct: number;
  rank: number;
  joinedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string; // always anonymized
  weekReturnPct: number;
  badge: BadgeId | null;
  isCurrentUser: boolean;
}

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokensUsed?: number;
  contextInjected?: string[];
}

// ---- API RESPONSES ----

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    generatedAt?: string;
  };
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

// ---- WEBSOCKET EVENTS ----

export type WsEventType =
  | 'signal.new'
  | 'signal.expired'
  | 'portfolio.update'
  | 'order.update'
  | 'order.filled'
  | 'mission.completed'
  | 'mission.new'
  | 'xp.awarded'
  | 'badge.unlocked'
  | 'leaderboard.update'
  | 'squad.update'
  | 'market.price';

export interface WsEvent<T = unknown> {
  type: WsEventType;
  payload: T;
  timestamp: string;
  userId?: string;
}

// ---- FEDGE BRAIN ----

export interface FedgeBrainContext {
  portfolio: PortfolioSummary;
  positions: Position[];
  recentSignals: Signal[];
  userProfile: Pick<User, 'xp' | 'level' | 'streakDays' | 'badges'>;
  marketContext?: string;
}

export interface FedgeSignalRequest {
  symbol: string;
  assetClass: AssetClass;
  priceData: PriceBar[];
  portfolioContext: FedgeBrainContext;
}

export interface PriceBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
