// This script has been deprecated as fee calculations are now handled by formula-engine.service.ts
// Use the formula engine directly for fee calculations

import { formulaEngine } from '@/lib/services/formula-engine.service';

async function testFeeCalculations() {
  console.log('Testing fee calculations with formula engine...');
  
  try {
    // Test calculation for deal 1
    const result = await formulaEngine.calculateForDeal({
      dealId: 1,
      grossCapital: 1000000
    });
    
    console.log('Calculation result:', result);
    console.log('Net Capital:', result.netCapital);
    console.log('Total Fees:', result.totalFees);
    console.log('Formula Used:', result.formulaUsed);
    
    // Validate all transactions for the deal
    const validation = await formulaEngine.validateDealTransactions(1);
    console.log('Validation results:', validation);
    
  } catch (error) {
    console.error('Error testing fees:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testFeeCalculations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}