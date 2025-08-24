import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
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
      transition-all duration-150
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
    
    const variants = {
      primary: `
        bg-primary text-primary-foreground
        hover:bg-primary/90
        active:scale-[0.98]
      `,
      secondary: `
        bg-secondary text-secondary-foreground
        hover:bg-secondary/90
        active:scale-[0.98]
      `,
      outline: `
        border border-input text-foreground
        hover:bg-accent hover:text-accent-foreground
        active:scale-[0.98]
      `,
      ghost: `
        text-muted-foreground
        hover:bg-accent hover:text-accent-foreground
      `,
      glass: `
        glass-card text-foreground
        hover:shadow-glow-purpleSubtle active:scale-[0.98]
        border border-border
      `,
      gradient: `
        bg-gradient-hero text-white animate-gradient
        hover:shadow-glow-purple active:scale-[0.98]
      `,
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
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