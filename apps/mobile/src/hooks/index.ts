// ============================================
// FEDGE 2.O — React Query Hooks
// apps/mobile/src/hooks/
// ============================================

// ---- useSignals.ts ----
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fedgeApi } from '../api/client';
import { useStore } from '../store';

export function useSignals(options?: { assetClass?: string; minConfidence?: number }) {
  const setFeed = useStore(s => s.setFeed);

  return useQuery({
    queryKey: ['signals', 'feed', options],
    queryFn: async () => {
      const res = await fedgeApi.getSignalFeed({
        limit: 20,
        assetClass: options?.assetClass,
        minConfidence: options?.minConfidence,
      });
      setFeed(res.data.signals);
      return res.data.signals;
    },
    refetchInterval: 60 * 1000, // refetch every minute
    staleTime: 30 * 1000,
  });
}

export function useExecuteSignal() {
  const queryClient = useQueryClient();
  const addXp = useStore(s => s.addXp);

  return useMutation({
    mutationFn: ({ signalId, qty }: { signalId: string; qty: number }) =>
      fedgeApi.executeSignal(signalId, qty),
    onSuccess: (data) => {
      addXp(data.xpAwarded);
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

// ---- usePortfolio.ts ----
export function usePortfolioSummary() {
  const setSummary = useStore(s => s.setSummary);

  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: async () => {
      const summary = await fedgeApi.getPortfolioSummary();
      setSummary(summary);
      return summary;
    },
    refetchInterval: 15 * 1000,
    staleTime: 10 * 1000,
  });
}

export function usePositions() {
  const setPositions = useStore(s => s.setPositions);

  return useQuery({
    queryKey: ['portfolio', 'positions'],
    queryFn: async () => {
      const positions = await fedgeApi.getPositions();
      setPositions(positions);
      return positions;
    },
    refetchInterval: 15 * 1000,
    staleTime: 10 * 1000,
  });
}

// ---- useMissions.ts ----
export function useDailyMissions() {
  const setDaily = useStore(s => s.setDaily);

  return useQuery({
    queryKey: ['missions', 'daily'],
    queryFn: async () => {
      const missions = await fedgeApi.getDailyMissions();
      setDaily(missions);
      return missions;
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ---- useAdvisor.ts ----
export function useAdvisorChat() {
  const { addMessage, setThinking, sessionId } = useStore(s => ({
    addMessage: s.addMessage,
    setThinking: s.setThinking,
    sessionId: s.sessionId,
  }));

  return useMutation({
    mutationFn: async (message: string) => {
      addMessage({
        id: `msg_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });
      setThinking(true);

      const result = await fedgeApi.sendAdvisorMessage(message, sessionId ?? undefined);

      addMessage({
        id: `msg_${Date.now()}_resp`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        tokensUsed: result.tokensUsed,
      });

      return result;
    },
    onSettled: () => setThinking(false),
  });
}

// ---- useGameProfile.ts ----
export function useGameProfile() {
  const setProfile = useStore(s => s.setProfile);

  return useQuery({
    queryKey: ['game', 'profile'],
    queryFn: async () => {
      const profile = await fedgeApi.getGameProfile();
      setProfile(profile);
      return profile;
    },
    staleTime: 30 * 1000,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard', 'global'],
    queryFn: () => fedgeApi.getGlobalLeaderboard(),
    refetchInterval: 30 * 1000,
    staleTime: 20 * 1000,
  });
}
