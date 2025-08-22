# Branding System — Public API

## Import Surface

```ts
import {
  BRAND_CONFIG,
  COMPONENT_STYLES,
  theme,
  brandCSS,
} from "@/BRANDING/brand.config";
```

- Do not import token files directly in app code.
- `brand.config.ts` re-exports curated tokens from `BRANDING/tokens/index.ts`.

## Exports

- `BRAND_CONFIG`: colors, typography, spacing
- `COMPONENT_STYLES`: presets for cards, buttons, tables
- `theme`: helper to access CSS variables
- `brandCSS`: CSS-in-JS helpers

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
