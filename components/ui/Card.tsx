'use client';

import { cn } from '@/lib/utils';
import { ReactNode, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'glass' | 'gradient' | 'elevated' | 'default' | 'outline' | 'hero';
  children: ReactNode;
  glow?: boolean;
  animate?: boolean;
}

export function Card({ 
  variant = 'glass', 
  className, 
  children,
  glow = false,
  animate = false,
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-card border border-border',
    glass: 'bg-card/60 backdrop-blur-md border border-border/50',
    gradient: 'bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20',
    elevated: 'bg-card border border-border shadow-elevated',
    outline: 'bg-transparent border border-border',
    hero: 'bg-gradient-mesh border border-border/30 backdrop-blur-xl'
  };

  const Component: any = animate ? motion.div : 'div';
  const componentProps: any = animate ? {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 },
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    ...props
  } : props;

  return (
    <Component
      className={cn(
        'relative rounded-xl p-6 transition-all duration-300 overflow-hidden',
        variants[variant],
        glow && 'hover:shadow-glow-primary',
        animate && 'hover:scale-[1.02] hover:shadow-xl',
        className
      )}
      {...componentProps}
    >
      {/* Glow effect overlay */}
      {glow && (
        <div className="absolute -inset-px bg-gradient-to-r from-primary-300 to-accent-blue opacity-0 hover:opacity-20 transition-opacity duration-500 rounded-xl blur-sm pointer-events-none" />
      )}
      
      {/* Background gradient for hero variant */}
      {variant === 'hero' && (
        <>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-300/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </Component>
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
  gradient = false,
  ...props
}: CardTitleProps) {
  const base = 'text-xl font-bold font-heading tracking-tight';
  const gradientClass = gradient
    ? 'bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'
    : 'text-foreground';
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
    <div className={cn('mt-4 pt-4 border-t border-border', className)} {...props}>
      {children}
    </div>
  );
}