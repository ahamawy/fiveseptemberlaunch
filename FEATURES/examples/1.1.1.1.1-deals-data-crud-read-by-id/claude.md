Use the prompt template in TEMPLATES/CLAUDE_FEATURE_PROMPT_TEMPLATE.md and paste this section.

- DB tables: deals.deal (id,name,company_id,type,stage,currency), deals.identifier(kind,value)
- Route: GET /deals/:dealId → returns { id, name, stage, company: { id, name }, identifiers: { code, slug, aliases[] } }
- Acceptance:
  - [ ] 404 for unknown/not-owned
  - [ ] DTO validated via zod
  - [ ] Unit + E2E pass
  - [ ] `fks.md` unchanged (read-only feature)
