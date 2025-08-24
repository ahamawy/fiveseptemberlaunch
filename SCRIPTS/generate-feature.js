#!/usr/bin/env node

/**
 * Feature Generator Script
 * Creates a complete feature module with Ultrathink context
 * 
 * Usage:
 *   npm run generate:feature -- --code 15.1.2 --name portfolio-analytics
 *   node scripts/generate-feature.js --code 15.1.2 --name portfolio-analytics --domain investor
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index > -1 ? args[index + 1] : null;
};

const featureCode = getArg('code') || '0.0.0';
const featureName = getArg('name') || 'new-feature';
const domain = getArg('domain') || 'core';
const author = getArg('author') || 'EQT Platform Team';

// Convert to proper naming conventions
const kebabName = featureName.toLowerCase().replace(/\s+/g, '-');
const pascalName = featureName.split('-').map(word => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join('');
const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);

// Feature directory
const featureDir = path.join(process.cwd(), 'FEATURES', `${featureCode}-${kebabName}`);

// Template for Ultrathink files
const templates = {
  '00_START_HERE.md': `# 🚀 START HERE - Feature ${featureCode} ${pascalName}

**Quick Ship:** Load this folder into Claude Code and say:
\`\`\`
Ship feature ${featureCode} ${kebabName} with Supabase integration
\`\`\`

## Pre-flight (1 minute)
\`\`\`bash
cd "${featureDir}"
npm i
npm run dev
\`\`\`

## Feature Context
- **Code**: ${featureCode}
- **Name**: ${pascalName}
- **Domain**: ${domain}
- **Author**: ${author}
- **Created**: ${new Date().toISOString().split('T')[0]}

## Quick Commands
\`\`\`bash
# Development
npm run dev
open http://localhost:3000/${domain}/${kebabName}

# Testing
npm run test:unit -- ${kebabName}
npm run test:e2e -- ${kebabName}

# API Check
curl http://localhost:3000/api/${domain}/${kebabName}
\`\`\`

## Definition of Done
- [ ] Feature loads at \`/${domain}/${kebabName}\`
- [ ] API returns correct shape per \`02_API_CONTRACT.json\`
- [ ] All tests pass
- [ ] No console errors
- [ ] < 500ms load time
`,

  '01_FEATURE_CARD.md': `# Feature Card: ${featureCode} ${pascalName}

## Feature Identity
- **Code**: ${featureCode}
- **Name**: ${pascalName}
- **Type**: ${domain}
- **Priority**: P1
- **Owner**: ${author}
- **Domain**: ${domain}
- **Path**: ${domain} > ${kebabName}

## Business Value
[Describe the business value and user impact]

## User Story
As a [user type], I want to [action] so that [benefit].

## Technical Spec

### Data Sources
\`\`\`typescript
import { ${camelName}Service } from '@/lib/services';

const data = await ${camelName}Service.getData();
\`\`\`

### UI Components
- \`Card\` with \`variant="gradient"\` for metrics
- \`Table\` for data display
- \`Button\` for actions

## Acceptance Criteria
- [ ] Feature accessible at \`/${domain}/${kebabName}\`
- [ ] Responsive on all devices
- [ ] Data loads without errors
- [ ] Meets accessibility standards
- [ ] Performance < 500ms

## Success Metrics
- Page load time < 500ms
- Zero console errors
- 100% test coverage
`,

  '02_API_CONTRACT.json': JSON.stringify({
    openapi: '3.0.0',
    info: {
      title: `${pascalName} API`,
      version: '1.0.0',
      description: `API contract for ${featureCode} ${pascalName}`
    },
    paths: {
      [`/api/${domain}/${kebabName}`]: {
        get: {
          summary: `Get ${pascalName} data`,
          operationId: `get${pascalName}`,
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          value: { type: 'number' },
                          timestamp: { type: 'string', format: 'date-time' }
                        }
                      },
                      metadata: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          page: { type: 'number' },
                          limit: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, null, 2),

  '03_DB_CONTRACT.sql': `-- Database Contract for ${featureCode} ${pascalName}
-- Author: ${author}
-- Created: ${new Date().toISOString().split('T')[0]}

-- Required tables/views
-- Note: These should already exist. Do not create new tables here.

-- Example query patterns:
SELECT 
  id,
  name,
  value,
  created_at
FROM ${domain}.${kebabName.replace(/-/g, '_')}
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 100;

-- Indexes needed for performance:
-- CREATE INDEX IF NOT EXISTS idx_${kebabName.replace(/-/g, '_')}_status 
--   ON ${domain}.${kebabName.replace(/-/g, '_')}(status);
`,

  '04_BRAND_TOKENS.ts': `/**
 * Brand Tokens for ${pascalName}
 * Consistent with platform design system
 */

