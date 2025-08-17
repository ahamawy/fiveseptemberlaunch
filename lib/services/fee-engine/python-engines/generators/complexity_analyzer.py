"""
Deal Complexity Analyzer for ARCHON/EQUITIE Fee Engine
Analyzes deal configuration to determine complexity and select appropriate engine
"""

from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from enum import Enum
import json

from base.types import (
    DealConfiguration, DealType, FeeComponentType, FeeBasis
)


class ComplexityLevel(Enum):
    """Deal complexity levels"""
    SIMPLE = "SIMPLE"           # Basic fees, no special logic
    STANDARD = "STANDARD"       # Standard fees with discounts
    COMPLEX = "COMPLEX"         # Multi-tier, waterfalls
    ADVANCED = "ADVANCED"       # Hurdles, catch-up, carry
    CUSTOM = "CUSTOM"          # Requires custom engine


class DealComplexityAnalyzer:
    """
    Analyzes deal complexity and recommends appropriate calculation engine
    """
    
    def __init__(self):
        """Initialize analyzer with complexity rules"""
        self.complexity_factors = {
            'fee_components': {
                'weight': 1,
                'thresholds': [(3, 0), (5, 1), (7, 2), (10, 3)]
            },
            'has_premium_calculation': {
                'weight': 2,
                'value': 1
            },
            'has_performance_fee': {
                'weight': 3,
                'value': 2
            },
            'has_hurdle_rate': {
                'weight': 4,
                'value': 3
            },
            'has_catch_up': {
                'weight': 2,
                'value': 2
            },
            'has_high_water_mark': {
                'weight': 2,
                'value': 2
            },
            'has_multi_tier': {
                'weight': 3,
                'value': 3
            },
            'has_waterfall': {
                'weight': 4,
                'value': 3
            },
            'has_partner_splits': {
                'weight': 2,
                'value': 1
            },
            'has_custom_rules': {
                'weight': 5,
                'value': 4
            }
        }
    
    def analyze(self, deal_config: DealConfiguration) -> Dict:
        """
        Analyze deal complexity and return analysis result
        """
        # Calculate complexity score
        score = self._calculate_complexity_score(deal_config)
        
        # Determine complexity level
        level = self._determine_complexity_level(score)
        
        # Identify special features
        features = self._identify_special_features(deal_config)
        
        # Recommend engine type
        engine_type = self._recommend_engine_type(level, features, deal_config.deal_type)
        
        # Generate analysis report
        return {
            'deal_id': deal_config.deal_id,
            'deal_name': deal_config.deal_name,
            'deal_type': deal_config.deal_type.value,
            'complexity_score': score,
            'complexity_level': level.value,
            'special_features': features,
            'recommended_engine': engine_type,
            'analysis_details': self._generate_analysis_details(deal_config, features),
            'optimization_hints': self._generate_optimization_hints(deal_config, features)
        }
    
    def _calculate_complexity_score(self, deal_config: DealConfiguration) -> int:
        """Calculate numerical complexity score"""
        score = 0
        
        # Score based on number of fee components
        num_components = len(deal_config.fee_schedule.components)
        for threshold, points in self.complexity_factors['fee_components']['thresholds']:
            if num_components >= threshold:
                score = points
        
        # Check for premium calculation
        if deal_config.purchase_valuation and deal_config.sell_valuation:
            score += self.complexity_factors['has_premium_calculation']['value']
        
        # Check for performance fee
        has_performance = any(
            c.component == FeeComponentType.PERFORMANCE 
            for c in deal_config.fee_schedule.components
        )
        if has_performance:
            score += self.complexity_factors['has_performance_fee']['value']
        
        # Check for hurdle rate
        if deal_config.hurdle_rate:
            score += self.complexity_factors['has_hurdle_rate']['value']
        
        # Check for catch-up
        if deal_config.catch_up:
            score += self.complexity_factors['has_catch_up']['value']
        
        # Check for high water mark
        if deal_config.high_water_mark:
            score += self.complexity_factors['has_high_water_mark']['value']
        
        # Check for partner components
        has_partner = any(
            c.component in [FeeComponentType.PARTNER_MGMT, FeeComponentType.PARTNER_CARRY]
            for c in deal_config.fee_schedule.components
        )
        if has_partner:
            score += self.complexity_factors['has_partner_splits']['value']
        
        # Check for custom rules
        if deal_config.custom_rules:
            score += self.complexity_factors['has_custom_rules']['value']
        
        return score
    
    def _determine_complexity_level(self, score: int) -> ComplexityLevel:
        """Determine complexity level from score"""
        if score <= 2:
            return ComplexityLevel.SIMPLE
        elif score <= 5:
            return ComplexityLevel.STANDARD
        elif score <= 8:
            return ComplexityLevel.COMPLEX
        elif score <= 12:
            return ComplexityLevel.ADVANCED
        else:
            return ComplexityLevel.CUSTOM
    
    def _identify_special_features(self, deal_config: DealConfiguration) -> List[str]:
        """Identify special features in the deal"""
        features = []
        
        # Check fee components
        components = [c.component for c in deal_config.fee_schedule.components]
        
        if FeeComponentType.PREMIUM in components:
            features.append("PREMIUM_CALCULATION")
        
        if FeeComponentType.PERFORMANCE in components:
            features.append("PERFORMANCE_FEE")
        
        if FeeComponentType.PARTNER_MGMT in components or FeeComponentType.PARTNER_CARRY in components:
            features.append("PARTNER_SPLITS")
        
        # Check for multiple basis types
        basis_types = set(c.basis for c in deal_config.fee_schedule.components)
        if len(basis_types) > 2:
            features.append("MULTI_BASIS")
        
        # Check for hurdle and related features
        if deal_config.hurdle_rate:
            features.append("HURDLE_RATE")
        
        if deal_config.catch_up:
            features.append("CATCH_UP")
        
        if deal_config.high_water_mark:
            features.append("HIGH_WATER_MARK")
        
        # Check for crystallization
        if deal_config.crystallization:
            features.append(f"CRYSTALLIZATION_{deal_config.crystallization}")
        
        # Check for valuation-based premium
        if deal_config.purchase_valuation and deal_config.sell_valuation:
            features.append("VALUATION_BASED_PREMIUM")
        
        # Check for fixed fees
        has_fixed = any(
            not c.is_percent for c in deal_config.fee_schedule.components
        )
        if has_fixed:
            features.append("FIXED_FEES")
        
        # Check for annual fees
        management_fee = next(
            (c for c in deal_config.fee_schedule.components 
             if c.component == FeeComponentType.MANAGEMENT), 
            None
        )
        if management_fee:
            features.append("ANNUAL_MANAGEMENT")
        
        return features
    
    def _recommend_engine_type(
        self, 
        level: ComplexityLevel, 
        features: List[str], 
        deal_type: DealType
    ) -> str:
        """Recommend specific engine type based on analysis"""
        
        # Custom engines for specific deal types
        if deal_type == DealType.FUND:
            return "FundOfFundsEngine"
        elif deal_type == DealType.SECONDARY and "WATERFALL" in features:
            return "SecondaryWaterfallEngine"
        elif deal_type == DealType.ADVISORY:
            return "AdvisoryEngine"
        
        # Based on complexity level
        if level == ComplexityLevel.SIMPLE:
            return "SimpleEngine"
        elif level == ComplexityLevel.STANDARD:
            return "StandardEngine"
        elif level == ComplexityLevel.COMPLEX:
            if "PERFORMANCE_FEE" in features:
                return "PerformanceEngine"
            else:
                return "ComplexEngine"
        elif level == ComplexityLevel.ADVANCED:
            if "HURDLE_RATE" in features:
                return "WaterfallEngine"
            else:
                return "AdvancedEngine"
        else:
            return "CustomEngine"
    
    def _generate_analysis_details(
        self, 
        deal_config: DealConfiguration, 
        features: List[str]
    ) -> Dict:
        """Generate detailed analysis"""
        components = deal_config.fee_schedule.components
        
        return {
            'fee_structure': {
                'total_components': len(components),
                'components': [
                    {
                        'name': c.component.value,
                        'rate': float(c.rate),
                        'basis': c.basis.value,
                        'precedence': c.precedence,
                        'is_percent': c.is_percent
                    }
                    for c in sorted(components, key=lambda x: x.precedence)
                ]
            },
            'calculation_flow': self._determine_calculation_flow(deal_config, features),
            'special_logic': {
                'has_premium': 'PREMIUM_CALCULATION' in features,
                'has_performance': 'PERFORMANCE_FEE' in features,
                'has_waterfall': 'HURDLE_RATE' in features,
                'has_partner_splits': 'PARTNER_SPLITS' in features
            },
            'data_requirements': self._determine_data_requirements(features)
        }
    
    def _determine_calculation_flow(
        self, 
        deal_config: DealConfiguration, 
        features: List[str]
    ) -> List[str]:
        """Determine the calculation flow steps"""
        flow = []
        
        # Always start with gross capital
        flow.append("Receive gross capital input")
        
        # Premium calculation if applicable
        if 'PREMIUM_CALCULATION' in features:
            flow.append("Calculate premium based on valuation delta")
            flow.append("Compute net capital (gross - premium)")
        
        # Standard fees
        flow.append("Apply fees in precedence order")
        
        # Performance fees if applicable
        if 'PERFORMANCE_FEE' in features:
            if 'HURDLE_RATE' in features:
                flow.append("Check if hurdle rate is met")
            flow.append("Calculate performance fee on profits")
            if 'CATCH_UP' in features:
                flow.append("Apply catch-up provision")
        
        # Discounts
        flow.append("Apply discounts as negative amounts")
        
        # Partner splits if applicable
        if 'PARTNER_SPLITS' in features:
            flow.append("Calculate partner fee splits")
            flow.append("Exclude partner fees from investor transfer")
        
        # Final calculations
        flow.append("Calculate final transfer amount")
        flow.append("Calculate units (floor of net/price)")
        flow.append("Validate invariants")
        
        return flow
    
    def _determine_data_requirements(self, features: List[str]) -> List[str]:
        """Determine what data is required for calculation"""
        requirements = [
            "gross_capital",
            "unit_price",
            "deal_id"
        ]
        
        if 'VALUATION_BASED_PREMIUM' in features:
            requirements.extend(["purchase_valuation", "sell_valuation"])
        
        if 'PERFORMANCE_FEE' in features:
            requirements.extend(["prior_nav", "current_nav"])
        
        if 'HURDLE_RATE' in features:
            requirements.append("hurdle_rate")
        
        if 'HIGH_WATER_MARK' in features:
            requirements.append("high_water_mark_value")
        
        if 'ANNUAL_MANAGEMENT' in features:
            requirements.append("years_held")
        
        return requirements
    
    def _generate_optimization_hints(
        self, 
        deal_config: DealConfiguration, 
        features: List[str]
    ) -> List[str]:
        """Generate optimization hints for the engine"""
        hints = []
        
        # Cache fee schedule
        hints.append("Cache fee schedule to avoid database lookups")
        
        # Pre-calculate premium if valuation-based
        if 'VALUATION_BASED_PREMIUM' in features:
            hints.append("Pre-calculate premium rate from valuations")
        
        # Batch processing for multiple transactions
        if deal_config.deal_type in [DealType.PRIMARY, DealType.SECONDARY]:
            hints.append("Use batch processing for multiple transactions")
        
        # Simplify if no performance fees
        if 'PERFORMANCE_FEE' not in features:
            hints.append("Skip performance calculation branch")
        
        # Optimize partner calculations
        if 'PARTNER_SPLITS' in features:
            hints.append("Calculate partner fees in parallel")
        
        return hints
    
    def export_analysis(self, analysis: Dict) -> str:
        """Export analysis as JSON for storage or transmission"""
        return json.dumps(analysis, indent=2, default=str)