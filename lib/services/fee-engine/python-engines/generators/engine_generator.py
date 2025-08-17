"""
Deal Engine Generator for ARCHON/EQUITIE Fee Engine
Generates custom Python calculation engines based on deal complexity
"""

import os
import json
from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path
import textwrap

from .complexity_analyzer import DealComplexityAnalyzer, ComplexityLevel
from ..base.types import DealConfiguration, DealType, FeeComponentType


class DealEngineGenerator:
    """
    Generates custom calculation engines for specific deals
    """
    
    def __init__(self, output_dir: str = "engines"):
        """Initialize generator with output directory"""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.analyzer = DealComplexityAnalyzer()
        
    def generate(self, deal_config: DealConfiguration) -> Dict:
        """
        Generate a custom engine for a specific deal
        Returns metadata about the generated engine
        """
        # Analyze deal complexity
        analysis = self.analyzer.analyze(deal_config)
        
        # Generate engine code
        engine_code = self._generate_engine_code(deal_config, analysis)
        
        # Generate test cases
        test_code = self._generate_test_code(deal_config, analysis)
        
        # Generate agent context
        agent_context = self._generate_agent_context(deal_config, analysis)
        
        # Save files
        engine_filename = f"deal_{deal_config.deal_id}_engine.py"
        test_filename = f"test_deal_{deal_config.deal_id}.py"
        context_filename = f"DEAL_{deal_config.deal_id}_CONTEXT.md"
        
        engine_path = self.output_dir / engine_filename
        test_path = self.output_dir / test_filename
        context_path = self.output_dir / context_filename
        
        # Write files
        with open(engine_path, 'w') as f:
            f.write(engine_code)
        
        with open(test_path, 'w') as f:
            f.write(test_code)
        
        with open(context_path, 'w') as f:
            f.write(agent_context)
        
        # Return metadata
        return {
            'deal_id': deal_config.deal_id,
            'deal_name': deal_config.deal_name,
            'engine_type': analysis['recommended_engine'],
            'complexity_level': analysis['complexity_level'],
            'files_generated': {
                'engine': str(engine_path),
                'tests': str(test_path),
                'context': str(context_path)
            },
            'analysis': analysis,
            'generation_date': datetime.now().isoformat()
        }
    
    def _generate_engine_code(self, deal_config: DealConfiguration, analysis: Dict) -> str:
        """Generate Python code for the calculation engine"""
        
        # Determine which template to use
        complexity = ComplexityLevel(analysis['complexity_level'])
        features = analysis['special_features']
        
        if complexity == ComplexityLevel.SIMPLE:
            return self._generate_simple_engine(deal_config, analysis)
        elif 'VALUATION_BASED_PREMIUM' in features:
            return self._generate_premium_engine(deal_config, analysis)
        elif 'PERFORMANCE_FEE' in features:
            return self._generate_performance_engine(deal_config, analysis)
        else:
            return self._generate_standard_engine(deal_config, analysis)
    
    def _generate_simple_engine(self, deal_config: DealConfiguration, analysis: Dict) -> str:
        """Generate code for a simple engine"""
        components_code = self._generate_components_code(deal_config)
        
        code = f'''"""
Auto-generated calculation engine for {deal_config.deal_name}
Deal ID: {deal_config.deal_id}
Generated: {datetime.now().isoformat()}
Complexity: {analysis['complexity_level']}
"""

from decimal import Decimal
from typing import Optional, List, Dict
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base.base_engine import BaseCalculationEngine
from base.types import (
    DealConfiguration, FeeSchedule, FeeComponent, FeeComponentType,
    FeeBasis, DealType, CalculationResult, DiscountInput
)


class Deal{deal_config.deal_id}Engine(BaseCalculationEngine):
    """
    Custom calculation engine for {deal_config.deal_name}
    """
    
    @classmethod
    def create_deal_config(cls) -> DealConfiguration:
        """Create deal configuration"""
        # Fee components
        components = [
{components_code}
        ]
        
        schedule = FeeSchedule(
            deal_id={deal_config.deal_id},
            components=components,
            version=1
        )
        
        return DealConfiguration(
            deal_id={deal_config.deal_id},
            deal_name="{deal_config.deal_name}",
            deal_type=DealType.{deal_config.deal_type.value},
            fee_schedule=schedule
        )
    
    def __init__(self):
        """Initialize with deal configuration"""
        super().__init__(self.create_deal_config())
    
    def calculate_for_investor(
        self,
        investor_name: str,
        gross_capital: Decimal,
        unit_price: Decimal = Decimal('1000'),
        discounts: Optional[List[DiscountInput]] = None
    ) -> CalculationResult:
        """
        Calculate fees for a specific investor
        """
        self._add_audit("INVESTOR", f"Calculating for {{investor_name}}")
        
        # Use base calculation
        result = self.calculate(
            gross_capital=gross_capital,
            unit_price=unit_price,
            discounts=discounts
        )
        
        # Add investor-specific metadata
        result.metadata['investor_name'] = investor_name
        
        return result


# Example usage
if __name__ == "__main__":
    engine = Deal{deal_config.deal_id}Engine()
    
    # Example calculation
    result = engine.calculate_for_investor(
        investor_name="Test Investor",
        gross_capital=Decimal('100000'),
        unit_price=Decimal('1000')
    )
    
    print(f"Gross Capital: ${{result.gross_capital:,.2f}}")
    print(f"Net Capital: ${{result.net_capital:,.2f}}")
    print(f"Transfer Amount: ${{result.transfer_post_discount:,.2f}}")
    print(f"Units: {{result.units}}")
'''
        return code
    
    def _generate_premium_engine(self, deal_config: DealConfiguration, analysis: Dict) -> str:
        """Generate engine with valuation-based premium calculation"""
        components_code = self._generate_components_code(deal_config)
        
        # Extract valuation values if available
        purchase_val = deal_config.purchase_valuation or Decimal('5300000000')
        sell_val = deal_config.sell_valuation or Decimal('5500000000')
        
        code = f'''"""
Auto-generated calculation engine for {deal_config.deal_name}
Deal ID: {deal_config.deal_id}
Generated: {datetime.now().isoformat()}
Complexity: {analysis['complexity_level']}
Special Features: Valuation-based Premium Calculation
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List, Dict
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base.base_engine import BaseCalculationEngine
from base.types import (
    DealConfiguration, FeeSchedule, FeeComponent, FeeComponentType,
    FeeBasis, DealType, CalculationResult, DiscountInput, CalculationState
)


class Deal{deal_config.deal_id}Engine(BaseCalculationEngine):
    """
    Custom calculation engine for {deal_config.deal_name}
    Includes valuation-based premium calculation
    """
    
    # Deal-specific valuations
    PURCHASE_VALUATION = Decimal('{purchase_val}')
    SELL_VALUATION = Decimal('{sell_val}')
    
    @classmethod
    def calculate_premium_rate(cls) -> Decimal:
        """Calculate premium rate from valuations"""
        rate = (cls.SELL_VALUATION - cls.PURCHASE_VALUATION) / cls.PURCHASE_VALUATION
        return rate.quantize(Decimal('0.000001'), rounding=ROUND_HALF_UP)
    
    @classmethod
    def create_deal_config(cls) -> DealConfiguration:
        """Create deal configuration with dynamic premium"""
        premium_rate = cls.calculate_premium_rate()
        
        # Fee components
        components = [
            FeeComponent(
                component=FeeComponentType.PREMIUM,
                rate=premium_rate,
                is_percent=True,
                basis=FeeBasis.GROSS,
                precedence=1,
                notes=f"Valuation delta: ${{cls.SELL_VALUATION - cls.PURCHASE_VALUATION:,.0f}}"
            ),
{components_code}
        ]
        
        schedule = FeeSchedule(
            deal_id={deal_config.deal_id},
            components=components,
            version=1
        )
        
        return DealConfiguration(
            deal_id={deal_config.deal_id},
            deal_name="{deal_config.deal_name}",
            deal_type=DealType.{deal_config.deal_type.value},
            fee_schedule=schedule,
            purchase_valuation=cls.PURCHASE_VALUATION,
            sell_valuation=cls.SELL_VALUATION
        )
    
    def __init__(self):
        """Initialize with deal configuration"""
        super().__init__(self.create_deal_config())
        self.premium_rate = self.calculate_premium_rate()
    
    def _apply_fees_by_precedence(self, state: CalculationState) -> CalculationState:
        """Override to add premium calculation details"""
        self._add_audit(
            "PREMIUM_CALCULATION",
            f"Premium rate: {{self.premium_rate:.4%}} "
            f"(Sell: ${{self.SELL_VALUATION:,.0f}}, "
            f"Purchase: ${{self.PURCHASE_VALUATION:,.0f}})"
        )
        
        # Use base implementation
        return super()._apply_fees_by_precedence(state)
    
    def calculate_for_investor(
        self,
        investor_name: str,
        gross_capital: Decimal,
        unit_price: Decimal = Decimal('1000'),
        structuring_discount: Decimal = Decimal('0'),
        management_discount: Decimal = Decimal('0'),
        admin_discount: Decimal = Decimal('0')
    ) -> CalculationResult:
        """
        Calculate fees for a specific investor with standard discounts
        """
        # Build discount list
        discounts = []
        
        if structuring_discount > 0:
            discounts.append(DiscountInput(
                component='STRUCTURING_DISCOUNT',
                percent=structuring_discount / Decimal('100')
            ))
        
        if management_discount > 0:
            discounts.append(DiscountInput(
                component='MANAGEMENT_DISCOUNT',
                percent=management_discount / Decimal('100')
            ))
        
        if admin_discount > 0:
            discounts.append(DiscountInput(
                component='ADMIN_DISCOUNT',
                percent=admin_discount / Decimal('100')
            ))
        
        self._add_audit("INVESTOR", f"Calculating for {{investor_name}}")
        
        # Use base calculation
        result = self.calculate(
            gross_capital=gross_capital,
            unit_price=unit_price,
            discounts=discounts if discounts else None
        )
        
        # Add investor-specific metadata
        result.metadata['investor_name'] = investor_name
        result.metadata['premium_rate'] = float(self.premium_rate)
        
        return result


# Example usage
if __name__ == "__main__":
    engine = Deal{deal_config.deal_id}Engine()
    
    print(f"Deal: {{engine.deal_config.deal_name}}")
    print(f"Premium Rate: {{engine.premium_rate:.4%}}")
    print("-" * 50)
    
    # Example calculation
    result = engine.calculate_for_investor(
        investor_name="John Doe",
        gross_capital=Decimal('100000'),
        unit_price=Decimal('1000'),
        structuring_discount=Decimal('50'),  # 50% discount
        management_discount=Decimal('0'),
        admin_discount=Decimal('100')  # 100% discount
    )
    
    print(f"Gross Capital: ${{result.gross_capital:,.2f}}")
    print(f"Premium: ${{result.premium_amount:,.2f}}")
    print(f"Net Capital: ${{result.net_capital:,.2f}}")
    print(f"Transfer Pre-Discount: ${{result.transfer_pre_discount:,.2f}}")
    print(f"Total Discounts: ${{result.total_discounts:,.2f}}")
    print(f"Transfer Post-Discount: ${{result.transfer_post_discount:,.2f}}")
    print(f"Units: {{result.units}}")
'''
        return code
    
    def _generate_performance_engine(self, deal_config: DealConfiguration, analysis: Dict) -> str:
        """Generate engine with performance fee calculation"""
        # This would include hurdle rates, catch-up, etc.
        # For now, using standard template
        return self._generate_standard_engine(deal_config, analysis)
    
    def _generate_standard_engine(self, deal_config: DealConfiguration, analysis: Dict) -> str:
        """Generate standard engine code"""
        components_code = self._generate_components_code(deal_config)
        
        code = f'''"""
Auto-generated calculation engine for {deal_config.deal_name}
Deal ID: {deal_config.deal_id}
Generated: {datetime.now().isoformat()}
Complexity: {analysis['complexity_level']}
"""

from decimal import Decimal
from typing import Optional, List, Dict
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base.base_engine import BaseCalculationEngine
from base.types import (
    DealConfiguration, FeeSchedule, FeeComponent, FeeComponentType,
    FeeBasis, DealType, CalculationResult, DiscountInput
)


class Deal{deal_config.deal_id}Engine(BaseCalculationEngine):
    """
    Custom calculation engine for {deal_config.deal_name}
    """
    
    @classmethod
    def create_deal_config(cls) -> DealConfiguration:
        """Create deal configuration"""
        components = [
{components_code}
        ]
        
        schedule = FeeSchedule(
            deal_id={deal_config.deal_id},
            components=components,
            version=1
        )
        
        return DealConfiguration(
            deal_id={deal_config.deal_id},
            deal_name="{deal_config.deal_name}",
            deal_type=DealType.{deal_config.deal_type.value},
            fee_schedule=schedule
        )
    
    def __init__(self):
        """Initialize with deal configuration"""
        super().__init__(self.create_deal_config())


# Example usage
if __name__ == "__main__":
    engine = Deal{deal_config.deal_id}Engine()
    
    result = engine.calculate(
        gross_capital=Decimal('100000'),
        unit_price=Decimal('1000')
    )
    
    print(f"Transfer Amount: ${{result.transfer_post_discount:,.2f}}")
    print(f"Units: {{result.units}}")
'''
        return code
    
    def _generate_components_code(self, deal_config: DealConfiguration) -> str:
        """Generate fee components code"""
        lines = []
        for comp in deal_config.fee_schedule.get_sorted_components():
            if comp.component == FeeComponentType.PREMIUM:
                continue  # Premium handled separately if valuation-based
            
            lines.append(f'''            FeeComponent(
                component=FeeComponentType.{comp.component.value},
                rate=Decimal('{comp.rate}'),
                is_percent={comp.is_percent},
                basis=FeeBasis.{comp.basis.value},
                precedence={comp.precedence}
            ),''')
        
        return '\n'.join(lines)
    
    def _generate_test_code(self, deal_config: DealConfiguration, analysis: Dict) -> str:
        """Generate test code for the engine"""
        code = f'''"""
Test cases for Deal {deal_config.deal_id} Engine
Generated: {datetime.now().isoformat()}
"""

import unittest
from decimal import Decimal
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from deal_{deal_config.deal_id}_engine import Deal{deal_config.deal_id}Engine
from base.types import DiscountInput


class TestDeal{deal_config.deal_id}Engine(unittest.TestCase):
    """Test cases for {deal_config.deal_name} engine"""
    
    def setUp(self):
        """Set up test engine"""
        self.engine = Deal{deal_config.deal_id}Engine()
    
    def test_basic_calculation(self):
        """Test basic fee calculation without discounts"""
        result = self.engine.calculate(
            gross_capital=Decimal('100000'),
            unit_price=Decimal('1000')
        )
        
        # Validate result structure
        self.assertIsNotNone(result)
        self.assertEqual(result.deal_id, {deal_config.deal_id})
        self.assertGreater(result.transfer_post_discount, 0)
        self.assertGreaterEqual(result.units, 0)
        
        # Validate invariants
        self.assertTrue(result.validation['valid'])
        self.assertEqual(len(result.validation['errors']), 0)
    
    def test_with_discounts(self):
        """Test calculation with discounts"""
        discounts = [
            DiscountInput(
                component='STRUCTURING_DISCOUNT',
                percent=Decimal('0.5')  # 50% discount
            )
        ]
        
        result = self.engine.calculate(
            gross_capital=Decimal('100000'),
            unit_price=Decimal('1000'),
            discounts=discounts
        )
        
        # Validate discounts applied
        discount_fees = [f for f in result.applied_fees if f['amount'] < 0]
        self.assertGreater(len(discount_fees), 0)
        
        # Validate total
        self.assertLess(result.transfer_post_discount, result.transfer_pre_discount)
    
    def test_invariants(self):
        """Test that all invariants hold"""
        result = self.engine.calculate(
            gross_capital=Decimal('1000000'),
            unit_price=Decimal('1000')
        )
        
        # Check NET calculation
        expected_net = result.gross_capital - result.premium_amount
        self.assertAlmostEqual(
            float(result.net_capital), 
            float(expected_net), 
            places=2
        )
        
        # Check transfer reconciliation
        calc_post = result.transfer_pre_discount - result.total_discounts
        self.assertAlmostEqual(
            float(result.transfer_post_discount),
            float(calc_post),
            places=2
        )
        
        # Check units are integers
        self.assertIsInstance(result.units, int)
    
    def test_edge_cases(self):
        """Test edge cases"""
        # Small amount
        result = self.engine.calculate(
            gross_capital=Decimal('100'),
            unit_price=Decimal('1000')
        )
        self.assertEqual(result.units, 0)  # Too small for any units
        
        # Large amount
        result = self.engine.calculate(
            gross_capital=Decimal('10000000'),
            unit_price=Decimal('1000')
        )
        self.assertGreater(result.units, 0)


if __name__ == '__main__':
    unittest.main()
'''
        return code
    
    def _generate_agent_context(self, deal_config: DealConfiguration, analysis: Dict) -> str:
        """Generate context document for AI agents"""
        
        # Format fee schedule
        fee_schedule = []
        for comp in deal_config.fee_schedule.get_sorted_components():
            fee_schedule.append(
                f"- **{comp.component.value}**: {float(comp.rate):.2%} on {comp.basis.value} "
                f"(Precedence: {comp.precedence})"
            )
        
        context = f'''# Deal {deal_config.deal_id} - {deal_config.deal_name} 
## Calculation Engine Context

### Overview
- **Deal ID**: {deal_config.deal_id}
- **Deal Name**: {deal_config.deal_name}
- **Deal Type**: {deal_config.deal_type.value}
- **Complexity Level**: {analysis['complexity_level']}
- **Engine Type**: {analysis['recommended_engine']}

### Fee Schedule
{chr(10).join(fee_schedule)}

### Special Features
{chr(10).join(f"- {feature}" for feature in analysis['special_features'])}

### Calculation Flow
{chr(10).join(f"{i+1}. {step}" for i, step in enumerate(analysis['analysis_details']['calculation_flow']))}

### Key Invariants
1. **Precedence Order**: Fees MUST be applied in precedence order (lower number = earlier)
2. **Premium First**: PREMIUM fee always has precedence = 1
3. **Discounts Negative**: Discounts stored as negative amounts in fee_application
4. **Transfer Reconciliation**: transfer_pre_discount - discounts = transfer_post_discount
5. **Integer Units**: Units = floor(net_capital / unit_price), no fractions

### Data Requirements
{chr(10).join(f"- `{req}`" for req in analysis['analysis_details']['data_requirements'])}

### Example Calculation
```python
from decimal import Decimal
from deal_{deal_config.deal_id}_engine import Deal{deal_config.deal_id}Engine

engine = Deal{deal_config.deal_id}Engine()

result = engine.calculate(
    gross_capital=Decimal('100000'),
    unit_price=Decimal('1000'),
    discounts=[
        {{'component': 'STRUCTURING_DISCOUNT', 'percent': Decimal('0.5')}}
    ]
)

print(f"Transfer: ${{result.transfer_post_discount:,.2f}}")
print(f"Units: {{result.units}}")
```

### Zero-Shot Prompts
- "Calculate fees for deal {deal_config.deal_id} with $1M investment"
- "Apply 50% structuring discount to deal {deal_config.deal_id}"
- "Show fee breakdown for {deal_config.deal_name}"
- "Validate fee calculation for transaction in deal {deal_config.deal_id}"

### Optimization Hints
{chr(10).join(f"- {hint}" for hint in analysis['optimization_hints'])}

### Generated Files
- **Engine**: `deal_{deal_config.deal_id}_engine.py`
- **Tests**: `test_deal_{deal_config.deal_id}.py`
- **Context**: `DEAL_{deal_config.deal_id}_CONTEXT.md`

### Notes
This engine was auto-generated based on the deal configuration and complexity analysis.
The calculation logic follows the ARCHON/EQUITIE Fee Engine standards with deterministic,
order-dependent fee applications.
'''
        return context