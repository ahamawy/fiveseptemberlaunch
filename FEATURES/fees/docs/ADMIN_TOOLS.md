# Fee Admin Tools Documentation

## Overview

The Equitie platform provides multiple specialized fee management interfaces, each designed for specific workflows and use cases. All tools integrate with the ARCHON Fee Engine for consistent calculation logic.

## Tool Catalog

### 1. Fee Profiles (`/admin/fees/profiles`)

**Purpose**: Primary configuration interface for fee structures

**Use Cases**:
- Setting up new deal fee structures
- Managing calculation profiles (LEGACY vs MODERN)
- Activating/deactivating fee schedules
- Testing fee configurations

**Key Features**:
- JSON-based configuration
- Deal-specific profiles
- Premium fee detection
- Real-time validation

**When to Use**: Start here for any new deal setup or when modifying existing fee structures.

---

### 2. Legacy Import (`/admin/fees/import`)

**Purpose**: Original CSV import tool with basic validation

**CSV Format**:
```csv
deal_id,transaction_id,component,basis,percent,amount,notes
1,123,STRUCTURING,GROSS,4,4000,Legacy import
```

**Use Cases**:
- Migrating from old systems
- Simple bulk imports
- Historical data loading

**Status**: Legacy - maintained for backward compatibility

---

### 3. Import V2 (`/admin/fees/import-v2`)

**Purpose**: Enhanced import with component-based validation

**Improvements over Legacy**:
- Component-based row structure
- Basis/percent/amount validation
- Preview before applying
- Error highlighting per row
- Batch processing

**CSV Format**:
```csv
deal_id,component,basis,percent,amount,precedence
1,PREMIUM,GROSS,3.77358,,1
1,STRUCTURING,GROSS,4.0,,2
1,MANAGEMENT,GROSS,2.0,,3
1,ADMIN,FIXED,,450,4
```

**When to Use**: Preferred for standard CSV imports with known structure.

---

### 4. Smart Import (`/admin/fees/smart-import`)

**Purpose**: AI-powered CSV mapping with automatic column detection

**Key Features**:
- Automatic column mapping
- Session-based staging
- Heuristic field detection
- Multi-step validation
- Flexible CSV formats

**Workflow**:
1. Upload CSV file
2. Review auto-mapped columns
3. Adjust mappings if needed
4. Preview calculations
5. Apply to database

**When to Use**: Best for non-standard CSVs or when column names vary.

---

### 5. ARCHON Fee Engine (`/admin/equitie-fee-engine`)

**Purpose**: Interactive calculator for testing fee scenarios

**Capabilities**:
- Real-time fee calculations
- Precedence visualization
- Discount application
- Transfer amount preview
- Multi-investor scenarios

**Use Cases**:
- Testing fee configurations
- Validating calculations
- Training on fee logic
- Debugging fee issues

**When to Use**: Use for testing and validation before applying fees to production.

---

### 6. Deal Equations (`/admin/deal-equations`)

**Purpose**: Complex fee equation management for specific deals

**Features**:
- Custom formula editor
- Deal-specific equations
- Variable substitution
- Calculation preview
- Version history

**Equation Format**:
```javascript
{
  "premium": "grossCapital * 0.0377358",
  "structuring": "grossCapital * 0.04",
  "management": "grossCapital * 0.02",
  "admin": 450,
  "transfer": "grossCapital - premium - structuring - management - admin"
}
```

**When to Use**: For deals with non-standard fee structures or complex calculations.

---

### 7. Bespoke Import (`/admin/fees/bespoke`)

**Purpose**: Custom import for edge cases and special scenarios

**Features**:
- Flexible data format
- Custom validation rules
- Manual mapping
- Exception handling

**When to Use**: When standard import tools don't fit your data structure.

---

### 8. Fee Editor (`/admin/fees/editor`)

**Purpose**: Direct editing of fee schedules

**Capabilities**:
- In-line editing
- Real-time validation
- Bulk updates
- History tracking

**Status**: Beta - under active development

---

## Choosing the Right Tool

### For New Deal Setup:
1. Start with **Fee Profiles** to configure structure
2. Use **ARCHON Fee Engine** to test calculations
3. Import investor data via **Smart Import** or **Import V2**

### For Data Migration:
1. Try **Smart Import** first for automatic mapping
2. Fall back to **Import V2** for manual control
3. Use **Legacy Import** for historical compatibility

### For Complex Scenarios:
1. Use **Deal Equations** for custom formulas
2. Try **Bespoke Import** for non-standard data
3. Use **Fee Editor** for manual adjustments

---

## ARCHON Fee Engine Rules

All tools follow these core rules:

1. **Precedence Order**: PREMIUM (1) → Others by precedence number
2. **Basis Types**: 
   - GROSS: Based on gross capital
   - NET: Based on remaining after previous fees
   - NET_AFTER_PREMIUM: Net amount after premium only
3. **Discounts**: Stored as negative amounts
4. **Partner Fees**: Prefixed with `PARTNER_` and excluded from investor views
5. **Rounding**: Money to 2 decimal places, units as integers (floor)

---

## API Integration

All tools use the same underlying APIs:

```typescript
// Preview calculations
POST /api/admin/fees/validate

// Apply fees
POST /api/admin/fees/apply
POST /api/admin/fees/apply-v2

// Import CSV
POST /api/admin/fees/import
POST /api/admin/fees/smart-import

// Manage profiles
GET/POST /api/admin/fees/profiles
```

---

## Best Practices

1. **Always Preview**: Review calculations before applying
2. **Test First**: Use ARCHON Engine to validate logic
3. **Keep Audit Trail**: Document changes in notes field
4. **Version Control**: Save fee profile JSONs externally
5. **Validate Totals**: Cross-check transfer amounts

---

## Common Workflows

### Setting Up a New Deal

```mermaid
graph LR
    A[Create Profile] --> B[Configure Fees]
    B --> C[Test in ARCHON]
    C --> D[Import Investors]
    D --> E[Preview Calculations]
    E --> F[Apply Fees]
```

### Importing Historical Data

```mermaid
graph LR
    A[Export from Legacy] --> B[Format CSV]
    B --> C[Smart Import]
    C --> D[Map Columns]
    D --> E[Validate]
    E --> F[Apply]
```

---

## Troubleshooting

### Common Issues:

1. **Precedence Conflicts**: Ensure PREMIUM = 1, others sequential
2. **Basis Mismatches**: Verify basis type matches calculation needs
3. **Rounding Errors**: Check decimal places in calculations
4. **Missing Discounts**: Discounts must be negative amounts
5. **Import Failures**: Validate CSV format and required fields

### Debug Steps:

1. Check `/api/admin/fees/validate` response
2. Review calculation notes in fee_application table
3. Use ARCHON Engine to reproduce issue
4. Check browser console for client errors
5. Review server logs for API errors

---

## Support

For additional help:
- Review ARCHON_FEE_ENGINE_CONTEXT.md for detailed logic
- Check FEATURES/fees/README.md for canonical reference
- Use admin chat interface for AI assistance
- Contact platform team for complex issues