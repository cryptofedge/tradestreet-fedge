// ============================================
// FEDGE 2.O — Brand Theme
// apps/mobile/src/theme/index.ts
// ============================================

export const colors = {
  // ---- Primary Brand ----
  orange:      '#FF6200',
  orangeDim:   '#CC4E00',
  orangeGlow:  'rgba(255, 98, 0, 0.15)',

  // ---- Backgrounds ----
  bg:          '#080808',
  bg2:         '#0e0e0e',
  bg3:         '#141414',
  bg4:         '#1a1a1a',

  // ---- Borders ----
  border:      '#1f1f1f',
  border2:     '#2a2a2a',

  // ---- Text ----
  text:        '#e8e8e8',
  textMuted:   '#999999',
  textDim:     '#555555',
  white:       '#ffffff',

  // ---- Semantic ----
  green:       '#22c55e',
  greenDim:    'rgba(34, 197, 94, 0.15)',
  red:         '#ef4444',
  redDim:      'rgba(239, 68, 68, 0.15)',
  blue:        '#3b82f6',
  blueDim:     'rgba(59, 130, 246, 0.15)',
  yellow:      '#eab308',
  purple:      '#a855f7',
  purpleDim:   'rgba(168, 85, 247, 0.15)',
} as const;

export const typography = {
  // IBM Plex Mono weights
  mono: {
    light:    'IBMPlexMono_300Light',
    regular:  'IBMPlexMono_400Regular',
    medium:   'IBMPlexMono_500Medium',
    semiBold: 'IBMPlexMono_600SemiBold',
    bold:     'IBMPlexMono_700Bold',
  },
  // IBM Plex Sans weights
  sans: {
    light:    'IBMPlexSans_300Light',
    regular:  'IBMPlexSans_400Regular',
    medium:   'IBMPlexSans_500Medium',
    semiBold: 'IBMPlexSans_600SemiBold',
    bold:     'IBMPlexSans_700Bold',
  },
} as const;

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  pill: 999,
} as const;

export const fontSize = {
  tiny:   9,
  xs:     10,
  sm:     11,
  base:   12,
  md:     13,
  lg:     16,
  xl:     20,
  xxl:    24,
  xxxl:   30,
  hero:   38,
} as const;

// Signal confidence to color mapping
export function confidenceColor(confidence: number): string {
  if (confidence >= 0.75) return colors.green;
  if (confidence >= 0.55) return colors.yellow;
  return colors.red;
}

// P&L color
export function pnlColor(value: number): string {
  return value >= 0 ? colors.green : colors.red;
}

// Risk level color
export function riskColor(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  const map = { LOW: colors.green, MEDIUM: colors.yellow, HIGH: colors.red };
  return map[level];
}
