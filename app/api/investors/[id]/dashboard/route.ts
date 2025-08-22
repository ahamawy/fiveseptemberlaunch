import { NextRequest, NextResponse } from "next/server";
import { investorsRepo } from "@/lib/db/repos/investors.repo";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);

    if (isNaN(investorId)) {
      return NextResponse.json(
        { error: "Invalid investor ID" },
        { status: 400 }
      );
    }

    // Prefer snapshots; fallback to transactions via repo
    const dashboardData = await investorsRepo.getDashboard(investorId);

    if (!dashboardData) {
      return NextResponse.json(
        { error: "Failed to fetch dashboard data" },
        { status: 404 }
      );
    }

    // Map service result (summary/recentActivity) to UI shape (portfolio/performance/activeDeals)
    const s = dashboardData.summary;
    const ui = {
      portfolio: {
        totalValue: s.currentValue,
        totalCommitted: s.totalCommitted,
        totalDistributed: s.totalDistributed,
        unrealizedGain: s.totalGains,
      },
      performance: {
        irr: s.portfolioIRR,
        moic: s.portfolioMOIC,
        dpi: s.totalDistributed / s.totalCalled || 0,
        tvpi: s.currentValue / s.totalCalled || 0,
      },
      recentActivity: dashboardData.recentActivity,
      activeDeals: s.activeDeals,
    };

    return NextResponse.json(ui);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
