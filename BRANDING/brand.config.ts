/**
 * EquiTie Centralized Brand Configuration
 * All brand tokens and styles should be imported from here
 */

// Re-export from existing brand file for backward compatibility
export { brand, tokens, BRAND_CONFIG as CHART_CONFIG, COLOR_SCHEMES } from '@/lib/brand';

// Centralized color system
export const COLORS = {
  // Primary Brand Colors
  primary: '#8B5CF6',        // EquiTie Purple
  primaryLight: '#C898FF',   // Light Purple
  primaryDark: '#8F4AD2',    // Dark Purple
  secondary: '#00D4AA',      // EquiTie Teal
  accentBlue: '#7BB8F0',     // Accent Blue
  
  // Backgrounds
  bgDeep: '#0A0A0B',         // Main background
  bgCard: '#141416',         // Card background
  bgSurface: '#1A1A1D',      // Surface background
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8B8D98',
  textMuted: '#6B6575',
  
  // Status Colors (semantic)
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
} as const;

// Gradient definitions
export const GRADIENTS = {
  hero: 'linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%)',
  mesh: `radial-gradient(at 40% 20%, hsla(263, 70%, 50%, 0.15) 0px, transparent 50%),
         radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.1) 0px, transparent 50%),
         radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.05) 0px, transparent 50%)`,
  card: 'linear-gradient(135deg, rgba(200, 152, 255, 0.1) 0%, rgba(143, 74, 210, 0.05) 100%)',
  glow: 'linear-gradient(135deg, rgba(200, 152, 255, 0.2) 0%, transparent 100%)',
  // Added for landing backgrounds (archive references)
  dark: 'radial-gradient(1200px circle at 0% 0%, rgba(10,10,11,1) 0%, rgba(10,10,11,0.6) 40%, transparent 70%)',
  radial: `radial-gradient(at 30% 10%, rgba(139, 92, 246, 0.08) 0px, transparent 55%),
           radial-gradient(at 80% 30%, rgba(102, 208, 255, 0.07) 0px, transparent 55%)`,
} as const;

// Shadow definitions
export const SHADOWS = {
  card: '0 4px 20px rgba(139, 92, 246, 0.08)',
  cardHover: '0 8px 30px rgba(139, 92, 246, 0.15)',
  elevated: '0 10px 40px rgba(0, 0, 0, 0.3)',
  glowPrimary: '0 0 24px rgba(139, 92, 246, 0.3)',
  glowSubtle: '0 0 18px rgba(139, 92, 246, 0.18)',
} as const;

// Component style classes
export const COMPONENT_STYLES = {
  // Card Variants
  card: {
    default: 'bg-card border border-border',
    glass: 'bg-card/60 backdrop-blur-md border border-border/50 shadow-card',
    gradient: 'bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20',
    elevated: 'bg-card shadow-elevated border border-border',
    hero: 'bg-gradient-mesh backdrop-blur-xl border border-border/30',
  },
  
  // Button Variants
  button: {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-glowSubtle transition-all duration-200',
    secondary: 'bg-card text-foreground hover:bg-muted border border-border transition-all duration-200',
    outline: 'border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-200',
    ghost: 'hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200',
  },
  
  // Navigation
  nav: {
    base: 'bg-card/80 backdrop-blur-md border-b border-border',
    link: 'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
    linkActive: 'bg-primary/20 text-primary shadow-glowSubtle',
    linkInactive: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
  },
  
  // Metric Display
  metric: {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-muted-foreground',
    value: 'text-3xl font-bold text-foreground',
    label: 'text-sm text-muted-foreground',
  },
  
  // Loading States
  loading: {
    skeleton: 'bg-muted animate-pulse rounded',
    spinner: 'animate-spin text-primary',
    overlay: 'bg-background/80 backdrop-blur-sm',
  },
} as const;

// Brand configuration object for external use
export const BRAND_CONFIG = {
  name: 'EquiTie',
  tagline: 'Institutional-Grade Investment Platform',
  colors: COLORS,
  gradients: GRADIENTS,
  shadows: SHADOWS,
  styles: COMPONENT_STYLES,
  
  // Chart specific config
  charts: {
    palette: {
      primary: COLORS.primary,
      accent: COLORS.secondary,
      success: COLORS.success,
      info: COLORS.info,
      warning: COLORS.warning,
      error: COLORS.error,
    },
    colors: [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.info, COLORS.warning, COLORS.error],
    background: 'transparent',
    gridColor: 'rgba(148, 163, 184, 0.2)',
    tickColor: '#9CA3AF',
    fontFamily: 'Space Grotesk, ui-sans-serif, system-ui',
    tooltipBg: 'rgba(17, 24, 39, 0.9)',
    tooltipBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

// Helper function to get consistent glass effect
export function getGlassStyle(variant: 'light' | 'medium' | 'heavy' = 'medium') {
  const blurs = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    heavy: 'backdrop-blur-xl',
  };
  
  return `${blurs[variant]} bg-card/60 border border-border/50`;
}

// Export for backward compatibility
export default BRAND_CONFIG;