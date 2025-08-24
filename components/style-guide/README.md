# Style Guide Components

## Overview
This directory contains the modularized components for the Equitie Design System style guide. The refactoring was completed on 2025-08-23 to improve maintainability and reduce file sizes.

## Directory Structure

```
components/style-guide/
├── README.md                 # This file
├── index.ts                  # Main exports
├── DesignTokens.tsx         # Core design tokens (colors, spacing, typography)
├── ComponentGuidelines.tsx  # Component styling guidelines
├── FeaturePatterns.tsx      # Common UI patterns
└── tabs/
    └── index.tsx            # Tab content components for style guide pages
```

## Components

### DesignTokens.tsx
**Purpose**: Centralized design system tokens
**Exports**: `designTokens` object containing:
- Theme configurations (dark/light)
- Color palettes (primary, accent, semantic)
- Typography scales
- Spacing system
- Border radius values
- Shadow definitions
- Glass morphism effects
- Motion/animation settings
- Gradients
- Z-index scale

**Usage**:
```typescript
import { designTokens } from '@/components/style-guide';

const theme = designTokens.themes.dark;
const primaryColor = theme.primary[300]; // #C898FF
```

### ComponentGuidelines.tsx
**Purpose**: Component-specific styling guidelines
**Exports**: `componentGuidelines` object containing:
- Button variants and sizes
- Card variants (default, elevated, glass, gradient)
- Input field variants and states
- Badge variants (default, success, warning, error, info)

**Usage**:
```typescript
import { componentGuidelines } from '@/components/style-guide';

const buttonStyle = componentGuidelines.buttons.variants.primary.styles.dark;
```

### FeaturePatterns.tsx
**Purpose**: Common UI patterns and layout configurations
**Exports**: `featurePatterns` object containing:
- Dashboard layout patterns
- Data visualization guidelines
- Form layout patterns
- Table styling patterns
- Navigation patterns
- Modal/overlay patterns

**Usage**:
```typescript
import { featurePatterns } from '@/components/style-guide';

const dashboardGrid = featurePatterns.dashboard.layout.grid; // "12 columns with 24px gap"
```

### tabs/index.tsx
**Purpose**: Tab content components for the style guide pages
**Exports**: Individual section components:
- `OverviewSection` - Design system overview
- `ColorsSection` - Color palette display
- `TypographySection` - Typography scale examples
- `ComponentsSection` - Component library showcase
- `FormsSection` - Form element examples
- `DataDisplaySection` - Table and data visualization
- `MotionSection` - Animation and transition examples
- `PatternsSection` - Common UI pattern examples

**Usage**:
```typescript
import { ColorsSection, TypographySection } from '@/components/style-guide/tabs';

// In your component
{activeTab === 'colors' && <ColorsSection />}
```

## Integration Points

### Style Guide Pages
The components are used by two main style guide pages:

1. `/app/style-guide/page.tsx` - Main style guide (163 lines)
2. `/app/style-guide/enhanced-page.tsx` - Enhanced style guide (572 lines)

### Benefits of Refactoring
- **Reduced file sizes**: From 2,566 total lines to 735 lines (71% reduction)
- **Improved maintainability**: Each component has a single responsibility
- **Better reusability**: Components can be imported individually
- **Easier testing**: Smaller, focused components are easier to test
- **Performance**: Smaller bundles with code splitting

## Adding New Components

To add a new design token or component:

1. **For design tokens**: Add to `DesignTokens.tsx`
2. **For component guidelines**: Add to `ComponentGuidelines.tsx`
3. **For feature patterns**: Add to `FeaturePatterns.tsx`
4. **For new tab sections**: Add to `tabs/index.tsx` or create a new file in `tabs/`

## Theme Integration

The components work with the ThemeProvider from `/providers/ThemeProvider.tsx`:

```typescript
const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
const currentTheme = designTokens.themes[theme];
```

## Testing

Components can be tested individually:

```typescript
import { render } from '@testing-library/react';
import { ColorsSection } from '@/components/style-guide/tabs';

test('renders color palette', () => {
  const { getByText } = render(<ColorsSection />);
  expect(getByText('Color Palette')).toBeInTheDocument();
});
```

## Migration Notes

### From Old Structure
If you were importing from the old monolithic files:
- Replace direct token definitions with imports from `@/components/style-guide`
- Update any inline style calculations to use the exported tokens
- Component demos are now in `tabs/index.tsx`

### Preserved Functionality
All original functionality has been preserved:
- ✅ Theme switching (dark/light)
- ✅ Color scheme selection
- ✅ All design tokens
- ✅ Component examples
- ✅ Interactive demos
- ✅ Typography samples
- ✅ Animation examples

## Performance Considerations

- Components use React.memo where appropriate
- Style objects are defined outside render functions
- Heavy computations are memoized
- Lazy loading can be implemented for tab content if needed

## Future Improvements

1. **Type Safety**: Add TypeScript interfaces for all token structures
2. **Storybook Integration**: Create stories for each component
3. **Design Token API**: Create hooks for accessing design tokens
4. **Theme Extension**: Support for custom themes
5. **Export Formats**: Generate CSS variables, Sass variables, or JSON tokens

## Maintenance

- Keep token values synchronized with Figma designs
- Update this README when adding new components
- Run tests after modifying components
- Ensure backward compatibility when updating tokens