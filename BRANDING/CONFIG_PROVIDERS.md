# Equitie Modular Configuration & Utility Providers

## Overview
This document lists all configuration files and utility providers required for modular feature development in the Equitie platform. These files provide a consistent foundation for all features.

## Core Configuration Files

### 1. Design Token System (`/branding/tokens/`)
Modular design tokens that define the visual language of the platform.

```
/branding/tokens/
├── index.ts           # Main export file for all tokens
├── colors.ts          # Color palette and semantic colors
├── typography.ts      # Font families, sizes, and text styles
├── spacing.ts         # Spacing scale and layout dimensions
├── shadows.ts         # Elevation shadows and glow effects
├── gradients.ts       # Brand gradients and glass effects
└── animations.ts      # Animation durations, easings, and keyframes
```

**Usage:**
```typescript
import { colors, typography, spacing } from '@/branding/tokens';
```

### 2. Tailwind Configuration (`tailwind.config.js`)
Extends Tailwind CSS with brand tokens and custom utilities.

**Key Features:**
- Imports all design tokens
- Dark mode support (`darkMode: 'class'`)
- Custom glass morphism utilities
- Text gradient utilities
- Brand-specific animations

### 3. Theme Provider (`/providers/ThemeProvider.tsx`)
React context provider for theme management.

**Features:**
- Dark/light theme switching
- Local storage persistence
- Hydration-safe rendering
- Theme hooks for components

**Usage:**
```typescript
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
```

### 4. Theme Utilities (`/lib/theme-utils.ts`)
Helper functions for consistent theming across features.

**Available Functions:**
- `getColor(path)` - Get color value from token system
- `getGradient(path)` - Get gradient value
- `getShadow(path)` - Get shadow value
- `formatCurrency(value, currency, options)` - Format currency consistently
- `formatPercentage(value, decimals)` - Format percentages
- `formatDate(date, options)` - Format dates
- `getGlassStyles(variant)` - Generate glass morphism styles
- `getStatusColor(value)` - Get semantic colors based on value
- `getResponsiveClasses(base, sm, md, lg, xl)` - Generate responsive classes
- `getTransition(type)` - Get animation transitions
- `getTextStyle(style)` - Get typography styles
- `getSpacing(size)` - Get spacing values

### 5. Common Utilities (`/lib/utils.ts`)
General utility functions for class management.

**Functions:**
- `cn(...inputs)` - Merge and deduplicate Tailwind classes

### 6. UI Components

#### Card Component (`/components/ui/Card.tsx`)
Branded card component with multiple variants.

**Variants:**
- `default` - Standard card with border
- `glass` - Glass morphism effect
- `outline` - Colored border emphasis
- `gradient` - Gradient background
- `elevated` - Shadow elevation

**Props:**
- `variant` - Visual style
- `size` - Padding size (sm, md, lg)
- `hover` - Enable hover effects
- `glow` - Enable purple glow

**Subcomponents:**
- `CardHeader`
- `CardTitle` (supports gradient text)
- `CardDescription`
- `CardContent`
- `CardFooter`

#### Button Component (`/components/ui/Button.tsx`)
Branded button component with multiple styles.

**Variants:**
- `primary` - Purple brand color
- `secondary` - Secondary brand color
- `outline` - Border only
- `ghost` - Minimal style
- `glass` - Glass morphism
- `gradient` - Gradient background

**Props:**
- `variant` - Visual style
- `size` - Button size (sm, md, lg, icon)
- `glow` - Enable glow effect
- `loading` - Show loading spinner

**Additional Components:**
- `IconButton` - Square icon buttons
- `ButtonGroup` - Group buttons together

