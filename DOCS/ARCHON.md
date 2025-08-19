# ARCHON Fee Engine Guide

> Canonical reference for the Fees feature is now `FEATURES/fees/README.md`. This file is supporting context and may omit newer workflows.

## Overview

Deterministic, order-dependent fee calculation system for investor transfer amounts.

## Core Concepts

### 1. Precedence Order

Fees applied in strict order (lower number = earlier):

- PREMIUM: precedence = 1 (always first)
- STRUCTURING: precedence = 2
- MANAGEMENT: precedence = 3
- ADMIN: precedence = 4

### 2. Basis Types

- **GROSS**: Original investment amount
- **NET**: Gross minus premium
- **NET_AFTER_PREMIUM**: For subsequent calculations

### 3. Discounts

Stored as NEGATIVE amounts in database:

```sql
-- 50% structuring discount = -$2000 on $4000 fee
INSERT INTO fees.fee_application
VALUES (..., 'STRUCTURING_DISCOUNT', -2000.00, ...)
```

## Implementation

### Calculator

```typescript
import { EnhancedFeeCalculator } from "@/lib/services/fee-engine/enhanced-calculator";

const calc = new EnhancedFeeCalculator(schedule);
const result = calc.calculate(100000, 1000);
// Returns: { grossAmount, netAmount, fees[], transferAmount }
```

### Service

```typescript
import { enhancedFeeService } from "@/lib/services/fee-engine/enhanced-service";

// Preview
const preview = await enhancedFeeService.previewFees(
  dealId,
  grossCapital,
  unitPrice,
  options
);

// Apply
await enhancedFeeService.applyTransactionFees(transactionId, preview);
```

## CSV Import Format

### Fee Schedule

```csv
Component,Rate,Basis,Precedence
PREMIUM,3.77358,GROSS,1
STRUCTURING,4.0,GROSS,2
MANAGEMENT,2.0,GROSS,3
ADMIN,450,FIXED,4
```

### Investor Discounts

```csv
Investor Name,Gross Capital,Structuring Discount %,Admin Discount %
John Doe,100000,50,100
```

## Database Schema

### fee_schedule

- `component`: Fee name
- `rate`: Percentage or fixed amount
- `is_percent`: true/false
- `basis`: GROSS/NET/NET_AFTER_PREMIUM
- `precedence`: Order (1-99)

### fee_application

- `component`: Fee or discount name
- `amount`: Positive for fees, NEGATIVE for discounts
- `notes`: Calculation audit trail

## Validation Rules

1. PREMIUM must have precedence = 1
2. All amounts rounded to 2 decimals
3. Discounts cannot exceed fee amounts
4. Partner fees (PARTNER\_\*) excluded from investor analytics

## Testing

```bash
npm test lib/services/fee-engine/__tests__/enhanced-calculator.test.ts
```

## Common Patterns

### Apply Standard Discounts

```typescript
const options = {
  discounts: [
    { component: "STRUCTURING_DISCOUNT", percent: 50 },
    { component: "ADMIN_DISCOUNT", percent: 100 },
  ],
};
```

### Annual Fees

```typescript
const options = {
  annualFees: [{ component: "MANAGEMENT", years: 3 }],
};
```

### Partner Fees

```typescript
// Automatically excluded from investor views
{ component: 'PARTNER_CARRY', amount: 5000 }
```
