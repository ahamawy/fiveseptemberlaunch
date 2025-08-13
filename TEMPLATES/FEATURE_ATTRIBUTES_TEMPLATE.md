# <feature-code> <feature-slug>

FOLDER: <DOMAIN>_<MODULE>_<FEATURE>

## Feature Attributes
- **Purpose:** <one-liner, specific>
- **Scope:** <what/when/where/how one-liner>
- **Depends on:** <tables|views|jobs|user-input>
- **Interfaces:** <method path(s), e.g., GET /deals/:dealId/fees>
- **Success:** <2–3 measurable checks>
- **Hands-off:** <which feature(s) or jobs get triggered next>
- **Edges:** <2–5 rare extremes to guard>

## Required Files
- **README:** Explains data flow, DTOs, and invariants.
- **Tests:** Unit (Vitest), E2E (Playwright), SQL (if migration).
- **Other:** Routes/handlers, zod schemas, policy/migration files.

## DTO / Validation
```ts
// Example Zod
export const RequestSchema = z.object({
  id: z.string().uuid(),
  q: z.string().optional(),
});
export const ResponseSchema = z.object({ ok: z.boolean(), data: z.any() });
```

## Observability
- `log.info("feat:<code>", { key: "value" })`
- basic timer: `perf("feat:<code>")`

## RLS + Security
- RLS policy names and checks here.
- Row ownership and tenant guards.

## Rollout
- Feature flag: `<feature-code>`
- Backfill or data migration, if any.