### 7. Global Styles (`/app/globals.css`)
Base styles and CSS variables.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS variables and global styles */
```

### 8. Layout Configuration (`/app/layout.tsx`)
Root layout with dark mode and base styles.

**Applied Classes:**
- `dark` class on `<html>` element
- Background and text color defaults
- Font configuration

## Implementation Checklist for New Features

When creating a new feature, ensure you:

### Setup
- [ ] Import design tokens from `/branding/tokens`
- [ ] Import UI components from `/components/ui`
- [ ] Import theme utilities from `/lib/theme-utils`
- [ ] Import class utilities from `/lib/utils`

### Styling
- [ ] Use semantic color tokens (not hardcoded colors)
- [ ] Apply consistent spacing using spacing tokens
- [ ] Use predefined text styles from typography tokens
- [ ] Apply appropriate shadows and effects

### Components
- [ ] Use Card component for containers
- [ ] Use Button component for actions
- [ ] Apply glass morphism for premium feel
- [ ] Add hover and glow effects where appropriate

### Dark Theme
- [ ] Ensure all colors work in dark mode
- [ ] Use semantic color classes (text-primary, bg-surface, etc.)
- [ ] Test contrast ratios for accessibility

### Consistency
- [ ] Format currencies with `formatCurrency()`
- [ ] Format percentages with `formatPercentage()`
- [ ] Format dates with `formatDate()`
- [ ] Use status colors based on value sentiment

## Example Feature Implementation

```typescript
// feature-page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getStatusColor } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';

export default function FeaturePage() {
  return (
    <div className="min-h-screen bg-background-deep">
      <div className="relative">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
        
        <div className="relative z-10 p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-surface-border">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
              Feature Title
            </h1>
            <p className="mt-2 text-text-secondary">
              Feature description
            </p>
          </div>

          {/* Content */}
          <Card variant="glass" hover glow>
            <CardHeader>
              <CardTitle gradient>Section Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-primary">Content here</p>
              <Button variant="primary" glow className="mt-4">
                Action
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

## File Structure for Features

```
/app/[feature-name]/
├── page.tsx              # Main page component
├── components/           # Feature-specific components
│   ├── FeatureCard.tsx
│   └── FeatureList.tsx
├── hooks/                # Feature-specific hooks
│   └── useFeatureData.ts
└── utils/                # Feature-specific utilities
    └── feature-helpers.ts
```

## Environment Variables

No specific environment variables required for branding, but features may need:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Testing Considerations

When testing branded components:

1. **Visual Regression Testing**
   - Test all component variants
   - Test hover and interaction states
   - Test responsive breakpoints

2. **Dark Mode Testing**
   - Verify contrast ratios
   - Check color semantic meaning
   - Test glass morphism effects

3. **Animation Testing**
   - Verify smooth transitions
   - Test reduced motion preferences
   - Check performance impact

## Performance Optimization

1. **CSS Optimization**
   - Use Tailwind's purge configuration
   - Minimize custom CSS
   - Use CSS variables for dynamic values

2. **Component Optimization**
   - Lazy load heavy components
   - Memoize expensive calculations
   - Use React.memo for pure components

3. **Image Optimization**
   - Use Next.js Image component
   - Provide appropriate sizes
   - Use WebP format when possible

## Accessibility Guidelines

1. **Color Contrast**
   - Maintain WCAG AA compliance
   - Test with color blindness simulators
   - Provide alternative indicators beyond color

2. **Keyboard Navigation**
   - Ensure all interactive elements are focusable
   - Provide visible focus indicators
   - Support keyboard shortcuts

3. **Screen Readers**
   - Use semantic HTML
   - Provide ARIA labels where needed
   - Test with screen readers

## Migration Guide

For existing features to adopt the branding system:

1. **Replace hardcoded colors** with token references
2. **Update component imports** to use branded components
3. **Apply dark theme classes** to containers
4. **Add gradient backgrounds** where appropriate
5. **Update spacing** to use token values
6. **Test thoroughly** in both light and dark modes

## Support and Documentation

- **Style Guide**: `/style-guide` - Interactive component showcase
- **Design Tokens**: `/branding/tokens/` - Token definitions
- **UI Components**: `/components/ui/` - Reusable components
- **Theme Utils**: `/lib/theme-utils.ts` - Helper functions

## Version History

- **v1.0.0** - Initial branding system implementation
  - Dark theme with Equitie purple (#C898FF)
  - Glass morphism effects
  - Complete token system
  - Core UI components
  - Theme utilities

---

*This configuration system ensures consistent branding across all Equitie platform features while maintaining modularity and reusability.*