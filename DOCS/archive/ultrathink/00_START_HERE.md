# 🚀 START HERE - Feature 15.1.1 Investor Portal Dashboard

**You will do 4 things:** load context → ask Claude for a plan → run dev + tests → (optional) switch to DB via MCP.

---

## 0) Pre-flight (1 minute)

```bash
# in your terminal
cd "/Users/ahmedelhamawy/Desktop/15.1.1 investor-portal-dashboard"
node -v            # v18+ recommended
npm i
npx playwright install --with-deps
```

---

## 1) Prime Claude Code with the right context (copy-paste)

> Use this exact prompt as your **first message** to Claude Code:

```
based on the files inside ultrathink (read them in order 00→10), create a short plan to ship feature 15.1.1 investor-portal-dashboard with MOCK DATA first, then wire optional DB via MCP. Keep a running checklist in ultrathink/07_TASKS.todo.md and use the acceptance criteria from 05_ACCEPTANCE_CHECKLIST.md. When ready, implement strictly against 02_API_CONTRACT.openapi.json and 03_DB_CONTRACT.sql. If a file is missing, create it in-place and update 10_CONTEXT_INDEX.json.
```

---

## 2) Run the app (mock-first)

```bash
npm run dev
# open http://localhost:3000/investor-portal/dashboard
```

If page is blank or 404, go to **Troubleshooting Ladder** below (items 1–5).

---

## 3) Test & ship

**Unit + E2E:**
```bash
npm run test:unit
npm run test:e2e
```

**If E2E fails:** ask Claude:
```
run the playwright tests, paste failing output, and fix the top 2 failures. update tests/e2e/dashboard.spec.ts as needed. keep mocks intact.
```

**Commit & PR:**
```bash
git checkout -b feat/15.1.1-investor-portal-dashboard
git add -A && git commit -m "feat(15.1.1): investor-portal-dashboard — mock-first + e2e smoke"
```

---

## 4) (Optional) Switch to DB via MCP

1. Copy `.env.example` → `.env` and fill:
```env
SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
USE_DB=true
```

2. Test with MCP tools (if configured)

---

## What lives where

* `ultrathink/01_FEATURE_CARD.md` — one-page spec
* `ultrathink/02_API_CONTRACT.openapi.json` — **shape you must return**
* `ultrathink/03_DB_CONTRACT.sql` — minimal columns/views if DB is used
* `ultrathink/04_BRAND_TOKENS.ts` — brand tokens (use these)
* `tests/e2e/investor-portal.spec.ts` — Playwright tests

---

## Troubleshooting Ladder

1. **`ultrathink` missing** → You're reading it now!
2. **Next won't start** → `npm i` then `npm run dev`
3. **404 on dashboard** → Check `app/investor-portal/dashboard/page.tsx` exists
4. **Hydration mismatch** → Add `'use client'` at top of interactive components
5. **Brand styles broken** → Import from `ultrathink/04_BRAND_TOKENS.ts`

---

## Definition of Done

* Dashboard loads in mock mode (<500ms) at `/investor-portal/dashboard`
* API routes return shapes per `02_API_CONTRACT.openapi.json`
* `npm run test:e2e` passes locally
* Brand tokens applied (no inline colors)

That's it. Ship it.