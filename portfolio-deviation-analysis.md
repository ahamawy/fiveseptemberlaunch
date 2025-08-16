# Portfolio Deviation Analysis

## Summary of Deviations

### 1. **Missing Deals in Database**
The following deals from your expected list are NOT in investor_units for investor 1:
- **Impossible Foods** (Food Technology, May 20) - Expected $1,640 net capital
- **Dastgyr** (E-commerce, Nov 21) - Expected $1,120 net capital  
- **EGY Vehicle** (Multiple, Nov 21) - Expected $190 net capital
- **Jiye Tech** (AgriTech, Jan 22) - Expected $100 net capital
- **Autone AI** (AI, Dec 24) - Expected $10 net capital
- **Groq** (AI, Jul 25) - Expected $1,600 net capital
- **EWT 1** (Feb 22) - Expected $650 net capital
- **EWT 2** (Aug 25) - Expected $700 net capital

### 2. **Name Mismatches**
Deals exist but with different names:
- Expected: "SpaceX" → Actual: "SpaceX Partnership"
- Expected: "Reddit" → Actual: "Reddit Partnership"
- Expected: "OpenAI" → Actual: "OpenAI Partnership"
- Expected: "Figure AI" → Actual: "Figure AI Series B" & "Figure AI Series C"
- Expected: "Sampdoria FC" → Actual: "Sampdoria SPV"
- Expected: "Patro Eisden" → Actual: "Patro Eisden SPV"
- Expected: "Scout AI" → Actual: "Scout AI Partnership"

### 3. **Net Capital Discrepancies**

| Deal | Expected Net Capital | Actual Net Capital | Difference |
|------|---------------------|-------------------|------------|
| Marlo | $55K | $1 | -$54,999 |
| SpaceX | $840K | $89,250 | -$750,750 |
| Reddit | $1,000K | $69,000 | -$931,000 |
| OpenAI | $870K | $131,000 | -$739,000 |
| Figure AI Series B | $2,500K | $52,500 | -$2,447,500 |
| Figure AI Series C | $4,198K | $238,500 | -$3,959,500 |
| Sampdoria | $546K | $425,000 | -$121,000 |
| Dagenham & Redbridge | $625K | $500,000 | -$125,000 |
| Scout AI | $400K | $217,350 | -$182,650 |
| Patro Eisden | $832K | $400,000 | -$432,000 |
| New Heights | $1,550K | $52,500 | -$1,497,500 |

### 4. **MOIC Calculation Issues**

The MOIC in the database is calculated as `current_unit_price / unit_price_at_purchase`, which gives different results than expected:

| Deal | Expected MOIC | Actual MOIC | Issue |
|------|--------------|-------------|-------|
| Marlo | 5.0x | 125.0x | Unit price calculation off |
| SpaceX | 5.3x | 1.00x | No price appreciation recorded |
| Reddit | 1.1x | 1.07x | Close but slightly off |
| OpenAI | 10.3x | 0.46x | Price went down instead of up |
| Figure AI | 15.0x | 1.09x | Minimal appreciation recorded |
| New Heights | 1.5x | 1.00x | No appreciation recorded |

### 5. **Date Discrepancies**

Several deals have different dates:
- Marlo: Expected Sep 2019, Actual July 2025
- OpenAI: Expected Feb 2023, Actual July 2025
- Figure AI Series C: Expected Feb 2025, Actual March 2025

## Root Causes

1. **Data Source Mismatch**: The investor_units table appears to have different or incomplete data compared to your expected portfolio
2. **Multiple Investors**: The deals have multiple investors, and investor 1's portion is much smaller than the total deal size
3. **Unit Price vs Valuation**: The database tracks unit prices, not company valuations directly
4. **Missing Historical Data**: Some older deals may not have been migrated to investor_units table

## Recommendations

1. **Data Verification**: 
   - Check if there's a separate historical transactions table
   - Verify if investor 1 is the correct investor ID for this portfolio
   - Check if some deals are recorded under different investor IDs

2. **MOIC Calculation**:
   - The MOIC should potentially be calculated using company valuations rather than unit prices
   - Consider using `current_valuation / entry_valuation` instead of unit price ratios

3. **Missing Deals**:
   - Import the missing deals into investor_units table
   - Ensure all historical transactions are properly recorded

4. **Net Capital Reconciliation**:
   - The actual invested amounts are significantly lower than expected
   - This could indicate partial ownership or different fee structures

## Total Portfolio Comparison

| Metric | Expected | Actual | Difference |
|--------|----------|--------|------------|
| Total Net Capital | $23,859K | $2,249K | -$21,610K |
| Total AUM | $90,947K | $2,249K | -$88,698K |
| Number of Deals | 21 | 11 | -10 |

The actual portfolio in the database is approximately 10% of the expected size, with only about half the deals present.