export const ${camelName}Tokens = {
  colors: {
    primary: '#C898FF',      // Equitie purple
    secondary: '#2A0B4B',    // Deep purple
    accent: '#00C2FF',       // Bright cyan
    background: '#0A0015',   // Dark background
    surface: '#150025',      // Card background
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },
  
  typography: {
    heading: 'font-bold text-3xl',
    subheading: 'font-semibold text-xl',
    body: 'text-base',
    caption: 'text-sm text-text-secondary',
  },
  
  components: {
    card: 'bg-surface-elevated border border-surface-border rounded-xl p-6',
    button: 'bg-primary-300 text-white px-4 py-2 rounded-lg hover:bg-primary-400',
    input: 'bg-surface border border-surface-border rounded-lg px-3 py-2',
  }
} as const;
`,

  '05_ACCEPTANCE.md': `# Acceptance Criteria for ${pascalName}

## Functional Requirements
- [ ] Feature loads at \`/${domain}/${kebabName}\`
- [ ] All UI components render correctly
- [ ] Data fetching works with both mock and real data
- [ ] Error states are handled gracefully
- [ ] Loading states are shown during data fetch

## Non-Functional Requirements
- [ ] Page load time < 500ms
- [ ] Lighthouse score > 90
- [ ] No console errors or warnings
- [ ] Accessible (WCAG 2.1 AA compliant)
- [ ] Responsive on mobile/tablet/desktop

## Testing Requirements
- [ ] Unit tests pass (> 80% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Documentation Requirements
- [ ] README.md is complete
- [ ] API documentation is current
- [ ] Inline code comments added
- [ ] CHANGELOG.md updated
`,

  '06_SERVICES.ts': `/**
 * Service Layer for ${pascalName}
 * Handles all business logic and data operations
 */

import { BaseService } from '@/lib/services/base.service';
import type { IDataClient } from '@/lib/db/client';

export interface ${pascalName}Data {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
}

export interface ${pascalName}Options {
  limit?: number;
  offset?: number;
  sortBy?: keyof ${pascalName}Data;
  sortOrder?: 'asc' | 'desc';
}

export class ${pascalName}Service extends BaseService {
  constructor() {
    super({
      enableCache: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      enableLogging: process.env.NODE_ENV === 'development'
    });
  }

  async get${pascalName}(options: ${pascalName}Options = {}): Promise<${pascalName}Data[]> {
    const cacheKey = \`${kebabName}:\${JSON.stringify(options)}\`;
    
    // Check cache first
    const cached = this.getCached<${pascalName}Data[]>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch from data source
      const data = await this.dataClient.${camelName}.findMany({
        limit: options.limit || 10,
        offset: options.offset || 0,
        orderBy: options.sortBy || 'timestamp',
        order: options.sortOrder || 'desc'
      });

      // Transform and cache
      const transformed = this.transform${pascalName}(data);
      this.setCache(cacheKey, transformed);
      
      return transformed;
    } catch (error) {
      this.handleError(error, 'get${pascalName}');
    }
  }

  async get${pascalName}ById(id: string): Promise<${pascalName}Data | null> {
    const cacheKey = \`${kebabName}:\${id}\`;
    
    const cached = this.getCached<${pascalName}Data>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.dataClient.${camelName}.findOne({ id });
      
      if (!data) return null;
      
      const transformed = this.transformSingle${pascalName}(data);
      this.setCache(cacheKey, transformed);
      
      return transformed;
    } catch (error) {
      this.handleError(error, 'get${pascalName}ById');
    }
  }

  private transform${pascalName}(data: any[]): ${pascalName}Data[] {
    return data.map(item => this.transformSingle${pascalName}(item));
  }

  private transformSingle${pascalName}(item: any): ${pascalName}Data {
    return {
      id: item.id,
      name: item.name || 'Unknown',
      value: item.value || 0,
      timestamp: new Date(item.created_at || Date.now())
    };
  }
}

// Export singleton instance
export const ${camelName}Service = new ${pascalName}Service();
`,

  '07_EVENTS.ts': `/**
 * Domain Events for ${pascalName}
 * Defines all events that can occur in this feature
 */

export enum ${pascalName}EventType {
  CREATED = '${kebabName}.created',
  UPDATED = '${kebabName}.updated',
  DELETED = '${kebabName}.deleted',
  VIEWED = '${kebabName}.viewed',
  EXPORTED = '${kebabName}.exported',
}

export interface ${pascalName}Event {
  id: string;
  type: ${pascalName}EventType;
  aggregateId: string;
  timestamp: Date;
  userId?: string;
  tenantId?: string;
  payload: any;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    version?: number;
  };
}

export class ${pascalName}Events {
  static created(data: any): ${pascalName}Event {
    return {
      id: crypto.randomUUID(),
      type: ${pascalName}EventType.CREATED,
      aggregateId: data.id,
      timestamp: new Date(),
      payload: data,
      metadata: {
        version: 1
      }
    };
  }

  static updated(id: string, changes: any): ${pascalName}Event {
    return {
      id: crypto.randomUUID(),
      type: ${pascalName}EventType.UPDATED,
      aggregateId: id,
      timestamp: new Date(),
      payload: { changes },
      metadata: {
        version: 1
      }
    };
  }

  static deleted(id: string): ${pascalName}Event {
    return {
      id: crypto.randomUUID(),
      type: ${pascalName}EventType.DELETED,
      aggregateId: id,
      timestamp: new Date(),
      payload: { id },
      metadata: {
        version: 1
      }
    };
  }
}
`,

  '08_METRICS.ts': `/**
 * Metrics and Monitoring for ${pascalName}
 * Tracks performance and usage metrics
 */

export class ${pascalName}Metrics {
  private static readonly PREFIX = '${kebabName}';
  
  // Counter metrics
  static readonly REQUESTS_TOTAL = \`\${this.PREFIX}_requests_total\`;
  static readonly ERRORS_TOTAL = \`\${this.PREFIX}_errors_total\`;
  static readonly SUCCESS_TOTAL = \`\${this.PREFIX}_success_total\`;
  
  // Histogram metrics
  static readonly RESPONSE_TIME = \`\${this.PREFIX}_response_time_ms\`;
  static readonly DATA_SIZE = \`\${this.PREFIX}_data_size_bytes\`;
  
  // Gauge metrics
  static readonly ACTIVE_USERS = \`\${this.PREFIX}_active_users\`;
  static readonly CACHE_HIT_RATIO = \`\${this.PREFIX}_cache_hit_ratio\`;
  
  // Business metrics
  static readonly FEATURE_USAGE = \`\${this.PREFIX}_feature_usage\`;
  static readonly CONVERSION_RATE = \`\${this.PREFIX}_conversion_rate\`;
  
  // Track a metric
  static track(metric: string, value: number, labels?: Record<string, string>) {
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to Prometheus/DataDog/etc
      console.log(\`Metric: \${metric} = \${value}\`, labels);
    }
  }
  
  // Start a timer
  static startTimer(): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.track(this.RESPONSE_TIME, duration);
      return duration;
    };
  }
  
  // Track an error
  static trackError(error: Error, context?: string) {
    this.track(this.ERRORS_TOTAL, 1, {
      error_type: error.name,
      context: context || 'unknown'
    });
  }
  
  // Track success
  static trackSuccess(operation: string) {
    this.track(this.SUCCESS_TOTAL, 1, {
      operation
    });
  }
}
`,

  '09_FLAGS.json': JSON.stringify({
    feature: `${kebabName}`,
    flags: {
      [`enable_${kebabName.replace(/-/g, '_')}`]: {
        enabled: true,
        description: `Enable ${pascalName} feature`,
        rollout: 100,
        variants: {
          control: 50,
          treatment: 50
        }
      },
      [`${kebabName.replace(/-/g, '_')}_use_cache`]: {
        enabled: true,
        description: `Use caching for ${pascalName}`,
        rollout: 100
      },
      [`${kebabName.replace(/-/g, '_')}_enable_metrics`]: {
        enabled: true,
        description: `Track metrics for ${pascalName}`,
        rollout: 100
      }
    }
  }, null, 2)
};

