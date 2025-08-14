import { colors } from '@/BRANDING/tokens/colors';
import { gradients } from '@/BRANDING/tokens/gradients';
import { shadows } from '@/BRANDING/tokens/shadows';
import { animations } from '@/BRANDING/tokens/animations';
import { typography } from '@/BRANDING/tokens/typography';
import { spacing } from '@/BRANDING/tokens/spacing';

/**
 * Get a color value from the token system
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let current: any = colors;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Color not found: ${path}`);
      return '#000000';
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Get a gradient value from the token system
 */
export function getGradient(path: string): string {
  const keys = path.split('.');
  let current: any = gradients;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Gradient not found: ${path}`);
      return 'linear-gradient(135deg, #000, #fff)';
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Get a shadow value from the token system
 */
export function getShadow(path: string): string {
  const keys = path.split('.');
  let current: any = shadows;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Shadow not found: ${path}`);
      return 'none';
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Format currency values with proper locale
 */
export function formatCurrency(
  value: number, 
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format dates consistently
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(dateObj);
}

/**
 * Generate glass morphism styles
 */
export function getGlassStyles(variant: 'light' | 'medium' | 'strong' = 'medium') {
  const opacity = {
    light: '0.05',
    medium: '0.1',
    strong: '0.15'
  };
  
  return {
    background: `rgba(255, 255, 255, ${opacity[variant]})`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(200, 152, 255, 0.1)'
  };
}

/**
 * Generate status colors based on value
 */
export function getStatusColor(value: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (value > 0) {
    return {
      bg: 'bg-success-500/20',
      text: 'text-success-400',
      border: 'border-success-400/30'
    };
  } else if (value < 0) {
    return {
      bg: 'bg-error-500/20',
      text: 'text-error-400',
      border: 'border-error-400/30'
    };
  } else {
    return {
      bg: 'bg-neutral-500/20',
      text: 'text-neutral-400',
      border: 'border-neutral-400/30'
    };
  }
}

/**
 * Generate responsive classes
 */
export function getResponsiveClasses(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string {
  const classes = [base];
  
  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  if (xl) classes.push(`xl:${xl}`);
  
  return classes.join(' ');
}

/**
 * Animation utility for consistent transitions
 */
export function getTransition(type: keyof typeof animations.transition): string {
  return animations.transition[type] || animations.transition.all;
}

/**
 * Typography utility for consistent text styles
 */
export function getTextStyle(style: keyof typeof typography.textStyles) {
  return typography.textStyles[style];
}

/**
 * Spacing utility for consistent spacing
 */
export function getSpacing(size: keyof typeof spacing): string {
  const value = spacing[size];
  if (typeof value === 'string') {
    return value;
  }
  return spacing.md as string;
}