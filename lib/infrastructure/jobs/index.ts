import { getCacheAdapter } from '@/lib/infrastructure/cache';

export interface JobContext {
  startedAt: number;
  correlationId: string;
  signal?: AbortSignal;
}

export type JobHandler = (ctx: JobContext, params?: Record<string, any>) => Promise<{ ok: true; meta?: any } | { ok: false; error: string }>;

interface RegisteredJob { name: string; handler: JobHandler; }

const registry = new Map<string, RegisteredJob>();

export function registerJob(name: string, handler: JobHandler) {
  registry.set(name, { name, handler });
}

export function listJobs(): string[] {
  return Array.from(registry.keys()).sort();
}

export async function runJob(name: string, params?: Record<string, any>) {
  const job = registry.get(name);
  if (!job) throw new Error(`Job not found: ${name}`);

  const correlationId = `job-${name}-${Date.now()}`;
  const ctx: JobContext = { startedAt: Date.now(), correlationId };

  const lockKey = `job-lock:${name}`;
  const cache = await getCacheAdapter();
  const lockAcquired = await acquireLock(cache, lockKey, 60);
  if (!lockAcquired) {
    return { ok: false as const, error: 'Job already running' };
  }
  try {
    const result = await job.handler(ctx, params);
    return result;
  } finally {
    await releaseLock(cache, lockKey);
  }
}

async function acquireLock(cache: any, key: string, ttlSeconds: number): Promise<boolean> {
  try {
    const exists = await cache.has(key);
    if (exists) return false;
    await cache.set(key, 'locked', { ttl: ttlSeconds });
    return true;
  } catch {
    return true; // be permissive if cache not available
  }
}

async function releaseLock(cache: any, key: string): Promise<void> {
  try { await cache.delete(key); } catch {}
}

// Example job: refresh company assets (placeholder)
registerJob('refresh-company-assets', async () => {
  // Intentionally minimal: real implementation can batch resolve asset URLs
  return { ok: true as const, meta: { refreshed: true } };
});


