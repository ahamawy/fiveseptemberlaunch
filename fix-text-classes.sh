#!/bin/bash

# Fix old text color classes to use proper Tailwind classes

echo "Fixing text color classes..."

# Replace text-text-primary with text-foreground
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/text-text-primary/text-foreground/g' {} \;

# Replace text-text-secondary with text-muted-foreground  
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/text-text-secondary/text-muted-foreground/g' {} \;

# Replace text-text-tertiary with text-muted-foreground/70
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/text-text-tertiary/text-muted-foreground\/70/g' {} \;

# Replace bg-surface with bg-card
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/bg-surface-main/bg-card/g' {} \;
  
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/bg-surface-elevated/bg-card/g' {} \;

find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/bg-surface-hover/bg-muted/g' {} \;

# Replace border-surface-border with border-border
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/border-surface-border/border-border/g' {} \;

# Replace bg-background-deep with bg-background
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/bg-background-deep/bg-background/g' {} \;

# Replace bg-background-surface with bg-card
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -exec sed -i '' 's/bg-background-surface/bg-card/g' {} \;

echo "✅ All text color classes have been updated to use proper Tailwind classes"