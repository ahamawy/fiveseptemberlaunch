/**
 * Test Deal Equations with Real Database Deals
 * Tests the equation system with actual deals from Supabase
 */

import 'dotenv/config';
import { dealEquationExecutor, DealEquation } from './lib/services/fee-engine/deal-equation-executor';
import { transactionsService } from './lib/services/transactions.service';

async function testRealDeals() {
  console.log('🧪 Testing Deal Equation System with Real Deals\n');
  console.log('='.repeat(60));
  
  try {
    // Test with actual deal IDs from database
    const testDeals = [
      { id: 29, name: 'EWT 2' },
      { id: 28, name: 'Groq AI Investment' }
    ];
    
    for (const deal of testDeals) {
      console.log(`\n📊 Testing Deal #${deal.id}: ${deal.name}`);
      console.log('-'.repeat(40));
      
      // Try to load equation for this deal
      const equation = await dealEquationExecutor.loadDealEquation(deal.id);
      
      if (equation) {
        console.log(`✅ Loaded equation: ${equation.equation_name}`);
        console.log(`   Components: ${Object.keys(equation.rules).join(', ')}`);
        
        // Test calculation with different scenarios
        const scenarios = [
          { amount: 100000, years: 1, label: 'Small ($100K, 1 year)' },
          { amount: 1000000, years: 3, label: 'Medium ($1M, 3 years)' },
          { amount: 10000000, years: 5, label: 'Large ($10M, 5 years)' }
        ];
        
        for (const scenario of scenarios) {
          console.log(`\n   Scenario: ${scenario.label}`);
          
          const result = await dealEquationExecutor.preview(deal.id, {
            gross_capital: scenario.amount,
            units: Math.floor(scenario.amount / 1000),
            unit_price: 1000,
            years: scenario.years,
            deal_id: deal.id,
            investor_id: 999
          });
          
          console.log(`   Gross: $${scenario.amount.toLocaleString()}`);
          console.log(`   Fees:`);
          
          result.state.appliedFees.forEach(fee => {
            const sign = fee.amount < 0 ? '-' : '';
            console.log(`     ${fee.component}: ${sign}$${Math.abs(fee.amount).toLocaleString()}`);
          });
          
          console.log(`   Total: $${result.transferPostDiscount.toLocaleString()}`);
          console.log(`   Net: $${(scenario.amount - result.transferPostDiscount).toLocaleString()}`);
        }
      } else {
        console.log(`⚠️  No equation found - using default`);
        
        // Set up a default equation for this deal
        const defaultEquation: DealEquation = {
          deal_id: deal.id,
          equation_name: 'DEFAULT_PRIMARY',
          rules: {
            premium: { basis: 'GROSS', rate: 0.03, precedence: 1 },
            structuring: { basis: 'NET', rate: 0.02, precedence: 2 },
            management: { basis: 'NET_AFTER_PREMIUM', rate: 0.015, annual: true, precedence: 3 },
            admin: { fixed_amount: 500, basis: 'GROSS', precedence: 4 }
          },
          metadata: {
            party_type: 'investor',
            effective_date: new Date()
          }
        };
        
        console.log(`   Saving default equation...`);
        await dealEquationExecutor.saveEquation(defaultEquation);
        console.log(`   ✅ Default equation saved`);
        
        // Test with the new equation
        const testAmount = 500000;
        const result = await dealEquationExecutor.preview(deal.id, {
          gross_capital: testAmount,
          units: Math.floor(testAmount / 1000),
          unit_price: 1000,
          years: 1,
          deal_id: deal.id,
          investor_id: 999
        });
        
        console.log(`\n   Test calculation ($${testAmount.toLocaleString()}):`);
        console.log(`   Total fees: $${result.transferPostDiscount.toLocaleString()}`);
      }
    }
    
    // Test creating a new transaction with fee calculation
    console.log('\n\n🔄 Testing Transaction Creation with Fees');
    console.log('='.repeat(60));
    
    const testTransaction = {
      deal_id: 29, // EWT 2
      investor_id: 1,
      units: 250,
      unit_price: 1000,
      years: 2
    };
    
    console.log('\nCreating test transaction:');
    console.log(`  Deal: #${testTransaction.deal_id}`);
    console.log(`  Units: ${testTransaction.units}`);
    console.log(`  Unit Price: $${testTransaction.unit_price}`);
    console.log(`  Gross Capital: $${(testTransaction.units * testTransaction.unit_price).toLocaleString()}`);
    
    try {
      const result = await transactionsService.createPrimaryTx(testTransaction);
      console.log('\n✅ Transaction created successfully!');
      console.log(`  Transaction ID: ${result.transaction_id}`);
      console.log(`  Net Capital: $${result.net_capital?.toLocaleString() || 'N/A'}`);
      console.log(`  Fee Method: ${result.fee_calc_method || 'None'}`);
    } catch (error: any) {
      console.log(`\n⚠️  Transaction creation failed: ${error.message}`);
      console.log('  (This is expected if the transaction already exists)');
    }
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n\n✅ Test completed!');
}

// Run the test
testRealDeals()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });