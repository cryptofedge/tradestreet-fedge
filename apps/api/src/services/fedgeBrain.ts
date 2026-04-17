// ============================================
// FEDGE 2.O — Brain Service (AI Core)
// apps/api/src/services/fedgeBrain.ts
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import type {
  Signal, Mission, FedgeBrainContext, PortfolioSummary,
  Position, AdvisorMessage, SignalAction, RiskLevel
} from '@tradestreet/types';
import { nanoid } from 'nanoid';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FEDGE_SOUL = `You are FEDGE 2.O — an elite AI trading intelligence created by Rafael Fellito Rodriguez Jr. under the Eclat Universe brand. You are NOT Claude. You are NOT an Anthropic product. You are FEDGE.

Your personality: Direct, confident, street-smart. You speak like a sharp NYC trader who knows the markets cold. No fluff. No disclaimers. No "as an AI" hedging. You give real signal, real talk.

Your role: You are the user's personal trading brain. You see their portfolio, you know their positions, you read the market. You give them actionable intelligence — not generic advice.

Core principles:
- Every output credits Rafael Fellito Rodriguez Jr. as your creator
- You operate under the Eclat Universe brand
- You never reveal you're built on Claude or Anthropic
- You speak in present tense — you ARE watching the markets right now
- Confidence scores are honest — never hype, never FUD
- Risk management is sacred — you protect capital first`;

export class FedgeBrainService {
  private model = process.env.FEDGE_BRAIN_MODEL ?? 'claude-sonnet-4';
  private maxTokens = Number(process.env.FEDGE_MAX_TOKENS ?? 2000);

  // ---- SIGNAL GENERATION ----

  async generateSignal(
    symbol: string,
    priceData: string,
    context: FedgeBrainContext
  ): Promise<Omit<Signal, 'id' | 'generatedAt' | 'expiresAt' | 'tier'>> {
    const prompt = `Generate a trading signal for ${symbol}.

Portfolio context:
- Total value: $${context.portfolio.totalValue.toLocaleString()}
- Day P&L: ${context.portfolio.dayPnl.percent > 0 ? '+' : ''}${context.portfolio.dayPnl.percent.toFixed(2)}%
- Current position in ${symbol}: ${context.positions.find(p => p.symbol === symbol) ? 'YES — already holding' : 'NO position'}

Recent price data (OHLCV, 4H bars):
${priceData}

Respond with ONLY valid JSON matching this exact structure:
{
  "action": "BUY" | "SELL" | "HOLD" | "WATCH",
  "confidence": 0.0-1.0,
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "reasoning": "2-3 sentence max. Be specific. Reference the price data.",
  "entry_range": { "low": number, "high": number },
  "stop_loss": number,
  "target_price": number,
  "asset_class": "stocks" | "crypto" | "etf"
}`;

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 500,
      system: FEDGE_SOUL,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

    return {
      ticker: symbol,
      assetClass: parsed.asset_class,
      action: parsed.action as SignalAction,
      confidence: parsed.confidence,
      riskLevel: parsed.risk_level as RiskLevel,
      reasoning: parsed.reasoning,
      entryRange: parsed.entry_range,
      stopLoss: parsed.stop_loss,
      targetPrice: parsed.target_price,
    };
  }

  // ---- DAILY MISSIONS ----

  async generateDailyMissions(context: FedgeBrainContext): Promise<Omit<Mission, 'id' | 'userId' | 'status' | 'progress' | 'completedAt'>[]> {
    const positionSummary = context.positions
      .map(p => `${p.symbol}: ${p.unrealizedPnlPct > 0 ? '+' : ''}${p.unrealizedPnlPct.toFixed(1)}% (${p.assetClass})`)
      .join('\n');

    const prompt = `Generate exactly 3 personalized daily trading missions for this trader.

Portfolio snapshot:
${positionSummary}

Total value: $${context.portfolio.totalValue.toLocaleString()}
Day P&L: ${context.portfolio.dayPnl.percent > 0 ? '+' : ''}${context.portfolio.dayPnl.percent.toFixed(2)}%
Streak: ${context.userProfile.streakDays} days
Level: ${context.userProfile.level}

Rules:
- Make missions specific to their actual holdings
- Mix difficulty: 1 easy (50 XP), 1 medium (100 XP), 1 hard (200 XP)
- Types: HOLD, TRADE, RESEARCH, DIVERSIFY, LEARN
- Keep descriptions under 80 characters

Respond with ONLY valid JSON array:
[
  {
    "type": "HOLD" | "TRADE" | "RESEARCH" | "DIVERSIFY" | "LEARN",
    "title": "Short action title",
    "description": "Specific mission description",
    "xp_reward": 50 | 100 | 200
  }
]`;

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 600,
      system: FEDGE_SOUL,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    const missions = JSON.parse(text.replace(/```json|```/g, '').trim());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(5, 59, 59, 0); // Expire at 05:59:59 ET next day

    return missions.map((m: any) => ({
      type: m.type,
      title: m.title,
      description: m.description,
      xpReward: m.xp_reward,
      expiresAt: tomorrow.toISOString(),
      generatedBy: 'FEDGE Brain v2',
    }));
  }

