/**
 * Color Scheme Configuration
 * Centralized color schemes for the Equitie branding system
 * Each scheme provides a complete set of primary colors that can be applied to both light and dark themes
 */

export interface ColorScheme {
  id: string;
  name: string;
  description: string;
  colors: {
    // Primary color scale (50-900)
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    // Accent colors that complement the primary
    accent: {
      blue: string;
      green: string;
      orange: string;
      yellow: string;
      pink: string;
      purple: string;
      teal: string;
      red: string;
    };
  };
}

export const colorSchemes: Record<string, ColorScheme> = {
  // Original Purple Scheme
  purple: {
    id: 'purple',
    name: 'Equitie Purple',
    description: 'Original vibrant purple theme',
    colors: {
      primary: {
        50: '245 240 255',   // #F5F0FF
        100: '232 220 255',  // #E8DCFF
        200: '217 183 255',  // #D9B7FF
        300: '200 152 255',  // #C898FF - Main purple
        400: '182 126 240',  // #B67EF0
        500: '163 100 225',  // #A364E1
        600: '143 74 210',   // #8F4AD2
        700: '122 48 195',   // #7A30C3
        800: '100 22 180',   // #6416B4
        900: '78 0 165',     // #4E00A5
      },
      accent: {
        blue: '102 208 255',    // #66D0FF
        green: '52 211 153',    // #34D399
        orange: '255 154 98',   // #FF9A62
        yellow: '255 209 102',  // #FFD166
        pink: '255 102 179',    // #FF66B3
        purple: '179 102 255',  // #B366FF
        teal: '102 255 208',    // #66FFD0
        red: '255 102 102',     // #FF6666
      },
    },
  },

  // Deep Electric Blue Scheme
  blue: {
    id: 'blue',
    name: 'Electric Blue',
    description: 'Deep electric blue for a modern tech feel',
    colors: {
      primary: {
        50: '239 246 255',   // #EFF6FF
        100: '219 234 254',  // #DBEAFE
        200: '191 219 254',  // #BFDBFE
        300: '96 165 250',   // #60A5FA - Main blue
        400: '59 130 246',   // #3B82F6
        500: '37 99 235',    // #2563EB
        600: '29 78 216',    // #1D4ED8
        700: '30 64 175',    // #1E40AF
        800: '30 58 138',    // #1E3A8A
        900: '23 37 84',     // #172554
      },
      accent: {
        blue: '14 165 233',     // #0EA5E9
        green: '16 185 129',    // #10B981
        orange: '251 146 60',   // #FB923C
        yellow: '250 204 21',   // #FACC15
        pink: '236 72 153',     // #EC4899
        purple: '139 92 246',   // #8B5CF6
        teal: '20 184 166',     // #14B8A6
        red: '239 68 68',       // #EF4444
      },
    },
  },

  // Royal British Racing Green
  green: {
    id: 'green',
    name: 'Racing Green',
    description: 'Royal British racing green for elegance',
    colors: {
      primary: {
        50: '240 253 244',   // #F0FDF4
        100: '220 252 231',  // #DCFCE7
        200: '187 247 208',  // #BBF7D0
        300: '34 197 94',    // #22C55E - Main green
        400: '22 163 74',    // #16A34A
        500: '21 128 61',    // #15803D
        600: '22 101 52',    // #166534
        700: '21 83 43',     // #15532B
        800: '20 61 33',     // #143D21
        900: '17 48 26',     // #11301A
      },
      accent: {
        blue: '6 182 212',      // #06B6D4
        green: '5 150 105',     // #059669
        orange: '249 115 22',   // #F97316
        yellow: '234 179 8',    // #EAB308
        pink: '232 121 249',    // #E879F9
        purple: '147 51 234',   // #9333EA
        teal: '13 148 136',     // #0D9488
        red: '220 38 38',       // #DC2626
      },
    },
  },

  // Elegant Monochrome (Black & White with grays)
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Elegant black and white with sophisticated grays',
    colors: {
      primary: {
        50: '249 250 251',   // #F9FAFB
        100: '243 244 246',  // #F3F4F6
        200: '229 231 235',  // #E5E7EB
        300: '156 163 175',  // #9CA3AF - Main gray
        400: '107 114 128',  // #6B7280
        500: '75 85 99',     // #4B5563
        600: '55 65 81',     // #374151
        700: '31 41 55',     // #1F2937
        800: '17 24 39',     // #111827
        900: '3 7 18',       // #030712
      },
      accent: {
        blue: '59 130 246',     // #3B82F6 - Minimal color accents
        green: '34 197 94',     // #22C55E
        orange: '251 146 60',   // #FB923C
        yellow: '250 204 21',   // #FACC15
        pink: '236 72 153',     // #EC4899
        purple: '139 92 246',   // #8B5CF6
        teal: '20 184 166',     // #14B8A6
        red: '239 68 68',       // #EF4444
      },
    },
  },
};

export const DEFAULT_COLOR_SCHEME = 'purple';

/**
 * Get the CSS variables for a color scheme
 */
export function getColorSchemeVars(schemeId: string): Record<string, string> {
  const scheme = colorSchemes[schemeId] || colorSchemes[DEFAULT_COLOR_SCHEME];
  
  return {
    '--primary-50': scheme.colors.primary[50],
    '--primary-100': scheme.colors.primary[100],
    '--primary-200': scheme.colors.primary[200],
    '--primary-300': scheme.colors.primary[300],
    '--primary-400': scheme.colors.primary[400],
    '--primary-500': scheme.colors.primary[500],
    '--primary-600': scheme.colors.primary[600],
    '--primary-700': scheme.colors.primary[700],
    '--primary-800': scheme.colors.primary[800],
    '--primary-900': scheme.colors.primary[900],
    '--accent-blue': scheme.colors.accent.blue,
    '--accent-green': scheme.colors.accent.green,
    '--accent-orange': scheme.colors.accent.orange,
    '--accent-yellow': scheme.colors.accent.yellow,
    '--accent-pink': scheme.colors.accent.pink,
    '--accent-purple': scheme.colors.accent.purple,
    '--accent-teal': scheme.colors.accent.teal,
    '--accent-red': scheme.colors.accent.red,
  };
}