#!/usr/bin/env node

/**
 * Feature Generator MCP Server
 * Accelerates feature development from FEATURE_TREE.md
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const FEATURE_TREE_PATH = '/features/FEATURE_TREE.md';
const TEMPLATES = {
  api: (feature) => `import { NextRequest, NextResponse } from 'next/server';
import { ${feature.service}Service } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const data = await ${feature.service}Service.get${feature.entity}();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}`,

  component: (feature) => `'use client';

import { useState, useEffect } from 'react';
import { ${feature.entity}Service } from '@/lib/services';

export default function ${feature.component}() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await ${feature.entity}Service.fetch();
        setData(result);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2>${feature.title}</h2>
      {/* Implementation */}
    </div>
  );
}`,

  service: (feature) => `import { supabase } from '@/lib/db/supabase/client';

export class ${feature.entity}Service {
  static async getAll() {
    const { data, error } = await supabase
      .from('${feature.table}')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('${feature.table}')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(payload: any) {
    const { data, error } = await supabase
      .from('${feature.table}')
      .insert(payload)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id: string, payload: any) {
    const { data, error } = await supabase
      .from('${feature.table}')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}`,

  test: (feature) => `import { test, expect } from '@playwright/test';

test.describe('${feature.title}', () => {
  test('should load ${feature.entity} data', async ({ page }) => {
    await page.goto('/${feature.path}');
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="${feature.entity}-list"]');
    
    // Check data exists
    const items = await page.$$('[data-testid="${feature.entity}-item"]');
    expect(items.length).toBeGreaterThan(0);
  });

  test('should create new ${feature.entity}', async ({ page }) => {
    await page.goto('/${feature.path}/new');
    
    // Fill form
    await page.fill('[name="name"]', 'Test ${feature.entity}');
    
    // Submit
    await page.click('[type="submit"]');
    
    // Verify creation
    await expect(page).toHaveURL(/${feature.path}\\/[a-z0-9-]+/);
  });
});`
};

function parseFeatureTree() {
  try {
    const content = fs.existsSync(FEATURE_TREE_PATH) 
      ? fs.readFileSync(FEATURE_TREE_PATH, 'utf-8')
      : fs.readFileSync('./FEATURES/FEATURE_TREE.md', 'utf-8');
    const lines = content.split('\n');
    const features = [];
    
    lines.forEach(line => {
      // Match patterns like "- 1.1.1.1.1 deals-data-crud-read-by-id"
      const match = line.match(/^[-#]+\s+([\d.]+)\s+(.+)$/);
      if (match) {
        const [, number, name] = match;
        const cleanName = name.trim();
        features.push({
          number,
          name: cleanName,
          path: cleanName.toLowerCase().replace(/\s+/g, '-'),
          entity: cleanName.split('-')[0],
          service: cleanName.split('-')[0].toLowerCase(),
          component: cleanName.split('-').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(''),
          table: cleanName.split('-')[0].toLowerCase() + 's',
          title: cleanName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        });
      }
    });
    
    return features;
  } catch (error) {
    console.error('Error parsing feature tree:', error);
    return [];
  }
}

function generateFeature(featureNumber) {
  const features = parseFeatureTree();
  const feature = features.find(f => f.number === featureNumber);
  
  if (!feature) {
    return { error: `Feature ${featureNumber} not found` };
  }
  
  return {
    feature: feature.name,
    files: {
      api: TEMPLATES.api(feature),
      component: TEMPLATES.component(feature),
      service: TEMPLATES.service(feature),
      test: TEMPLATES.test(feature)
    },
    paths: {
      api: `/app/api/${feature.path}/route.ts`,
      component: `/components/${feature.component}.tsx`,
      service: `/lib/services/${feature.service}.service.ts`,
      test: `/e2e/${feature.path}.spec.ts`
    }
  };
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  if (req.url === '/features') {
    const features = parseFeatureTree();
    res.end(JSON.stringify({ features }));
  } else if (req.url?.startsWith('/generate/')) {
    const featureNumber = req.url.split('/')[2];
    const result = generateFeature(featureNumber);
    res.end(JSON.stringify(result));
  } else {
    res.end(JSON.stringify({
      name: 'feature-generator-mcp',
      version: '1.0.0',
      endpoints: [
        '/features - List all features from FEATURE_TREE.md',
        '/generate/{number} - Generate boilerplate for feature'
      ]
    }));
  }
});

const port = process.env.PORT || 3108;
server.listen(port, () => {
  console.log(`Feature Generator MCP running on port ${port}`);
});