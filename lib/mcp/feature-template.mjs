// Feature generator template aligned with codebase patterns

export const apiRouteTemplate = (feature) => `import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/db/supabase/server-client';
import { z } from 'zod';

// Input validation schema
const querySchema = z.object({
  limit: z.string().optional().transform(val => Math.min(100, parseInt(val || '20'))),
  offset: z.string().optional().transform(val => Math.max(0, parseInt(val || '0'))),
  // Add more params as needed
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    
    // Parse and validate query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { limit, offset } = querySchema.parse(searchParams);
    
    // Query with proper error handling
    const { data, error } = await supabase
      .from('${feature.table || feature.name}')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('id', { ascending: false });
    
    if (error) throw error;
    
    // TODO: Map to domain types using data-contracts.ts
    const mapped = data || [];
    
    return NextResponse.json({ 
      success: true, 
      data: mapped,
      pagination: { limit, offset, total: mapped.length }
    });
  } catch (error: any) {
    console.error('[${feature.name}] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ${feature.name}' },
      { status: 500 }
    );
  }
}`;

export const componentTemplate = (feature) => `'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/theme-utils';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

// TODO: Import proper domain type
interface ${feature.entityName} {
  id: number;
  name: string;
  [key: string]: any;
}

export default function ${feature.componentName}() {
  const [items, setItems] = useState<${feature.entityName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('${feature.apiPath}?limit=20');
        const json = await res.json();
        if (json.success) {
          setItems(json.data || []);
        } else {
          setError(json.error || 'Failed to load data');
        }
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div data-testid="${feature.name}-loading" className="min-h-[400px] flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="${feature.name}-error" className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="${feature.name}-list">
      <div className="flex justify-between items-center">
        <h2 data-testid="${feature.name}-title" className="text-2xl font-bold text-text-primary">
          ${feature.displayName}
        </h2>
        <button 
          data-testid="new-${feature.name}-button"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          + New ${feature.entityName}
        </button>
      </div>

      <div className="bg-background-surface rounded-xl border border-surface-border overflow-hidden">
        {items.length > 0 ? (
          <div className="divide-y divide-surface-border">
            {items.map((item) => (
              <div 
                key={item.id} 
                data-testid="${feature.name}-item"
                className="p-4 hover:bg-surface-hover transition-colors flex justify-between items-center"
              >
                <div>
                  <div className="font-medium text-text-primary">{item.name}</div>
                  <div className="text-sm text-text-secondary">ID: {item.id}</div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-text-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <div data-testid="${feature.name}-empty" className="text-center py-12 text-text-secondary">
            No ${feature.displayName.toLowerCase()} found. Create your first ${feature.entityName.toLowerCase()} to get started.
          </div>
        )}
      </div>
    </div>
  );
}`;

export const testTemplate = (feature) => `import { test, expect } from '@playwright/test';

test.describe('${feature.displayName} Feature', () => {
  test('should load and display ${feature.name}', async ({ page }) => {
    await page.goto('${feature.pagePath}');
    
    // Wait for key elements using data-testid
    await page.waitForSelector('[data-testid="${feature.name}-title"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="${feature.name}-list"]', { timeout: 10000 });
    
    // Either items or empty state should appear
    await page.waitForSelector(
      '[data-testid="${feature.name}-item"], [data-testid="${feature.name}-empty"]',
      { timeout: 10000 }
    );
  });

  test('should show new ${feature.entityName.toLowerCase()} button', async ({ page }) => {
    await page.goto('${feature.pagePath}');
    await page.waitForSelector('[data-testid="${feature.name}-title"]', { timeout: 10000 });
    
    const newButton = await page.locator('[data-testid="new-${feature.name}-button"]');
    await expect(newButton).toBeVisible();
    await expect(newButton).toHaveText('+ New ${feature.entityName}');
  });

  test('API should return data with correct shape', async ({ request }) => {
    const response = await request.get('${feature.apiPath}?limit=5');
    expect(response.ok()).toBeTruthy();
    
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    
    // Check pagination
    expect(json.pagination).toBeDefined();
    expect(json.pagination.limit).toBe(5);
    expect(json.pagination.offset).toBe(0);
    
    // Verify data shape if present
    if (json.data.length > 0) {
      const item = json.data[0];
      expect(typeof item.id).toBe('number');
      expect(typeof item.name).toBe('string');
    }
  });

  test('should handle loading states', async ({ page }) => {
    await page.route('${feature.apiPath}*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      });
    });

    await page.goto('${feature.pagePath}');
    await page.waitForSelector('[data-testid="${feature.name}-empty"]', { timeout: 10000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('${feature.apiPath}*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Test error' })
      });
    });

    await page.goto('${feature.pagePath}');
    await page.waitForSelector('[data-testid="${feature.name}-error"]', { timeout: 10000 });
    const errorState = await page.locator('[data-testid="${feature.name}-error"]');
    await expect(errorState).toContainText('Test error');
  });
});`;

export const pageTemplate = (feature) => `import ${feature.componentName} from '@/components/${feature.path}/${feature.componentName}';

export default function ${feature.pageName}() {
  return (
    <div className="container mx-auto py-8">
      <${feature.componentName} />
    </div>
  );
}`;