# Equitie Component Style Guidelines

## Overview
This document provides comprehensive styling guidelines for all UI components in the Equitie platform. All components support both dark and light themes and follow our Figma design specifications.

## Design Token Usage

### Importing Tokens
```typescript
import { tokens, getTheme } from '@/BRANDING/tokens/design-system';

// Get current theme
const theme = getTheme('dark'); // or 'light'

// Use specific tokens
const primaryColor = theme.colors.primary[300];
const spacing = tokens.spacing[4]; // 16px
```

## Component Guidelines

### 1. Buttons

#### Variants

##### Primary Button
- **Usage**: Main CTAs, form submissions, primary actions
- **Dark Theme**:
  ```css
  background: linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%);
  color: #FFFFFF;
  border: none;
  box-shadow: 0 4px 12px rgba(200, 152, 255, 0.2);
  ```
- **Light Theme**:
  ```css
  background: linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%);
  color: #FFFFFF;
  border: none;
  box-shadow: 0 4px 12px rgba(200, 152, 255, 0.15);
  ```
- **Hover State**: 
  - Transform: `translateY(-2px)`
  - Shadow: Increase opacity by 0.1
- **Active State**: 
  - Transform: `translateY(0)`
  - Brightness: 90%

##### Secondary Button
- **Usage**: Alternative actions, less emphasis
- **Dark Theme**:
  ```css
  background: rgba(200, 152, 255, 0.1);
  color: #C898FF;
  border: 1px solid rgba(200, 152, 255, 0.2);
  ```
- **Light Theme**:
  ```css
  background: rgba(200, 152, 255, 0.08);
  color: #8F4AD2;
  border: 1px solid rgba(200, 152, 255, 0.3);
  ```

##### Glass Button
- **Usage**: Overlays, floating elements, premium feel
- **Dark Theme**:
  ```css
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  ```

#### Sizes
- **Small**: Height 32px, padding 8px 16px, font-size 13px
- **Medium**: Height 40px, padding 10px 20px, font-size 14px
- **Large**: Height 48px, padding 12px 24px, font-size 16px

#### States
- **Loading**: Show spinner, disable interactions, reduce opacity to 0.7
- **Disabled**: Opacity 0.5, cursor not-allowed, no hover effects
- **Focus**: Box-shadow with primary color at 0.2 opacity

### 2. Cards

#### Variants

##### Default Card
- **Dark Theme**:
  ```css
  background: #131016;
  border: 1px solid rgba(255, 255, 255, 0.08);
  ```
- **Light Theme**:
  ```css
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  ```

##### Elevated Card
- **Usage**: Important content, modals, popups
- **Dark Theme**:
  ```css
  background: #1A111F;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  ```

##### Glass Card
- **Usage**: Overlays, premium sections
- **Properties**:
  ```css
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  ```

##### Gradient Card
- **Usage**: Feature highlights, special offers
- **Background**: Use brand gradients from tokens

#### Spacing
- **Padding**: 24px (desktop), 16px (mobile)
- **Card gap in grid**: 24px
- **Header/content separator**: 1px divider or 16px spacing

### 3. Inputs

#### Base Styles
- **Height**: 40px (default), 32px (small), 48px (large)
- **Padding**: 12px horizontal
- **Border radius**: 8px
- **Font size**: 14px
- **Transition**: All 200ms ease

#### States

##### Default State
- **Dark Theme**:
  ```css
  background: #0B071A;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  ```

##### Focus State
- **Border color**: Primary color
- **Box shadow**: `0 0 0 3px rgba(200, 152, 255, 0.1)`
- **Outline**: none

##### Error State
- **Border color**: Error color from semantic tokens
- **Background tint**: Error color at 5% opacity
- **Helper text color**: Error color

##### Success State
- **Border color**: Success color
- **Icon**: Checkmark in success color
- **Background tint**: Success color at 5% opacity

#### Placeholder
- **Dark theme**: `#666666`
- **Light theme**: `#999999`
- **Font style**: Normal (not italic)

### 4. Tables

#### Structure
- **Header**:
  - Background: Slightly darker than surface
  - Font weight: 500
  - Text transform: None (sentence case)
  - Border bottom: 1px divider color

