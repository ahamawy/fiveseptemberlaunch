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

## Guidelines

- Keep style helpers in `lib/theme-utils.ts`
- Use Tailwind and CSS variables; avoid inline styles
- Update tokens in `BRANDING/tokens/` and surface via `brand.config.ts`
