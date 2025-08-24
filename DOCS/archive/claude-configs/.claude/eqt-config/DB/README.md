# Database Setup (Unified)

Assumes the **modular schema** is applied. If not, run migrations in `DB/migrations/`.

1) **Roles & grants**
```
psql -f DB/roles.sql
psql -f DB/permissions.sql
```

2) **Migrations**
- Supabase CLI: `supabase db reset` or `supabase db push`
- Raw psql: apply files in `DB/migrations/` in order

3) **Policies**
- Start from `DB/policies/BASE_RLS.sql` then add per-table specs
- Validate with `SCRIPTS/check-rls.mjs`

4) **Versioning**
- `SCHEMA_VERSION` and `SCHEMA_ID` (in `.env`) identify the running contract
