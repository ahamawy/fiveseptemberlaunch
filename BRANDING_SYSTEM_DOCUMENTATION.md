# Equitie Branding System Documentation

## Overview
The Equitie branding system provides a comprehensive, modular configuration framework for consistent visual identity across all platform frontends, features, and development teams. This system is designed to be both human-readable and agent-friendly, enabling rapid feature development while maintaining brand consistency.

## Theme Support

### Dark and Light Modes
The branding system fully supports both dark and light themes with automatic switching based on user preference. All colors and styles adapt seamlessly between themes.

**Theme Implementation**:
- CSS variables defined in `/app/globals.css` for both themes
- Theme provider at `/providers/ThemeProvider.tsx` manages state
- Automatic class application (`dark`/`light`) on HTML element
- Local storage persistence for user preference
- Fully responsive color system using RGB values

**Key Features**:
- All components automatically adapt to theme changes
- Glass morphism effects adjusted for each theme
- Semantic colors maintain meaning across themes
- Smooth transitions between theme states

## Architecture

### Core Configuration Structure
```
/BRANDING/
├── brand.config.ts           # Main brand configuration export
├── tokens/                   # Modular design tokens
│   ├── index.ts             # Central token exports
│   ├── colors.ts            # Color system
│   ├── typography.ts        # Typography scales
│   ├── spacing.ts           # Spacing system
│   ├── shadows.ts           # Shadow definitions
│   ├── gradients.ts         # Gradient definitions
│   ├── animations.ts        # Animation system
│   └── design-system.ts     # Complete design system with themes
├── CONFIG_PROVIDERS.md      # Configuration usage guide
├── COMPONENT_GUIDELINES.md  # Component implementation patterns
├── FEATURE_PATTERNS.md      # Feature development patterns
└── UI_GUIDE.md             # Interactive UI guidelines

/lib/
├── theme-utils.ts           # Theme utility functions
└── utils.ts                 # General utilities

/providers/
└── ThemeProvider.tsx        # React theme context

/components/ui/
├── Card.tsx                 # Branded card component
├── Button.tsx               # Branded button component
└── [other components]       # Additional UI components
```

## Core Configuration Files

### 1. Main Brand Configuration (`/BRANDING/brand.config.ts`)

**Purpose**: Central configuration file that defines all brand tokens in a single, importable module.

**Key Features**:
- Color definitions (primary, secondary, semantic, gradients)
- Typography settings (font families, sizes, weights)
- Spacing scale
- Border radius definitions
- Shadow definitions
- Glass morphism effects
- Animation configurations
- Component style presets

**Usage Pattern**:
```typescript
import { BRAND_CONFIG, COMPONENT_STYLES, theme, brandCSS } from "@/config/brand.config";

// Access tokens
const primaryColor = BRAND_CONFIG.colors.primary.hero;
const cardStyles = COMPONENT_STYLES.card.gradient;

// Apply styles dynamically
const buttonStyle = brandCSS('backgroundColor', 'colors.primary.hero');
```

**Helper Functions**:
- `getBrandValue(path)` - Navigate token hierarchy
- `brandCSS(property, path)` - Generate CSS objects
- `applyBrandStyles(element, styles)` - Apply styles to DOM elements

### 2. Design Token System (`/BRANDING/tokens/`)

**Purpose**: Modular, type-safe design tokens that can be imported individually or as a complete system.

#### Token Categories:

**Colors** (`colors.ts`):
- Primary palette with 10 shades
- Accent colors (blue, green, orange, yellow, pink, purple, teal, red)
- Semantic colors (success, warning, error, info)
- Neutral grays
- Background hierarchy

**Typography** (`typography.ts`):
- Font families (heading, body, mono)
- Size scale (xs to 5xl, plus display sizes)
- Weight scale (light to black)
- Line heights and letter spacing
- Pre-configured text styles

**Spacing** (`spacing.ts`):
- 4px base unit system
- Scale from 0 to 96 (0px to 384px)
- Consistent spacing rhythm

**Shadows** (`shadows.ts`):
- Elevation shadows (xs to 2xl)
- Glow effects (purple, blue, green, orange)
- Inner shadows
- Glass morphism shadows

