/**
 * Component Style Guidelines
 * 
 * Defines styling rules and variants for UI components.
 * Each component includes variants, states, and usage guidelines.
 * 
 * @example
 * ```typescript
 * import { componentGuidelines } from '@/components/style-guide';
 * 
 * // Get button styling
 * const primaryButton = componentGuidelines.buttons.variants.primary;
 * console.log(primaryButton.description); // "Main call-to-action buttons"
 * console.log(primaryButton.usage); // "Form submissions, primary actions"
 * 
 * // Apply styles based on theme
 * const styles = primaryButton.styles[theme];
 * ```
 */
export const componentGuidelines = {
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