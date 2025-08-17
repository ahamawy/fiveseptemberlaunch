"""
Type definitions for the ARCHON/EQUITIE Fee Engine
"""

from enum import Enum
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime


class DealType(Enum):
    """Types of investment deals"""
    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"
    ADVISORY = "ADVISORY"
    COINVEST = "COINVEST"
    FUND = "FUND"
    PARTNERSHIP = "PARTNERSHIP"
    FACILITATED_DIRECT = "FACILITATED_DIRECT"
    SPECIAL_SITUATION = "SPECIAL_SITUATION"


class FeeBasis(Enum):
    """Basis for fee calculations"""
    GROSS = "GROSS"
    NET = "NET"
    NET_AFTER_PREMIUM = "NET_AFTER_PREMIUM"
    COMMITTED_CAPITAL = "COMMITTED_CAPITAL"
    DEPLOYED_CAPITAL = "DEPLOYED_CAPITAL"
    NAV = "NAV"
    PROFIT = "PROFIT"
    FIXED = "FIXED"


class FeeComponentType(Enum):
    """Standard fee component types matching Supabase enum"""
    STRUCTURING = "STRUCTURING"
    MANAGEMENT = "MANAGEMENT"
    PERFORMANCE = "PERFORMANCE"
    ADMIN = "ADMIN"
    PREMIUM = "PREMIUM"
    OTHER = "OTHER"
    # Partner components (excluded from investor analytics)
    PARTNER_MGMT = "PARTNER_MGMT"
    PARTNER_CARRY = "PARTNER_CARRY"


@dataclass
class FeeComponent:
    """Individual fee component configuration"""
    component: FeeComponentType
    rate: Decimal
    is_percent: bool
    basis: FeeBasis
    precedence: int
    fixed_amount: Optional[Decimal] = None
    notes: Optional[str] = None
    
    def __post_init__(self):
        """Ensure proper types"""
        if not isinstance(self.rate, Decimal):
            self.rate = Decimal(str(self.rate))
        if self.fixed_amount and not isinstance(self.fixed_amount, Decimal):
            self.fixed_amount = Decimal(str(self.fixed_amount))


@dataclass
class FeeSchedule:
    """Complete fee schedule for a deal"""
    deal_id: int
    components: List[FeeComponent]
    version: int = 1
    effective_at: Optional[datetime] = None
    
    def get_sorted_components(self) -> List[FeeComponent]:
        """Return components sorted by precedence"""
        return sorted(self.components, key=lambda x: x.precedence)


@dataclass
class DiscountInput:
    """Discount to be applied to a fee component"""
    component: str  # e.g., 'STRUCTURING_DISCOUNT'
    percent: Optional[Decimal] = None
    amount: Optional[Decimal] = None
    basis: Optional[FeeBasis] = None
    
    def __post_init__(self):
        """Ensure proper types"""
        if self.percent and not isinstance(self.percent, Decimal):
            self.percent = Decimal(str(self.percent))
        if self.amount and not isinstance(self.amount, Decimal):
            self.amount = Decimal(str(self.amount))


@dataclass
class CalculationState:
    """State during fee calculation"""
    gross_amount: Decimal
    net_amount: Decimal
    premium_amount: Decimal = Decimal('0')
    running_amount: Decimal = Decimal('0')
    applied_fees: List[Dict] = None
    
    def __post_init__(self):
        if self.applied_fees is None:
            self.applied_fees = []
        self.running_amount = self.gross_amount


@dataclass
class CalculationResult:
    """Result of fee calculation"""
    deal_id: int
    transaction_id: Optional[int]
    gross_capital: Decimal
    net_capital: Decimal
    premium_amount: Decimal
    transfer_pre_discount: Decimal
    total_discounts: Decimal
    transfer_post_discount: Decimal
    units: int
    unit_price: Decimal
    applied_fees: List[Dict]
    validation: Dict
    metadata: Dict
    audit_trail: List[str]


@dataclass
class DealConfiguration:
    """Configuration for a specific deal"""
    deal_id: int
    deal_name: str
    deal_type: DealType
    fee_schedule: FeeSchedule
    # Deal-specific parameters
    purchase_valuation: Optional[Decimal] = None
    sell_valuation: Optional[Decimal] = None
    hurdle_rate: Optional[Decimal] = None
    catch_up: bool = False
    high_water_mark: bool = False
    crystallization: Optional[str] = None  # QUARTERLY, ANNUAL, EXIT
    # Custom logic
    custom_rules: Optional[Dict] = None
    
    def get_complexity_score(self) -> int:
        """Calculate complexity score for this deal"""
        score = len(self.fee_schedule.components)
        if self.hurdle_rate:
            score += 2
        if self.catch_up:
            score += 1
        if self.high_water_mark:
            score += 1
        if self.custom_rules:
            score += len(self.custom_rules)
        return score


@dataclass
class ValidationError:
    """Validation error details"""
    field: str
    value: any
    error: str
    severity: str = "ERROR"  # ERROR, WARNING, INFO


@dataclass
class AuditEntry:
    """Audit trail entry"""
    timestamp: datetime
    action: str
    details: str
    component: Optional[str] = None
    amount: Optional[Decimal] = None