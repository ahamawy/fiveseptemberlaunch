#!/usr/bin/env node

/**
 * Data Migration Script
 * Populates missing PMSP, ISP, SFR values and recalculates Net Capital
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Formula template configurations
const FORMULA_CONFIGS = {
  impossible: {
    pmsp: 21,  // Post-money share price
    isp: 19,   // Initial share price
    sfr: null
  },
  spacex2: {
    pmsp: 125,
    isp: 100,
    sfr: null
  },
  openai: {
    pmsp: 150,
    isp: 100,
    sfr: 0.2  // 20% structuring fee rate
  },
  figure: {
    pmsp: null,
    isp: null,
    sfr: 0.35  // 35% structuring fee rate
  },
  spacex1: {
    pmsp: null,
    isp: null,
    sfr: 0.25  // 25% structuring fee rate
  },
  reddit: {
    pmsp: null,
    isp: null,
    sfr: null  // Direct NC = GC
  },
  standard: {
    pmsp: null,
    isp: null,
    sfr: null  // Direct NC = GC
  }
};

async function migrateData() {
  console.log('🚀 Starting Formula Data Migration...\n');

  try {
    // Step 1: Get all deals with their formula templates
    const { data: deals, error: dealsError } = await supabase
      .from('deals_clean')
      .select('deal_id, deal_name, formula_template, nc_calculation_method')
      .order('deal_id');

    if (dealsError) throw dealsError;

    console.log(`Found ${deals?.length || 0} deals to process\n`);

    let totalUpdated = 0;
    let totalRecalculated = 0;

    // Step 2: Process each deal
    for (const deal of deals || []) {
      console.log(`\n📊 Processing Deal #${deal.deal_id}: ${deal.deal_name}`);
      console.log(`   Template: ${deal.formula_template}`);
      console.log(`   NC Method: ${deal.nc_calculation_method}`);

      // Get transactions for this deal
      const { data: transactions, error: txError } = await supabase
        .from('transactions_clean')
        .select('transaction_id, gross_capital, initial_net_capital, pmsp, isp, sfr')
        .eq('deal_id', deal.deal_id)
        .eq('transaction_type', 'primary');

      if (txError) {
        console.error(`   ❌ Error fetching transactions: ${txError.message}`);
        continue;
      }

      console.log(`   Found ${transactions?.length || 0} transactions`);

      const config = FORMULA_CONFIGS[deal.formula_template as keyof typeof FORMULA_CONFIGS] || {};
      let dealUpdated = 0;
      let dealRecalculated = 0;

      // Step 3: Update missing values and recalculate NC
      for (const tx of transactions || []) {
        const updates: any = {};
        let needsUpdate = false;

        // Add missing PMSP/ISP/SFR values
        if (config.pmsp !== null && tx.pmsp === null) {
          updates.pmsp = config.pmsp;
          needsUpdate = true;
        }
        if (config.isp !== null && tx.isp === null) {
          updates.isp = config.isp;
          needsUpdate = true;
        }
        if (config.sfr !== null && tx.sfr === null) {
          updates.sfr = config.sfr;
          needsUpdate = true;
        }

        // Calculate new NC based on formula
        const gc = parseFloat(tx.gross_capital);
        let calculatedNC = gc;

        switch (deal.nc_calculation_method) {
          case 'premium_based':
            const pmsp = updates.pmsp || tx.pmsp || config.pmsp;
            const isp = updates.isp || tx.isp || config.isp;
            if (pmsp && isp && isp > 0) {
              calculatedNC = gc * (pmsp / isp);
            }
            break;

          case 'sfr_based':
            const sfr = updates.sfr || tx.sfr || config.sfr;
            if (sfr) {
              calculatedNC = gc / (1 + sfr);
            }
            break;

          case 'structured':
            const structSfr = updates.sfr || tx.sfr || config.sfr;
            if (structSfr) {
              calculatedNC = gc * (1 - structSfr);
            }
            break;

          case 'complex':
            // OpenAI: NC = (GC × (1 - SFR)) × (PMSP/ISP)
            const complexSfr = updates.sfr || tx.sfr || config.sfr;
            const complexPmsp = updates.pmsp || tx.pmsp || config.pmsp;
            const complexIsp = updates.isp || tx.isp || config.isp;
            if (complexSfr !== null && complexPmsp && complexIsp && complexIsp > 0) {
              calculatedNC = (gc * (1 - complexSfr)) * (complexPmsp / complexIsp);
            }
            break;

          case 'direct':
          case 'standard':
          default:
            calculatedNC = gc;
            break;
        }

        // Check if NC needs updating
        const currentNC = parseFloat(tx.initial_net_capital);
        const ncDifference = Math.abs(calculatedNC - currentNC);
        const ncPercentDiff = (ncDifference / currentNC) * 100;

        if (ncPercentDiff > 1) {
          updates.initial_net_capital = calculatedNC;
          needsUpdate = true;
          dealRecalculated++;
        }

        // Apply updates
        if (needsUpdate && Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('transactions_clean')
            .update(updates)
            .eq('transaction_id', tx.transaction_id);

          if (updateError) {
            console.error(`   ❌ Failed to update transaction ${tx.transaction_id}: ${updateError.message}`);
          } else {
            dealUpdated++;
            
            // Log the update
            const updatedFields = Object.keys(updates).join(', ');
            console.log(`   ✓ Updated transaction ${tx.transaction_id}: ${updatedFields}`);
            
            if (updates.initial_net_capital) {
              console.log(`     NC: ${currentNC.toFixed(2)} → ${calculatedNC.toFixed(2)} (${ncPercentDiff.toFixed(1)}% change)`);
            }
          }
        }
      }

      totalUpdated += dealUpdated;
      totalRecalculated += dealRecalculated;
      
      console.log(`   📈 Deal Summary: ${dealUpdated} transactions updated, ${dealRecalculated} NC recalculated`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration Complete!');
    console.log('='.repeat(50));
    console.log(`Total Transactions Updated: ${totalUpdated}`);
    console.log(`Total NC Recalculated: ${totalRecalculated}`);

    // Step 4: Run validation check
    console.log('\n🔍 Running Validation Check...\n');
    
    const { data: validationData } = await supabase
      .from('transactions_clean')
      .select('deal_id, COUNT(*)', { count: 'exact' })
      .eq('transaction_type', 'primary')
      .is('pmsp', null)
      .is('isp', null)
      .is('sfr', null);

    console.log('Transactions still missing formula fields:', validationData?.length || 0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();