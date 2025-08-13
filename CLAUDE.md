# Claude Code Project Context

## Project Overview
Equitie multi-platform investment portal with comprehensive branding system, Flutter mobile app, and Next.js web dashboard.

## Tech Stack

### Web Platform (Primary)
- **Framework**: Next.js 14 with App Router
- **UI Library**: React with TypeScript
- **Styling**: Tailwind CSS with custom brand tokens
- **State Management**: React Context + Hooks
- **Theme System**: Dark/Light mode with design tokens

### Mobile Platform (Flutter)
- **Framework**: Flutter 3.x with Dart
- **State Management**: Riverpod
- **Platform**: iOS (primary), Android (secondary)
- **Design System**: Figma integration with automated token extraction
- **Motion System**: Custom iOS-native spring animations and transitions

## Branding Configuration System

### Core Brand Files
The branding system is modular and consistent across all platforms:

```
/BRANDING/
├── brand.config.ts           # Main brand configuration
├── tokens/                   # Design tokens
│   ├── colors.ts            # Color palette
│   ├── typography.ts        # Typography system
│   ├── spacing.ts           # Spacing scale
│   ├── shadows.ts           # Shadow definitions
│   ├── gradients.ts         # Gradient presets
│   ├── animations.ts        # Animation configs
│   └── design-system.ts     # Complete design system
├── CONFIG_PROVIDERS.md      # Configuration guide
├── COMPONENT_GUIDELINES.md  # Component patterns
└── FEATURE_PATTERNS.md      # Feature templates
```

### Using Brand Tokens
```typescript
// Import brand configuration
import { BRAND_CONFIG, COMPONENT_STYLES } from '@/branding/brand.config';
import { colors, typography, spacing } from '@/branding/tokens';

// Use semantic colors and styles
const primaryColor = BRAND_CONFIG.colors.primary.hero; // #C898FF
const cardStyle = COMPONENT_STYLES.card.gradient;
```

### Theme Utilities
```typescript
import { formatCurrency, getGlassStyles, getStatusColor } from '@/lib/theme-utils';

// Format data consistently
formatCurrency(1000000) // "$1,000,000"
getStatusColor(5.2) // Returns success colors
getGlassStyles('medium') // Glass morphism styles
```

### Component Library
Pre-styled components following brand guidelines:
- `Card` - Multiple variants (glass, gradient, elevated)
- `Button` - Branded buttons with glow effects
- Theme-aware components with dark/light support

## Project Structure
```
equitie_app/
├── lib/
│   ├── core/           # Core functionality (providers, router, services)
│   ├── motion/          # Platform-specific motion systems
│   │   ├── ios/        # iOS spring animations and transitions
│   │   └── android/    # Android motion system
│   ├── screens/        # App screens (auth, home, profile, etc.)
│   ├── shared/         # Shared widgets and components
│   ├── theme/          # Theme system with Figma integration
│   │   ├── figma/      # Extracted Figma design tokens
│   │   └── equitie_theme.dart  # Custom theme with gradients
│   └── utils/          # Utilities (platform detection, responsive)
├── scripts/            # Figma extraction scripts
└── ios/               # iOS platform configuration
```

## Key Features Implemented
1. **iOS-Native Motion System**: Spring animations matching iOS HIG
2. **Figma Design Integration**: Automated design token extraction
3. **Custom Theme System**: Gradient cards, neumorphic effects
4. **Authentication Flow**: Login, register, onboarding screens
5. **Responsive Design**: Breakpoint-based responsive utilities

## Commands to Remember
```bash
# Navigate to project
cd equitie_app

# Install dependencies
flutter pub get

# Run on iOS simulator
flutter run -d ios

# Run on specific device
flutter devices  # List available devices
flutter run -d [device-id]

# Build for iOS
flutter build ios

# Clean build
flutter clean
flutter pub get

# Run tests
flutter test

# Analyze code
flutter analyze
```

## Figma Integration
The project includes scripts to extract design tokens from Figma:
- `scripts/figma_quick_extract.js` - Quick extraction of colors and typography
- `scripts/figma_extractor.py` - Python-based extraction
- `scripts/extract_figma_api.js` - API-based extraction

Design tokens are automatically converted to Flutter theme in `lib/theme/figma/`.

## Development Workflow
1. **Design Updates**: Run Figma extraction scripts to update design tokens
2. **Motion System**: Platform-specific animations in `lib/motion/`
3. **Theme Customization**: Edit `lib/theme/equitie_theme.dart`
4. **State Management**: Use Riverpod providers in `lib/core/providers/`

## Important Files
- `lib/main.dart` - App entry point
- `lib/theme/equitie_theme.dart` - Custom theme with gradients
- `lib/motion/ios/ios_motion_system.dart` - iOS animations
- `lib/core/router/app_router.dart` - Navigation setup

## Next Steps for Development
1. Connect to backend API (update `lib/core/services/api_service.dart`)
2. Implement real authentication
3. Add more iOS-native animations
4. Complete Figma design integration
5. Add unit and widget tests

## Notes for Claude Code

### ⚠️ CRITICAL BRANDING RULES - NO EMOJIS
- **ABSOLUTELY NO EMOJIS** in any code or UI - this is a professional financial platform
- **ALWAYS** use SVG icons from Heroicons or Lucide React libraries
- **NEVER** use emoji characters (😀, 📊, 💼, etc.) anywhere in the codebase
- All icons must be monochrome using `currentColor` for theme adaptation
- Maintain consistent icon sizing: `w-4 h-4` (small), `w-5 h-5` (medium), `w-6 h-6` (large)

