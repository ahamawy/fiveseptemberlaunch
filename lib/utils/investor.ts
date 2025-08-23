export function resolveInvestorId(param: string | null): string {
  // Priority: URL param → localStorage → env default → '1'
  if (param && String(param).trim().length > 0) return String(param).trim();
  try {
    if (typeof window !== 'undefined') {
      const ls = window.localStorage.getItem('equitie-current-investor-id');
      if (ls && ls.trim().length > 0) return ls.trim();
    }
  } catch {}
  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_INVESTOR_ID;
  if (envDefault && envDefault.trim().length > 0) return envDefault.trim();
  return '1';
}


