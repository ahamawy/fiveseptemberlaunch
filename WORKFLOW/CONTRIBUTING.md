# Contributing

- Branch: `feat/<feature-code>--short-slug` (e.g., `feat/1.2.1.2--fees-links-create`)
- Commits: conventional (`feat:`, `fix:`, `docs:`), include feature code.
- PRs: template auto-checklist; include screenshots/JSON for UI/API.
- Reviews: 2 LGTM for DB changes; 1 LGTM for UI-only.

## Make a DB change
1. Add SQL to `DB/migrations/` with next number.
2. Update `DB/schema.sql` (regenerate or copy the diff).
3. Update `DB/fks.md` and `DB/feature_tables_map.md` if applicable.
4. Run locally and post results in PR.

## Make a UI change
- Use tokens from `BRAND_CONFIG` and CVA variants.
- Do not hardcode colors; rely on Tailwind theme aliases.
