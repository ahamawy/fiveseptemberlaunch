# Service Layer Catalog

## Core Services

- deals.service.ts — Deal management
- investors.service.ts — Investor data & dashboard
- transactions.service.ts — Financial transactions
- documents.service.ts — Document management
- fees.service.ts — Fee orchestration (wraps enhanced engine)

## Usage Pattern

```ts
import { dealsService } from "@/lib/services";
const deals = await dealsService.getActiveDeals();
```

## Notes

- Public methods documented via JSDoc
- Prefer enhanced fee engine paths
