# Dev Onboarding (10-min)

- Clone repo and unzip EQT Config + Guardrails folders.
- Fill `.env`, run DB roles/grants, migrations.
- `node GUARDRAILS/SCRIPTS/generate-feature.mjs <code> <slug>`
- Open `FEATURE.md` and `claude.md` in the new folder.
- Start Next dev server; run tests: `pnpm test:unit && pnpm test:e2e`.
- Ship small PRs only (one feature leaf per PR).
