# 🎨 Equitie Branding System — Public API

## Quick Start

```typescript
// Core imports
import { BRAND_CONFIG, COMPONENT_STYLES } from "@/BRANDING/brand.config";
import { formatCurrency, formatPercentage, getStatusColor } from "@/lib/theme-utils";

// UI Components
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
```

**Important**: Never import token files directly. Use `brand.config.ts` as the single source.

## 🎨 Color System

### Primary Colors
```typescript
BRAND_CONFIG.colors.primary = {
  hero: "#C898FF",    // Main brand purple
  light: "#D9B7FF",   // Hover states
  dark: "#9B7AC1",    // Active states
  DEFAULT: "#C18AFF"
}
```

### Semantic Colors
- ✅ **Success**: `#22C55E` - Positive metrics, gains
- ❌ **Error**: `#EF4444` - Losses, negative values
- ℹ️ **Info**: `#3B82F6` - Neutral information
- ⚠️ **Warning**: `#F59E0B` - Cautions, alerts

### Background Layers
```css
--deep:     #040210  /* Main app background */
--surface:  #0B071A  /* Card background */
--card:     #0F0B22  /* Nested cards */
--elevated: #160F33  /* Modals, dropdowns */
```

## 📦 Component Styles

### Cards
```tsx
<Card variant="glass">      // Glass morphism (default)
<Card variant="gradient">   // Purple gradient accent
<Card variant="elevated">   // Solid elevated surface
```

### Buttons
```tsx
<Button variant="primary">  // Purple CTA
<Button variant="glass">    // Glass secondary
<Button variant="danger">   // Red destructive
```

### Status Badges
```tsx
// Auto-colored based on value
const color = getStatusColor(value);
<span className={`${color.bg} ${color.text} ${color.border}`}>
  {formatPercentage(value)}
</span>
```

## 📊 Data Visualization

- `BRAND_CONFIG.charts`: Chart color palette and styling
- Pre-themed wrappers in `components/ui/Charts.tsx`
- Consistent colors across Chart.js, Nivo, Victory

### Charts Theme

`BRAND_CONFIG.charts` exposes:

- `palette` (primary, accent, success, info, warning, error)
- `gridColor`, `tickColor`, `tooltipBg`, `tooltipBorder`, `fontFamily`

Wrappers (pre-themed):

- Chart.js: `components/ui/Charts.tsx` (`LineChart`, `DoughnutChart`, `BarChartJS`)
- Nivo: `components/ui/NivoCharts.tsx` (`NivoLine`, `NivoPie`, `NivoBar`)
- Victory: `components/ui/VictoryCharts.tsx` (`VictoryLineChart`, `VictoryPieChart`)

Motion & DnD:

- Motion helper: `components/ui/Motion.tsx` (`MotionSection`)
- DnD Kit: `components/ui/DnD.tsx` (`SortableList`)

## Guidelines

- Keep style helpers in `lib/theme-utils.ts`
- Use Tailwind and CSS variables; avoid inline styles
- Update tokens in `BRANDING/tokens/` and surface via `brand.config.ts`
