// ============================================
// FEDGE 2.O — Alpaca Markets Service
// apps/api/src/services/alpaca.ts
// ============================================

import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import type { Position, PortfolioSummary, Order, PriceBar } from '@tradestreet/types';

export class AlpacaService {
  private client: AxiosInstance;
  private dataClient: AxiosInstance;

  constructor(apiKey: string, apiSecret: string) {
    this.client = axios.create({
      baseURL: process.env.ALPACA_BASE_URL ?? 'https://paper-api.alpaca.markets/v2',
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json',
      },
    });

    this.dataClient = axios.create({
      baseURL: process.env.ALPACA_DATA_URL ?? 'https://data.alpaca.markets/v2',
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
      },
    });
  }

  // ---- ACCOUNT ----

  async getAccount(): Promise<PortfolioSummary> {
    const { data } = await this.client.get('/account');

    return {
      totalValue: parseFloat(data.portfolio_value),
      cash: parseFloat(data.cash),
      buyingPower: parseFloat(data.buying_power),
      dayPnl: {
        amount: parseFloat(data.equity) - parseFloat(data.last_equity),
        percent: ((parseFloat(data.equity) - parseFloat(data.last_equity)) / parseFloat(data.last_equity)) * 100,
      },
      totalPnl: {
        amount: parseFloat(data.equity) - 10000, // vs initial deposit
        percent: ((parseFloat(data.equity) - 10000) / 10000) * 100,
      },
      positionsCount: 0, // set after getPositions()
      platform: 'alpaca',
      lastSynced: new Date().toISOString(),
    };
  }

  // ---- POSITIONS ----

  async getPositions(): Promise<Omit<Position, 'fedgeRiskScore' | 'fedgeCommentary'>[]> {
    const { data } = await this.client.get('/positions');

    return data.map((p: any) => ({
      id: p.asset_id,
      symbol: p.symbol,
      assetClass: p.asset_class === 'crypto' ? 'crypto' : 'stocks',
      qty: parseFloat(p.qty),
      marketValue: parseFloat(p.market_value),
      avgEntryPrice: parseFloat(p.avg_entry_price),
      currentPrice: parseFloat(p.current_price),
      unrealizedPnl: parseFloat(p.unrealized_pl),
      unrealizedPnlPct: parseFloat(p.unrealized_plpc) * 100,
      platform: 'alpaca',
    }));
  }

  // ---- ORDERS ----

  async placeOrder(params: {
    symbol: string;
    side: 'buy' | 'sell';
    qty: number;
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    timeInForce?: 'day' | 'gtc' | 'ioc';
    limitPrice?: number;
    stopPrice?: number;
  }): Promise<Order> {
    const body: Record<string, unknown> = {
      symbol: params.symbol,
      qty: params.qty.toString(),
      side: params.side,
      type: params.type,
      time_in_force: params.timeInForce ?? 'day',
    };

    if (params.limitPrice) body['limit_price'] = params.limitPrice.toString();
    if (params.stopPrice) body['stop_price'] = params.stopPrice.toString();

    const { data } = await this.client.post('/orders', body);

    return {
      id: data.id,
      clientOrderId: data.client_order_id,
      symbol: data.symbol,
      side: data.side,
      type: data.type,
      qty: parseFloat(data.qty),
      filledQty: parseFloat(data.filled_qty ?? '0'),
      filledAvgPrice: data.filled_avg_price ? parseFloat(data.filled_avg_price) : null,
      limitPrice: data.limit_price ? parseFloat(data.limit_price) : null,
      stopPrice: data.stop_price ? parseFloat(data.stop_price) : null,
      status: data.status,
      timeInForce: data.time_in_force,
      submittedAt: data.submitted_at,
      filledAt: data.filled_at ?? null,
      platform: 'alpaca',
      fedgeSignalId: null,
      fedgePostTradeComment: null,
    };
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.client.delete(`/orders/${orderId}`);
  }

  async getOrders(status?: 'open' | 'closed' | 'all', limit = 20): Promise<Order[]> {
    const { data } = await this.client.get('/orders', {
      params: { status: status ?? 'all', limit },
    });
    return data.map((o: any) => ({
      id: o.id,
      clientOrderId: o.client_order_id,
      symbol: o.symbol,
      side: o.side,
      type: o.type,
      qty: parseFloat(o.qty),
      filledQty: parseFloat(o.filled_qty ?? '0'),
      filledAvgPrice: o.filled_avg_price ? parseFloat(o.filled_avg_price) : null,
      limitPrice: o.limit_price ? parseFloat(o.limit_price) : null,
      stopPrice: o.stop_price ? parseFloat(o.stop_price) : null,
      status: o.status,
      timeInForce: o.time_in_force,
      submittedAt: o.submitted_at,
      filledAt: o.filled_at ?? null,
      platform: 'alpaca',
      fedgeSignalId: null,
      fedgePostTradeComment: null,
    }));
  }

  // ---- MARKET DATA ----

  async getBars(symbol: string, timeframe: '1H' | '4H' | '1D' = '4H', limit = 50): Promise<PriceBar[]> {
    const { data } = await this.dataClient.get(`/stocks/${symbol}/bars`, {
      params: { timeframe, limit, sort: 'desc' },
    });

    return (data.bars ?? []).map((b: any) => ({
      timestamp: b.t,
      open: b.o,
      high: b.h,
      low: b.l,
      close: b.c,
      volume: b.v,
    })).reverse();
  }

  async getLatestPrice(symbol: string): Promise<number> {
    const { data } = await this.dataClient.get(`/stocks/${symbol}/trades/latest`);
    return data.trade.p;
  }

  // ---- WEBSOCKET STREAM ----

  connectStream(
    symbols: string[],
    onPrice: (symbol: string, price: number) => void
  ): WebSocket {
    const ws = new WebSocket('wss://stream.data.alpaca.markets/v2/iex');

    ws.on('open', () => {
      ws.send(JSON.stringify({
        action: 'auth',
        key: process.env.ALPACA_API_KEY,
        secret: process.env.ALPACA_API_SECRET,
      }));
      ws.send(JSON.stringify({
        action: 'subscribe',
        trades: symbols,
      }));
    });

    ws.on('message', (raw: Buffer) => {
      const msgs = JSON.parse(raw.toString());
      for (const msg of msgs) {
        if (msg.T === 't') { // trade event
          onPrice(msg.S, msg.p);
        }
      }
    });

    ws.on('error', (err) => {
      console.error('[Alpaca WS] Error:', err.message);
    });

    return ws;
  }
}
