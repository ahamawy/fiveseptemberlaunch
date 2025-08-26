#!/bin/bash

# Fix all old table references to use clean tables

echo "Fixing old table references..."

# Fix transactions.transaction.primary references
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/transactions\.transaction\.primary/transactions_clean/g' {} \;

# Fix investors.investor references  
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/investors\.investor/investors_clean/g' {} \;

# Fix deals.deal references
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/deals\.deal/deals_clean/g' {} \;

# Fix companies.company references
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/companies\.company/companies_clean/g' {} \;

echo "✅ All table references have been updated to use clean tables"