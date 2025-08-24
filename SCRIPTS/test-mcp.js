#!/usr/bin/env node

/**
 * MCP Server Test Script
 * 
 * This script verifies that MCP servers are properly configured
 * and can access the Supabase database through the IDE.
 * 
 * Usage: node scripts/test-mcp.js
 */

const TESTS = [
  {
    name: "Test Supabase Connection",
    description: "Verify MCP can connect to Supabase project",
    query: "SELECT current_database(), current_user, version()"
  },
  {
    name: "Test Table Access",
    description: "Verify access to investors.investor table",
    query: "SELECT COUNT(*) as investor_count FROM \"investors.investor\""
  },
  {
    name: "Test Foreign Keys",
    description: "Count foreign key relationships to investors.investor",
    query: `
      SELECT COUNT(DISTINCT tc.table_name) as tables_with_fks
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'investors.investor'
        AND tc.table_schema = 'public'
    `
  },
  {
    name: "Test Deals Access",
    description: "Verify access to deals.deal table",
    query: "SELECT COUNT(*) as deal_count FROM \"deals.deal\""
  },
  {
    name: "Test Companies Access",
    description: "Verify access to companies.company table",
    query: "SELECT COUNT(*) as company_count FROM \"companies.company\""
  }
];

console.log("🔍 MCP Server Test Suite");
console.log("========================\n");

console.log("📋 Test Plan:");
TESTS.forEach((test, i) => {
  console.log(`${i + 1}. ${test.name}`);
  console.log(`   ${test.description}`);
});

console.log("\n⚡ To run these tests in Cursor IDE:");
console.log("1. Open Command Palette (Cmd+Shift+P)");
console.log("2. Search for 'MCP' or 'Model Context Protocol'");
console.log("3. Select 'Run MCP Query' or similar command");
console.log("4. Choose 'supabase' server");
console.log("5. Execute each test query\n");

console.log("📝 Expected Results:");
console.log("- Database: postgres");
console.log("- Investor count: 202");
console.log("- Tables with FKs to investors.investor: 11+");
console.log("- All queries should return results without errors\n");

console.log("🔧 Troubleshooting:");
console.log("- If MCP servers don't appear: Restart Cursor IDE");
console.log("- If authentication fails: Check .vscode/settings.json");
console.log("- If queries fail: Verify SUPABASE_SERVICE_ROLE_KEY in settings\n");

console.log("✅ MCP Configuration Location:");
console.log("   .vscode/settings.json\n");

// Export test queries for programmatic use
module.exports = { TESTS };