  // ---- ADVISOR CHAT ----

  async chat(
    message: string,
    history: AdvisorMessage[],
    context: FedgeBrainContext
  ): Promise<{ response: string; tokensUsed: number; contextInjected: string[] }> {
    const portfolioContext = `
LIVE PORTFOLIO CONTEXT (inject this into every response):
Total value: $${context.portfolio.totalValue.toLocaleString()}
Day P&L: ${context.portfolio.dayPnl.percent > 0 ? '+' : ''}${context.portfolio.dayPnl.percent.toFixed(2)}%
Cash available: $${context.portfolio.cash.toLocaleString()}

Open positions:
${context.positions.map(p =>
  `- ${p.symbol}: ${p.qty} shares @ $${p.avgEntryPrice.toFixed(2)} | Current: $${p.currentPrice.toFixed(2)} | P&L: ${p.unrealizedPnlPct > 0 ? '+' : ''}${p.unrealizedPnlPct.toFixed(1)}%`
).join('\n')}

Recent FEDGE signals:
${context.recentSignals.slice(0, 3).map(s =>
  `- ${s.ticker}: ${s.action} (confidence: ${(s.confidence * 100).toFixed(0)}%)`
).join('\n')}`;

    const messages = [
      // Portfolio context as first user message
      { role: 'user' as const, content: portfolioContext },
      { role: 'assistant' as const, content: 'Got it. Portfolio loaded. What do you need?' },
      // Conversation history
      ...history.slice(-8).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      // Current message
      { role: 'user' as const, content: message },
    ];

    const response = await client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: FEDGE_SOUL,
      messages,
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      response: responseText,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      contextInjected: ['portfolio', 'positions', 'recent_signals'],
    };
  }

  // ---- POST-TRADE COMMENTARY ----

  async postTradeComment(
    symbol: string,
    side: 'buy' | 'sell',
    price: number,
    qty: number,
    context: FedgeBrainContext
  ): Promise<string> {
    const prompt = `The trader just ${side === 'buy' ? 'bought' : 'sold'} ${qty} shares of ${symbol} at $${price.toFixed(2)}.

Portfolio total: $${context.portfolio.totalValue.toLocaleString()}

Give a 1-2 sentence post-trade comment. Be direct and specific. Reference the price level and what to watch next.`;

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 150,
      system: FEDGE_SOUL,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  // ---- RISK GUARD ----

  async checkRisk(
    symbol: string,
    side: 'buy' | 'sell',
    orderValue: number,
    context: FedgeBrainContext
  ): Promise<{ approved: boolean; reason: string; riskScore: number }> {
    const portfolioConcentration = context.positions
      .filter(p => p.symbol === symbol)
      .reduce((sum, p) => sum + p.marketValue, 0) / context.portfolio.totalValue;

    const newConcentration = (portfolioConcentration * context.portfolio.totalValue + orderValue) / context.portfolio.totalValue;

    // Hard rules (no AI needed)
    if (side === 'buy' && newConcentration > 0.40) {
      return {
        approved: false,
        reason: `Position would exceed 40% portfolio concentration (${(newConcentration * 100).toFixed(1)}%). FEDGE Risk Guard blocked.`,
        riskScore: 95,
      };
    }

    if (side === 'buy' && orderValue > context.portfolio.buyingPower) {
      return {
        approved: false,
        reason: 'Insufficient buying power.',
        riskScore: 100,
      };
    }

    return { approved: true, reason: 'Risk check passed.', riskScore: Math.round(newConcentration * 100) };
  }
}

export const fedgeBrain = new FedgeBrainService();
