// Test the deals feature module
const path = require('path');

// Set environment variables before importing anything
process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
process.env.NEXT_PUBLIC_ENABLE_SUPABASE = 'false';
process.env.NEXT_PUBLIC_ENABLE_FEATURES = 'true';
process.env.NEXT_PUBLIC_FEATURE_DEALS_READ = 'true';
process.env.NODE_ENV = 'development';

async function testDealsEndpoint() {
  try {
    console.log('Environment:', {
      USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
      ENABLE_SUPABASE: process.env.NEXT_PUBLIC_ENABLE_SUPABASE,
      ENABLE_FEATURES: process.env.NEXT_PUBLIC_ENABLE_FEATURES,
    });

    // Test via HTTP
    const response = await fetch('http://localhost:3001/api/deals/1');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDealsEndpoint();