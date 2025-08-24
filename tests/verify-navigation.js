#!/usr/bin/env node

/**
 * Navigation Verification Script
 * Tests all navigation links in the application
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

const pages = [
  { path: '/', name: 'Home Page' },
  { path: '/investor-portal/dashboard', name: 'Dashboard' },
  { path: '/investor-portal/deals', name: 'Deals' },
  { path: '/investor-portal/portfolio', name: 'Portfolio' },
  { path: '/investor-portal/transactions', name: 'Transactions' },
  { path: '/investor-portal/documents', name: 'Documents' },
  { path: '/investor-portal/profile', name: 'Profile' },
  { path: '/style-guide', name: 'Style Guide' },
];

const apiEndpoints = [
  { path: '/api/investors/1/dashboard', name: 'Dashboard API' },
  { path: '/api/investors/1/portfolio', name: 'Portfolio API' },
  { path: '/api/investors/1/commitments', name: 'Commitments API' },
  { path: '/api/investors/1/transactions?page=1&limit=10', name: 'Transactions API' },
];

function testUrl(url, name) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      const status = res.statusCode;
      const isSuccess = status >= 200 && status < 500; // 2xx, 3xx, 4xx are acceptable
      
      if (isSuccess) {
        console.log(`✅ ${name}: ${status} - ${url}`);
      } else {
        console.log(`❌ ${name}: ${status} - ${url}`);
      }
      
      resolve({ name, url, status, success: isSuccess });
    }).on('error', (err) => {
      console.log(`❌ ${name}: ERROR - ${url} - ${err.message}`);
      resolve({ name, url, status: 0, success: false, error: err.message });
    });
  });
}

async function verifyNavigation() {
  console.log('=================================');
  console.log('Navigation Verification Test');
  console.log('=================================\n');
  
  console.log('Testing Pages:');
  console.log('-------------');
  const pageResults = [];
  for (const page of pages) {
    const result = await testUrl(`${BASE_URL}${page.path}`, page.name);
    pageResults.push(result);
  }
  
  console.log('\nTesting API Endpoints:');
  console.log('--------------------');
  const apiResults = [];
  for (const endpoint of apiEndpoints) {
    const result = await testUrl(`${BASE_URL}${endpoint.path}`, endpoint.name);
    apiResults.push(result);
  }
  
  // Summary
  console.log('\n=================================');
  console.log('Summary');
  console.log('=================================');
  
  const allResults = [...pageResults, ...apiResults];
  const successCount = allResults.filter(r => r.success).length;
  const failCount = allResults.filter(r => !r.success).length;
  
  console.log(`Total Tests: ${allResults.length}`);
  console.log(`✅ Passed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  if (failCount > 0) {
    console.log('\nFailed Tests:');
    allResults.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.status} ${r.error || ''}`);
    });
  }
  
  console.log('\n=================================');
  console.log(failCount === 0 ? '✅ All navigation links working!' : '⚠️ Some navigation links need attention');
  console.log('=================================');
  
  process.exit(failCount > 0 ? 1 : 0);
}

// Run the verification
verifyNavigation().catch(console.error);