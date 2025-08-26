import { NextRequest, NextResponse } from 'next/server';
import { getCacheAdapter } from '@/lib/infrastructure/cache';
import { apiError } from '@/lib/utils/api-response';

type Handler = (request: NextRequest, ctx?: any) => Promise<NextResponse<any>>;

/**
 * Ensures there is a correlation ID for tracing and computes start time
 */
export function getRequestContext(request: NextRequest) {
  const incoming = request.headers.get('x-correlation-id');
  const correlationId = incoming && incoming.length > 0 ? incoming : cryptoRandomUUID();
  const startTime = Date.now();
  return { correlationId, startTime };
}

/**
 * Wraps a handler with idempotency protection for mutating requests.
 * Uses Redis if available, falls back to in-memory cache.
 */
export function withIdempotency(
  handler: Handler,
  options: { ttlSeconds?: number } = {}
): Handler {
  const { ttlSeconds = 60 } = options;

  return async (request: NextRequest, ctx?: any): Promise<NextResponse<any>> => {
    try {
      // Only enforce for mutating methods
      const method = request.method?.toUpperCase();
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return handler(request, ctx);
      }

      const key = request.headers.get('Idempotency-Key') || request.headers.get('x-idempotency-key');
      if (!key) {
        return handler(request, ctx);
      }

      const cache = await getCacheAdapter();
      const cacheKey = `idempotency:${key}`;

      const existing = await cache.get<string>(cacheKey);
      if (existing === 'in-progress') {
        return NextResponse.json(
          { success: false, error: 'Request already in progress' } as any,
          { status: 409 }
        );
      }
      if (existing === 'done') {
        return NextResponse.json(
          { success: true, message: 'Duplicate request ignored (idempotent)' } as any,
          { status: 200 }
        );
      }

      // Mark as in-progress
      await cache.set(cacheKey, 'in-progress', { ttl: ttlSeconds });

      try {
        const response = await handler(request, ctx);
        // Mark as done for TTL window
        await cache.set(cacheKey, 'done', { ttl: ttlSeconds });
        return response;
      } catch (error) {
        // Clear key on failure so client can retry
        await cache.delete(cacheKey);
        return apiError(error);
      }
    } catch (error) {
      return apiError(error);
    }
  };
}

function cryptoRandomUUID() {
  try {
    // node:crypto is not available in edge runtime; fallback to Math.random-based
    // Next middleware runtime can use crypto.randomUUID when available
    // @ts-ignore
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch {}
  return 'corr-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}


