import { NextResponse } from "next/server";
import { formulaEngine } from "@/lib/services/formula-engine.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dealId = parseInt(String(body.dealId ?? body.deal_id), 10);
    const grossCapital = Number(body.grossCapital ?? body.gross_capital);

    if (!Number.isFinite(dealId) || Number.isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid dealId" }, { status: 400 });
    }
    if (!Number.isFinite(grossCapital)) {
      return NextResponse.json(
        { error: "Invalid grossCapital" },
        { status: 400 }
      );
    }

    // Use the formula engine for all calculations
    const result = await formulaEngine.calculateForDeal({
      dealId,
      grossCapital,
      pmsp: body.pmsp,
      isp: body.isp,
      sfr: body.sfr,
      eup: body.eup,
      iup: body.iup,
      timeHorizon: body.years,
      structuringFeeDiscountPercent: body.structuringFeeDiscountPercent,
      managementFeeDiscountPercent: body.managementFeeDiscountPercent,
      performanceFeeDiscountPercent: body.performanceFeeDiscountPercent,
      premiumFeeDiscountPercent: body.premiumFeeDiscountPercent,
      otherFees: body.otherFees
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}