**Gradients** (`gradients.ts`):
- Brand gradients (primary, hero, sunset, ocean, forest)
- Mesh gradients for backgrounds
- Overlay gradients
- Surface gradients

**Animations** (`animations.ts`):
- Duration scale (instant to slowest)
- Easing functions (linear, ease variations, spring, bounce)
- Transition presets
- Keyframe animations

### 3. Complete Design System (`/BRANDING/tokens/design-system.ts`)

**Purpose**: Comprehensive design system with theme support and advanced features.

**Features**:
- Dark and light theme definitions
- Complete color systems for each theme
- Glass morphism configurations
- Helper functions for theme application
- Token getter functions
- CSS variable generation

**Theme Structure**:
```typescript
{
  themes: {
    dark: {
      colors: { /* complete color system */ },
      glass: { /* glass morphism effects */ },
      shadows: { /* shadow definitions */ }
    },
    light: { /* light theme equivalent */ }
  },
  typography: { /* typography system */ },
  spacing: { /* spacing scale */ },
  borderRadius: { /* border radius scale */ },
  animation: { /* animation system */ },
  gradients: { /* gradient definitions */ }
}
```

### 4. Theme Utilities (`/lib/theme-utils.ts`)

**Purpose**: Helper functions for consistent theming and formatting across features.

**Available Functions**:
```typescript
// Token access
getColor(path: string): string
getGradient(path: string): string
getShadow(path: string): string
getSpacing(size: string): string
getTextStyle(style: string): object
getTransition(type: string): string

// Formatting
formatCurrency(value: number, currency?: string, options?: object): string
formatPercentage(value: number, decimals?: number): string
formatDate(date: Date | string, options?: object): string

// Style generation
getGlassStyles(variant: 'light' | 'medium' | 'strong'): object
getStatusColor(value: number): { bg, text, border }
getResponsiveClasses(base, sm?, md?, lg?, xl?): string
```

## Integration Patterns

### For New Features

1. **Import Required Tokens**:
```typescript
import { colors, typography, spacing } from '@/branding/tokens';
import { formatCurrency, getStatusColor } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
```

2. **Use Branded Components**:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
```

3. **Apply Theme Classes**:
```typescript
<div className="bg-background-deep text-text-primary">
  <Card variant="glass" hover glow>
    <CardContent>
      {/* Feature content */}
    </CardContent>
  </Card>
</div>
```

### For Claude Code Agents

When developing with Claude Code, reference the branding system as follows:

1. **Always import from the token system** rather than hardcoding values
2. **Use semantic color names** (e.g., `text-primary` not `text-white`)
3. **Apply consistent spacing** using the spacing scale
4. **Leverage component variants** for consistency
5. **Format data using theme utilities** for consistency

### For Frontend Frameworks

#### Next.js/React
```typescript
// Import and use directly
import { BRAND_CONFIG } from '@/branding/brand.config';
import { ThemeProvider } from '@/providers/ThemeProvider';
```

#### Flutter (equitie_app)
```dart
// Use extracted Figma tokens
import 'package:equitie_app/theme/equitie_theme.dart';
import 'package:equitie_app/theme/figma/figma_theme.dart';
```

#### Tailwind CSS
```javascript
// tailwind.config.js automatically extends with brand tokens
// Use classes like: bg-primary-300, text-accent-blue, shadow-glow-purple
```

## Component Library

### Card Component
**Variants**: default, glass, outline, gradient, elevated
**Sizes**: sm, md, lg
**Features**: hover effects, glow effects, gradient titles

### Button Component
**Variants**: primary, secondary, outline, ghost, glass, gradient
**Sizes**: sm, md, lg, icon
**Features**: loading states, glow effects, icon support

## Best Practices

### 1. Token Usage
- Always use tokens from the system, never hardcode values
- Use semantic names when available
- Access tokens through proper import paths

### 2. Theme Consistency
- Test all features in both dark and light modes
- Use theme-aware color classes
- Apply glass morphism for premium feel

### 3. Performance
- Import only needed tokens
- Use CSS variables for dynamic values
- Leverage Tailwind's purge for production

### 4. Accessibility
- Maintain WCAG AA contrast ratios
- Provide focus indicators
- Support reduced motion preferences

## Development Workflow

### Step 1: Setup
```typescript
// Import core dependencies
import { BRAND_CONFIG } from '@/branding/brand.config';
import { colors, typography, spacing } from '@/branding/tokens';
import { Card, Button } from '@/components/ui';
```

### Step 2: Apply Styles
```typescript
// Use token values
const styles = {
  container: `bg-${colors.background.surface} p-${spacing[4]}`,
  title: `text-${typography.fontSize.h2} font-${typography.fontWeight.semibold}`,
  button: COMPONENT_STYLES.button.primary
};
```

### Step 3: Build Components
```tsx
<Card variant="glass" hover>
  <CardHeader>
    <CardTitle gradient>Feature Title</CardTitle>
  </CardHeader>
  <CardContent className={styles.container}>
    <Button variant="primary" glow>
      Action
    </Button>
  </CardContent>
