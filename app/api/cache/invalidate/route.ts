/**
 * Cache Invalidation API Endpoint
 * Allows clearing cache by pattern or tags
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCacheAdapter } from '@/lib/infrastructure/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern, tags, all } = body;
    
    const cache = await getCacheAdapter();
    let result = {
      invalidated: false,
      method: '',
      details: ''
    };
    
    if (all) {
      // Clear all cache
      await cache.clear();
      result = {
        invalidated: true,
        method: 'all',
        details: 'All cache entries cleared'
      };
    } else if (pattern) {
      // Clear by pattern
      await cache.deleteByPattern(pattern);
      result = {
        invalidated: true,
        method: 'pattern',
        details: `Cache entries matching pattern "${pattern}" cleared`
      };
    } else if (tags && Array.isArray(tags)) {
      // Clear by tags
      await cache.deleteByTags(tags);
      result = {
        invalidated: true,
        method: 'tags',
        details: `Cache entries with tags [${tags.join(', ')}] cleared`
      };
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request. Provide pattern, tags, or all flag'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to invalidate cache',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing key parameter'
        },
        { status: 400 }
      );
    }
    
    const cache = await getCacheAdapter();
    await cache.delete(key);
    
    return NextResponse.json({
      success: true,
      data: {
        deleted: true,
        key
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete cache entry',
        details: error.message
      },
      { status: 500 }
    );
  }
}