'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button, ButtonGroup, IconButton } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { colors } from '@/branding/tokens/colors';
import { gradients } from '@/branding/tokens/gradients';
import { shadows } from '@/branding/tokens/shadows';
import { typography } from '@/branding/tokens/typography';
import { animations } from '@/branding/tokens/animations';

// Enhanced Figma-based design tokens
const designTokens = {
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

// Component Style Guidelines
const componentGuidelines = {
  buttons: {
    variants: {
      primary: {
        description: 'Main call-to-action buttons',
        usage: 'Form submissions, primary actions',
        styles: {
          dark: {
            background: 'linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%)',
            color: '#FFFFFF',
            border: 'none',
            hover: {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(200, 152, 255, 0.3)',
            },
          },
          light: {
            background: 'linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%)',
            color: '#FFFFFF',
            border: 'none',
            hover: {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(200, 152, 255, 0.2)',
            },
          },
        },
      },
      secondary: {
        description: 'Secondary actions',
        usage: 'Alternative actions, less emphasis',
        styles: {
          dark: {
            background: 'rgba(200, 152, 255, 0.1)',
            color: '#C898FF',
            border: '1px solid rgba(200, 152, 255, 0.2)',
          },
          light: {
            background: 'rgba(200, 152, 255, 0.1)',
            color: '#8F4AD2',
            border: '1px solid rgba(200, 152, 255, 0.3)',
          },
        },
      },
      glass: {
        description: 'Glass morphism style',
        usage: 'Overlays, floating elements',
        styles: {
          dark: {
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
          },
          light: {
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            color: '#1A1A1A',
          },
        },
      },
    },
    sizes: {
      sm: { padding: '8px 16px', fontSize: '13px', height: '32px' },
      md: { padding: '10px 20px', fontSize: '14px', height: '40px' },
      lg: { padding: '12px 24px', fontSize: '16px', height: '48px' },
    },
  },
  
  cards: {
    variants: {
      default: {
        description: 'Standard card',
        usage: 'General content containers',
        styles: {
          dark: {
            background: '#131016',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
          light: {
            background: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      elevated: {
        description: 'Raised card with shadow',
        usage: 'Important content, modals',
        styles: {
          dark: {
            background: '#1A111F',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          },
          light: {
            background: '#FFFFFF',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      glass: {
        description: 'Glass morphism card',
        usage: 'Overlays, premium feel',
        styles: {
          dark: {
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
          light: {
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
      gradient: {
        description: 'Gradient background card',
        usage: 'Feature highlights, CTAs',
        styles: {
          dark: {
            background: 'linear-gradient(135deg, rgba(200, 152, 255, 0.1) 0%, rgba(102, 208, 255, 0.1) 100%)',
            border: '1px solid rgba(200, 152, 255, 0.2)',
          },
          light: {
            background: 'linear-gradient(135deg, rgba(200, 152, 255, 0.05) 0%, rgba(102, 208, 255, 0.05) 100%)',
            border: '1px solid rgba(200, 152, 255, 0.15)',
          },
        },
      },
    },
  },
  
  inputs: {
    variants: {
      default: {
        description: 'Standard input field',
        usage: 'Forms, data entry',
        styles: {
          dark: {
            background: '#0B071A',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            placeholder: '#666666',
          },
          light: {
            background: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            color: '#1A1A1A',
            placeholder: '#999999',
          },
        },
      },
      glass: {
        description: 'Glass morphism input',
        usage: 'Premium forms, overlays',
        styles: {
          dark: {
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
          light: {
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    states: {
      focus: {
        dark: {
          borderColor: '#C898FF',
          boxShadow: '0 0 0 3px rgba(200, 152, 255, 0.1)',
        },
        light: {
          borderColor: '#8F4AD2',
          boxShadow: '0 0 0 3px rgba(200, 152, 255, 0.1)',
        },
      },
      error: {
        dark: {
          borderColor: '#EF4444',
          background: 'rgba(239, 68, 68, 0.05)',
        },
        light: {
          borderColor: '#DC2626',
          background: 'rgba(239, 68, 68, 0.02)',
        },
      },
      success: {
        dark: {
          borderColor: '#22C55E',
          background: 'rgba(34, 197, 94, 0.05)',
        },
        light: {
          borderColor: '#16A34A',
          background: 'rgba(34, 197, 94, 0.02)',
        },
      },
    },
  },
  
  badges: {
    variants: {
      default: {
        styles: {
          dark: { background: 'rgba(200, 152, 255, 0.1)', color: '#C898FF' },
          light: { background: 'rgba(200, 152, 255, 0.1)', color: '#8F4AD2' },
        },
      },
      success: {
        styles: {
          dark: { background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
          light: { background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' },
        },
      },
      warning: {
        styles: {
          dark: { background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
          light: { background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' },
        },
      },
      error: {
        styles: {
          dark: { background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
          light: { background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' },
        },
      },
      info: {
        styles: {
          dark: { background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
          light: { background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' },
        },
      },
    },
  },
};

// Modular Feature Patterns
const featurePatterns = {
  dashboard: {
    description: 'Dashboard layout and components',
    components: ['MetricCard', 'Chart', 'ActivityFeed', 'QuickActions'],
    layout: {
      grid: '12 columns with 24px gap',
      sidebar: 'Optional 280px fixed width',
      header: '64px height with sticky positioning',
    },
    colors: {
      metrics: {
        positive: '#22C55E',
        negative: '#EF4444',
        neutral: '#B3B3B3',
      },
    },
  },
  
  dataVisualization: {
    description: 'Charts and data visualization',
    components: ['LineChart', 'BarChart', 'PieChart', 'Sparkline'],
    colors: {
      primary: ['#C898FF', '#B67EF0', '#A364E1', '#8F4AD2', '#7A30C3'],
      secondary: ['#66D0FF', '#34D399', '#FFD166', '#FF9A62', '#FF66B3'],
    },
    guidelines: {
      gridLines: 'Use subtle opacity (0.06)',
      animations: 'Stagger data points by 50ms',
      tooltips: 'Glass morphism with 8px blur',
    },
  },
  
  forms: {
    description: 'Form layouts and validation',
    components: ['FormField', 'FormGroup', 'ValidationMessage'],
    layout: {
      labelPosition: 'Above input with 8px spacing',
      fieldSpacing: '24px between fields',
      groupSpacing: '32px between groups',
    },
    validation: {
      realTime: 'Validate on blur',
      errorDisplay: 'Below field with 4px spacing',
      successFeedback: 'Optional checkmark icon',
    },
  },
  
  tables: {
    description: 'Data tables and lists',
    components: ['Table', 'TableRow', 'TablePagination', 'TableFilters'],
    styles: {
      header: {
        background: 'Slightly darker than surface',
        borderBottom: '1px solid divider',
        fontWeight: 500,
      },
      rows: {
        hover: 'Subtle background change',
        striped: 'Optional alternating backgrounds',
        selected: 'Primary color with 0.1 opacity',
      },
    },
  },
  
  navigation: {
    description: 'Navigation patterns',
    components: ['Navbar', 'Sidebar', 'Breadcrumb', 'TabNav'],
    patterns: {
      activeIndicator: '2px bottom border or left border',
      hoverEffect: 'Background with 0.05 opacity',
      transition: '200ms ease-out',
    },
  },
  
  modals: {
    description: 'Modal and overlay patterns',
    components: ['Modal', 'Dialog', 'Drawer', 'Toast'],
    styles: {
      overlay: 'Black with 0.5 opacity',
      content: {
        background: 'Elevated surface color',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '560px',
      },
      animations: {
        enter: 'Fade in + scale from 0.95',
        exit: 'Fade out + scale to 0.95',
        duration: '200ms',
      },
    },
  },
};

export default function EnhancedStyleGuidePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showCode, setShowCode] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'design-tokens', label: 'Design Tokens' },
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'components', label: 'Components' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'motion', label: 'Motion' },
    { id: 'guidelines', label: 'Guidelines' },
  ];

  const currentTheme = designTokens.themes[theme];

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#040210]' : 'bg-white'}`}>
      <div className="relative">
        {/* Background gradient mesh */}
        {theme === 'dark' && (
          <div className="fixed inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0" style={{ background: designTokens.gradients.mesh.purple }} />
            <div className="absolute inset-0" style={{ background: designTokens.gradients.mesh.blue }} />
            <div className="absolute inset-0" style={{ background: designTokens.gradients.mesh.green }} />
          </div>
        )}
        
        <div className="relative z-10">
          {/* Header */}
          <div className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{
            backgroundColor: theme === 'dark' ? 'rgba(4, 2, 16, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: currentTheme.surface.border,
          }}>
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#C898FF] via-[#66D0FF] to-[#34D399] bg-clip-text text-transparent">
                    Equitie Design System
                  </h1>
                  <p className="mt-3 text-lg" style={{ color: currentTheme.text.secondary }}>
                    Comprehensive style guide with Figma integration and modular patterns
                  </p>
                </div>
                
                {/* Theme Toggle */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? 'Hide' : 'Show'} Code
                  </Button>
                  <div className="flex items-center gap-2 p-1 rounded-lg" style={{
                    background: currentTheme.surface.border,
                  }}>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`px-4 py-2 rounded-md transition-all ${
                        theme === 'dark' ? 'bg-[#C898FF] text-white' : 'text-gray-500'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`px-4 py-2 rounded-md transition-all ${
                        theme === 'light' ? 'bg-[#C898FF] text-white' : 'text-gray-500'
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#C898FF] to-[#8F4AD2] text-white'
                        : theme === 'dark' 
                          ? 'bg-white/5 text-white/70 hover:bg-white/10'
                          : 'bg-black/5 text-black/70 hover:bg-black/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8 space-y-12">
            {/* Overview Section */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <Card variant="glass" className="overflow-hidden">
                  <CardHeader>
                    <CardTitle gradient>Figma-Integrated Design System</CardTitle>
                    <CardDescription>
                      Built from Figma designs with comprehensive theming support
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#C898FF]">2</div>
                        <div className="text-sm" style={{ color: currentTheme.text.secondary }}>
                          Theme Modes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#66D0FF]">50+</div>
                        <div className="text-sm" style={{ color: currentTheme.text.secondary }}>
                          Components
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#34D399]">8</div>
                        <div className="text-sm" style={{ color: currentTheme.text.secondary }}>
                          Color Palettes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#FFD166]">6</div>
                        <div className="text-sm" style={{ color: currentTheme.text.secondary }}>
                          Feature Patterns
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card variant={theme === 'dark' ? 'gradient' : 'elevated'}>
                    <CardHeader>
                      <CardTitle>Figma Sync</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p style={{ color: currentTheme.text.secondary }}>
                        Direct extraction from Figma designs ensures pixel-perfect implementation
                      </p>
                    </CardContent>
                  </Card>

                  <Card variant={theme === 'dark' ? 'gradient' : 'elevated'}>
                    <CardHeader>
                      <CardTitle>Dual Themes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p style={{ color: currentTheme.text.secondary }}>
                        Complete dark and light mode support with seamless transitions
                      </p>
                    </CardContent>
                  </Card>

                  <Card variant={theme === 'dark' ? 'gradient' : 'elevated'}>
                    <CardHeader>
                      <CardTitle>Modular</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p style={{ color: currentTheme.text.secondary }}>
                        Component-based architecture for consistent feature development
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Design Tokens Section */}
            {activeTab === 'design-tokens' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Design Token Structure</CardTitle>
                    <CardDescription>
                      Comprehensive token system extracted from Figma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showCode && (
                      <pre className="p-4 rounded-lg overflow-x-auto text-sm" style={{
                        background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                        color: currentTheme.text.primary,
                      }}>
                        <code>{JSON.stringify(designTokens, null, 2)}</code>
                      </pre>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="font-semibold mb-4" style={{ color: currentTheme.text.primary }}>
                          Token Categories
                        </h4>
                        <ul className="space-y-2">
                          {Object.keys(designTokens).map((category) => (
                            <li key={category} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#C898FF]" />
                              <span style={{ color: currentTheme.text.secondary }}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-4" style={{ color: currentTheme.text.primary }}>
                          Usage Example
                        </h4>
                        <pre className="p-3 rounded-lg text-sm" style={{
                          background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                          color: currentTheme.text.primary,
                        }}>
                          <code>{`import { designTokens } from '@/styles/tokens';

const theme = designTokens.themes.dark;
const primaryColor = theme.primary[300];
const spacing = designTokens.spacing.scale['4'];`}</code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Colors Section */}
            {activeTab === 'colors' && (
              <div className="space-y-8">
                {/* Primary Colors */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Primary Palette</CardTitle>
                    <CardDescription>Equitie brand purple with tints and shades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                      {Object.entries(currentTheme.primary).map(([shade, color]) => (
                        <div key={shade} className="text-center">
                          <div
                            className="w-full aspect-square rounded-lg border transition-transform hover:scale-105"
                            style={{
                              backgroundColor: color,
                              borderColor: currentTheme.surface.border,
                            }}
                          />
                          <p className="text-xs mt-2" style={{ color: currentTheme.text.tertiary }}>
                            {shade}
                          </p>
                          <p className="text-xs" style={{ color: currentTheme.text.muted }}>
                            {color}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Accent Colors */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Accent Colors</CardTitle>
                    <CardDescription>Supporting colors for various UI elements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                      {Object.entries(currentTheme.accent).map(([name, color]) => (
                        <div key={name} className="text-center">
                          <div
                            className="w-full aspect-square rounded-lg border transition-transform hover:scale-105"
                            style={{
                              backgroundColor: color,
                              borderColor: currentTheme.surface.border,
                            }}
                          />
                          <p className="text-xs mt-2" style={{ color: currentTheme.text.tertiary }}>
                            {name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Semantic Colors */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Semantic Colors</CardTitle>
                    <CardDescription>Contextual colors for states and feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {Object.entries(currentTheme.semantic)
                        .filter(([key]) => !key.includes('Light'))
                        .map(([name, color]) => (
                          <div key={name}>
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-12 h-12 rounded-lg"
                                style={{ backgroundColor: color }}
                              />
                              <div
                                className="w-12 h-12 rounded-lg"
                                style={{ 
                                  backgroundColor: currentTheme.semantic[`${name}Light` as keyof typeof currentTheme.semantic] 
                                }}
                              />
                            </div>
                            <p className="text-sm font-medium" style={{ color: currentTheme.text.primary }}>
                              {name.charAt(0).toUpperCase() + name.slice(1)}
                            </p>
                            <p className="text-xs" style={{ color: currentTheme.text.tertiary }}>
                              {color}
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Typography Section */}
            {activeTab === 'typography' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Typography Scale</CardTitle>
                    <CardDescription>
                      Type system based on Inter font family
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Display Sizes */}
                    <div>
                      <h4 className="text-sm font-medium mb-4" style={{ color: currentTheme.text.secondary }}>
                        Display
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(designTokens.typography.scale.display).map(([size, specs]) => (
                          <div key={size} className="flex items-baseline gap-4">
                            <span
                              className="min-w-[60px] text-xs"
                              style={{ color: currentTheme.text.tertiary }}
                            >
                              {size.toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: specs.size,
                                lineHeight: specs.lineHeight,
                                fontWeight: specs.weight,
                                letterSpacing: specs.tracking,
                                color: currentTheme.text.primary,
                              }}
                            >
                              The quick brown fox jumps
                            </span>
                            {showCode && (
                              <span className="text-xs" style={{ color: currentTheme.text.muted }}>
                                {specs.size} / {specs.lineHeight}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Heading Sizes */}
                    <div>
                      <h4 className="text-sm font-medium mb-4" style={{ color: currentTheme.text.secondary }}>
                        Headings
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(designTokens.typography.scale.heading).map(([size, specs]) => (
                          <div key={size} className="flex items-baseline gap-4">
                            <span
                              className="min-w-[60px] text-xs"
                              style={{ color: currentTheme.text.tertiary }}
                            >
                              {size.toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: specs.size,
                                lineHeight: specs.lineHeight,
                                fontWeight: specs.weight,
                                letterSpacing: specs.tracking,
                                color: currentTheme.text.primary,
                              }}
                            >
                              The quick brown fox jumps over the lazy dog
                            </span>
                            {showCode && (
                              <span className="text-xs" style={{ color: currentTheme.text.muted }}>
                                {specs.size} / {specs.lineHeight}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Body Sizes */}
                    <div>
                      <h4 className="text-sm font-medium mb-4" style={{ color: currentTheme.text.secondary }}>
                        Body
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(designTokens.typography.scale.body).map(([size, specs]) => (
                          <div key={size} className="flex items-baseline gap-4">
                            <span
                              className="min-w-[60px] text-xs"
                              style={{ color: currentTheme.text.tertiary }}
                            >
                              {size.toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: specs.size,
                                lineHeight: specs.lineHeight,
                                fontWeight: specs.weight,
                                letterSpacing: specs.tracking,
                                color: currentTheme.text.primary,
                              }}
                            >
                              The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
                            </span>
                            {showCode && (
                              <span className="text-xs" style={{ color: currentTheme.text.muted }}>
                                {specs.size} / {specs.lineHeight}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Components Section */}
            {activeTab === 'components' && (
              <div className="space-y-8">
                {Object.entries(componentGuidelines).map(([component, details]) => (
                  <Card key={component} variant="glass">
                    <CardHeader>
                      <CardTitle>
                        {component.charAt(0).toUpperCase() + component.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {Object.entries(details.variants).map(([variant, info]) => (
                          <div key={variant} className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium" style={{ color: currentTheme.text.primary }}>
                                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                                </h4>
                                <p className="text-sm" style={{ color: currentTheme.text.secondary }}>
                                  {info.description}
                                </p>
                                <p className="text-xs mt-1" style={{ color: currentTheme.text.tertiary }}>
                                  Usage: {info.usage}
                                </p>
                              </div>
                              {component === 'buttons' && (
                                <Button variant={variant as any}>
                                  Example
                                </Button>
                              )}
                            </div>
                            
                            {showCode && (
                              <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{
                                background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                                color: currentTheme.text.primary,
                              }}>
                                <code>{JSON.stringify(info.styles[theme], null, 2)}</code>
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Patterns Section */}
            {activeTab === 'patterns' && (
              <div className="space-y-8">
                {Object.entries(featurePatterns).map(([pattern, details]) => (
                  <Card key={pattern} variant="glass">
                    <CardHeader>
                      <CardTitle>
                        {pattern.charAt(0).toUpperCase() + pattern.slice(1).replace(/([A-Z])/g, ' $1')}
                      </CardTitle>
                      <CardDescription>{details.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2" style={{ color: currentTheme.text.primary }}>
                            Components
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {details.components.map((comp) => (
                              <Badge key={comp} variant="default">
                                {comp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {showCode && (
                          <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{
                            background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                            color: currentTheme.text.primary,
                          }}>
                            <code>{JSON.stringify(details, null, 2)}</code>
                          </pre>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Spacing Section */}
            {activeTab === 'spacing' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Spacing Scale</CardTitle>
                    <CardDescription>4px base unit system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(designTokens.spacing.scale).slice(0, 20).map(([name, value]) => (
                        <div key={name} className="flex items-center gap-4">
                          <span className="text-xs min-w-[60px]" style={{ color: currentTheme.text.tertiary }}>
                            {name}
                          </span>
                          <div
                            className="h-8 bg-gradient-to-r from-[#C898FF] to-[#8F4AD2] rounded"
                            style={{ width: value }}
                          />
                          <span className="text-xs" style={{ color: currentTheme.text.secondary }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Motion Section */}
            {activeTab === 'motion' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Animation System</CardTitle>
                    <CardDescription>iOS-inspired motion design</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-medium mb-4" style={{ color: currentTheme.text.primary }}>
                          Duration Scale
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(designTokens.motion.duration).map(([name, value]) => (
                            <div key={name} className="flex items-center gap-4">
                              <span className="text-sm min-w-[80px]" style={{ color: currentTheme.text.secondary }}>
                                {name}
                              </span>
                              <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#C898FF] to-[#66D0FF]"
                                  style={{
                                    animation: `slide ${value} ease-in-out infinite`,
                                    width: '33%',
                                  }}
                                />
                              </div>
                              <span className="text-xs" style={{ color: currentTheme.text.tertiary }}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-4" style={{ color: currentTheme.text.primary }}>
                          Easing Functions
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(designTokens.motion.easing).map(([name, value]) => (
                            <div key={name}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm" style={{ color: currentTheme.text.secondary }}>
                                  {name}
                                </span>
                              </div>
                              <code className="text-xs" style={{ color: currentTheme.text.tertiary }}>
                                {value}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Guidelines Section */}
            {activeTab === 'guidelines' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Implementation Guidelines</CardTitle>
                    <CardDescription>
                      Best practices for using the design system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: currentTheme.text.primary }}>
                        Component Usage
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-[#22C55E]">✓</span>
                          <span style={{ color: currentTheme.text.secondary }}>
                            Use design tokens for all colors, spacing, and typography
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#22C55E]">✓</span>
                          <span style={{ color: currentTheme.text.secondary }}>
                            Follow the established component patterns for consistency
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#22C55E]">✓</span>
                          <span style={{ color: currentTheme.text.secondary }}>
                            Maintain accessibility standards (WCAG 2.1 AA)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#EF4444]">✗</span>
                          <span style={{ color: currentTheme.text.secondary }}>
                            Avoid hardcoding colors or measurements
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#EF4444]">✗</span>
                          <span style={{ color: currentTheme.text.secondary }}>
                            Don't create one-off components without design review
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: currentTheme.text.primary }}>
                        Theme Support
                      </h4>
                      <p style={{ color: currentTheme.text.secondary }}>
                        All components must support both light and dark themes. Use the theme-aware
                        color tokens rather than static colors to ensure proper theming.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: currentTheme.text.primary }}>
                        Responsive Design
                      </h4>
                      <p style={{ color: currentTheme.text.secondary }}>
                        Components should be responsive by default. Use the provided breakpoints
                        and ensure all layouts work across mobile, tablet, and desktop viewports.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(300%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}