// Create feature structure
function createFeatureStructure() {
  console.log(`\n🚀 Generating feature: ${featureCode} ${pascalName}\n`);

  // Create directories
  const dirs = [
    featureDir,
    path.join(featureDir, 'ultrathink'),
    path.join(featureDir, 'domain', 'entities'),
    path.join(featureDir, 'domain', 'value-objects'),
    path.join(featureDir, 'domain', 'aggregates'),
    path.join(featureDir, 'domain', 'events'),
    path.join(featureDir, 'application', 'commands'),
    path.join(featureDir, 'application', 'queries'),
    path.join(featureDir, 'application', 'handlers'),
    path.join(featureDir, 'infrastructure', 'api'),
    path.join(featureDir, 'infrastructure', 'db'),
    path.join(featureDir, 'infrastructure', 'cache'),
    path.join(featureDir, 'infrastructure', 'messaging'),
    path.join(featureDir, 'tests', 'unit'),
    path.join(featureDir, 'tests', 'integration'),
    path.join(featureDir, 'tests', 'e2e'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✅ Created: ${dir.replace(process.cwd(), '.')}`);
    }
  });

  // Create ultrathink files
  Object.entries(templates).forEach(([filename, content]) => {
    const filepath = path.join(featureDir, 'ultrathink', filename);
    fs.writeFileSync(filepath, content);
    console.log(`  ✅ Created: ultrathink/${filename}`);
  });

  // Create main README
  const readmeContent = `# Feature ${featureCode}: ${pascalName}

## Quick Start
\`\`\`bash
cd ${featureDir}
npm run dev
\`\`\`

## Structure
- \`ultrathink/\` - Feature context and contracts
- \`domain/\` - Business logic and entities
- \`application/\` - Use cases and handlers
- \`infrastructure/\` - External interfaces
- \`tests/\` - Test coverage

## Development
See \`ultrathink/00_START_HERE.md\` for detailed instructions.

## API
See \`ultrathink/02_API_CONTRACT.json\` for API specification.

## Testing
\`\`\`bash
npm run test:unit -- ${kebabName}
npm run test:e2e -- ${kebabName}
\`\`\`
`;

  fs.writeFileSync(path.join(featureDir, 'README.md'), readmeContent);
  console.log(`  ✅ Created: README.md`);

  // Create package.json for feature
  const packageJson = {
    name: `@features/${kebabName}`,
    version: '1.0.0',
    description: `${pascalName} feature module`,
    scripts: {
      dev: 'npm run dev -w ../..',
      test: `npm run test -w ../.. -- ${kebabName}`,
      build: 'npm run build -w ../..'
    },
    author,
    private: true
  };

  fs.writeFileSync(
    path.join(featureDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log(`  ✅ Created: package.json`);

  console.log(`
✨ Feature generated successfully!

Next steps:
1. Load the feature into Claude Code:
   cd ${featureDir}
   
2. Tell Claude:
   "Ship feature ${featureCode} ${kebabName} using the ultrathink context"

3. Start development:
   npm run dev
   open http://localhost:3000/${domain}/${kebabName}

Feature location: ${featureDir.replace(process.cwd(), '.')}
`);
}

// Main execution
try {
  createFeatureStructure();
} catch (error) {
  console.error('❌ Error generating feature:', error.message);
  process.exit(1);
}