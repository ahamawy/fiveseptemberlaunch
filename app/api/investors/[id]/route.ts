import { NextRequest, NextResponse } from "next/server";
import { investorsService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Support numeric ID or public_id (non-numeric)
    const asNumber = parseInt(params.id);
    const investor = isNaN(asNumber)
      ? await investorsService.getInvestorByPublicId(params.id)
      : await investorsService.getInvestorById(asNumber);

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(investor);
  } catch (error) {
    console.error("Error fetching investor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
