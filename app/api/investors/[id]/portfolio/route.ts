import { NextRequest, NextResponse } from "next/server";
import { investorsRepo } from "@/lib/db/repos/investors.repo";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { PortfolioDataSchema } from "@/lib/contracts/api/portfolio";
import * as crypto from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const correlationId = crypto.randomUUID();

  try {
    // Basic request context
    const investorId = parseInt(params.id);
    if (isNaN(investorId)) {
      return apiError(
        new Error("Invalid investor ID"),
        400,
        "Invalid investor ID format"
      );
    }

    // Fetch typed portfolio data (already aligned to contract)
    const portfolio = await investorsRepo.getPortfolio(investorId);

    // Validate response data with Zod
    const validatedData = PortfolioDataSchema.parse(portfolio);

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Create successful response with metadata
    const response = apiSuccess(validatedData, {
      correlationId,
      responseTime,
      dealsCount: validatedData.deals?.length || 0,
    });

    // Add cache headers for performance
    response.headers.set(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );
    response.headers.set("X-Correlation-Id", correlationId);

    return response;
  } catch (error) {
    console.error(`[Portfolio API] Error for investor ${params.id}`, {
      error,
      correlationId,
      duration: Date.now() - startTime,
    });

    // Handle Zod validation errors specifically
    if (error instanceof Error && error.name === "ZodError") {
      const details = (error as any).errors
        ? JSON.stringify((error as any).errors)
        : "Portfolio data validation failed";
      return apiError(error, 500, details);
    }

    return apiError(error, 500, "Failed to fetch portfolio data");
  }
}
