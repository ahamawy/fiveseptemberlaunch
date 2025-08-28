#!/usr/bin/env node

/**
 * Health Check Script
 * Tests all critical pages and APIs to ensure the platform is working
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

const defaultPort = process.env.PORT || process.env.NEXT_PUBLIC_PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${defaultPort}`;

const checks = [
  // Core Pages
  { name: 'Home Page', url: '/', expected: 200 },
  { name: 'Login Page', url: '/login', expected: 200 },
  
  // Admin Pages
  { name: 'Admin Dashboard', url: '/admin/dashboard', expected: 200 },
  { name: 'Admin Deals', url: '/admin/deals', expected: 200 },
  { name: 'Admin Transactions', url: '/admin/transactions', expected: 200 },
  { name: 'Admin Fees', url: '/admin/fees', expected: 200 },
  
  // Investor Portal Pages  
  { name: 'Investor Dashboard', url: '/investor-portal/dashboard', expected: 200 },
  { name: 'Investor Portfolio', url: '/investor-portal/portfolio', expected: 200 },
  { name: 'Investor Deals', url: '/investor-portal/deals', expected: 200 },
  { name: 'Investor Transactions', url: '/investor-portal/transactions', expected: 200 },
  
  // API Endpoints
  { name: 'Health API', url: '/api/health/supabase', expected: 200 },
  { name: 'Deals API', url: '/api/deals', expected: 200 },
  { name: 'Companies API', url: '/api/companies', expected: 200 },
  { name: 'Investor API', url: '/api/investors/1', expected: 200 },
];

async function checkUrl(check) {
  try {
    const response = await fetch(`${BASE_URL}${check.url}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Health-Check/1.0',
      },
      timeout: 5000,
    });
    
    const status = response.status;
    const success = status === check.expected;
    
    return {
      ...check,
      status,
      success,
      error: null,
    };
  } catch (error) {
    return {
      ...check,
      status: 0,
      success: false,
      error: error.message,
    };
  }
}

async function runHealthCheck() {
  console.log(chalk.bold.blue('\n🏥 Running Health Check...\n'));
  console.log(chalk.gray(`Base URL: ${BASE_URL}\n`));
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    process.stdout.write(chalk.gray(`Checking ${check.name}... `));
    const result = await checkUrl(check);
    results.push(result);
    
    if (result.success) {
      console.log(chalk.green(`✓ ${result.status}`));
      passed++;
    } else {
      if (result.error) {
        console.log(chalk.red(`✗ ERROR: ${result.error}`));
      } else {
        console.log(chalk.red(`✗ ${result.status} (expected ${check.expected})`));
      }
      failed++;
    }
  }
  
  // Summary
  console.log(chalk.bold.blue('\n📊 Summary:\n'));
  console.log(chalk.green(`  ✓ Passed: ${passed}`));
  if (failed > 0) {
    console.log(chalk.red(`  ✗ Failed: ${failed}`));
  }
  
  const successRate = ((passed / checks.length) * 100).toFixed(1);
  const rateColor = successRate >= 80 ? chalk.green : successRate >= 50 ? chalk.yellow : chalk.red;
  console.log(rateColor(`  Success Rate: ${successRate}%`));
  
  // Failed checks details
  if (failed > 0) {
    console.log(chalk.bold.red('\n❌ Failed Checks:\n'));
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(chalk.red(`  • ${r.name}: ${r.url}`));
        if (r.error) {
          console.log(chalk.gray(`    Error: ${r.error}`));
        } else {
          console.log(chalk.gray(`    Status: ${r.status} (expected ${r.expected})`));
        }
      });
  }
  
  // Exit code
  if (failed > 0) {
    console.log(chalk.bold.red('\n❌ Health check failed!\n'));
    process.exit(1);
  } else {
    console.log(chalk.bold.green('\n✅ All health checks passed!\n'));
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  runHealthCheck().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

module.exports = { runHealthCheck, checkUrl };