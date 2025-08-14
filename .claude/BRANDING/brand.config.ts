// Minimal brand tokens + helpers (expand as needed)
export const BRAND_CONFIG = {
  colors: {
    primary: { hero: '#7C3AED', DEFAULT: '#6D28D9', light: '#A78BFA', dark: '#4C1D95' },
    secondary: { orange: '#FB923C', yellow: '#FBBF24', blue: '#60A5FA', green: '#34D399', red: '#F87171' },
    semantic: { success: '#22C55E', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6' },
    gray: { DEFAULT: '#9CA3AF', light: '#E5E7EB', dark: '#374151' },
    background: { deep: '#0B0720', surface: '#100A28', card: '#160F33', elevated: '#1B1142' }
  },
  typography: {
    fontFamily: { primary: 'Inter, system-ui', heading: 'Inter, system-ui', body: 'Inter, system-ui' },
    fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem' },
    fontWeight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 }
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem' },
  borderRadius: { none: '0', sm: '0.125rem', DEFAULT: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', '2xl': '1.25rem', full: '9999px' },
  shadows: { sm: '0 1px 2px rgba(0,0,0,.05)', DEFAULT: '0 1px 3px rgba(0,0,0,.1)', md: '0 4px 6px rgba(0,0,0,.1)', lg: '0 10px 15px rgba(0,0,0,.15)', xl: '0 20px 25px rgba(0,0,0,.2)', '2xl': '0 25px 50px rgba(0,0,0,.25)', glow: '0 0 20px rgba(124,58,237,.5)' },
  glass: { background: 'rgba(255,255,255,0.06)', backgroundLight: 'rgba(255,255,255,0.03)', backdropBlur: '8px', border: '1px solid rgba(255,255,255,0.12)' },
  animation: { duration: { fast: '150ms', normal: '250ms', slow: '400ms' }, easing: { default: 'cubic-bezier(.2,.8,.2,1)', spring: 'cubic-bezier(.34,1.56,.64,1)' } },
  gradients: { primary: 'linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%)', dark: 'linear-gradient(135deg,#0B0720,#1B1142)', surface: 'linear-gradient(135deg,#100A28,#160F33)', radial: 'radial-gradient(circle at 30% 30%, #1B1142, #0B0720 60%)', hero: 'linear-gradient(90deg,#A78BFA,#7C3AED,#4C1D95)' }
};

export const COMPONENT_STYLES = {
  card: { base: 'rounded-xl border border-white/10 bg-[color:var(--card,#160F33)] p-4', elevated: 'shadow-md shadow-black/30', gradient: 'bg-gradient-to-br from-purple-900/40 to-black/20' },
  button: {
    primary: 'bg-equitie-purple text-white hover:bg-equitie-purple/90 active:scale-95',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    ghost: 'bg-transparent hover:bg-white/5'
  },
  input: { base: 'bg-white/5 border border-white/10 rounded-md text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 px-3 py-2', error: 'border-red-500', success: 'border-emerald-500' },
  table: { container: 'rounded-lg border border-white/10 overflow-hidden', header: 'bg-white/5', headerCell: 'px-3 py-2 text-white/70', row: 'border-t border-white/10 hover:bg-white/5', cell: 'px-3 py-2 text-white/80' }
};

export const theme = BRAND_CONFIG;

export const getBrandValue = (path) => path.split('.').reduce((a,k)=>a?.[k], BRAND_CONFIG);
export const brandCSS = (prop, path) => ({ [prop]: getBrandValue(path) });
export const applyBrandStyles = (el, styles) => styles;
