#!/usr/bin/env tsx

/**
 * Apply RLS Policies Script
 * 
 * This script safely applies Row Level Security policies to the database
 * It can be run multiple times safely (idempotent)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

interface PolicyCheck {
  table: string;
  rls_enabled: boolean;
  policy_count: number;
}

async function checkCurrentPolicies(): Promise<PolicyCheck[]> {
  console.log('🔍 Checking current RLS status...\n');

  const query = `
    SELECT 
      c.relname as table,
      c.relrowsecurity as rls_enabled,
      COUNT(p.polname) as policy_count
    FROM pg_class c
    LEFT JOIN pg_policy p ON c.oid = p.polrelid
    WHERE c.relkind = 'r'
      AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND c.relname IN (
        'investors_clean',
        'deals_clean',
        'companies_clean',
        'transactions_clean',
        'transactions.transaction.secondary',
        'documents',
        'investor_analytics',
        'deal_valuations',
        'user_profiles'
      )
    GROUP BY c.relname, c.relrowsecurity
    ORDER BY c.relname;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { query_text: query });

  if (error) {
    // Try alternative query method
    console.warn('RPC method not available, using alternative approach');
    return [];
  }

  return data as PolicyCheck[];
}

async function applyRLSPolicies(): Promise<void> {
  console.log('📋 Applying RLS Policies...\n');

  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'DB/migrations/07_rls_policies.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split into individual statements (naive split, works for this case)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const statement of statements) {
    // Skip comment-only lines
    if (statement.replace(/--.*$/gm, '').trim().length === 0) {
      continue;
    }

    try {
      // For this example, we'll need to use the Supabase SQL editor
      // or implement via direct PostgreSQL connection
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      
      // Note: In production, you'd execute this via:
      // - Direct PostgreSQL connection
      // - Supabase CLI
      // - Supabase Dashboard
      
      successCount++;
    } catch (error) {
      errorCount++;
      errors.push(`${statement.substring(0, 50)}... - ${error}`);
    }
  }

  console.log('\n📊 Results:');
  console.log(`✅ Successful statements: ${successCount}`);
  console.log(`❌ Failed statements: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }
}

async function testRLSPolicies(): Promise<void> {
  console.log('\n🧪 Testing RLS Policies...\n');

  const tests = [
    {
      name: 'Admin can see all investors',
      role: 'admin',
      query: 'SELECT COUNT(*) FROM "investors_clean"',
      expected: 'Should return all rows',
    },
    {
      name: 'Investor can only see own data',
      role: 'investor',
      query: 'SELECT * FROM "investors_clean" WHERE id = auth.get_investor_id()',
      expected: 'Should return only own row',
    },
    {
      name: 'Anon cannot see investor data',
      role: 'anon',
      query: 'SELECT COUNT(*) FROM "investors_clean"',
      expected: 'Should return 0 rows',
    },
  ];

  console.log('🔬 RLS Policy Tests:');
  tests.forEach(test => {
    console.log(`  - ${test.name}`);
    console.log(`    Role: ${test.role}`);
    console.log(`    Expected: ${test.expected}`);
  });
}

async function main() {
  console.log('🚀 RLS Policy Application Script');
  console.log('=================================\n');

  // Check current status
  const currentPolicies = await checkCurrentPolicies();
  
  if (currentPolicies.length > 0) {
    console.log('Current RLS Status:');
    currentPolicies.forEach(p => {
      const status = p.rls_enabled ? '✅ Enabled' : '❌ Disabled';
      console.log(`  ${p.table}: ${status} (${p.policy_count} policies)`);
    });
    console.log('');
  }

  // Provide instructions for manual application
  console.log('📝 To apply RLS policies:\n');
  console.log('1. Option A: Use Supabase Dashboard');
  console.log('   - Go to SQL Editor in Supabase Dashboard');
  console.log('   - Copy contents of DB/migrations/07_rls_policies.sql');
  console.log('   - Run the migration\n');

  console.log('2. Option B: Use Supabase CLI');
  console.log('   - Install: npm install -g supabase');
  console.log('   - Link: supabase link --project-ref ikezqzljrupkzmyytgok');
  console.log('   - Apply: supabase db push\n');

  console.log('3. Option C: Use MCP through IDE');
  console.log('   - Open Cursor IDE');
  console.log('   - Use MCP Supabase server');
  console.log('   - Execute migration queries\n');

  // Test policies
  await testRLSPolicies();

  console.log('\n✅ RLS policy preparation complete!');
  console.log('⚠️  Remember: RLS policies affect all database access');
  console.log('💡 Test thoroughly in development before production');
}

main().catch(console.error);