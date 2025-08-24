'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SupabaseImageProps {
  bucket: string;
  path: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function SupabaseImage({
  bucket,
  path,
  alt,
  width = 100,
  height = 100,
  className = '',
  priority = false,
  fallback = '/placeholder.svg'
}: SupabaseImageProps) {
  const [error, setError] = useState(false);
  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;

  if (error) {
    return (
      <div 
        className={`bg-gradient-to-br from-primary-300/20 to-primary-500/10 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-xs">Image</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
      unoptimized
    />
  );
}

// Logo component with proper Equitie branding
export function EquitieLogo({ 
  variant = 'horizontal',
  className = '',
  width = 150,
  height = 50 
}: { 
  variant?: 'horizontal' | 'stacked' | 'square';
  className?: string;
  width?: number;
  height?: number;
}) {
  const logoMap = {
    horizontal: 'EQUITIE LOGO - Horizontal.png',
    stacked: 'EQUITIE LOGO - Stacked.png',
    square: 'Square Logo White.png'
  };

  return (
    <SupabaseImage
      bucket="equitiebrand"
      path={logoMap[variant]}
      alt="Equitie Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}