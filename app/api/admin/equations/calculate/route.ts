import { NextResponse } from "next/server";
import { enhancedFeeCalculator } from "@/lib/services/fee-engine/enhanced-calculator";
import {
  dealEquationExecutor,
  DealEquation,
} from "@/lib/services/fee-engine/deal-equation-executor";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dealId = parseInt(String(body.dealId ?? body.deal_id), 10);
    const grossCapital = Number(body.grossCapital ?? body.gross_capital);
    const unitPrice = Number(body.unitPrice ?? body.unit_price ?? 1000);
    const discounts = Array.isArray(body.discounts)
      ? body.discounts
      : undefined;
    const years = body.years != null ? Number(body.years) : undefined;
    const mode = String(body.mode || "").toLowerCase();
    const equation: DealEquation | undefined = body.equation;

    if (!Number.isFinite(dealId) || Number.isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid dealId" }, { status: 400 });
    }
    if (!Number.isFinite(grossCapital)) {
      return NextResponse.json(
        { error: "Invalid grossCapital" },
        { status: 400 }
      );
    }

    // If equation mode is requested or an explicit equation is provided,
    // use the DealEquationExecutor to allow per-deal/per-transaction relationships
    if (mode === "deal-equation" || equation) {
      const result = await dealEquationExecutor.preview(
        dealId,
        {
          deal_id: dealId,
          investor_id: Number(body.investorId ?? body.investor_id ?? 0),
          gross_capital: grossCapital,
          unit_price: unitPrice,
          units: Number(body.units ?? 0),
          years,
          profit: body.profit != null ? Number(body.profit) : undefined,
          returned_capital:
            body.returned_capital != null
              ? Number(body.returned_capital)
              : undefined,
          current_valuation:
            body.current_valuation != null
              ? Number(body.current_valuation)
              : undefined,
        },
        equation
      );
      return NextResponse.json(result);
    }

    // Default to enhanced calculator (legacy behavior)
    const result = await enhancedFeeCalculator.preview(
      dealId,
      grossCapital,
      unitPrice,
      { discounts }
    );
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
