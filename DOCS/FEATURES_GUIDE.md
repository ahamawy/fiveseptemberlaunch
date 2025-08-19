# Modular Feature Documentation Guide

## Purpose

Create a consistent, modular, and independent documentation structure per feature so teams can develop, review, and ship features without stepping on each other. This guide defines the canonical layout and linking rules.

## Canonical Structure (per feature)

```text
FEATURES/<feature-code>-<kebab-name>/
├── README.md                # Canonical feature index (source of truth)
├── docs/                    # Deep docs specific to this feature
│   ├── ARCHITECTURE.md      # Diagrams, flows, decisions
│   ├── API.md               # REST/route contracts (App Router)
│   ├── DB.md                # Tables/views used (no schema changes here)
│   ├── UI.md                # Screens, components, routes
│   ├── TESTS.md             # E2E/unit coverage and commands
│   ├── CHANGELOG.md         # Human-readable change history
│   └── DEPRECATIONS.md      # Old flows replaced by this feature
├── dto/                     # Types/Zod schemas used by the feature
├── repo/                    # Data access patterns (if applicable)
├── routes/                  # API route handlers (cohesive to feature)
├── services/                # Business logic entry points
└── FEATURE.md               # Compact spec: scope, acceptance, risks
```

## Naming & Codes

- Use the existing feature code convention from `FEATURES/FEATURE_TREE.md`.
- Folder name = `<feature-code>-<kebab-name>` to keep readable URLs.

## Canonical Source of Truth

- Each feature’s `README.md` under `FEATURES/...` is the canonical doc.
- Any older or general docs should add a short banner linking to the canonical doc.
- Do not duplicate deep content across multiple files. Link back instead.

## Templates

- Use these templates when creating a feature:
  - `TEMPLATES/FEATURE_ATTRIBUTES_TEMPLATE.md`
  - `TEMPLATES/PLAYWRIGHT_SPEC_TEMPLATE.ts`
  - `TEMPLATES/VITEST_SPEC_TEMPLATE.ts`
  - `TEMPLATES/MIGRATION_TEMPLATE.sql` (schema references only; no new schema in-app features)
  - `TEMPLATES/FEATURE_DOCS_INDEX.md` (this guide’s mini-index for `FEATURES/.../README.md`)

## Linking Rules

- Prefer relative links to code and routes, e.g. `../../app/api/...`.
- When referencing shared domain concepts (e.g., branding, fee invariants), link to the shared doc once and avoid restating rules.
- If a feature supersedes legacy flows, add a one-line notice and link to `docs/DEPRECATIONS.md`.

## Cross-Cutting Docs

- Keep platform-wide docs in `DOCS/` (e.g., `CLAUDE.md`, brand guidelines).
- Features should not redefine platform rules; instead, reference them.

## Review Checklist (for PRs)

- README exists at `FEATURES/<code>-<name>/README.md` and is up to date.
- Links to API routes, services, UI pages are valid.
- Tests and commands listed in `docs/TESTS.md` run green locally.
- Any legacy docs updated with a deprecation banner pointing to this feature’s README.

## Example

- See `FEATURES/examples/1.1.1.1.1-deals-data-crud-read-by-id/` as a reference.