- **Rows**:
  - Min height: 48px
  - Padding: 12px horizontal, 8px vertical
  - Border bottom: 1px divider color (except last)

#### Interactions
- **Hover**: Background color with 5% opacity
- **Selected**: Primary color at 10% opacity
- **Striped** (optional): Alternate rows with 2% opacity difference

#### Responsive
- **Mobile**: Convert to card layout below 768px
- **Tablet**: Horizontal scroll with sticky first column

### 5. Badges

#### Variants
- **Default**: Primary color at 10% opacity background
- **Success**: Green semantic color
- **Warning**: Yellow semantic color
- **Error**: Red semantic color
- **Info**: Blue semantic color

#### Sizes
- **Small**: Height 20px, font-size 11px, padding 4px 8px
- **Medium**: Height 24px, font-size 12px, padding 4px 10px
- **Large**: Height 28px, font-size 14px, padding 6px 12px

#### Effects
- **Glow**: Box-shadow with color at 40% opacity
- **Pulse**: Animation with 2s duration
- **Gradient**: Use brand gradients for special badges

### 6. Modals

#### Structure
```css
/* Overlay */
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);

/* Content */
background: elevated surface color;
border-radius: 16px;
padding: 24px;
max-width: 560px;
max-height: 90vh;
```

#### Animation
- **Enter**: Fade in + scale from 0.95
- **Exit**: Fade out + scale to 0.95
- **Duration**: 200ms with spring easing

#### Sizes
- **Small**: 400px max-width
- **Medium**: 560px max-width
- **Large**: 720px max-width
- **Full**: 90vw max-width

### 7. Navigation

#### Top Navigation
- **Height**: 64px
- **Background**: Surface color with 80% opacity
- **Backdrop filter**: blur(16px)
- **Border bottom**: 1px divider color
- **Position**: Sticky top

#### Sidebar
- **Width**: 280px (expanded), 64px (collapsed)
- **Background**: Surface color
- **Border right**: 1px divider color
- **Item height**: 40px
- **Item padding**: 12px horizontal

#### Active States
- **Primary nav**: 2px bottom border
- **Sidebar**: 3px left border + background tint
- **Breadcrumb**: Primary color text

### 8. Forms

#### Layout
- **Label position**: Above input
- **Label spacing**: 8px from input
- **Field spacing**: 24px between fields
- **Section spacing**: 32px between sections
- **Required indicator**: Red asterisk after label

#### Field Groups
- **Background**: Surface color with 2% opacity difference
- **Padding**: 16px
- **Border radius**: 12px
- **Title**: H5 size, semibold weight

#### Validation
- **Timing**: On blur (default), on change (after error)
- **Error position**: Below field, 4px spacing
- **Error icon**: Left of message
- **Success feedback**: Optional checkmark

### 9. Data Visualization

#### Color Palettes
```typescript
// Primary series
const primary = ['#C898FF', '#B67EF0', '#A364E1', '#8F4AD2', '#7A30C3'];

// Secondary series  
const secondary = ['#66D0FF', '#34D399', '#FFD166', '#FF9A62', '#FF66B3'];

// Semantic (for specific data types)
const semantic = {
  positive: '#22C55E',
  negative: '#EF4444',
  neutral: '#B3B3B3',
  warning: '#F59E0B'
};
```

#### Chart Guidelines
- **Grid lines**: 6% opacity
- **Axis text**: Secondary text color
- **Tooltips**: Glass morphism style
- **Animation**: Stagger data points by 50ms
- **Legend**: Below chart, 16px spacing

### 10. Loading States

#### Skeleton Loaders
```css
background: linear-gradient(
  90deg,
  rgba(255, 255, 255, 0.05) 25%,
  rgba(255, 255, 255, 0.1) 50%,
  rgba(255, 255, 255, 0.05) 75%
);
animation: shimmer 2s infinite;
```

#### Spinners
- **Small**: 16px
- **Medium**: 24px
- **Large**: 32px
- **Color**: Primary gradient or single color
- **Animation**: 1s rotation, ease-in-out

#### Progress Bars
- **Height**: 4px (default), 8px (large)
- **Background**: Surface color at 10% opacity
- **Fill**: Primary gradient
- **Animation**: Indeterminate shimmer for unknown progress

