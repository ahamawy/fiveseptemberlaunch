/** @type {import('tailwindcss').Config} */
const { colors } = require('./branding/tokens/colors');
const { typography } = require('./branding/tokens/typography');
const { spacing } = require('./branding/tokens/spacing');
const { shadows } = require('./branding/tokens/shadows');
const { animations } = require('./branding/tokens/animations');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS Variable based colors for theme switching
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Background colors using CSS variables
        background: {
          deep: 'rgb(var(--bg-deep) / <alpha-value>)',
          main: 'rgb(var(--bg-main) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
          overlay: 'rgb(var(--bg-overlay) / <alpha-value>)',
          hover: 'rgb(var(--bg-hover) / <alpha-value>)',
          active: 'rgb(var(--bg-active) / <alpha-value>)',
        },
        
        // Primary colors using CSS variables
        primary: {
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          200: 'rgb(var(--primary-200) / <alpha-value>)',
          300: 'rgb(var(--primary-300) / <alpha-value>)',
          400: 'rgb(var(--primary-400) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
          700: 'rgb(var(--primary-700) / <alpha-value>)',
          800: 'rgb(var(--primary-800) / <alpha-value>)',
          900: 'rgb(var(--primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--primary-300) / <alpha-value>)',
        },
        
        // Text colors using CSS variables
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          disabled: 'rgb(var(--text-disabled) / <alpha-value>)',
          inverse: 'rgb(var(--text-inverse) / <alpha-value>)',
          link: 'rgb(var(--text-link) / <alpha-value>)',
        },
        
        // Accent colors using CSS variables
        accent: {
          blue: 'rgb(var(--accent-blue) / <alpha-value>)',
          green: 'rgb(var(--accent-green) / <alpha-value>)',
          orange: 'rgb(var(--accent-orange) / <alpha-value>)',
          yellow: 'rgb(var(--accent-yellow) / <alpha-value>)',
          pink: 'rgb(var(--accent-pink) / <alpha-value>)',
          purple: 'rgb(var(--accent-purple) / <alpha-value>)',
          teal: 'rgb(var(--accent-teal) / <alpha-value>)',
          red: 'rgb(var(--accent-red) / <alpha-value>)',
        },
        
        // Semantic colors using CSS variables
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          light: 'rgb(var(--success-light) / <alpha-value>)',
          dark: 'rgb(var(--success-dark) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
          light: 'rgb(var(--warning-light) / <alpha-value>)',
          dark: 'rgb(var(--warning-dark) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--error) / <alpha-value>)',
          light: 'rgb(var(--error-light) / <alpha-value>)',
          dark: 'rgb(var(--error-dark) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--info) / <alpha-value>)',
          light: 'rgb(var(--info-light) / <alpha-value>)',
          dark: 'rgb(var(--info-dark) / <alpha-value>)',
        },
        
        // Surface colors for borders and dividers
        surface: {
          border: 'rgba(var(--surface-border) / var(--surface-border-opacity))',
          divider: 'rgba(var(--surface-border) / var(--surface-divider-opacity))',
          hover: 'rgba(var(--primary-300) / var(--surface-hover-opacity))',
          active: 'rgba(var(--primary-300) / var(--surface-active-opacity))',
          disabled: 'rgba(var(--surface-border) / var(--surface-disabled-opacity))',
        },
        
        // Keep static brand colors for reference
        'equitie-purple': '#C898FF',
        'equitie-purple-dark': '#8F4AD2',
        
        // Keep original static colors from tokens for backwards compatibility
        secondary: colors.secondary,
        neutral: colors.neutral,
      },
      
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      
      spacing: spacing,
      
      boxShadow: {
        ...shadows.elevation,
        ...shadows.glow,
        ...shadows.glass,
        ...shadows.component,
      },
      
      textShadow: shadows.text,
      
      animation: animations.animation,
      keyframes: animations.keyframes,
      transitionTimingFunction: animations.easing,
      transitionDuration: animations.duration,
      
      backgroundImage: {
        // Brand gradients
        'gradient-primary': 'linear-gradient(135deg, #C898FF 0%, #9B7AC1 100%)',
        'gradient-hero': 'linear-gradient(145deg, #C898FF 0%, #66D0FF 100%)',
        'gradient-hero-radial': 'radial-gradient(circle at 30% 30%, #C898FF 0%, #66D0FF 50%, #040210 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF9A62 0%, #FF62E3 50%, #C898FF 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #0B5B7D 0%, #66D0FF 50%, #62FF7F 100%)',
        
        // Background mesh gradient
        'gradient-mesh': `
          radial-gradient(at 40% 20%, rgba(200, 152, 255, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(102, 208, 255, 0.2) 0px, transparent 50%),
          radial-gradient(at 10% 50%, rgba(98, 255, 127, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 80%, rgba(255, 154, 98, 0.2) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(255, 98, 227, 0.2) 0px, transparent 50%)
        `,
        
        // Glass morphism gradients
        'glass-light': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'glass-medium': 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
        'glass-purple': 'linear-gradient(135deg, rgba(200, 152, 255, 0.15) 0%, rgba(200, 152, 255, 0.05) 100%)',
      },
      
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Custom plugin for glass morphism utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(13, 10, 34, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(200, 152, 255, 0.1)',
        },
        '.text-gradient': {
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}