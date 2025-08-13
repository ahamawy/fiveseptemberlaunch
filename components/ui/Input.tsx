import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass' | 'outline' | 'ghost';
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', error, icon, iconPosition = 'left', type, ...props }, ref) => {
    const variants = {
      default: `
        bg-background-surface border border-surface-border
        focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20
      `,
      glass: `
        glass-dark border border-primary-300/20
        focus:border-primary-300 focus:ring-2 focus:ring-primary-300/30
      `,
      outline: `
        bg-transparent border-2 border-surface-border
        focus:border-primary-300 focus:ring-0
      `,
      ghost: `
        bg-transparent border-0 border-b border-surface-border rounded-none
        focus:border-primary-300 focus:ring-0
      `,
    };

    const errorStyles = error
      ? 'border-error-400 focus:border-error-400 focus:ring-error-400/20'
      : '';

    const inputElement = (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md px-3 py-2 text-sm',
          'text-text-primary placeholder:text-text-tertiary',
          'ring-offset-background-deep',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          variants[variant],
          errorStyles,
          icon && iconPosition === 'left' && 'pl-10',
          icon && iconPosition === 'right' && 'pr-10',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (icon) {
      return (
        <div className="relative">
          {iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </div>
          )}
          {inputElement}
          {iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </div>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'glass' | 'outline' | 'ghost';
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', error, ...props }, ref) => {
    const variants = {
      default: `
        bg-background-surface border border-surface-border
        focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20
      `,
      glass: `
        glass-dark border border-primary-300/20
        focus:border-primary-300 focus:ring-2 focus:ring-primary-300/30
      `,
      outline: `
        bg-transparent border-2 border-surface-border
        focus:border-primary-300 focus:ring-0
      `,
      ghost: `
        bg-transparent border-0 border-b border-surface-border rounded-none
        focus:border-primary-300 focus:ring-0
      `,
    };

    const errorStyles = error
      ? 'border-error-400 focus:border-error-400 focus:ring-error-400/20'
      : '';

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm',
          'text-text-primary placeholder:text-text-tertiary',
          'ring-offset-background-deep',
          'focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200 resize-none',
          variants[variant],
          errorStyles,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'glass' | 'outline' | 'ghost';
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = 'default', error, children, ...props }, ref) => {
    const variants = {
      default: `
        bg-background-surface border border-surface-border
        focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20
      `,
      glass: `
        glass-dark border border-primary-300/20
        focus:border-primary-300 focus:ring-2 focus:ring-primary-300/30
      `,
      outline: `
        bg-transparent border-2 border-surface-border
        focus:border-primary-300 focus:ring-0
      `,
      ghost: `
        bg-transparent border-0 border-b border-surface-border rounded-none
        focus:border-primary-300 focus:ring-0
      `,
    };

    const errorStyles = error
      ? 'border-error-400 focus:border-error-400 focus:ring-error-400/20'
      : '';

    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md px-3 py-2 text-sm',
          'text-text-primary',
          'ring-offset-background-deep',
          'focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          'appearance-none bg-no-repeat bg-right',
          'bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDEuNUw2IDYuNUwxMSAxLjUiIHN0cm9rZT0iI0M4OThGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+")]',
          'pr-10',
          variants[variant],
          errorStyles,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';