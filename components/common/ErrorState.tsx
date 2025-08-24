import React from 'react';

export function ErrorState({ title='Error', message='Unexpected error', onRetry }:{ title?:string; message?:string; onRetry?:()=>void}){
  return (
    <div data-testid="error-state" className="rounded-xl border border-white/10 bg-[color:var(--elevated,#160F33)] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-white/70 text-sm mt-1">{message}</p>
        </div>
        {onRetry && <button className="bg-equitie-purple text-white rounded-md px-3 py-2 text-sm" onClick={onRetry}>Retry</button>}
      </div>
    </div>
  );
}
