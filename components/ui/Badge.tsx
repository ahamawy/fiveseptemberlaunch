import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', pulse, glow, children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface-active text-text-primary border-surface-border',
      success: 'bg-success-500/20 text-success-400 border-success-400/30',
      warning: 'bg-warning-500/20 text-warning-400 border-warning-400/30',
      error: 'bg-error-500/20 text-error-400 border-error-400/30',
      info: 'bg-info-500/20 text-info-400 border-info-400/30',
      outline: 'bg-transparent text-primary-300 border-primary-300/50',
      gradient: 'bg-gradient-to-r from-primary-300/20 to-accent-blue/20 text-primary-300 border-primary-300/30',
    };

    const sizes = {
      sm: 'px-1.5 py-0.5 text-xs',
      md: 'px-2 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    const pulseStyles = pulse ? 'animate-pulse' : '';
    
    const glowStyles = glow
      ? variant === 'success'
        ? 'shadow-glow-greenSubtle'
        : variant === 'error'
        ? 'shadow-[0_0_12px_rgba(248,113,113,0.3)]'
        : variant === 'info'
        ? 'shadow-glow-blueSubtle'
        : 'shadow-glow-purpleSubtle'
      : '';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          'transition-all duration-200',
          variants[variant],
          sizes[size],
          pulseStyles,
          glowStyles,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status = 'online', size = 'md', pulse, ...props }, ref) => {
    const statusColors = {
      online: 'bg-success-400',
      offline: 'bg-neutral-500',
      busy: 'bg-error-400',
      away: 'bg-warning-400',
    };

    const sizes = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
    };

    return (
      <span className="relative inline-flex">
        {pulse && status === 'online' && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              statusColors[status]
            )}
          />
        )}
        <span
          ref={ref}
          className={cn(
            'relative inline-flex rounded-full',
            statusColors[status],
            sizes[size],
            className
          )}
          {...props}
        />
      </span>
    );
  }
);

StatusDot.displayName = 'StatusDot';