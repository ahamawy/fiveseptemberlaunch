'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'gradient' | 'elevated' | 'default' | 'outline';
  children: ReactNode;
}

export function Card({ 
  variant = 'default', 
  className, 
  children,
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-surface border border-surface-border',
    glass: 'bg-glass-medium backdrop-blur-xl border border-glass-border',
    gradient: 'bg-gradient-to-br from-primary-300/10 via-surface to-secondary-blue/10 border border-primary-300/20',
    elevated: 'bg-surface-elevated border border-surface-border shadow-elevated',
    outline: 'bg-transparent border border-surface-border'
  };

  return (
    <div
      className={cn(
        'rounded-xl p-6 transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  gradient?: boolean;
}

export function CardTitle({
  className,
  children,
  gradient,
  ...props
}: CardTitleProps) {
  const base = 'text-xl font-semibold text-white';
  const gradientClass = gradient
    ? 'bg-gradient-to-r from-primary-300 to-accent-blue text-gradient'
    : '';
  return (
    <h3 className={cn(base, gradientClass, className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-gray-400', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-surface-border', className)} {...props}>
      {children}
    </div>
  );
}