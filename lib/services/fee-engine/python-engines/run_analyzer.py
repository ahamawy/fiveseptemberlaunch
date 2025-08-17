
import sys
import os
import json
from decimal import Decimal

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from generators.complexity_analyzer import DealComplexityAnalyzer, ComplexityLevel
from base.types import DealConfiguration, DealType, FeeSchedule, FeeComponent, FeeComponentType, FeeBasis

deal_id = int(sys.argv[1])
deal_name = sys.argv[2]
deal_type_str = sys.argv[3]

# Create mock configuration for analysis
components = [
    FeeComponent(
        component=FeeComponentType.PREMIUM,
        rate=Decimal('0.0377358'),
        is_percent=True,
        basis=FeeBasis.GROSS,
        precedence=1
    ),
    FeeComponent(
        component=FeeComponentType.STRUCTURING,
        rate=Decimal('0.04'),
        is_percent=True,
        basis=FeeBasis.GROSS,
        precedence=2
    ),
    FeeComponent(
        component=FeeComponentType.MANAGEMENT,
        rate=Decimal('0.02'),
        is_percent=True,
        basis=FeeBasis.GROSS,
        precedence=3
    ),
    FeeComponent(
        component=FeeComponentType.ADMIN,
        rate=Decimal('450'),
        is_percent=False,
        basis=FeeBasis.FIXED,
        precedence=4,
        fixed_amount=Decimal('450')
    )
]

schedule = FeeSchedule(deal_id=deal_id, components=components)
config = DealConfiguration(
    deal_id=deal_id,
    deal_name=deal_name,
    deal_type=DealType[deal_type_str],
    fee_schedule=schedule
)

analyzer = DealComplexityAnalyzer()
analysis = analyzer.analyze(config)
print(json.dumps(analysis, default=str))
