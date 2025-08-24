# Changelog

## Unreleased

- UI: Restored professional visuals with non-breaking utilities in `app/globals.css` (gradients, glass, glow, shimmer) and aligned `Button`, `Card`, `Skeleton` components.
- Theme: Centralized HSL tokens and chart palette in `lib/brand.ts`; legacy class aliases for compatibility.
- Branding: Navbar and icons use `NEXT_PUBLIC_LOGO_URL` when provided; fallback monogram with brand gradient. Updated `app/icon.tsx`, `app/apple-icon.tsx`.
- Health: Updated `SCRIPTS/health-check.js` to current routes; 100% pass.
- DB: Stabilized `lib/db/supabase/status.ts`; added `lib/db/README.md` for architecture and conventions.
- MCP: Adjusted `lib/mcp/supabase-utils.ts` typing for safe query execution; docker-compose services documented.
- Docs: Added `DOCS/FEATURE_MAP.md` and `DOCS/feature-map.json`; updated top-level `README.md` with branding/icons section.