</Card>
```

## Configuration for Different Platforms

### Web Applications (Next.js)
- Import from `/BRANDING/brand.config.ts`
- Use Tailwind extended classes
- Apply ThemeProvider for context

### Mobile Applications (Flutter)
- Use `/equitie_app/lib/theme/equitie_theme.dart`
- Apply iOS motion system from `/equitie_app/lib/motion/`
- Reference Figma extracted tokens

### Design Tools (Figma)
- Sync with `/scripts/figma_quick_extract.js`
- Export tokens to `/lib/theme/figma/`
- Maintain bi-directional sync

## Maintenance and Updates

### Updating Tokens
1. Modify token files in `/BRANDING/tokens/`
2. Update `brand.config.ts` if needed
3. Run build to verify changes
4. Test across all themes

### Adding New Components
1. Create component in `/components/ui/`
2. Use existing token system
3. Add variants following patterns
4. Document in component guidelines

### Extracting from Figma
```bash
# Quick extraction
node scripts/figma_quick_extract.js

# Full extraction
python scripts/figma_extractor.py
```

## Quick Reference

### Import Statements
```typescript
// Main config
import { BRAND_CONFIG, COMPONENT_STYLES } from '@/branding/brand.config';

// Individual tokens
import { colors, typography, spacing, shadows, gradients, animations } from '@/branding/tokens';

// Design system
import { designSystem, getTheme, applyTheme } from '@/branding/tokens/design-system';

// Utilities
import { formatCurrency, getGlassStyles, getStatusColor } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';

// Components
import { Card, Button } from '@/components/ui';

// Theme Provider
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
```

### Common Patterns
```typescript
// Glass card with glow
<Card variant="glass" hover glow>

// Gradient text
<h1 className="bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">

// Status indicator
<div className={cn(getStatusColor(value).bg, getStatusColor(value).text)}>

// Formatted currency
<span>{formatCurrency(amount, 'USD')}</span>

// Responsive spacing
<div className={getResponsiveClasses('p-4', 'p-6', 'p-8')}>
```

## Troubleshooting

### Issue: Colors not applying
- Check theme provider is wrapped around app
- Verify dark mode class on html element
- Ensure proper token import path

### Issue: Gradients not visible
- Add `text-gradient` class for text gradients
- Check gradient token exists in system
- Verify browser compatibility

### Issue: Glass effect not working
- Ensure backdrop-filter support
- Check background opacity values
- Apply proper blur values

## Version Control

Current Version: **v1.1.0**

### Changelog

#### v1.1.0 (Current)
- Full light/dark theme support with CSS variables
- Theme persistence in local storage
- Responsive glass morphism for both themes
- Improved color contrast for accessibility
- Theme-aware Tailwind configuration
- Fixed hydration issues with theme provider

#### v1.0.0
- Initial implementation of complete branding system
- Dark theme with Equitie purple (#C898FF) as primary
- Glass morphism effects throughout
- Complete token system with type safety
- Component library with variants
- Theme utilities for consistency
- Flutter/Figma integration support

---

*This documentation ensures consistent branding implementation across all Equitie platform development, enabling both human developers and AI agents to maintain visual consistency while shipping features rapidly.*