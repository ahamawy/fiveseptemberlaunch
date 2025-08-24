import React from 'react';

export function EmptyState({ title='Nothing here', hint='Try adjusting filters.' }:{ title?:string; hint?:string }){
  return (
    <div data-testid="empty-state" className="rounded-xl border border-white/10 bg-[color:var(--elevated,#160F33)] p-6 text-center">
      <p className="text-white/80">{title}</p>
      <p className="text-white/50 text-sm mt-1">{hint}</p>
    </div>
  );
}
