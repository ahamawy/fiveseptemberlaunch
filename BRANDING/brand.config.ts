/**
 * Brand tokens + presets for Equitie.
 * Import in app: `import { BRAND_CONFIG, COMPONENT_STYLES, theme, brandCSS } from "@/config/brand.config"`
 */

export const BRAND_CONFIG = {
  colors: {
    primary: {
      hero: "#C898FF",
      light: "#D9B7FF",
      dark:  "#9B7AC1",
      DEFAULT: "#C18AFF"
    },
    secondary: {
      orange: "#FF9A62",
      yellow: "#FFD166",
      blue:   "#66D0FF",
      green:  "#34D399",
      red:    "#F87171"
    },
    semantic: {
      success: "#22C55E",
      warning: "#F59E0B",
      error:   "#EF4444",
      info:    "#3B82F6"
    },
    gray: {
      DEFAULT: "#8B8B93",
      light:   "#A9A9B2",
      dark:    "#565666"
    },
    background: {
      deep:     "#040210",
      surface:  "#0B071A",
      card:     "#0F0B22",
      elevated: "#160F33"
    }
  },
  typography: {
    fontFamily: {
      primary: "Inter, ui-sans-serif, system-ui",
      heading: "Inter, ui-sans-serif, system-ui",
      body:    "Inter, ui-sans-serif, system-ui"
    },
    fontSize: {
      xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem",
      xl: "1.25rem", _2xl: "1.5rem", _3xl: "1.875rem",
      _4xl: "2.25rem", _5xl: "3rem"
    },
    fontWeight: {
      light: "300", regular: "400", medium: "500", semibold: "600", bold: "700"
    }
  },
  spacing: { xs: "0.25rem", sm: "0.5rem", md: "1rem", lg: "1.5rem", xl: "2rem", _2xl: "3rem", _3xl: "4rem" },
  borderRadius: { none: "0", sm: "0.125rem", DEFAULT: "0.25rem", md: "0.375rem", lg: "0.5rem", xl: "0.75rem", _2xl: "1rem", full: "9999px" },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.1)",
    DEFAULT: "0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.06)",
    md: "0 4px 6px rgba(0,0,0,0.2)",
    lg: "0 10px 15px rgba(0,0,0,0.25)",
    xl: "0 20px 25px rgba(0,0,0,0.3)",
    _2xl: "0 25px 50px rgba(0,0,0,0.35)",
    glow: "0 0 32px rgba(200,152,255,0.35)"
  },
  glass: {
    background: "rgba(255,255,255,0.04)",
    backgroundLight: "rgba(255,255,255,0.08)",
    backdropBlur: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.12)"
  },
  animation: {
    duration: { fast: "120ms", normal: "200ms", slow: "320ms" },
    easing: { default: "cubic-bezier(0.2, 0.8, 0.2, 1)", spring: "cubic-bezier(0.16, 1, 0.3, 1)" }
  },
  gradients: {
    primary: "linear-gradient(135deg, #C898FF 0%, #9B7AC1 100%)",
    dark:    "linear-gradient(180deg, #0B071A 0%, #040210 100%)",
    surface: "linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    radial:  "radial-gradient(1000px 600px at 20% -10%, rgba(200,152,255,0.25), transparent)",
    hero:    "linear-gradient(145deg, #C898FF, #66D0FF)"
  }
  ,
  charts: {
    palette: {
      primary: "#C898FF",
      accent: "#66D0FF",
      success: "#22C55E",
      info: "#3B82F6",
      warning: "#F59E0B",
      error: "#EF4444"
    },
    gridColor: "rgba(255,255,255,0.08)",
    tickColor: "rgba(255,255,255,0.6)",
    tooltipBg: "rgba(15,11,34,0.95)",
    tooltipBorder: "rgba(255,255,255,0.12)",
    fontFamily: "Inter, ui-sans-serif, system-ui"
  }
} as const;

export const theme = BRAND_CONFIG; // alias

export function getBrandValue(path: string): any {
  return path.split(".").reduce((acc: any, key: string) => (acc ? acc[key] : undefined), BRAND_CONFIG);
}

export function brandCSS(property: string, path: string): Record<string, string> {
  const val = getBrandValue(path);
  return { [property]: String(val ?? "") };
}

export function applyBrandStyles(el: HTMLElement, styles: string[]) {
  styles.forEach((p) => {
    const [property, path] = p.split("::");
    const val = getBrandValue(path);
    if (val) el.style.setProperty(property, String(val));
  });
}

export const COMPONENT_STYLES = {
  card: {
    base: "bg-[color:var(--surface,#0F0B22)] border border-white/10 rounded-lg p-4 shadow",
    elevated: "bg-[color:var(--elevated,#160F33)] border border-white/10 rounded-xl p-6 shadow-lg",
    gradient: "bg-gradient-to-br from-[#C898FF]/15 to-[#66D0FF]/10 border border-white/10 rounded-xl p-6 shadow-[0_0_24px_rgba(200,152,255,0.15)]"
  },
  button: {
    primary: "bg-equitie-purple text-white hover:bg-equitie-purple/90 active:scale-95 transition",
    secondary: "bg-white/10 text-white hover:bg-white/20 active:scale-95 border border-white/10",
    danger: "bg-equitie-red text-white hover:bg-equitie-red/90 active:scale-95",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95",
    ghost: "bg-transparent text-white hover:bg-white/10"
  },
  input: {
    base: "bg-white/5 border border-white/10 rounded-md px-3 py-2 outline-none focus:ring-2 ring-equitie-purple/50",
    error: "bg-white/5 border border-red-500/50 text-red-100 focus:ring-red-400",
    success: "bg-white/5 border border-emerald-500/50 text-emerald-100 focus:ring-emerald-400"
  },
  badge: {
    success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    error: "bg-red-500/15 text-red-300 border border-red-500/30",
    info: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    neutral: "bg-white/10 text-white border border-white/20"
  },
  text: {
    heading: "text-white font-semibold",
    subheading: "text-white/80",
    body: "text-white/80",
    muted: "text-white/60",
    link: "text-equitie-blue underline-offset-2 hover:underline"
  },
  table: {
    container: "bg-white/5 border border-white/10 rounded-lg overflow-hidden",
    header: "bg-white/5",
    headerCell: "text-white/70 text-xs uppercase tracking-wide",
    row: "hover:bg-white/5 transition",
    cell: "text-white/80"
  },
  nav: {
    item: "text-white/70 hover:text-white",
    itemActive: "text-white"
  },
  modal: {
    backdrop: "bg-black/50 backdrop-blur-md",
    container: "bg-[color:var(--elevated,#160F33)] border border-white/10 rounded-xl shadow-2xl",
    header: "border-b border-white/10 pb-3",
    body: "py-4",
    footer: "border-t border-white/10 pt-3"
  }
} as const;
