import { NextRequest, NextResponse } from "next/server";
import { investorsRepo } from "@/lib/db/repos/investors.repo";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);

    const portfolio = await investorsRepo.getPortfolio(investorId);
    // Generate historical performance (still mocked based on NAV)
    const historicalPerformance = generateHistoricalPerformance(
      portfolio.summary.totalValue
    );
    return NextResponse.json({ ...portfolio, historicalPerformance });
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}

function generateHistoricalPerformance(currentValue: number) {
  // Generate 12 months of historical data
  const months = 12;
  const data = [];
  const baseValue = currentValue * 0.85; // Start at 85% of current value

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - i - 1));

    const progress = i / (months - 1);
    const value = baseValue + (currentValue - baseValue) * progress;
    const moic = value / baseValue;
    const irr = 10 + progress * 7; // IRR from 10% to 17%

    data.push({
      date: date.toISOString().split("T")[0],
      nav: Math.round(value),
      irr: Math.round(irr * 10) / 10,
      moic: Math.round(moic * 100) / 100,
    });
  }

  return data;
}
