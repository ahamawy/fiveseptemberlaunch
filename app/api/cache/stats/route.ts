/**
 * Cache Statistics API Endpoint
 * Returns current cache statistics and health
 */

import { NextResponse } from 'next/server';
import { getCacheAdapter, checkCacheHealth } from '@/lib/infrastructure/cache';

export async function GET() {
  try {
    // Get cache adapter
    const cache = await getCacheAdapter();
    
    // Get cache statistics
    const stats = await cache.getStats();
    
    // Check cache health
    const health = await checkCacheHealth();
    
    // Test cache performance
    const performanceTest = await testCachePerformance();
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        health,
        performance: performanceTest,
        config: {
          useRedis: process.env.USE_REDIS === 'true',
          redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured',
          defaultTTL: process.env.CACHE_DEFAULT_TTL || 3600
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve cache statistics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Test cache performance
async function testCachePerformance() {
  const cache = await getCacheAdapter();
  const iterations = 100;
  const testData = { test: true, data: 'x'.repeat(1000) };
  
  // Test write performance
  const writeStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    await cache.set(`perf-test-${i}`, testData, { ttl: 60 });
  }
  const writeTime = Date.now() - writeStart;
  
  // Test read performance
  const readStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    await cache.get(`perf-test-${i}`);
  }
  const readTime = Date.now() - readStart;
  
  // Clean up
  for (let i = 0; i < iterations; i++) {
    await cache.delete(`perf-test-${i}`);
  }
  
  return {
    iterations,
    writeTime: `${writeTime}ms`,
    writePerOp: `${(writeTime / iterations).toFixed(2)}ms`,
    readTime: `${readTime}ms`,
    readPerOp: `${(readTime / iterations).toFixed(2)}ms`,
    opsPerSecond: Math.round((iterations * 2) / ((writeTime + readTime) / 1000))
  };
}