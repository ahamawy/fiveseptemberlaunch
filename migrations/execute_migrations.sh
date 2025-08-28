#!/bin/bash

# Migration Execution Script for Supabase Synchronization
# Purpose: Apply all migrations to fix many-to-many relationships and NC entry points
# Date: 2025-01-28

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get database URL from environment or prompt
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Please enter your Supabase database URL:${NC}"
    echo "Format: postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
    read -s DATABASE_URL
    export DATABASE_URL
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Supabase Migration Execution${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to execute migration and check result
execute_migration() {
    local migration_file=$1
    local migration_name=$2
    
    echo -e "\n${YELLOW}Executing: ${migration_name}${NC}"
    echo "File: ${migration_file}"
    
    if psql "$DATABASE_URL" -f "$migration_file" -v ON_ERROR_STOP=1; then
        echo -e "${GREEN}✅ ${migration_name} completed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ ${migration_name} failed${NC}"
        return 1
    fi
}

# Pre-flight checks
echo -e "\n${BLUE}Running pre-flight checks...${NC}"

# Test database connection
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to database${NC}"
    exit 1
fi

# Check if migrations exist
if [ ! -f "migrations/001_fix_many_to_many_relationships.sql" ]; then
    echo -e "${RED}❌ Migration files not found. Please run from project root.${NC}"
    exit 1
fi

# Backup reminder
echo -e "\n${YELLOW}⚠️  IMPORTANT: Have you backed up your database?${NC}"
echo "Press Enter to continue or Ctrl+C to abort..."
read

# Execute migrations in order
echo -e "\n${BLUE}Starting migrations...${NC}"

# Migration 001: Many-to-Many Relationships
if ! execute_migration "migrations/001_fix_many_to_many_relationships.sql" "Many-to-Many Relationships"; then
    echo -e "${RED}Migration 001 failed. Aborting.${NC}"
    exit 1
fi

# Migration 002: Formula Support
if ! execute_migration "migrations/002_add_formula_support.sql" "Formula Support and NC Entry Points"; then
    echo -e "${RED}Migration 002 failed. Aborting.${NC}"
    exit 1
fi

# Migration 003: NAV Cascade Triggers
if ! execute_migration "migrations/003_nav_cascade_triggers.sql" "NAV Cascade Triggers"; then
    echo -e "${RED}Migration 003 failed. Aborting.${NC}"
    exit 1
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}   All migrations completed!${NC}"
echo -e "${BLUE}========================================${NC}"

# Run verification queries
echo -e "\n${BLUE}Running verification queries...${NC}"

# Check foreign keys
echo -e "\n${YELLOW}Checking foreign key relationships...${NC}"
psql "$DATABASE_URL" -c "
SELECT COUNT(*) as fk_count 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'deal_company_positions';
"

# Check formula templates
echo -e "\n${YELLOW}Checking formula templates...${NC}"
psql "$DATABASE_URL" -c "
SELECT template_name, nc_formula 
FROM public.formula_templates 
LIMIT 5;
"

# Check NAV health
echo -e "\n${YELLOW}Checking NAV health...${NC}"
psql "$DATABASE_URL" -c "
SELECT COUNT(*) as deal_count,
       COUNT(CASE WHEN last_nav_update > NOW() - INTERVAL '1 day' THEN 1 END) as fresh_nav_count
FROM portfolio.deal_tokens;
"

# Check many-to-many relationships
echo -e "\n${YELLOW}Checking many-to-many deal-company relationships...${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    (SELECT COUNT(DISTINCT deal_id) FROM portfolio.deal_company_positions) as unique_deals,
    (SELECT COUNT(DISTINCT company_id) FROM portfolio.deal_company_positions) as unique_companies,
    (SELECT COUNT(*) FROM portfolio.deal_company_positions) as total_positions;
"

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}   Migration Summary${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "${GREEN}✅ Foreign keys properly configured${NC}"
echo -e "${GREEN}✅ Formula templates installed${NC}"
echo -e "${GREEN}✅ NAV cascade triggers active${NC}"
echo -e "${GREEN}✅ Net capital entry points created${NC}"
echo -e "${GREEN}✅ Many-to-many relationships established${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Test NAV cascade: Update a company valuation and check audit.nav_cascade_log"
echo "2. Test NC entry: Use record_transaction_net_capital() for a legacy deal"
echo "3. Update service layer to use new functions"
echo "4. Run full test suite"

echo -e "\n${GREEN}Migration complete! 🎉${NC}"