### Branding System Usage
- **ALWAYS** import tokens from `/BRANDING/` instead of hardcoding values
- Use `BRAND_CONFIG` for accessing all brand tokens
- Apply `COMPONENT_STYLES` for consistent component styling
- Use theme utilities from `/lib/theme-utils.ts` for formatting
- Reference `BRANDING_SYSTEM_DOCUMENTATION.md` for detailed guidelines

### Key Brand Values
- Primary Color: `#C898FF` (Equitie Purple)
- Background Deep: `#040210`
- Glass Effects: Use `getGlassStyles()` utility
- Gradients: Hero gradient from purple to blue
- Font: Inter for all text

### Development Patterns
1. **For New Features**: Start with brand tokens and component library
2. **For Styling**: Use Tailwind classes extended with brand tokens
3. **For Data Display**: Use format utilities (currency, percentage, date)
4. **For Components**: Use pre-built UI components with variants
5. **For Themes**: Ensure dark/light mode compatibility

### File References
- Brand Config: `/BRANDING/brand.config.ts`
- Design Tokens: `/BRANDING/tokens/`
- Theme Utils: `/lib/theme-utils.ts`
- UI Components: `/components/ui/`
- Documentation: `/BRANDING_SYSTEM_DOCUMENTATION.md`
- DevToolbar: `/components/dev/DevToolbar.tsx`
- DevToolbar Docs: `/DEVTOOLBAR_DOCS.md`

### Development Navigation
- **DevToolbar**: Fixed bottom-right development menu for quick page navigation
- **Quick Access**: Categorized list of all app pages with theme controls
- **Development Only**: Automatically hidden in production builds
- **Theme Testing**: Built-in theme and color scheme switching

### Platform-Specific Notes

#### Web (Next.js)
- Use Tailwind classes with brand extensions
- Apply ThemeProvider for context
- Glass morphism works with backdrop-filter

#### Mobile (Flutter)
- Motion system uses platform-specific implementations
- Design tokens extracted from Figma
- Theme system supports gradients and neumorphic effects
- All screens follow iOS design patterns

## Data Layer Architecture

### Service Layer Pattern
The project uses a service layer pattern for all data operations:

```typescript
// Import services
import { dealsService, investorsService } from '@/lib/services';

// Use in components or API routes
const deals = await dealsService.getDeals({ stage: 'active' });
const dashboard = await investorsService.getDashboardData();
```

### Available Services

#### DealsService (`lib/services/deals.service.ts`)
- `getDeals(options)` - List deals with filters and pagination
- `getDealById(id)` - Get single deal with details
- `getDealBySlug(slug)` - Get deal by URL slug
- `getDealsByInvestor(investorId)` - Get investor's deals
- `getActiveDeals()` - Get active deals only
- `getFeaturedDeals()` - Get top 3 featured deals
- `getDealMetrics(dealId)` - Calculate deal metrics
- `searchDeals(query)` - Search deals by name

#### InvestorsService (`lib/services/investors.service.ts`)
- `getCurrentInvestor()` - Get logged-in investor
- `getInvestorById(id)` - Get investor profile
- `getDashboardData(investorId?)` - Get dashboard metrics
- `getPortfolioData(investorId?)` - Get portfolio holdings
- `getCommitments(investorId?)` - Get investor commitments
- `getTransactions(investorId?, options)` - Get transactions
- `getSummaryStats(investorId?)` - Get summary statistics

### Database Abstraction
The data layer switches between mock data and Supabase:

```typescript
// Controlled by environment variables
NEXT_PUBLIC_USE_MOCK_DATA=true  // Use mock data
NEXT_PUBLIC_ENABLE_SUPABASE=false  // Use Supabase when true
```

### Type Safety
All entities have TypeScript types in `lib/db/types.ts`:
- `Deal`, `Company`, `Investor`, `Commitment`
- `Transaction`, `Document`, `Portfolio`
- Filter types for queries
- Response types for API calls

### Mock Data Location
- `lib/mock-data/deals.ts` - Deals, companies, commitments
- `lib/mock-data/investors.ts` - Investor profiles
- `lib/mock-data/transactions.ts` - Transaction records
- `lib/mock-data/performance.ts` - Performance metrics

## Quick Setup

1. **Initial Setup**: Run `npm run setup`
2. **Start Dev**: Run `npm run dev`
3. **Default User**: John Doe (ID: 1) in mock mode

## API Routes Available

- `GET /api/deals` - List all deals with filters
- `GET /api/investors/[id]` - Get investor profile
- `GET /api/investors/[id]/dashboard` - Dashboard data
- `GET /api/investors/[id]/commitments` - Commitments
- `GET /api/investors/[id]/portfolio` - Portfolio
- `GET /api/investors/[id]/transactions` - Transactions
- `GET /api/transactions` - All transactions
- `GET /api/documents` - All documents

## Service Usage Examples

### In React Components
```typescript
import { useEffect, useState } from 'react';
import { dealsService } from '@/lib/services';

export function DealsPage() {
  const [deals, setDeals] = useState([]);
  
  useEffect(() => {
    dealsService.getActiveDeals().then(result => {
      setDeals(result.data);
    });
  }, []);
  
  return <DealsList deals={deals} />;
}
```

### In API Routes
```typescript
import { NextResponse } from 'next/server';
import { investorsService } from '@/lib/services';

export async function GET(request, { params }) {
  const data = await investorsService.getDashboardData(params.id);
  return NextResponse.json(data);
}
```