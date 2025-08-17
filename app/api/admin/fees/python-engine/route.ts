import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

/**
 * API endpoint to interact with Python calculation engines
 * Supports: analyze, generate, calculate, and validate operations
 */

interface PythonEngineRequest {
  action: 'analyze' | 'generate' | 'calculate' | 'validate' | 'test';
  dealId: number;
  dealName?: string;
  dealType?: string;
  data?: {
    grossCapital?: number;
    unitPrice?: number;
    discounts?: Array<{
      component: string;
      percent?: number;
      amount?: number;
    }>;
    investors?: Array<{
      name: string;
      grossCapital: number;
      structuringDiscount?: number;
      managementDiscount?: number;
      adminDiscount?: number;
    }>;
    feeSchedule?: any;
  };
}

interface PythonEngineResponse {
  success: boolean;
  action: string;
  dealId: number;
  result?: any;
  error?: string;
  logs?: string[];
}

/**
 * Execute Python script and return results
 */
async function executePython(
  scriptPath: string,
  args: string[]
): Promise<{ output: string; error: string }> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, ...args]);
    
    let output = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0 && !output) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
      } else {
        resolve({ output, error });
      }
    });
    
    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * GET endpoint to check Python engine status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dealId = searchParams.get('dealId');
    
    if (!dealId) {
      return NextResponse.json({
        success: true,
        status: 'ready',
        message: 'Python engine bridge is operational',
        availableActions: ['analyze', 'generate', 'calculate', 'validate', 'test']
      });
    }
    
    // Check if engine exists for this deal
    const enginePath = path.join(
      process.cwd(),
      'lib/services/fee-engine/python-engines/engines',
      `deal_${dealId}_groq_engine.py`  // Check for Groq engine specifically
    );
    
    const genericEnginePath = path.join(
      process.cwd(),
      'lib/services/fee-engine/python-engines/engines',
      `deal_${dealId}_engine.py`
    );
    
    try {
      // Try Groq-specific engine first
      await fs.access(enginePath);
      
      return NextResponse.json({
        success: true,
        dealId: parseInt(dealId),
        engineExists: true,
        enginePath: enginePath.replace(process.cwd(), ''),
        message: `Engine found for deal ${dealId}`
      });
    } catch {
      // Try generic engine path
      try {
        await fs.access(genericEnginePath);
        
        return NextResponse.json({
          success: true,
          dealId: parseInt(dealId),
          engineExists: true,
          enginePath: genericEnginePath.replace(process.cwd(), ''),
          message: `Engine found for deal ${dealId}`
        });
      } catch {
        return NextResponse.json({
          success: true,
          dealId: parseInt(dealId),
          engineExists: false,
          message: `No engine found for deal ${dealId}. Use 'generate' action to create one.`
        });
      }
    }
  } catch (error) {
    console.error('Python engine status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to execute Python engine operations
 */
export async function POST(request: NextRequest) {
  try {
    const body: PythonEngineRequest = await request.json();
    const { action, dealId, dealName, dealType, data } = body;
    
    const pythonDir = path.join(
      process.cwd(),
      'lib/services/fee-engine/python-engines'
    );
    
    let response: PythonEngineResponse = {
      success: false,
      action,
      dealId
    };
    
    switch (action) {
      case 'analyze': {
        // Run complexity analyzer
        const scriptPath = path.join(pythonDir, 'run_analyzer.py');
        const args = [
          dealId.toString(),
          dealName || `Deal ${dealId}`,
          dealType || 'PRIMARY'
        ];
        
        // Create runner script if it doesn't exist
        const runnerScript = `
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
`;
        
        await fs.writeFile(scriptPath, runnerScript);
        
        const { output, error } = await executePython(scriptPath, args);
        
        if (output) {
          response.success = true;
          response.result = JSON.parse(output);
        } else {
          response.error = error || 'No output from analyzer';
        }
        break;
      }
      
      case 'generate': {
        // Generate engine for deal
        const scriptPath = path.join(pythonDir, 'run_generator.py');
        const args = [
          dealId.toString(),
          dealName || `Deal ${dealId}`,
          dealType || 'PRIMARY'
        ];
        
        // Create generator script
        const generatorScript = `
import sys
import os
import json
from decimal import Decimal

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from generators.engine_generator import DealEngineGenerator
from base.types import DealConfiguration, DealType, FeeSchedule, FeeComponent, FeeComponentType, FeeBasis

deal_id = int(sys.argv[1])
deal_name = sys.argv[2]
deal_type_str = sys.argv[3]

# Create configuration
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
    fee_schedule=schedule,
    purchase_valuation=Decimal('5300000000'),
    sell_valuation=Decimal('5500000000')
)

generator = DealEngineGenerator()
result = generator.generate(config)
print(json.dumps(result, default=str))
`;
        
        await fs.writeFile(scriptPath, generatorScript);
        
        const { output, error } = await executePython(scriptPath, args);
        
        if (output) {
          response.success = true;
          response.result = JSON.parse(output);
        } else {
          response.error = error || 'No output from generator';
        }
        break;
      }
      
      case 'calculate': {
        // Run calculation using existing engine
        const enginePath = path.join(
          pythonDir,
          'engines',
          `deal_${dealId}_engine.py`
        );
        
        // Check if engine exists
        try {
          await fs.access(enginePath);
        } catch {
          // Try to use the Groq engine if it's deal 28
          if (dealId === 28) {
            const groqEnginePath = path.join(pythonDir, 'engines', 'deal_28_groq_engine.py');
            const scriptPath = path.join(pythonDir, 'run_calculation.py');
            
            // Extract discount values from request
            let structuringDiscount = 0;
            let managementDiscount = 0;
            let adminDiscount = 0;
            
            if (data?.discounts && Array.isArray(data.discounts)) {
              for (const discount of data.discounts) {
                if (discount.component === 'STRUCTURING_DISCOUNT') {
                  structuringDiscount = discount.percent || 0;
                } else if (discount.component === 'MANAGEMENT_DISCOUNT') {
                  managementDiscount = discount.percent || 0;
                } else if (discount.component === 'ADMIN_DISCOUNT') {
                  adminDiscount = discount.percent || 0;
                }
              }
            }
            
            const calcScript = `
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
gross_capital = Decimal('${data?.grossCapital || 100000}')
unit_price = Decimal('${data?.unitPrice || 1000}')

result = engine.calculate_for_investor(
    investor_name="API User",
    gross_capital=gross_capital,
    unit_price=unit_price,
    structuring_discount_percent=Decimal('${structuringDiscount}'),
    management_discount_percent=Decimal('${managementDiscount}'),
    admin_discount_percent=Decimal('${adminDiscount}')
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
`;
            
            await fs.writeFile(scriptPath, calcScript);
            
            const { output, error } = await executePython(scriptPath, []);
            
            if (output) {
              response.success = true;
              response.result = JSON.parse(output);
            } else {
              response.error = error || 'Calculation failed';
            }
          } else {
            response.error = `No engine found for deal ${dealId}. Generate one first.`;
          }
        }
        break;
      }
      
      case 'validate': {
        // Validate engine calculations
        response.success = true;
        response.result = {
          message: 'Validation not yet implemented',
          dealId
        };
        break;
      }
      
      case 'test': {
        // Run engine tests
        const testPath = path.join(
          pythonDir,
          'engines',
          `test_deal_${dealId}.py`
        );
        
        try {
          await fs.access(testPath);
          const { output, error } = await executePython(testPath, []);
          
          response.success = !error;
          response.result = {
            output: output || 'Tests completed',
            error: error || null
          };
        } catch {
          response.error = `No tests found for deal ${dealId}`;
        }
        break;
      }
      
      default:
        response.error = `Unknown action: ${action}`;
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Python engine error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'error',
        dealId: 0
      },
      { status: 500 }
    );
  }
}