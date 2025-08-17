"""
Base Calculation Engine for ARCHON/EQUITIE Fee Engine
Implements core fee calculation logic with precedence ordering and discount handling
"""

from typing import Dict, List, Optional, Tuple
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
import json
import logging

from .types import (
    DealConfiguration, FeeComponent, FeeSchedule, DiscountInput,
    CalculationState, CalculationResult, ValidationError, AuditEntry,
    FeeBasis, FeeComponentType
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseCalculationEngine:
    """
    Base class for all fee calculation engines
    Implements deterministic, order-dependent fee calculations
    """
    
    def __init__(self, deal_config: DealConfiguration):
        """Initialize engine with deal configuration"""
        self.deal_config = deal_config
        self.audit_trail: List[AuditEntry] = []
        self.validation_errors: List[ValidationError] = []
        
    def calculate(
        self,
        gross_capital: Decimal,
        unit_price: Decimal,
        discounts: Optional[List[DiscountInput]] = None,
        annual_fees: Optional[Dict[str, int]] = None,
        transaction_id: Optional[int] = None
    ) -> CalculationResult:
        """
        Main calculation method
        Returns complete calculation result with audit trail
        """
        # Initialize calculation state
        state = CalculationState(
            gross_amount=Decimal(str(gross_capital)),
            net_amount=Decimal(str(gross_capital))
        )
        
        self._add_audit("CALCULATION_START", 
                       f"Starting calculation for deal {self.deal_config.deal_id}")
        
        # Step 1: Apply fees in precedence order
        state = self._apply_fees_by_precedence(state)
        
        # Step 2: Apply annual fee multipliers if specified
        if annual_fees:
            state = self._apply_annual_multipliers(state, annual_fees)
        
        # Step 3: Apply discounts as negative amounts
        if discounts:
            state = self._apply_discounts(state, discounts)
        
        # Step 4: Calculate final amounts
        final_amounts = self._calculate_final_amounts(state, Decimal(str(unit_price)))
        
        # Step 5: Validate calculation
        validation = self._validate_calculation(state, final_amounts)
        
        # Step 6: Create result
        result = CalculationResult(
            deal_id=self.deal_config.deal_id,
            transaction_id=transaction_id,
            gross_capital=state.gross_amount,
            net_capital=state.net_amount,
            premium_amount=state.premium_amount,
            transfer_pre_discount=final_amounts['transfer_pre_discount'],
            total_discounts=final_amounts['total_discounts'],
            transfer_post_discount=final_amounts['transfer_post_discount'],
            units=final_amounts['units'],
            unit_price=Decimal(str(unit_price)),
            applied_fees=state.applied_fees,
            validation=validation,
            metadata=self._generate_metadata(),
            audit_trail=[f"{e.timestamp.isoformat()}: {e.action} - {e.details}" 
                        for e in self.audit_trail]
        )
        
        self._add_audit("CALCULATION_COMPLETE", 
                       f"Calculation complete. Transfer: {result.transfer_post_discount}")
        
        return result
    
    def _apply_fees_by_precedence(self, state: CalculationState) -> CalculationState:
        """Apply fees in precedence order"""
        sorted_components = self.deal_config.fee_schedule.get_sorted_components()
        
        for component in sorted_components:
            # Get base amount for this fee
            base_amount = self._get_base_amount(component.basis, state)
            
            # Calculate fee amount
            if component.is_percent:
                fee_amount = self._round_money(base_amount * component.rate)
            else:
                fee_amount = component.fixed_amount or component.rate
            
            # Special handling for PREMIUM
            if component.component == FeeComponentType.PREMIUM:
                state.premium_amount = fee_amount
                state.net_amount = state.gross_amount - state.premium_amount
                self._add_audit("PREMIUM_CALCULATED", 
                              f"Premium: {fee_amount} (Rate: {component.rate})")
            
            # Add to applied fees (positive amount)
            state.applied_fees.append({
                'component': component.component.value,
                'amount': float(fee_amount),
                'percent': float(component.rate) if component.is_percent else None,
                'basis': component.basis.value,
                'precedence': component.precedence,
                'notes': f"Applied at precedence {component.precedence}, basis: {component.basis.value}"
            })
            
            # Update running amount
            state.running_amount -= fee_amount
            
            self._add_audit(f"FEE_APPLIED_{component.component.value}", 
                          f"Applied {component.component.value}: {fee_amount}")
        
        return state
    
    def _get_base_amount(self, basis: FeeBasis, state: CalculationState) -> Decimal:
        """Get base amount based on basis type"""
        if basis == FeeBasis.GROSS:
            return state.gross_amount
        elif basis == FeeBasis.NET:
            return state.net_amount
        elif basis == FeeBasis.NET_AFTER_PREMIUM:
            return state.net_amount - state.premium_amount
        else:
            # Default to running amount
            return state.running_amount
    
    def _apply_annual_multipliers(
        self, 
        state: CalculationState, 
        annual_fees: Dict[str, int]
    ) -> CalculationState:
        """Apply annual fee multipliers"""
        for component_name, years in annual_fees.items():
            # Find the fee in applied fees
            for fee in state.applied_fees:
                if fee['component'] == component_name:
                    original_amount = Decimal(str(fee['amount']))
                    new_amount = self._round_money(original_amount * years)
                    fee['amount'] = float(new_amount)
                    fee['notes'] += f" | annual x {years} years"
                    
                    # Update running amount
                    state.running_amount -= (new_amount - original_amount)
                    
                    self._add_audit(f"ANNUAL_MULTIPLIER_{component_name}", 
                                  f"Applied {years} year multiplier to {component_name}")
                    break
        
        return state
    
    def _apply_discounts(
        self, 
        state: CalculationState, 
        discounts: List[DiscountInput]
    ) -> CalculationState:
        """Apply discounts as negative amounts"""
        for discount in discounts:
            # Extract base component name
            base_component = discount.component.replace('_DISCOUNT', '')
            
            # Find the base fee
            base_fee = None
            for fee in state.applied_fees:
                if fee['component'] == base_component:
                    base_fee = fee
                    break
            
            if not base_fee:
                logger.warning(f"Base fee not found for discount: {discount.component}")
                continue
            
            # Calculate discount amount
            base_amount = Decimal(str(base_fee['amount']))
            if discount.percent:
                discount_amount = self._round_money(base_amount * discount.percent)
            elif discount.amount:
                discount_amount = min(discount.amount, base_amount)
            else:
                continue
            
            # Add as NEGATIVE amount with proper notes
            state.applied_fees.append({
                'component': discount.component,
                'amount': -float(discount_amount),  # NEGATIVE
                'percent': float(discount.percent) if discount.percent else None,
                'basis': base_fee['basis'],
                'precedence': base_fee['precedence'] + 100,  # After base fee
                'notes': 'discount'  # As per backend spec
            })
            
            # Add back to running amount (discount reduces fees)
            state.running_amount += discount_amount
            
            self._add_audit(f"DISCOUNT_APPLIED_{discount.component}", 
                          f"Applied discount: -{discount_amount}")
        
        return state
    
    def _calculate_final_amounts(
        self, 
        state: CalculationState, 
        unit_price: Decimal
    ) -> Dict:
        """Calculate final transfer amounts and units"""
        # Sum positive fees
        transfer_pre_discount = Decimal('0')
        for fee in state.applied_fees:
            if fee['amount'] > 0:
                transfer_pre_discount += Decimal(str(fee['amount']))
        
        # Sum negative fees (discounts)
        total_discounts = Decimal('0')
        for fee in state.applied_fees:
            if fee['amount'] < 0:
                total_discounts += abs(Decimal(str(fee['amount'])))
        
        # Final transfer amount
        transfer_post_discount = transfer_pre_discount - total_discounts
        
        # Units calculation (always floor)
        units = int(state.net_amount / unit_price)
        
        return {
            'transfer_pre_discount': self._round_money(transfer_pre_discount),
            'total_discounts': self._round_money(total_discounts),
            'transfer_post_discount': self._round_money(transfer_post_discount),
            'units': units
        }
    
    def _validate_calculation(
        self, 
        state: CalculationState, 
        final_amounts: Dict
    ) -> Dict:
        """Validate calculation invariants"""
        errors = []
        warnings = []
        
        # Check NET calculation
        expected_net = state.gross_amount - state.premium_amount
        if abs(state.net_amount - expected_net) > Decimal('0.01'):
            errors.append(f"Net amount mismatch: {state.net_amount} != {expected_net}")
        
        # Check discounts are negative
        for fee in state.applied_fees:
            if '_DISCOUNT' in fee['component'] and fee['amount'] >= 0:
                errors.append(f"Discount must be negative: {fee['component']}")
        
        # Check transfer reconciliation
        calc_post = final_amounts['transfer_pre_discount'] - final_amounts['total_discounts']
        if abs(calc_post - final_amounts['transfer_post_discount']) > Decimal('0.01'):
            errors.append(f"Transfer reconciliation failed: {calc_post} != {final_amounts['transfer_post_discount']}")
        
        # Check units are integers
        if not isinstance(final_amounts['units'], int):
            errors.append(f"Units must be integers: {final_amounts['units']}")
        
        # Check premium is first
        if state.applied_fees and state.applied_fees[0]['component'] != 'PREMIUM':
            warnings.append(f"Premium should be first fee, found: {state.applied_fees[0]['component']}")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _generate_metadata(self) -> Dict:
        """Generate calculation metadata"""
        components = self.deal_config.fee_schedule.get_sorted_components()
        return {
            'engine_type': self.__class__.__name__,
            'deal_id': self.deal_config.deal_id,
            'deal_name': self.deal_config.deal_name,
            'deal_type': self.deal_config.deal_type.value,
            'complexity_score': self.deal_config.get_complexity_score(),
            'fee_components': len(components),
            'precedence_order': ' -> '.join([c.component.value for c in components]),
            'calculation_date': datetime.now().isoformat(),
            'engine_version': '1.0.0'
        }
    
    def _round_money(self, amount: Decimal) -> Decimal:
        """Round money to 2 decimal places"""
        return amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _add_audit(self, action: str, details: str, **kwargs):
        """Add entry to audit trail"""
        entry = AuditEntry(
            timestamp=datetime.now(),
            action=action,
            details=details,
            component=kwargs.get('component'),
            amount=kwargs.get('amount')
        )
        self.audit_trail.append(entry)
    
    def export_for_agents(self) -> Dict:
        """Export engine logic for AI agents"""
        return {
            'deal_id': self.deal_config.deal_id,
            'deal_name': self.deal_config.deal_name,
            'engine_type': self.__class__.__name__,
            'fee_schedule': [
                {
                    'component': c.component.value,
                    'rate': float(c.rate),
                    'basis': c.basis.value,
                    'precedence': c.precedence
                }
                for c in self.deal_config.fee_schedule.get_sorted_components()
            ],
            'calculation_steps': [
                "1. Load fee schedule ordered by precedence",
                "2. Calculate PREMIUM first (always precedence 1)",
                "3. Set NET = GROSS - PREMIUM",
                "4. Apply remaining fees in precedence order",
                "5. Apply discounts as negative amounts",
                "6. Calculate transfer amounts",
                "7. Calculate units as floor(NET / unit_price)",
                "8. Validate invariants"
            ],
            'invariants': [
                "PREMIUM must be first (precedence = 1)",
                "Discounts stored as negative amounts",
                "Transfer reconciliation must balance",
                "Units must be integers (no fractions)",
                "All amounts rounded to 2 decimal places"
            ]
        }