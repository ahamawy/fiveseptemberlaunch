import { brand, tokens } from "@/lib/brand";

/**
 * Generic token value getter - eliminates duplication
 */
function getTokenValue<T>(
  tokenObject: any,
  path: string,
  tokenType: string,
  fallback: T
): T {
  const keys = path.split('.');
  let current: any = tokenObject;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`${tokenType} not found: ${path}`);
      return fallback;
    }
    current = current[key];
  }
  
  return current as T;
}

/**
 * Get a color value from the token system
 */
export function getColor(path: string): string {
  return getTokenValue(tokens.colors || {}, path, 'Color', '#000000');
}

/**
 * Get a gradient value from the token system
 */
export function getGradient(path: string): string {
  return 'linear-gradient(135deg, #0066FF, #00D4AA)';
}

/**
 * Get a shadow value from the token system
 */
export function getShadow(path: string): string {
  return '0 4px 6px rgba(0, 0, 0, 0.1)';
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
    return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-400/30' };
  } else if (value < 0) {
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-400/30' };
  } else {
    return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-400/30' };
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
export function getTransition(type: 'all' | 'color' | 'transform'): string {
  const animations = {
    transition: {
      all: 'transition-all duration-200 ease-out',
      color: 'transition-colors duration-200 ease-out',
      transform: 'transition-transform duration-200 ease-out'
    }
  } as const;
  return animations.transition[type] || animations.transition.all;
}

/**
 * Typography utility for consistent text styles
 */
export function getTextStyle(style: 'h1' | 'h2' | 'body' | 'caption') {
  const typography = {
    textStyles: {
      h1: 'text-3xl font-bold',
      h2: 'text-2xl font-semibold',
      body: 'text-base',
      caption: 'text-xs text-muted-foreground'
    }
  } as const;
  return typography.textStyles[style];
}

/**
 * Spacing utility for consistent spacing
 */
export function getSpacing(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string {
  const spacing = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  } as const;
  const value = spacing[size];
  if (typeof value === 'string') {
    return value;
  }
  return spacing.md as string;
}