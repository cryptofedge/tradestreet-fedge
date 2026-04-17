// ============================================
// FEDGE 2.O — Mobile API Client
// apps/mobile/src/api/client.ts
// ============================================

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import type {
  User, Signal, PortfolioSummary, Position, Order,
  Mission, GameProfile, LeaderboardEntry, Squad,
  AdvisorMessage, ApiResponse
} from '@tradestreet/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.fedge.io/v2';

class FedgeApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-FEDGE-Version': '2.0',
      },
    });

    // Request interceptor — inject JWT
    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('fedge_access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Response interceptor — handle 401 refresh
    this.client.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          try {
            const refreshToken = await SecureStore.getItemAsync('fedge_refresh_token');
            if (!refreshToken) throw new Error('No refresh token');

            const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
            await SecureStore.setItemAsync('fedge_access_token', data.access_token);

            // Retry original request
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${data.access_token}`;
              return this.client(error.config);
            }
          } catch {
            await SecureStore.deleteItemAsync('fedge_access_token');
            await SecureStore.deleteItemAsync('fedge_refresh_token');
            // Trigger logout via event
            throw { code: 'SESSION_EXPIRED' };
          }
        }
        throw error;
      }
    );
  }

  // ---- AUTH ----

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { data } = await this.client.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('fedge_access_token', data.access_token);
    await SecureStore.setItemAsync('fedge_refresh_token', data.refresh_token);
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
    };
  }

  async connectPlatform(platform: string, oauthCode: string): Promise<{ connected: boolean }> {
    const { data } = await this.client.post('/auth/platform/connect', {
      platform,
      oauth_code: oauthCode,
      redirect_uri: 'fedge://oauth/callback',
    });
    return { connected: data.platform_connected };
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout').catch(() => {});
    await SecureStore.deleteItemAsync('fedge_access_token');
    await SecureStore.deleteItemAsync('fedge_refresh_token');
  }

  // ---- SIGNALS ----

  async getSignalFeed(params?: {
    limit?: number;
    assetClass?: string;
    minConfidence?: number;
  }): Promise<ApiResponse<{ signals: Signal[] }>> {
    const { data } = await this.client.get('/signals/feed', { params: {
      limit: params?.limit,
      asset_class: params?.assetClass,
      min_confidence: params?.minConfidence,
    }});
    return data;
  }

  async executeSignal(signalId: string, qty: number, orderType?: string): Promise<{ order: Order; xpAwarded: number }> {
    const { data } = await this.client.post(`/signals/${signalId}/execute`, {
      qty,
      order_type: orderType ?? 'market',
      confirm: true,
    });
    return { order: data.data.order, xpAwarded: data.data.xp_awarded };
  }

  // ---- PORTFOLIO ----

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const { data } = await this.client.get('/portfolio/summary');
    return data.data;
  }

  async getPositions(): Promise<Position[]> {
    const { data } = await this.client.get('/portfolio/positions');
    return data.data;
  }

  async placeOrder(params: {
    symbol: string;
    side: 'buy' | 'sell';
    qty: number;
    type: string;
    limitPrice?: number;
  }): Promise<Order> {
    const { data } = await this.client.post('/portfolio/orders', params);
    return data.data;
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.client.delete(`/portfolio/orders/${orderId}`);
  }

  // ---- MISSIONS ----

  async getDailyMissions(): Promise<Mission[]> {
    const { data } = await this.client.get('/missions/daily');
    return data.data.missions;
  }

  // ---- GAME ----

  async getGameProfile(): Promise<GameProfile> {
    const { data } = await this.client.get('/game/profile');
    return data.data;
  }

  async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data } = await this.client.get('/leaderboards/global');
    return data.data.entries;
  }

  async createSquad(name: string, maxMembers?: number): Promise<Squad> {
    const { data } = await this.client.post('/squads', { name, max_members: maxMembers });
    return data.data;
  }

  async joinSquad(inviteCode: string): Promise<Squad> {
    const { data } = await this.client.post('/squads/join', { invite_code: inviteCode });
    return data.data;
  }

  // ---- ADVISOR ----

  async sendAdvisorMessage(
    message: string,
    sessionId?: string,
    stream?: boolean
  ): Promise<{ response: string; sessionId: string; tokensUsed: number }> {
    const { data } = await this.client.post('/advisor/message', {
      message,
      session_id: sessionId,
      stream: stream ?? false,
      include_portfolio: true,
    });
    return {
      response: data.data.response,
      sessionId: data.data.session_id,
      tokensUsed: data.data.tokens_used,
    };
  }
}

export const fedgeApi = new FedgeApiClient();
