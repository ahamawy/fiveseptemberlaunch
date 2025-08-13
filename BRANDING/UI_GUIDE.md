# Equitie Branding and UI Components Guide

This folder centralizes brand tokens and presets for UI components.

- Source tokens: `BRAND_CONFIG` in `brand.config.ts`
- Presets: `COMPONENT_STYLES` in `brand.config.ts`
- Components (app repo): `src/components/ui/*` consume tokens via Tailwind aliases + helpers.

Read the root of this document for full guidance (copied from product design notes).

## Tokens Overview
- Colors: primary, secondary, semantic, gray, backgrounds
- Typography: families, sizes, weights
- Spacing, Radii, Shadows, Glass, Animations, Gradients

## Helpers
- `getBrandValue(path)` — resolve nested token path.
- `brandCSS(property, path)` — inline style helper.
- `applyBrandStyles(element, styles)` — programmatic bundle application.

## Component Presets (examples)
- `button.primary`, `button.secondary`, `button.danger`, `button.success`, `button.ghost`
- `card.base`, `card.elevated`, `card.gradient`
- `input.base`, `input.error`, `input.success`
- `badge.*`, `text.*`, `table.*`, `nav.*`, `modal.*`

See `brand.config.ts` for concrete values and usage.
