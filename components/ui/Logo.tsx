'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'monogram';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { fontSize: 14 },
  sm: { fontSize: 18 },
  md: { fontSize: 20 },
  lg: { fontSize: 24 },
  xl: { fontSize: 32 },
};

export function Logo({ 
  variant = 'full', 
  size = 'md', 
  className
}: LogoProps) {
  const { fontSize } = sizes[size];

  if (variant === 'monogram') {
    return (
      <div 
        className={cn(
          'flex items-center justify-center rounded-lg',
          'bg-gradient-to-br from-primary to-primary/80',
          'w-10 h-10',
          className
        )}
      >
        <span 
          className="font-bold text-white font-heading"
          style={{ fontSize }}
        >
          E
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
        <span className="font-bold text-white text-xl">E</span>
      </div>
      <span 
        className={cn(
          'font-bold font-heading tracking-wider',
          'text-foreground',
          size === 'xs' && 'text-sm',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-xl',
          size === 'xl' && 'text-2xl'
        )}
      >
        Equitie
      </span>
    </div>
  );
}