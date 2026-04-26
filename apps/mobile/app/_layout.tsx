// ============================================
// FEDGE 2.O — Root Layout
// apps/mobile/app/_layout.tsx
// ============================================

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  IBMPlexMono_300Light,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  IBMPlexSans_300Light,
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexMono_300Light,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    IBMPlexMono_700Bold,
    IBMPlexSans_300Light,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });

  useEffect(() => {
    // Hide splash as soon as fonts load OR if they error — never stay stuck
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't block render on font error — fall back to system fonts
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={colors.bg} />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="onboarding/index" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="signal/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
