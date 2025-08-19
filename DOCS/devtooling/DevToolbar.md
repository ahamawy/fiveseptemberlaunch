# DevToolbar Documentation (Developer Reference)

> Canonical product UI docs live at `FEATURES/investor-portal/README.md`. This page is dev-only.

## Overview

The DevToolbar is a development-only navigation tool for quick access to pages and theme controls.

## Usage

1. `npm run dev`
2. Open any page, click the "Dev Menu" button at bottom-right
3. Use categories to navigate; use theme controls to switch themes

## Key Files

- `components/dev/DevToolbar.tsx`
- `app/layout.tsx` (integration)

## Notes

- Hidden in production (`process.env.NODE_ENV === 'development'`)
- Uses brand tokens; no external icon libs

For product-facing structure and routes, see `FEATURES/investor-portal/README.md`.
