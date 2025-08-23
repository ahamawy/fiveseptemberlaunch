### Tech Debt Inventory (candidate archive paths)

Criteria
- Not used by investor portal runtime; superseded by repos/services; high noise-to-signal in editor.

Candidates (keep in repo; hide via .cursorignore for now)
- `ultrathink/` — design explorations and context; not runtime-critical
- `UI_FALLBACKS/` — legacy components; portal uses `components/ui/**`
- `TOOLING/` — scripts for generation/migration; not needed daily
- `e2e/`, `tests/`, reports — large surfaces; run in CI only
- Root test scripts: `test-*.ts`, `test-setup.ts`, `test-documents/`

Next steps
- Tag ownership and last-use; move to `archive/` folder on a maintenance day
- Add CODEOWNERS rules to prevent accidental edits by portal team
- Keep a README in `archive/` pointing to authoritative replacements

