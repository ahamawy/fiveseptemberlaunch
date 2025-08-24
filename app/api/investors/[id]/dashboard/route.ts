import { NextRequest, NextResponse } from "next/server";
import { investorsRepo } from "@/lib/db/repos/investors.repo";
import {
  apiSuccess,
  apiError,
  apiValidationError,
} from "@/lib/utils/api-response";
import { DashboardDataSchema } from "@/lib/contracts/api/dashboard";
import { z } from "zod";
import * as crypto from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const correlationId = crypto.randomUUID();

  try {
    const investorId = parseInt(params.id);

    if (isNaN(investorId)) {
      return apiValidationError("Invalid investor ID");
    }

    // Prefer snapshots; fallback to transactions via repo
    const dashboardData = await investorsRepo.getDashboard(investorId);

    if (!dashboardData) {
      return apiError(
        new Error("Dashboard data not found"),
        404,
        "Failed to fetch dashboard data"
      );
    }

    // Map service result (summary/recentActivity) to UI shape (portfolio/performance/activeDeals)
    const s = dashboardData.summary;
    const responseData = {
      portfolio: {
        totalValue: s.currentValue,
        totalCommitted: s.totalCommitted,
        totalDistributed: s.totalDistributed,
        unrealizedGain: s.totalGains,
        totalCalled: s.totalCalled,
        totalGains: s.totalGains,
        portfolioIRR: s.portfolioIRR,
        portfolioMOIC: s.portfolioMOIC,
        activeDeals: s.activeDeals,
      },
      performance: {
        irr: s.portfolioIRR,
        moic: s.portfolioMOIC,
        dpi: s.totalCalled > 0 ? s.totalDistributed / s.totalCalled : 0,
        tvpi: s.totalCalled > 0 ? s.currentValue / s.totalCalled : 0,
      },
      recentActivity: dashboardData.recentActivity,
      activeDeals: s.activeDeals,
    };

    // Validate response with schema
    const validatedData = DashboardDataSchema.parse(responseData);

    const response = apiSuccess(validatedData, {
      correlationId,
      responseTime: Date.now() - startTime,
    });

    // Add cache headers
    response.headers.set(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );
    response.headers.set("x-correlation-id", correlationId);
    response.headers.set("x-response-time", `${Date.now() - startTime}ms`);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[${correlationId}] Validation error:`, error.errors);
      const validationErrors = error.errors.reduce((acc, issue) => {
        acc[issue.path.join(".")] = issue.message;
        return acc;
      }, {} as Record<string, string>);
      return apiValidationError(validationErrors);
    }

    console.error(`[${correlationId}] Error fetching dashboard data:`, error);
    return apiError(error);
  }
}
