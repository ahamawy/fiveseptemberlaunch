"""
Groq AI Investment Deal Engine (Deal ID: 28)
ARCHON/EQUITIE Fee Engine - Custom Implementation

Deal Parameters:
- Pre-money Purchase Valuation: $5,300,000,000
- Pre-money Sell Valuation: $5,500,000,000
- Premium Rate: 3.77358% (calculated from valuation delta)
- Structuring Fee: 4% of Gross Capital
- Management Fee: 2% of Gross Capital (annual)
- Admin Fee: $450 fixed per investor
- Unit Price: $1,000
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List, Dict
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base.base_engine import BaseCalculationEngine
from base.types import (
    DealConfiguration, FeeSchedule, FeeComponent, FeeComponentType,
    FeeBasis, DealType, CalculationResult, DiscountInput, CalculationState
)


class GroqDealEngine(BaseCalculationEngine):
    """
    Custom calculation engine for Groq AI Investment (July 2025)
    Implements valuation-based premium with standard fee structure
    """
    
    # Deal-specific constants
    DEAL_ID = 28
    DEAL_NAME = "Groq AI Investment"
    PURCHASE_VALUATION = Decimal('5300000000')  # $5.3B
    SELL_VALUATION = Decimal('5500000000')      # $5.5B
    UNIT_PRICE = Decimal('1000')
    ADMIN_FEE_FIXED = Decimal('450')
    
    @classmethod
    def calculate_premium_rate(cls) -> Decimal:
        """
        Calculate premium rate from valuation delta
        Premium = (Sell - Purchase) / Purchase
        """
        rate = (cls.SELL_VALUATION - cls.PURCHASE_VALUATION) / cls.PURCHASE_VALUATION
        # Round to 6 decimal places for precision
        return rate.quantize(Decimal('0.000001'), rounding=ROUND_HALF_UP)
    
    @classmethod
    def create_deal_config(cls) -> DealConfiguration:
        """Create Groq deal configuration with all fee components"""
        premium_rate = cls.calculate_premium_rate()
        
        # Define fee components in precedence order
        components = [
            # Premium - always first (precedence 1)
            FeeComponent(
                component=FeeComponentType.PREMIUM,
                rate=premium_rate,
                is_percent=True,
                basis=FeeBasis.GROSS,
                precedence=1,
                notes=f"Valuation delta: ${cls.SELL_VALUATION - cls.PURCHASE_VALUATION:,.0f}"
            ),
            # Structuring Fee - 4% of Gross
            FeeComponent(
                component=FeeComponentType.STRUCTURING,
                rate=Decimal('0.04'),
                is_percent=True,
                basis=FeeBasis.GROSS,
                precedence=2,
                notes="Standard structuring fee"
            ),
            # Management Fee - 2% of Gross (can be annualized)
            FeeComponent(
                component=FeeComponentType.MANAGEMENT,
                rate=Decimal('0.02'),
                is_percent=True,
                basis=FeeBasis.GROSS,
                precedence=3,
                notes="Annual management fee"
            ),
            # Admin Fee - $450 fixed
            FeeComponent(
                component=FeeComponentType.ADMIN,
                rate=cls.ADMIN_FEE_FIXED,
                is_percent=False,
                basis=FeeBasis.FIXED,
                precedence=4,
                fixed_amount=cls.ADMIN_FEE_FIXED,
                notes="Fixed admin fee per investor"
            ),
        ]
        
        schedule = FeeSchedule(
            deal_id=cls.DEAL_ID,
            components=components,
            version=1,
            effective_at=datetime(2025, 7, 1)  # July 2025
        )
        
        return DealConfiguration(
            deal_id=cls.DEAL_ID,
            deal_name=cls.DEAL_NAME,
            deal_type=DealType.FACILITATED_DIRECT,
            fee_schedule=schedule,
            purchase_valuation=cls.PURCHASE_VALUATION,
            sell_valuation=cls.SELL_VALUATION
        )
    
    def __init__(self):
        """Initialize Groq engine with configuration"""
        super().__init__(self.create_deal_config())
        self.premium_rate = self.calculate_premium_rate()
        
        # Log configuration
        self._add_audit(
            "ENGINE_INIT",
            f"Groq Deal Engine initialized. Premium rate: {self.premium_rate:.4%}"
        )
    
    def calculate_for_investor(
        self,
        investor_name: str,
        gross_capital: Decimal,
        structuring_discount_percent: Decimal = Decimal('0'),
        management_discount_percent: Decimal = Decimal('0'),
        admin_discount_percent: Decimal = Decimal('0'),
        management_years: int = 1,
        unit_price: Optional[Decimal] = None
    ) -> CalculationResult:
        """
        Calculate fees for a specific investor in the Groq deal
        
        Args:
            investor_name: Name of the investor
            gross_capital: Gross investment amount
            structuring_discount_percent: Discount on structuring fee (0-100)
            management_discount_percent: Discount on management fee (0-100)
            admin_discount_percent: Discount on admin fee (0-100)
            management_years: Number of years for management fee (default 1)
            unit_price: Override unit price (default $1000)
        """
        if unit_price is None:
            unit_price = self.UNIT_PRICE
        
        # Build discount list
        discounts = []
        
        if structuring_discount_percent > 0:
            discounts.append(DiscountInput(
                component='STRUCTURING_DISCOUNT',
                percent=structuring_discount_percent / Decimal('100')
            ))
        
        if management_discount_percent > 0:
            discounts.append(DiscountInput(
                component='MANAGEMENT_DISCOUNT',
                percent=management_discount_percent / Decimal('100')
            ))
        
        if admin_discount_percent > 0:
            discounts.append(DiscountInput(
                component='ADMIN_DISCOUNT',
                percent=admin_discount_percent / Decimal('100')
            ))
        
        # Handle annual fees
        annual_fees = None
        if management_years > 1:
            annual_fees = {'MANAGEMENT': management_years}
        
        # Log investor calculation
        self._add_audit(
            "INVESTOR_CALC",
            f"Calculating for {investor_name}: ${gross_capital:,.2f}"
        )
        
        # Perform calculation
        result = self.calculate(
            gross_capital=gross_capital,
            unit_price=unit_price,
            discounts=discounts if discounts else None,
            annual_fees=annual_fees,
            transaction_id=None  # Will be set when persisted
        )
        
        # Add investor-specific metadata
        result.metadata['investor_name'] = investor_name
        result.metadata['premium_rate_percent'] = f"{float(self.premium_rate * 100):.4f}%"
        result.metadata['valuation_delta'] = float(self.SELL_VALUATION - self.PURCHASE_VALUATION)
        
        return result
    
    def calculate_batch(
        self,
        investors: List[Dict]
    ) -> List[CalculationResult]:
        """
        Calculate fees for multiple investors
        
        Args:
            investors: List of investor dictionaries with:
                - name: Investor name
                - gross_capital: Investment amount
                - structuring_discount: Optional discount percent
                - management_discount: Optional discount percent
                - admin_discount: Optional discount percent
        """
        results = []
        
        for investor in investors:
            result = self.calculate_for_investor(
                investor_name=investor['name'],
                gross_capital=Decimal(str(investor['gross_capital'])),
                structuring_discount_percent=Decimal(str(investor.get('structuring_discount', 0))),
                management_discount_percent=Decimal(str(investor.get('management_discount', 0))),
                admin_discount_percent=Decimal(str(investor.get('admin_discount', 0)))
            )
            results.append(result)
        
        return results
    
    def generate_summary_report(
        self,
        results: List[CalculationResult]
    ) -> Dict:
        """Generate summary report for batch calculations"""
        total_gross = sum(r.gross_capital for r in results)
        total_net = sum(r.net_capital for r in results)
        total_units = sum(r.units for r in results)
        total_transfer_pre = sum(r.transfer_pre_discount for r in results)
        total_discounts = sum(r.total_discounts for r in results)
        total_transfer_post = sum(r.transfer_post_discount for r in results)
        
        return {
            'deal_id': self.DEAL_ID,
            'deal_name': self.DEAL_NAME,
            'investor_count': len(results),
            'totals': {
                'gross_capital': float(total_gross),
                'net_capital': float(total_net),
                'units': total_units,
                'transfer_pre_discount': float(total_transfer_pre),
                'total_discounts': float(total_discounts),
                'transfer_post_discount': float(total_transfer_post)
            },
            'premium_rate': f"{float(self.premium_rate * 100):.4f}%",
            'valuation': {
                'purchase': float(self.PURCHASE_VALUATION),
                'sell': float(self.SELL_VALUATION),
                'delta': float(self.SELL_VALUATION - self.PURCHASE_VALUATION)
            }
        }


# Example usage and testing
if __name__ == "__main__":
    print("=" * 60)
    print("GROQ AI INVESTMENT - FEE CALCULATION ENGINE")
    print("=" * 60)
    
    engine = GroqDealEngine()
    
    print(f"\nDeal Configuration:")
    print(f"- Deal ID: {engine.DEAL_ID}")
    print(f"- Deal Name: {engine.DEAL_NAME}")
    print(f"- Purchase Valuation: ${engine.PURCHASE_VALUATION:,.0f}")
    print(f"- Sell Valuation: ${engine.SELL_VALUATION:,.0f}")
    print(f"- Premium Rate: {engine.premium_rate:.4%}")
    print(f"- Unit Price: ${engine.UNIT_PRICE:,.2f}")
    
    print("\n" + "-" * 60)
    print("TEST CALCULATIONS")
    print("-" * 60)
    
    # Test investors from the legacy documentation
    test_investors = [
        {
            'name': 'John Doe',
            'gross_capital': 100000,
            'structuring_discount': 50,
            'management_discount': 0,
            'admin_discount': 100
        },
        {
            'name': 'Jane Smith',
            'gross_capital': 75000,
            'structuring_discount': 0,
            'management_discount': 0,
            'admin_discount': 0
        },
        {
            'name': 'Bob Johnson',
            'gross_capital': 125000,
            'structuring_discount': 25,
            'management_discount': 25,
            'admin_discount': 50
        }
    ]
    
    results = []
    for investor in test_investors:
        print(f"\nCalculating for {investor['name']}:")
        print(f"  Gross Capital: ${investor['gross_capital']:,.2f}")
        
        result = engine.calculate_for_investor(
            investor_name=investor['name'],
            gross_capital=Decimal(str(investor['gross_capital'])),
            structuring_discount_percent=Decimal(str(investor.get('structuring_discount', 0))),
            management_discount_percent=Decimal(str(investor.get('management_discount', 0))),
            admin_discount_percent=Decimal(str(investor.get('admin_discount', 0)))
        )
        
        results.append(result)
        
        print(f"  Premium: ${result.premium_amount:,.2f}")
        print(f"  Net Capital: ${result.net_capital:,.2f}")
        print(f"  Transfer Pre-Discount: ${result.transfer_pre_discount:,.2f}")
        print(f"  Total Discounts: ${result.total_discounts:,.2f}")
        print(f"  Transfer Post-Discount: ${result.transfer_post_discount:,.2f}")
        print(f"  Units: {result.units}")
    
    # Generate summary
    print("\n" + "=" * 60)
    print("SUMMARY REPORT")
    print("=" * 60)
    
    summary = engine.generate_summary_report(results)
    
    print(f"\nTotal Investors: {summary['investor_count']}")
    print(f"Total Gross Capital: ${summary['totals']['gross_capital']:,.2f}")
    print(f"Total Net Capital: ${summary['totals']['net_capital']:,.2f}")
    print(f"Total Units: {summary['totals']['units']:,}")
    print(f"Total Transfer (Pre-Discount): ${summary['totals']['transfer_pre_discount']:,.2f}")
    print(f"Total Discounts: ${summary['totals']['total_discounts']:,.2f}")
    print(f"Total Transfer (Post-Discount): ${summary['totals']['transfer_post_discount']:,.2f}")
    
    print("\n" + "=" * 60)
    print("VALIDATION COMPLETE")
    print("=" * 60)