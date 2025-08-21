import { NextRequest, NextResponse } from "next/server";
import { FormulaManager } from "@/lib/services/formula-engine/formula-manager";

const formulaManager = new FormulaManager();

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    const template = await formulaManager.getDealFormula(dealId);
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    const { formulaTemplateId } = await request.json();
    if (!formulaTemplateId || Number.isNaN(Number(formulaTemplateId))) {
      return NextResponse.json(
        { success: false, error: "formulaTemplateId is required" },
        { status: 400 }
      );
    }

    const ok = await formulaManager.assignFormulaToDeal(
      dealId,
      Number(formulaTemplateId)
    );
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to assign formula to deal" },
        { status: 500 }
      );
    }

    const template = await formulaManager.getDealFormula(dealId);
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
