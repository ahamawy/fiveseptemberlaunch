// Minimal brand configuration
export const brand = {
  name: 'EquiTie',
  colors: {
    primary: '#8B5CF6',
    secondary: '#00D4AA',
    background: '#0A0A0B',
    surface: '#141416',
    text: '#FFFFFF',
    muted: '#8B8D98'
  }
};

export const tokens = {
  colors: brand.colors,
  typography: {
    heading: 'JetBrains Mono, monospace',
    body: 'Space Grotesk, sans-serif'
  }
};

// Chart colors for consistency
export const BRAND_CONFIG = {
  charts: {
    palette: {
      primary: '#8B5CF6',
      accent: '#00D4AA',
      success: '#22C55E',
      info: '#06B6D4',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    colors: ['#8B5CF6', '#00D4AA', '#22C55E', '#06B6D4', '#F59E0B', '#EF4444'],
    background: 'transparent',
    gridColor: 'rgba(148, 163, 184, 0.2)',
    tickColor: '#9CA3AF',
    fontFamily: 'Space Grotesk, ui-sans-serif, system-ui',
    tooltipBg: 'rgba(17, 24, 39, 0.9)',
    tooltipBorder: 'rgba(255, 255, 255, 0.1)'
  }
};

// Color scheme constants
export const DEFAULT_COLOR_SCHEME = 'default';
export const COLOR_SCHEMES = {
  default: {
    name: 'Default',
    primary: '#8B5CF6',
    secondary: '#00D4AA'
  }
};

export default brand;