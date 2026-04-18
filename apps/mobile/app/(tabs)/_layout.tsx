// ============================================
// FEDGE 2.O — Tab Navigator
// apps/mobile/app/(tabs)/_layout.tsx
// ============================================

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontSize } from '../../src/theme';

interface TabIconProps {
  focused: boolean;
  label: string;
  icon: string;
}

function TabIcon({ focused, label, icon }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="FEED" icon="⚡" />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="PORT" icon="📊" />
          ),
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="OPS" icon="🎯" />
          ),
        }}
      />
      <Tabs.Screen
        name="squads"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="SQUAD" icon="🏆" />
          ),
        }}
      />
      <Tabs.Screen
        name="advisor"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="FEDGE" icon="🤖" />
          ),
        }}
      />
      <Tabs.Screen
        name="academy"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="LEARN" icon="🎓" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 70,
    paddingTop: 6,
    paddingBottom: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 18,
    opacity: 0.4,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontFamily: typography.mono.bold,
    fontSize: fontSize.tiny,
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: colors.orange,
  },
  tabDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.orange,
    marginTop: 1,
  },
});
