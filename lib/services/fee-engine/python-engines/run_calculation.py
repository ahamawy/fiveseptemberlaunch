
import sys
import json
from decimal import Decimal
import os

# Add the python-engines directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'engines'))

from engines.deal_28_groq_engine import GroqDealEngine

engine = GroqDealEngine()

# Parse input data
gross_capital = Decimal('125000')
unit_price = Decimal('1000')

result = engine.calculate_for_investor(
    investor_name="API User",
    gross_capital=gross_capital,
    unit_price=unit_price,
    structuring_discount_percent=Decimal('25'),
    management_discount_percent=Decimal('0'),
    admin_discount_percent=Decimal('50')
)

output = {
    'gross_capital': float(result.gross_capital),
    'net_capital': float(result.net_capital),
    'premium_amount': float(result.premium_amount),
    'transfer_pre_discount': float(result.transfer_pre_discount),
    'total_discounts': float(result.total_discounts),
    'transfer_post_discount': float(result.transfer_post_discount),
    'units': result.units,
    'metadata': result.metadata
}

print(json.dumps(output))
