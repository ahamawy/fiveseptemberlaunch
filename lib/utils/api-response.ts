import { NextResponse } from "next/server";

/**
 * Standardized API response utilities
 * Ensures consistent response format across all API endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp?: string;
    count?: number;
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

/**
 * Creates a successful API response
 */
export function apiSuccess<T>(
  data: T,
  metadata?: ApiResponse["metadata"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });
}

/**
 * Creates an error API response with proper logging
 */
export function apiError(
  error: unknown,
  statusCode: number = 500,
  userMessage?: string
): NextResponse<ApiResponse> {
  // Log the error for debugging
  console.error("[API Error]", {
    error,
    statusCode,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Determine the error message
  let errorMessage = userMessage || "An error occurred";
  
  if (!userMessage && error instanceof Error) {
    // In development, show actual error message
    if (process.env.NODE_ENV === "development") {
      errorMessage = error.message;
    } else {
      // In production, use generic message for security
      errorMessage = "Internal server error";
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}

/**
 * Handles not found responses
 */
export function apiNotFound(resource: string = "Resource"): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 404 }
  );
}

/**
 * Handles validation errors
 */
export function apiValidationError(
  errors: Record<string, string> | string
): NextResponse<ApiResponse> {
  const errorMessage = typeof errors === "string" 
    ? errors 
    : "Validation failed";

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      data: typeof errors === "object" ? errors : undefined,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 400 }
  );
}

/**
 * Wraps an async API handler with error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<ApiResponse<R>>>
) {
  return async (...args: T): Promise<NextResponse<ApiResponse<R>>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return apiError(error);
    }
  };
}

/**
 * Handles paginated responses
 */
export function apiPaginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]>> {
  return apiSuccess(data, {
    page,
    limit,
    total,
    count: data.length,
    hasMore: page * limit < total,
    totalPages: Math.ceil(total / limit),
  });
}

/**
 * Attaches standard cache headers to a response
 */
export function withCache<T = any>(
  response: NextResponse<T>,
  options: { sMaxage?: number; staleWhileRevalidate?: number } = {}
): NextResponse<T> {
  const { sMaxage = 60, staleWhileRevalidate = 300 } = options;
  response.headers.set(
    'Cache-Control',
    `s-maxage=${sMaxage}, stale-while-revalidate=${staleWhileRevalidate}`
  );
  return response;
}

/**
 * Attaches arbitrary headers to a response
 */
export function withHeaders<T = any>(
  response: NextResponse<T>,
  headers: Record<string, string>
): NextResponse<T> {
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams(url: string) {
  const { searchParams } = new URL(url);
  
  return {
    page: Math.max(1, parseInt(searchParams.get("page") || "1")),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10"))),
    search: searchParams.get("search") || undefined,
    sort: searchParams.get("sort") || undefined,
    order: (searchParams.get("order") || "desc") as "asc" | "desc",
    filters: Object.fromEntries(
      Array.from(searchParams.entries()).filter(
        ([key]) => !["page", "limit", "search", "sort", "order"].includes(key)
      )
    ),
  };
}

/**
 * Validates required fields in request body
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      errors[field as string] = `${String(field)} is required`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}