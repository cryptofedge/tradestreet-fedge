// ============================================
// FEDGE 2.O — WebSocket Hook
// apps/mobile/src/hooks/useWebSocket.ts
// ============================================

import { useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useStore } from '../store';
import type { WsEvent } from '@tradestreet/types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'wss://stream.fedge.io/v2';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useFedgeWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const {
    prependSignal,
    updatePosition,
    addXp,
    completeMission,
  } = useStore(s => ({
    prependSignal: s.prependSignal,
    updatePosition: s.updatePosition,
    addXp: s.addXp,
    completeMission: s.completeMission,
  }));

  const handleEvent = useCallback((event: WsEvent) => {
    switch (event.type) {
      case 'signal.new':
        prependSignal(event.payload as any);
        break;

      case 'portfolio.update':
        const { symbol, ...updates } = event.payload as any;
        if (symbol) updatePosition(symbol, updates);
        break;

      case 'xp.awarded':
        const { amount } = event.payload as any;
        if (amount > 0) addXp(amount);
        break;

      case 'mission.completed':
        const { missionId } = event.payload as any;
        completeMission(missionId);
        break;

      default:
        break;
    }
  }, [prependSignal, updatePosition, addXp, completeMission]);

  const connect = useCallback(async () => {
    const token = await SecureStore.getItemAsync('fedge_access_token');
    if (!token) return;

    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(`${WS_URL}/connect?token=${token}`);

    ws.current.onopen = () => {
      reconnectAttempts.current = 0;
      console.log('[WS] Connected to FEDGE stream');
    };

    ws.current.onmessage = (e) => {
      try {
        const event: WsEvent = JSON.parse(e.data);
        handleEvent(event);
      } catch {
        // Ignore parse errors
      }
    };

    ws.current.onclose = () => {
      console.log('[WS] Disconnected');
      scheduleReconnect();
    };

    ws.current.onerror = () => {
      ws.current?.close();
    };
  }, [handleEvent]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[WS] Max reconnect attempts reached');
      return;
    }
    reconnectAttempts.current += 1;
    const delay = RECONNECT_DELAY * reconnectAttempts.current;
    reconnectTimer.current = setTimeout(connect, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimer.current);
    ws.current?.close();
    ws.current = null;
  }, []);

  const subscribe = useCallback((channel: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }, []);

  const ping = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  useEffect(() => {
    connect();

    // Ping every 30s to keep connection alive
    const pingInterval = setInterval(ping, 30000);

    return () => {
      clearInterval(pingInterval);
      disconnect();
    };
  }, [connect, disconnect, ping]);

  return { subscribe, disconnect, isConnected: ws.current?.readyState === WebSocket.OPEN };
}
