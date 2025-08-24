/**
 * Design Tokens for Equitie Design System
 * 
 * Centralized design tokens synchronized with Figma designs.
 * These tokens provide the foundation for consistent UI across the application.
 * 
 * @example
 * ```typescript
 * import { designTokens } from '@/components/style-guide';
 * const theme = designTokens.themes.dark;
 * const primaryColor = theme.primary[300]; // #C898FF
 * ```
 * 
 * @see {@link https://figma.com/equitie-design-system} Figma Design System
 */
export const designTokens = {
  themes: {
    dark: {
      // Core Background Colors - From Figma (#131016)
      background: {
        deep: '#040210',      // Deepest background
        main: '#0B071A',      // Main app background
        surface: '#131016',   // Surface/card background from Figma
        elevated: '#1A111F',  // Elevated elements
        overlay: '#211829',   // Modal/dropdown overlays
        hover: '#2A1F33',     // Hover states
      },
      
      // Primary Brand Colors - Equitie Purple
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
      },
      
      // Text Colors
      text: {
        primary: '#FFFFFF',
        secondary: '#B3B3B3',
        tertiary: '#808080',
        muted: '#666666',
        disabled: '#4D4D4D',
        inverse: '#040210',
      },
      
      // Accent Colors from Figma
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
      
      // Semantic Colors
      semantic: {
        success: '#22C55E',
        successLight: '#34D399',
        warning: '#F59E0B',
        warningLight: '#FCD34D',
        error: '#EF4444',
        errorLight: '#F87171',
        info: '#3B82F6',
        infoLight: '#60A5FA',
      },
      
      // Surface & Border Colors
      surface: {
        border: 'rgba(255, 255, 255, 0.08)',
        divider: 'rgba(255, 255, 255, 0.06)',
        hover: 'rgba(200, 152, 255, 0.1)',
        active: 'rgba(200, 152, 255, 0.2)',
        selected: 'rgba(200, 152, 255, 0.15)',
      },
    },
    
    light: {
      // Light Theme Colors
      background: {
        deep: '#FFFFFF',
        main: '#FAFAFA',
        surface: '#FFFFFF',
        elevated: '#FFFFFF',
        overlay: '#FFFFFF',
        hover: '#F5F5F5',
      },
      
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
      },
      
      text: {
        primary: '#1A1A1A',
        secondary: '#4D4D4D',
        tertiary: '#808080',
        muted: '#999999',
        disabled: '#B3B3B3',
        inverse: '#FFFFFF',
      },
      
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
      
      semantic: {
        success: '#16A34A',
        successLight: '#22C55E',
        warning: '#D97706',
        warningLight: '#F59E0B',
        error: '#DC2626',
        errorLight: '#EF4444',
        info: '#2563EB',
        infoLight: '#3B82F6',
      },
      
      surface: {
        border: 'rgba(0, 0, 0, 0.08)',
        divider: 'rgba(0, 0, 0, 0.06)',
        hover: 'rgba(200, 152, 255, 0.1)',
        active: 'rgba(200, 152, 255, 0.2)',
        selected: 'rgba(200, 152, 255, 0.15)',
      },
    },
  },
  
  // Typography System from Figma
  typography: {
    fontFamilies: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: 'JetBrains Mono, "SF Mono", Consolas, monospace',
    },
    
    scale: {
      display: {
        xl: { size: '72px', lineHeight: '90px', weight: 700, tracking: '-0.02em' },
        lg: { size: '60px', lineHeight: '72px', weight: 700, tracking: '-0.02em' },
        md: { size: '48px', lineHeight: '60px', weight: 600, tracking: '-0.01em' },
        sm: { size: '36px', lineHeight: '44px', weight: 600, tracking: '-0.01em' },
      },
      heading: {
        h1: { size: '30px', lineHeight: '36px', weight: 600, tracking: '-0.01em' },
        h2: { size: '24px', lineHeight: '32px', weight: 600, tracking: '0' },
        h3: { size: '20px', lineHeight: '28px', weight: 600, tracking: '0' },
        h4: { size: '18px', lineHeight: '24px', weight: 500, tracking: '0' },
        h5: { size: '16px', lineHeight: '20px', weight: 500, tracking: '0' },
        h6: { size: '14px', lineHeight: '20px', weight: 500, tracking: '0' },
      },
      body: {
        xl: { size: '18px', lineHeight: '28px', weight: 400, tracking: '0' },
        lg: { size: '16px', lineHeight: '24px', weight: 400, tracking: '0' },
        md: { size: '14px', lineHeight: '20px', weight: 400, tracking: '0' },
        sm: { size: '13px', lineHeight: '18px', weight: 400, tracking: '0' },
        xs: { size: '12px', lineHeight: '16px', weight: 400, tracking: '0' },
      },
      label: {
        lg: { size: '14px', lineHeight: '20px', weight: 500, tracking: '0.01em' },
        md: { size: '12px', lineHeight: '16px', weight: 500, tracking: '0.01em' },
        sm: { size: '11px', lineHeight: '14px', weight: 500, tracking: '0.01em' },
      },
    },
  },
  
  // Spacing System
  spacing: {
    base: 4, // 4px base unit
    scale: {
      '0': '0px',
      'px': '1px',
      '0.5': '2px',
      '1': '4px',
      '1.5': '6px',
      '2': '8px',
      '2.5': '10px',
      '3': '12px',
      '3.5': '14px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      '14': '56px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
      '28': '112px',
      '32': '128px',
      '36': '144px',
      '40': '160px',
      '44': '176px',
      '48': '192px',
      '52': '208px',
      '56': '224px',
      '60': '240px',
      '64': '256px',
      '72': '288px',
      '80': '320px',
      '96': '384px',
    },
  },
  
  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    dark: {
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
      },
    },
    light: {
      xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
      sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
      md: '0 4px 8px rgba(0, 0, 0, 0.08)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
      xl: '0 12px 24px rgba(0, 0, 0, 0.12)',
      '2xl': '0 24px 48px rgba(0, 0, 0, 0.14)',
      glow: {
        purple: '0 0 24px rgba(200, 152, 255, 0.3)',
        blue: '0 0 24px rgba(102, 208, 255, 0.3)',
        green: '0 0 24px rgba(52, 211, 153, 0.3)',
      },
    },
  },
  
  // Glass Morphism Effects
  glass: {
    dark: {
      background: 'rgba(255, 255, 255, 0.04)',
      backgroundHover: 'rgba(255, 255, 255, 0.06)',
      backgroundActive: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.12)',
      blur: 'blur(16px)',
      blurLight: 'blur(8px)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      backgroundHover: 'rgba(255, 255, 255, 0.8)',
      backgroundActive: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(0, 0, 0, 0.12)',
      blur: 'blur(16px)',
      blurLight: 'blur(8px)',
    },
  },
  
  // Motion & Animation
  motion: {
    duration: {
      instant: '50ms',
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      slowest: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Gradients
  gradients: {
    brand: {
      primary: 'linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%)',
      secondary: 'linear-gradient(135deg, #66D0FF 0%, #3B82F6 100%)',
      success: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
      warning: 'linear-gradient(135deg, #FFD166 0%, #F59E0B 100%)',
      error: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
    },
    mesh: {
      purple: 'radial-gradient(at 20% 50%, #C898FF 0%, transparent 50%)',
      blue: 'radial-gradient(at 80% 50%, #66D0FF 0%, transparent 50%)',
      green: 'radial-gradient(at 50% 100%, #34D399 0%, transparent 50%)',
    },
    overlay: {
      dark: 'linear-gradient(180deg, rgba(4, 2, 16, 0) 0%, rgba(4, 2, 16, 0.8) 100%)',
      light: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
    },
  },
  
  // Z-Index Scale
  zIndex: {
    hide: -1,
    base: 0,
    raised: 10,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
  },
};