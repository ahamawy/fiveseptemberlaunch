/**
 * Equitie Brand Tokens for Feature 15.1.1
 * Always use these tokens instead of hardcoding values
 */

// Import from main brand config
import { BRAND_CONFIG } from '@/BRANDING/brand.config';

// Quick Reference - Use These in Your Components

export const COLORS = {
  // Primary Brand Colors
  primary: '#C898FF',        // Equitie Purple
  primaryHero: '#C898FF',    // Hero gradient start
  accentBlue: '#7BB8F0',     // Hero gradient end
  
  // Backgrounds
  bgDeep: '#040210',         // Main background
  bgCard: '#0A0118',         // Card background
  bgSurface: '#0F0420',      // Surface background
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A8A2B4',
  textMuted: '#6B6575',
  
  // Status Colors (semantic)
  success: '#10B981',        // Green for positive
  error: '#EF4444',          // Red for negative
  warning: '#F59E0B',        // Amber for warning
  info: '#3B82F6',          // Blue for info
} as const;

export const GRADIENTS = {
  hero: 'from-primary-300 to-accent-blue',
  card: 'from-primary-300/10 to-primary-500/5',
  glow: 'from-primary-300/20 via-accent-blue/20 to-transparent',
} as const;

export const SHADOWS = {
  card: '0 4px 20px rgba(200, 152, 255, 0.08)',
  cardHover: '0 8px 30px rgba(200, 152, 255, 0.15)',
  glowPurple: '0 0 30px rgba(200, 152, 255, 0.3)',
  glowPurpleSubtle: '0 0 20px rgba(200, 152, 255, 0.15)',
} as const;

export const COMPONENT_STYLES = {
  // Card Variants
  card: {
    default: 'bg-background-card border border-surface-border',
    glass: 'glass-adaptive', // Automatically adapts to theme
    gradient: 'bg-gradient-to-br from-primary-300/10 to-primary-500/5 border border-primary-300/20',
    elevated: 'bg-background-card shadow-card',
  },
  
  // Button Variants
  button: {
    primary: 'bg-primary-300 text-white hover:bg-primary-400 shadow-glow-purpleSubtle',
    secondary: 'bg-surface-elevated text-text-primary hover:bg-surface-hover',
    outline: 'border border-primary-300/20 hover:bg-primary-300/10',
  },
  
  // Metric Display
  metric: {
    positive: 'text-status-success',
    negative: 'text-status-error',
    neutral: 'text-text-secondary',
  },
} as const;

// Helper Functions

/**
 * Format currency with proper locale
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get status color based on value
 */
export function getStatusColor(value: number): string {
  if (value > 0) return COLORS.success;
  if (value < 0) return COLORS.error;
  return COLORS.textSecondary;
}

// Usage Example in Component:
/*
import { COLORS, GRADIENTS, formatCurrency } from '@/ultrathink/04_BRAND_TOKENS';

<Card variant="gradient">
  <div className={`text-2xl font-bold bg-gradient-to-r ${GRADIENTS.hero} text-gradient`}>
    {formatCurrency(portfolioValue)}
  </div>
</Card>
*/

// NO EMOJIS - Use these icon imports instead:
/*
import { 
  ChartBarIcon,
  TrendingUpIcon,
  CurrencyDollarIcon,
  BriefcaseIcon 
} from '@heroicons/react/24/outline';
*/