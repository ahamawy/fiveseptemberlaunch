/**
 * Equitie Animation Tokens
 * Motion system for smooth, iOS-inspired animations
 */

export const animations = {
  // Duration
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '1000ms',
  },

  // Easing functions (iOS-inspired springs)
  easing: {
    // Standard easings
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // iOS-style spring easings
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    springSnappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    springSmooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
    springBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Custom brand easings
    brandSmooth: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    brandSnap: 'cubic-bezier(0.32, 0.72, 0, 1)',
    brandBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Transition presets
  transition: {
    all: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    colors: 'colors 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: 'opacity 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    transform: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    shadow: 'box-shadow 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    
    // Component-specific
    button: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)',
    card: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    modal: 'all 350ms cubic-bezier(0.23, 1, 0.32, 1)',
    dropdown: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Keyframe animations
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
    glow: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(200, 152, 255, 0.5)' },
      '50%': { boxShadow: '0 0 40px rgba(200, 152, 255, 0.8)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    rotate: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },

  // Animation classes
  animation: {
    fadeIn: 'fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    fadeOut: 'fadeOut 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    slideInUp: 'slideInUp 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    slideInDown: 'slideInDown 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    slideInLeft: 'slideInLeft 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    slideInRight: 'slideInRight 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    scaleIn: 'scaleIn 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    scaleOut: 'scaleOut 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    glow: 'glow 2s ease-in-out infinite',
    shimmer: 'shimmer 2s linear infinite',
    float: 'float 3s ease-in-out infinite',
    rotate: 'rotate 1s linear infinite',
  },
} as const;

export type AnimationToken = typeof animations;