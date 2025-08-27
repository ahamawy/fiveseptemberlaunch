# Docs QA Checklist (Institutional Grade)

Use this checklist before merging documentation changes in `BRANDING/*`, `DOCS/*`, and feature READMEs.

## Structure
- [ ] Clear purpose statement at top
- [ ] Table of contents for longer docs
- [ ] Version history with dates
- [ ] Ownership (technical and document owner)

## Accuracy and Consistency
- [ ] Aligns with clean schema fields in `CLAUDE.md`
- [ ] References fee engine precedence and invariants
- [ ] Variables match glossary in `BRANDING/FORMULA_ENGINE.md`
- [ ] Discounts modeled as reductions; negative stored values where applicable
- [ ] Money rounded to 2 decimals; units are integers

## Cross-References
- [ ] Links to related docs (index, bible, schema mapping)
- [ ] Links to code in `lib/services/fee-engine/*`
- [ ] Links to tests or validation pages (e.g., `/formula-validator`)

## Compliance and Audit
- [ ] Audit trail requirements stated (inputs, steps, outputs)
- [ ] Edge cases and error handling documented
- [ ] No emojis; professional tone

## Formatting
- [ ] Use markdown tables for matrices
- [ ] Math shown as inline parentheses or block where helpful
- [ ] Code snippets compile or are clearly labeled pseudocode
- [ ] File and function names wrapped in backticks

## Final Validation
- [ ] Spell-check pass
- [ ] All links resolve
- [ ] Peer review completed
- [ ] Update `BRANDING/INSTITUTIONAL_DOCS_INDEX.md` last updated date if significant
