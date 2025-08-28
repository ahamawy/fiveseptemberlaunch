import React from 'react';
import { cn } from '@/lib/utils';
import { COMPONENT_STYLES, getGlassStyle } from '@/lib/config/brand.config';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'xs' | 'xl';
  glow?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      glow = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative inline-flex items-center justify-center
      font-semibold rounded-lg
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
    
    const variants = {
      primary: COMPONENT_STYLES.button.primary,
      secondary: COMPONENT_STYLES.button.secondary,
      outline: COMPONENT_STYLES.button.outline,
      ghost: COMPONENT_STYLES.button.ghost,
      glass: `${getGlassStyle('medium')} hover:bg-card/40 text-foreground transition-all duration-200`,
      gradient: `bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all duration-200`,
    };
    
    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
      icon: 'p-2',
    };
    
    const glowStyles = glow
      ? variant === 'primary'
        ? 'shadow-glow-purpleSubtle hover:shadow-glow-purple'
        : 'shadow-sm hover:shadow-md'
      : '';
    
    const loadingStyles = loading ? 'cursor-wait' : '';
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glowStyles,
          loadingStyles,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = 'ghost', size = 'md', glow = false, className, ...props }, ref) => {
    const sizeMap = {
      sm: 'icon',
      md: 'icon',
      lg: 'icon',
    } as const;
    
    return (
      <Button
        ref={ref}
        variant={variant}
        size={sizeMap[size]}
        glow={glow}
        className={cn('aspect-square', className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, orientation = 'horizontal', className, ...props }, ref) => {
    const orientationStyles = {
      horizontal: 'flex-row space-x-2',
      vertical: 'flex-col space-y-2',
    };
    
    return (
      <div
        ref={ref}
        className={cn('flex', orientationStyles[orientation], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';