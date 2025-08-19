#!/usr/bin/env npx tsx
import 'dotenv/config';
import { enhancedFeeCalculator } from './lib/services/fee-engine/enhanced-calculator';

async function test() {
  console.log('Testing Fee Equation System\n');
  console.log('='.repeat(60));
  
  // Test Deal 28 calculation
  console.log('\nTest 1: Deal 28 with $100k investment');
  try {
    const result = await enhancedFeeCalculator.calculate(
      28, // dealId
      100000, // grossCapital
      1000, // unitPrice
      {
        discounts: [
          { component: 'STRUCTURING_DISCOUNT', percent: 0.5 }
        ]
      }
    );
    
    console.log('✅ Calculation successful:');
    console.log('  Gross Amount:', result.state.grossAmount);
    console.log('  Applied Fees:', result.state.appliedFees.length);
    console.log('  Transfer Pre-Discount:', result.transferPreDiscount);
    console.log('  Total Discounts:', result.totalDiscounts);
    console.log('  Transfer Post-Discount:', result.transferPostDiscount);
    console.log('  Units:', result.units);
    console.log('  Valid:', result.validation.valid);
    
    if (result.validation.warnings.length > 0) {
      console.log('  Warnings:', result.validation.warnings);
    }
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  
  // Test Deal 29 calculation
  console.log('\n\nTest 2: Deal 29 with $500k investment');
  try {
    const result = await enhancedFeeCalculator.calculate(
      29, // dealId
      500000, // grossCapital
      1000, // unitPrice
      {}
    );
    
    console.log('✅ Calculation successful:');
    console.log('  Transfer Amount:', result.transferPostDiscount);
    console.log('  Units:', result.units);
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test complete');
}

test().catch(console.error);