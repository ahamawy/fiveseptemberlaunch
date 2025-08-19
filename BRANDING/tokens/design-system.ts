/**
 * Equitie Design System Tokens
 * Comprehensive design tokens extracted from Figma with light/dark theme support
 * 
 * Usage:
 * import { tokens, getTheme, applyTheme } from '@/BRANDING/tokens/design-system';
 * const theme = getTheme('dark');
 * const primaryColor = theme.colors.primary[300];
 */

export const designSystem = {
  // Theme definitions
  themes: {
    dark: {
      name: 'dark',
      colors: {
        // Background hierarchy
        background: {
          deep: '#040210',      // Deepest background layer
          main: '#0B071A',      // Main app background
          surface: '#131016',   // Card/surface background (from Figma)
          elevated: '#1A111F',  // Elevated elements (modals, dropdowns)
          overlay: '#211829',   // Overlay backgrounds
          hover: '#2A1F33',     // Hover state backgrounds
          active: '#342841',    // Active/pressed state
        },
        
        // Primary brand colors - Equitie Purple
        primary: {
          50: '#F5F0FF',
          100: '#E8DCFF',
          200: '#D9B7FF',
          300: '#C898FF',  // Main brand purple
          400: '#B67EF0',
          500: '#A364E1',
          600: '#8F4AD2',
          700: '#7A30C3',
          800: '#6416B4',
          900: '#4E00A5',
          DEFAULT: '#C898FF',
        },
        
        // Text hierarchy
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          tertiary: '#808080',
          muted: '#666666',
          disabled: '#4D4D4D',
          inverse: '#040210',
          link: '#66D0FF',
          linkHover: '#99E0FF',
        },
        
        // Accent colors
        accent: {
          blue: '#66D0FF',
          green: '#34D399',
          orange: '#FF9A62',
          yellow: '#FFD166',
          pink: '#FF66B3',
          purple: '#B366FF',
          teal: '#66FFD0',
          red: '#FF6666',
        },
        
        // Semantic colors
        semantic: {
          success: '#22C55E',
          successLight: '#34D399',
          successDark: '#16A34A',
          warning: '#F59E0B',
          warningLight: '#FCD34D',
          warningDark: '#D97706',
          error: '#EF4444',
          errorLight: '#F87171',
          errorDark: '#DC2626',
          info: '#3B82F6',
          infoLight: '#60A5FA',
          infoDark: '#2563EB',
        },
        
        // Surface colors
        surface: {
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.12)',
          divider: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(200, 152, 255, 0.1)',
          active: 'rgba(200, 152, 255, 0.2)',
          selected: 'rgba(200, 152, 255, 0.15)',
          disabled: 'rgba(255, 255, 255, 0.04)',
        },
      },
      
      // Glass morphism effects
      glass: {
        background: 'rgba(255, 255, 255, 0.04)',
        backgroundHover: 'rgba(255, 255, 255, 0.06)',
        backgroundActive: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.12)',
        blur: '16px',
        blurLight: '8px',
      },
      
      // Shadows
      shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.4)',
        sm: '0 2px 4px rgba(0, 0, 0, 0.5)',
        md: '0 4px 8px rgba(0, 0, 0, 0.6)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.7)',
        xl: '0 12px 24px rgba(0, 0, 0, 0.8)',
        '2xl': '0 24px 48px rgba(0, 0, 0, 0.9)',
        glow: {
          purple: '0 0 24px rgba(200, 152, 255, 0.4)',
          blue: '0 0 24px rgba(102, 208, 255, 0.4)',
          green: '0 0 24px rgba(52, 211, 153, 0.4)',
          orange: '0 0 24px rgba(255, 154, 98, 0.4)',
        },
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
    },
    
    light: {
      name: 'light',
      colors: {
        // Background hierarchy
        background: {
          deep: '#FFFFFF',
          main: '#FAFAFA',
          surface: '#FFFFFF',
          elevated: '#FFFFFF',
          overlay: '#FFFFFF',
          hover: '#F5F5F5',
          active: '#EBEBEB',
        },
        
        // Primary brand colors
        primary: {
          50: '#F5F0FF',
          100: '#E8DCFF',
          200: '#D9B7FF',
          300: '#C898FF',
          400: '#B67EF0',
          500: '#A364E1',
          600: '#8F4AD2',
          700: '#7A30C3',
          800: '#6416B4',
          900: '#4E00A5',
          DEFAULT: '#8F4AD2',
        },
        
        // Text hierarchy
        text: {
          primary: '#1A1A1A',
          secondary: '#4D4D4D',
          tertiary: '#808080',
          muted: '#999999',
          disabled: '#B3B3B3',
          inverse: '#FFFFFF',
          link: '#2563EB',
          linkHover: '#1D4ED8',
        },
        
        // Accent colors
        accent: {
          blue: '#0EA5E9',
          green: '#10B981',
          orange: '#F97316',
          yellow: '#EAB308',
          pink: '#EC4899',
          purple: '#8B5CF6',
          teal: '#14B8A6',
          red: '#EF4444',
        },
        
        // Semantic colors
        semantic: {
          success: '#16A34A',
          successLight: '#22C55E',
          successDark: '#15803D',
          warning: '#D97706',
          warningLight: '#F59E0B',
          warningDark: '#B45309',
          error: '#DC2626',
          errorLight: '#EF4444',
          errorDark: '#B91C1C',
          info: '#2563EB',
          infoLight: '#3B82F6',
          infoDark: '#1E40AF',
        },
        
        // Surface colors
        surface: {
          border: 'rgba(0, 0, 0, 0.08)',
          borderHover: 'rgba(0, 0, 0, 0.12)',
          divider: 'rgba(0, 0, 0, 0.06)',
          hover: 'rgba(200, 152, 255, 0.08)',
          active: 'rgba(200, 152, 255, 0.15)',
          selected: 'rgba(200, 152, 255, 0.12)',
          disabled: 'rgba(0, 0, 0, 0.04)',
        },
      },
      
      // Glass morphism effects
      glass: {
        background: 'rgba(255, 255, 255, 0.7)',
        backgroundHover: 'rgba(255, 255, 255, 0.8)',
        backgroundActive: 'rgba(255, 255, 255, 0.9)',
        border: 'rgba(0, 0, 0, 0.08)',
        borderHover: 'rgba(0, 0, 0, 0.12)',
        blur: '16px',
        blurLight: '8px',
      },
      
      // Shadows
      shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
        md: '0 4px 8px rgba(0, 0, 0, 0.08)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
        xl: '0 12px 24px rgba(0, 0, 0, 0.12)',
        '2xl': '0 24px 48px rgba(0, 0, 0, 0.14)',
        glow: {
          purple: '0 0 24px rgba(200, 152, 255, 0.25)',
          blue: '0 0 24px rgba(102, 208, 255, 0.25)',
          green: '0 0 24px rgba(52, 211, 153, 0.25)',
          orange: '0 0 24px rgba(255, 154, 98, 0.25)',
        },
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  
  // Typography system
  typography: {
    // Font families
    fontFamily: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, "SF Mono", Monaco, Consolas, monospace',
    },
    
    // Font sizes and line heights
    fontSize: {
      // Display sizes
      'display-xl': ['72px', { lineHeight: '90px', letterSpacing: '-0.02em' }],
      'display-lg': ['60px', { lineHeight: '72px', letterSpacing: '-0.02em' }],
      'display-md': ['48px', { lineHeight: '60px', letterSpacing: '-0.01em' }],
      'display-sm': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em' }],
      
      // Heading sizes
      'h1': ['30px', { lineHeight: '36px', letterSpacing: '-0.01em' }],
      'h2': ['24px', { lineHeight: '32px', letterSpacing: '0' }],
      'h3': ['20px', { lineHeight: '28px', letterSpacing: '0' }],
      'h4': ['18px', { lineHeight: '24px', letterSpacing: '0' }],
      'h5': ['16px', { lineHeight: '20px', letterSpacing: '0' }],
      'h6': ['14px', { lineHeight: '20px', letterSpacing: '0' }],
      
      // Body sizes
      'body-xl': ['18px', { lineHeight: '28px' }],
      'body-lg': ['16px', { lineHeight: '24px' }],
      'body-md': ['14px', { lineHeight: '20px' }],
      'body-sm': ['13px', { lineHeight: '18px' }],
      'body-xs': ['12px', { lineHeight: '16px' }],
      
      // Label sizes
      'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
      'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
      'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.01em' }],
    },
    
    // Font weights
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },
  
  // Spacing scale (4px base unit)
  spacing: {
    0: '0px',
    px: '1px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
    72: '288px',
    80: '320px',
    96: '384px',
  },
  
  // Border radius
  borderRadius: {
    none: '0px',
    sm: '4px',
    DEFAULT: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
  },
  
  // Breakpoints
  screens: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index scale
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
  },
  
  // Animation
  animation: {
    // Durations
    duration: {
      instant: '50ms',
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      slowest: '500ms',
    },
    
    // Easing functions
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    // Keyframes
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      slideInUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideInDown: {
        '0%': { transform: 'translateY(-20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideInLeft: {
        '0%': { transform: 'translateX(-20px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      slideInRight: {
        '0%': { transform: 'translateX(20px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.95)', opacity: '0' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      bounce: {
        '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
        '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
      },
      spin: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
    },
  },
  
  // Gradients
  gradients: {
    // Brand gradients
    brand: {
      primary: 'linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%)',
      secondary: 'linear-gradient(135deg, #66D0FF 0%, #3B82F6 100%)',
      success: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
      warning: 'linear-gradient(135deg, #FFD166 0%, #F59E0B 100%)',
      error: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
      hero: 'linear-gradient(145deg, #C898FF 0%, #66D0FF 100%)',
      sunset: 'linear-gradient(135deg, #FF9A62 0%, #FF66B3 100%)',
      ocean: 'linear-gradient(135deg, #66D0FF 0%, #66FFD0 100%)',
      forest: 'linear-gradient(135deg, #34D399 0%, #66FFD0 100%)',
    },
    
    // Mesh gradients
    mesh: {
      purple: 'radial-gradient(at 20% 50%, #C898FF 0%, transparent 50%)',
      blue: 'radial-gradient(at 80% 50%, #66D0FF 0%, transparent 50%)',
      green: 'radial-gradient(at 50% 100%, #34D399 0%, transparent 50%)',
      combined: `
        radial-gradient(at 20% 50%, rgba(200, 152, 255, 0.3) 0%, transparent 50%),
        radial-gradient(at 80% 50%, rgba(102, 208, 255, 0.3) 0%, transparent 50%),
        radial-gradient(at 50% 100%, rgba(52, 211, 153, 0.3) 0%, transparent 50%)
      `,
    },
    
    // Overlay gradients
    overlay: {
      dark: 'linear-gradient(180deg, rgba(4, 2, 16, 0) 0%, rgba(4, 2, 16, 0.8) 100%)',
      light: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
      topFade: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 100%)',
      bottomFade: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.5) 100%)',
    },
  },
};

// Helper functions
export function getTheme(mode: 'dark' | 'light' = 'dark') {
  return designSystem.themes[mode];
}

export function applyTheme(mode: 'dark' | 'light' = 'dark') {
  const theme = getTheme(mode);
  const root = document.documentElement;
  
  // Apply CSS variables
  Object.entries(theme.colors).forEach(([category, colors]) => {
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${category}-${key}`, value as string);
    });
  });
  
  // Apply other theme properties
  root.style.setProperty('--glass-blur', theme.glass.blur);
  root.style.setProperty('--glass-bg', theme.glass.background);
  root.style.setProperty('--glass-border', theme.glass.border);
  
  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', mode);
}

// Get a specific token value
export function getToken(path: string, theme: 'dark' | 'light' = 'dark'): any {
  const parts = path.split('.');
  let value: any = designSystem;
  
  // If path starts with theme-specific token
  if (parts[0] === 'theme') {
    value = designSystem.themes[theme];
    parts.shift();
  }
  
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) break;
  }
  
  return value;
}

// Export individual token categories for convenience
export const tokens = designSystem;
export const darkTheme = designSystem.themes.dark;
export const lightTheme = designSystem.themes.light;
export const typography = designSystem.typography;
export const spacing = designSystem.spacing;
export const animation = designSystem.animation;
export const gradients = designSystem.gradients;
export const screens = designSystem.screens;

export default designSystem;