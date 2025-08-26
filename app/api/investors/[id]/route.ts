import { NextRequest, NextResponse } from "next/server";
import { investorsService } from "@/lib/services";
import { getServiceClient } from "@/lib/db/supabase/server-client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Support numeric ID or public_id (non-numeric)
    const asNumber = parseInt(params.id);
    let investor = isNaN(asNumber)
      ? await investorsService.getInvestorByPublicId(params.id)
      : await investorsService.getInvestorById(asNumber);

    if (!investor) {
      // Fallback: derive minimal profile from transactions if any exist
      if (!isNaN(asNumber)) {
        const sb = getServiceClient();
        const { data: tx } = await sb
          .from("transactions_clean")
          .select("investor_id")
          .eq("investor_id", asNumber)
          .limit(1);
        if (Array.isArray(tx) && tx.length > 0) {
          investor = {
            id: asNumber,
            public_id: String(asNumber),
            user_id: null,
            type: "individual",
            name: null,
            email: null,
            phone: null,
            country: null,
            kyc_status: null,
            accredited: false,
            created_at: null,
            updated_at: null,
          } as any;
          return NextResponse.json(investor);
        }
      }
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
