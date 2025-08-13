/**
 * Equitie Color Tokens
 * Extracted from Figma design system
 * Single source of truth for all color values
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#F3EEFF',
    100: '#E8DDFF',
    200: '#D9B7FF',
    300: '#C898FF', // Hero purple
    400: '#C18AFF',
    500: '#B47FE5',
    600: '#9B7AC1',
    700: '#7E63A3',
    800: '#5F4A7D',
    900: '#3D2F52',
    DEFAULT: '#C898FF',
  },

  // Secondary Colors
  secondary: {
    green: '#62FF7F',
    orange: '#FF9A62',
    peach: '#F8BB98',
    yellow: '#FFD166',
    blue: '#66D0FF',
    teal: '#0B5B7D',
    pink: '#FF62E3',
    red: '#F87171',
    DEFAULT: '#62FF7F',
  },

  // Accent Colors (alias for easy access)
  accent: {
    green: '#62FF7F',
    orange: '#FF9A62',
    blue: '#66D0FF',
    teal: '#0B5B7D',
    pink: '#FF62E3',
  },

  // Background Colors - Dark Theme Primary
  background: {
    deep: '#040210',      // Deepest dark
    dark: '#0B071A',      // Main background
    surface: '#131016',   // Surface level 1
    card: '#0F0B22',      // Card background
    elevated: '#160F33',  // Elevated surfaces
    overlay: '#1A1140',   // Modal/overlay background
    purple: '#302141',    // Purple tinted background
  },

  // Neutral Colors
  neutral: {
    0: '#FFFFFF',
    50: '#F6E2E2',
    100: '#DEDEDE',
    200: '#BCBABE',
    300: '#A9A9B2',
    400: '#8B8B93',
    500: '#787880',
    600: '#565666',
    700: '#3C3C43',
    800: '#2E2E30',
    900: '#1C1C1E',
    1000: '#000000',
  },

  // Semantic Colors
  semantic: {
    success: '#22C55E',
    successLight: '#86EFAC',
    successDark: '#16A34A',
    
    warning: '#F59E0B',
    warningLight: '#FDE047',
    warningDark: '#D97706',
    
    error: '#EF4444',
    errorLight: '#FCA5A5',
    errorDark: '#DC2626',
    
    info: '#3B82F6',
    infoLight: '#93C5FD',
    infoDark: '#2563EB',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#BCBABE',
    tertiary: '#8B8B93',
    muted: '#565666',
    inverse: '#000000',
    accent: '#C898FF',
  },

  // Glass Morphism
  glass: {
    white5: 'rgba(255, 255, 255, 0.05)',
    white10: 'rgba(255, 255, 255, 0.10)',
    white20: 'rgba(255, 255, 255, 0.20)',
    white30: 'rgba(255, 255, 255, 0.30)',
    black20: 'rgba(0, 0, 0, 0.20)',
    black40: 'rgba(0, 0, 0, 0.40)',
    black60: 'rgba(0, 0, 0, 0.60)',
    purple10: 'rgba(200, 152, 255, 0.10)',
    purple20: 'rgba(200, 152, 255, 0.20)',
  },

  // Special Effects
  glow: {
    purple: 'rgba(200, 152, 255, 0.5)',
    green: 'rgba(98, 255, 127, 0.5)',
    blue: 'rgba(102, 208, 255, 0.5)',
    orange: 'rgba(255, 154, 98, 0.5)',
  },
} as const;

export type ColorToken = typeof colors;