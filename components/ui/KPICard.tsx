'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: ReactNode;
  variant?: 'glass' | 'gradient' | 'elevated' | 'default';
  className?: string;
  animate?: boolean;
  glow?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  change,
  changeType,
  icon,
  variant = 'glass',
  className,
  animate = true,
  glow = false,
}: KPICardProps) {
  // Determine change type from value if not provided
  const actualChangeType = changeType || (
    change ? (change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral') : undefined
  );

  const changeColors = {
    increase: 'text-accent-green',
    decrease: 'text-accent-red',
    neutral: 'text-muted-foreground',
  };

  const changeIcons = {
    increase: <ArrowUpIcon className="w-3 h-3" />,
    decrease: <ArrowDownIcon className="w-3 h-3" />,
    neutral: <MinusIcon className="w-3 h-3" />,
  };

  return (
    <Card 
      variant={variant} 
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        animate && 'hover:scale-[1.02] hover:shadow-xl',
        glow && 'hover:shadow-glow-primary',
        'card-hover',
        className
      )}
    >
      {/* Background decoration */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-300/10 via-transparent to-accent-blue/10 opacity-50" />
      )}
      
      {/* Glow effect */}
      {glow && (
        <div className="absolute -inset-px bg-gradient-to-r from-primary-300 to-accent-blue opacity-0 hover:opacity-20 transition-opacity duration-500 rounded-xl blur-sm" />
      )}

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title with icon */}
            <div className="flex items-center gap-2 mb-2">
              {icon && (
                <div className="text-primary-300 opacity-80">
                  {icon}
                </div>
              )}
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
            </div>

            {/* Value with animation */}
            <div className={cn(
              "text-3xl font-bold text-foreground mb-1",
              animate && "animate-in fade-in slide-in-from-bottom-2 duration-500"
            )}>
              {value}
            </div>

            {/* Subtitle and change */}
            <div className="flex items-center gap-3">
              {subtitle && (
                <p className="text-xs text-muted-foreground/70">
                  {subtitle}
                </p>
              )}
              
              {change !== undefined && actualChangeType && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  changeColors[actualChangeType],
                  animate && "animate-in fade-in slide-in-from-left-2 duration-700"
                )}>
                  {changeIcons[actualChangeType]}
                  <span>
                    {Math.abs(change)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Decorative element */}
          {variant === 'gradient' && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary-300/20 to-transparent blur-2xl" />
          )}
        </div>

        {/* Bottom accent line */}
        {variant === 'elevated' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-300 via-accent-blue to-primary-300 opacity-50" />
        )}
      </CardContent>
    </Card>
  );
}

// Specialized KPI card for large metrics
export function HeroKPICard({
  title,
  value,
  subtitle,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  className?: string;
}) {
  return (
    <div className={cn(
      "relative p-8 rounded-2xl",
      "bg-gradient-to-br from-primary-300/10 via-surface to-accent-blue/5",
      "border border-primary-300/20",
      "backdrop-blur-xl",
      "hover:shadow-glow-primary transition-all duration-500",
      "group",
      className
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-300/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
      
      {/* Content */}
      <div className="relative">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {title}
        </p>
        
        <div className="flex items-baseline gap-4">
          <div className="text-5xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient animate-gradient">
            {value}
          </div>
          
          {trend && (
            <div className="flex flex-col">
              <span className={cn(
                "text-lg font-semibold",
                trend.value > 0 ? "text-accent-green" : "text-accent-red"
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground/70">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="mt-3 text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-300/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-blue/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
    </div>
  );
}

// Grid of KPI cards with consistent spacing
export function KPIGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
      className
    )}>
      {children}
    </div>
  );
}