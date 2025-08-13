/**
 * Equitie Shadow Tokens
 * Elevation and glow effects for dark theme
 */

export const shadows = {
  // Elevation shadows (dark theme optimized)
  elevation: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.4)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.5)',
    md: '0 4px 8px rgba(0, 0, 0, 0.6)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.7)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.8)',
    '2xl': '0 16px 32px rgba(0, 0, 0, 0.9)',
    '3xl': '0 24px 48px rgba(0, 0, 0, 0.95)',
  },

  // Glow effects (brand colors)
  glow: {
    purple: '0 0 24px rgba(200, 152, 255, 0.4)',
    purpleStrong: '0 0 48px rgba(200, 152, 255, 0.6)',
    purpleSubtle: '0 0 12px rgba(200, 152, 255, 0.2)',
    
    green: '0 0 24px rgba(98, 255, 127, 0.4)',
    greenStrong: '0 0 48px rgba(98, 255, 127, 0.6)',
    greenSubtle: '0 0 12px rgba(98, 255, 127, 0.2)',
    
    blue: '0 0 24px rgba(102, 208, 255, 0.4)',
    blueStrong: '0 0 48px rgba(102, 208, 255, 0.6)',
    blueSubtle: '0 0 12px rgba(102, 208, 255, 0.2)',
    
    orange: '0 0 24px rgba(255, 154, 98, 0.4)',
    orangeStrong: '0 0 48px rgba(255, 154, 98, 0.6)',
    orangeSubtle: '0 0 12px rgba(255, 154, 98, 0.2)',
  },

  // Inner shadows (neumorphic effects)
  inner: {
    sm: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
    md: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
    lg: 'inset 0 4px 8px rgba(0, 0, 0, 0.6)',
  },

  // Glass morphism shadows
  glass: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },

  // Component-specific shadows
  component: {
    card: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 1px rgba(200, 152, 255, 0.1)',
    cardHover: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 24px rgba(200, 152, 255, 0.2)',
    
    button: '0 2px 8px rgba(0, 0, 0, 0.4)',
    buttonHover: '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 16px rgba(200, 152, 255, 0.3)',
    buttonActive: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
    
    input: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
    inputFocus: 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(200, 152, 255, 0.2)',
    
    modal: '0 24px 48px rgba(0, 0, 0, 0.8), 0 0 64px rgba(200, 152, 255, 0.1)',
    dropdown: '0 8px 24px rgba(0, 0, 0, 0.7)',
    tooltip: '0 4px 12px rgba(0, 0, 0, 0.8)',
  },

  // Text shadows for better readability on dark backgrounds
  text: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 2px 4px rgba(0, 0, 0, 0.6)',
    lg: '0 3px 6px rgba(0, 0, 0, 0.7)',
    glow: '0 0 8px rgba(200, 152, 255, 0.6)',
  },
} as const;

export type ShadowToken = typeof shadows;