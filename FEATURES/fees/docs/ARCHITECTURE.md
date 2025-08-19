# Fees — Architecture

## Overview

- Deterministic, precedence-ordered fee engine (ARCHON) with auditability.
- Calculation flow: schedule → base fees → discounts (negative) → transfer → units.

## Components

- Calculator: `lib/services/fee-engine/enhanced-calculator.ts`
- Service: `lib/services/fee-engine/enhanced-service.ts`
- Import flows: legacy, v2, smart-import, chat-driven.

## Data Flow

1. Load active schedule (ordered by precedence)
2. Calculate base fees by basis (GROSS/NET/NET_AFTER_PREMIUM)
3. Apply discounts as negative rows
4. Persist to `fees.fee_application`
5. Analytics exclude `PARTNER_` components for investor transfer

## References

- Deep context: `ARCHON_FEE_ENGINE_CONTEXT.md`
- Concise guide: `DOCS/ARCHON.md`
