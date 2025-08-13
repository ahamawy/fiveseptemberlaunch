import React from 'react';

export function LoadingSkeleton({ lines = 3 }:{ lines?: number }){
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      {Array.from({ length: lines }).map((_,i)=>(
        <div key={i} className="h-4 bg-white/10 rounded mb-3" />
      ))}
    </div>
  );
}
