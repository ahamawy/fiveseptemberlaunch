// This script has been deprecated
// Data migration is now handled through the formula engine

import 'dotenv/config';

console.log(`
================================================
This migration script is no longer needed.

The system now uses:
- Clean tables (transactions_clean, deals_clean, etc.)
- Formula templates for fee calculations
- Formula engine for all calculations

Data has already been migrated to the clean schema.
================================================
`);

if (require.main === module) {
  console.log('No migration needed - clean schema is active');
  process.exit(0);
}