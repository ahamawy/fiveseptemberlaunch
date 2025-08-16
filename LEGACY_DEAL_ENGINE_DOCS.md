# Legacy Deal Fee Calculation Engine Documentation

## Overview
This system manages complex fee calculations for legacy investment deals with support for multiple fee components, discounts, and partner transfers.

## Quick Start Guide

### Step 1: Create Fee Profile
1. Navigate to http://localhost:3000/admin/fees/profiles
2. Enter Deal ID: `1`
3. Select Kind: `LEGACY`
4. Paste the JSON from `groq-deal-profile.json`
5. Click "Create/Activate"

### Step 2: Import Investor Data
1. Navigate to http://localhost:3000/admin/fees/import
2. Copy the CSV content from `groq-investors.csv`
3. Paste into the CSV input field
4. Click "Upload CSV" to preview
5. Verify the calculations match expected totals
6. Click "Apply Import" to save to database

## Fee Calculation Formula

### Base Calculations
```
Premium = Gross Capital × Premium Rate (3.77358%)
Net Capital = Gross Capital - Premium
Units = floor(Net Capital / Unit Price)
```

### Fee Components
1. **Premium Fee**: Based on valuation difference
   - Rate = (Sell Valuation - Purchase Valuation) / Purchase Valuation
   - Example: (5.5B - 5.3B) / 5.3B = 3.77358%

2. **Structuring Fee**: 4% of Gross Capital
3. **Management Fee**: 2% of Gross Capital (annual)
4. **Admin Fee**: $450 per investor (fixed)

### Transfer Calculations
```
Transfer Pre-Discount = Gross Capital + All Fees
Discounts = Sum of (Fee × Discount%)
Transfer Post-Discount = Transfer Pre-Discount - Discounts
```

## Example: Groq Deal (July 2025)

### Deal Parameters
- Pre-money Purchase Valuation: $5,300,000,000
- Pre-money Sell Valuation: $5,500,000,000
- Premium Rate: 3.77358%
- Structuring Fee: 4%
- Management Fee: 2% (annual)
- Admin Fee: $450
- Unit Price: $1,000

### Expected Totals
- Total Gross Capital: $1,453,750
- Total Net Capital: $1,398,892
- Total Units: 1,399
- Transfer Pre-Discount: $1,552,225
- Total Discounts: $37,225
- Transfer Post-Discount: $1,515,000

## CSV Format Specification

### For Investor Import
```csv
investor_name,gross_capital,structuring_discount_percent,management_discount_percent,admin_discount_percent
John Doe,100000,50,0,100
```

### For Fee Import
```csv
deal_id,transaction_id,component,basis,percent,amount,notes,source_file
1,123,STRUCTURING,GROSS,4,4000,Legacy import,groq.csv
```

## API Endpoints

### Profiles Management
- `GET /api/admin/fees/profiles` - List all profiles
- `POST /api/admin/fees/profiles` - Create/update profile

### Import Management
- `GET /api/admin/fees/import` - Get import preview
- `POST /api/admin/fees/import` - Upload CSV data
- `POST /api/admin/fees/apply` - Apply imported data

## Database Schema

### Key Tables
- `fees.calculator_profile` - Profile configurations
- `fees.fee_schedule` - Fee schedules by deal
- `fees.schedule_version` - Version control for schedules
- `fees.fee_application` - Applied fees to transactions
- `fees.legacy_import` - Temporary import staging
- `analytics.v_fee_import_preview` - Preview view for imports

## Testing & Validation

### Test Profile Creation
1. Use the provided `groq-deal-profile.json`
2. Verify profile appears in the profiles list
3. Check "Active" status is true

### Test CSV Import
1. Use the provided `groq-investors.csv`
2. Verify preview calculations:
   - Each investor's premium, fees, and discounts
   - Total sums match expected values
3. Apply import and verify database updates

### Validation Checks
- [ ] Premium calculation: 3.77358% of gross
- [ ] Net capital: Gross - Premium
- [ ] Units: floor(Net / 1000)
- [ ] Transfer amounts with discounts
- [ ] Total net capital: $1,398,892
- [ ] Total transfer: $1,515,000

## Accessibility Features

### Keyboard Navigation
- All form fields accessible via Tab
- Buttons triggered with Space/Enter
- Tables navigable with arrow keys

### Screen Reader Support
- ARIA labels on all inputs
- Role attributes on tables
- Live regions for status updates
- Descriptive button labels

### Visual Design
- High contrast text (WCAG AA compliant)
- Focus indicators on all interactive elements
- Status colors with text alternatives
- Responsive layout for all screen sizes

## Troubleshooting

### Common Issues

1. **500 Error on Profile Load**
   - Check database connection
   - Verify fees schema exists
   - Run migrations if needed

2. **Import Preview Empty**
   - Verify CSV format is correct
   - Check column names match exactly
   - Ensure deal_id exists in database

3. **Calculations Don't Match**
   - Verify profile JSON configuration
   - Check discount percentages
   - Review rounding rules (floor vs round)

### Debug Commands

```sql
-- Check imported data
SELECT * FROM fees.legacy_import;

-- View preview
SELECT * FROM analytics.v_fee_import_preview;

-- Check applied fees
SELECT * FROM fees.fee_application WHERE deal_id = 1;

-- Verify profile
SELECT * FROM fees.calculator_profile WHERE id = 1;
```

## Support
For issues or questions, refer to the main CLAUDE.md documentation or contact the development team.