## Responsive Design

### Breakpoints
```scss
$breakpoints: (
  xs: 475px,   // Mobile landscape
  sm: 640px,   // Tablet portrait
  md: 768px,   // Tablet landscape
  lg: 1024px,  // Desktop
  xl: 1280px,  // Large desktop
  2xl: 1536px  // Extra large
);
```

### Mobile Adaptations
- **Touch targets**: Minimum 44px × 44px
- **Spacing**: Reduce by 25% on mobile
- **Font sizes**: Use responsive scale
- **Columns**: Stack on mobile, grid on desktop

## Accessibility

### Color Contrast
- **Text on background**: Minimum 4.5:1 (AA)
- **Large text**: Minimum 3:1
- **Interactive elements**: Minimum 3:1
- **Focus indicators**: Visible with 3:1 contrast

### Keyboard Navigation
- **Tab order**: Logical flow
- **Focus states**: Visible for all interactive elements
- **Skip links**: For main navigation
- **Escape key**: Close modals/dropdowns

### Screen Readers
- **ARIA labels**: For icons and interactive elements
- **Role attributes**: Proper semantic roles
- **Live regions**: For dynamic content
- **Alt text**: For all images

## Animation Guidelines

### Timing
```typescript
const duration = {
  instant: '50ms',   // Micro interactions
  fast: '100ms',     // Hover states
  normal: '200ms',   // Most transitions
  slow: '300ms',     // Page transitions
  slower: '400ms',   // Complex animations
};
```

### Easing
- **Default**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- **Spring**: `cubic-bezier(0.16, 1, 0.3, 1)` (iOS spring)
- **Bounce**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

### Performance
- **Use transform**: Instead of position properties
- **Use opacity**: For fade effects
- **GPU acceleration**: Add `will-change` for heavy animations
- **Reduce motion**: Respect user preferences

## Theme Implementation

### CSS Variables
```css
:root[data-theme="dark"] {
  --color-primary: #C898FF;
  --color-background: #040210;
  --color-surface: #131016;
  /* ... more variables */
}

:root[data-theme="light"] {
  --color-primary: #8F4AD2;
  --color-background: #FFFFFF;
  --color-surface: #FFFFFF;
  /* ... more variables */
}
```

### Component Theming
```typescript
// In component
const theme = useTheme(); // Custom hook
const styles = {
  background: theme.colors.surface,
  color: theme.colors.text.primary,
  borderColor: theme.colors.surface.border,
};
```

### Theme Toggle
- **Position**: Top right of header
- **Icon**: Sun/moon icons
- **Transition**: 300ms fade
- **Persistence**: Save to localStorage

## Best Practices

### Do's
✅ Use design tokens for all values  
✅ Support both themes in every component  
✅ Test on multiple screen sizes  
✅ Ensure keyboard accessibility  
✅ Use semantic HTML  
✅ Optimize for performance  
✅ Follow the spacing scale  
✅ Maintain consistent animations  

### Don'ts
❌ Hardcode colors or dimensions  
❌ Create one-off styles  
❌ Ignore accessibility  
❌ Use inline styles extensively  
❌ Override design tokens  
❌ Skip responsive testing  
❌ Mix animation timings  
❌ Forget loading states  

## Component Checklist

Before marking a component as complete:

- [ ] Supports dark and light themes
- [ ] Responsive on all breakpoints
- [ ] Keyboard accessible
- [ ] Has loading states
- [ ] Has error states
- [ ] Has empty states
- [ ] Follows spacing scale
- [ ] Uses design tokens
- [ ] Includes hover/focus states
- [ ] Tested with screen reader
- [ ] Documentation complete
- [ ] Storybook story created

## Resources

- **Figma Design**: [Link to Figma file]
- **Design Tokens**: `/BRANDING/tokens/design-system.ts`
- **Style Guide Demo**: `/app/style-guide/enhanced-page.tsx`
- **Component Library**: `/components/ui/`
- **Theme Provider**: `/providers/ThemeProvider.tsx`

## Questions?

For design questions, consult the Figma file first. For implementation questions, refer to the enhanced style guide page which demonstrates all patterns with live examples.