/**
 * System Context Service
 * Provides comprehensive system knowledge to AI agents
 * Includes database schema, feature tree, and business logic
 */

import {
  SUPABASE_SCHEMA,
  CSV_MAPPINGS,
  BUSINESS_RULES,
  DASHBOARD_QUERIES,
  getSchemaContext,
} from "@/lib/knowledge/supabase-schema";

export interface SystemContext {
  database: {
    schema: typeof SUPABASE_SCHEMA;
    mappings: typeof CSV_MAPPINGS;
    businessRules: typeof BUSINESS_RULES;
    queries: typeof DASHBOARD_QUERIES;
  };
  features: {
    currentFeature: string;
    featureTree: string;
    apiContracts: any;
  };
  codebase: {
    architecture: string;
    services: string[];
    patterns: string[];
  };
}

export class SystemContextService {
  private static instance: SystemContextService;

  private constructor() {}

  static getInstance(): SystemContextService {
    if (!this.instance) {
      this.instance = new SystemContextService();
    }
    return this.instance;
  }

  /**
   * Get complete system context for AI reasoning
   */
  getFullContext(): SystemContext {
    return {
      database: {
        schema: SUPABASE_SCHEMA,
        mappings: CSV_MAPPINGS,
        businessRules: BUSINESS_RULES,
        queries: DASHBOARD_QUERIES,
      },
      features: {
        currentFeature: "15.1.1 investor-portal-dashboard",
        featureTree: this.getFeatureTreeSummary(),
        apiContracts: this.getAPIContracts(),
      },
      codebase: {
        architecture: this.getArchitectureOverview(),
        services: this.getAvailableServices(),
        patterns: this.getCodePatterns(),
      },
    };
  }

  /**
   * Get context specifically for CSV analysis
   */
  getCSVAnalysisContext(csvColumns: string[]): string {
    const context = `
You are analyzing CSV data for the EQUITIE private equity platform.

DATABASE SCHEMA:
${getSchemaContext()}

CSV COLUMNS PROVIDED:
${csvColumns.join(", ")}

ANALYSIS STEPS:
1. Identify the type of data (investors, deals, transactions, fees)
2. Map each CSV column to the correct database field
3. Validate data types and constraints
4. Check for required fields that might be missing
5. Identify any data quality issues
6. Generate SQL for importing the data
7. Suggest next steps and optimizations

RESPONSE FORMAT:
Return a structured analysis with:
- Data type identification
- Column mappings (CSV → Database)
- Data validation results
- SQL import statements
- Recommendations for data cleanup
- Business insights based on the data
`;
    return context;
  }

  /**
   * Get context for intelligent querying
   */
  getQueryContext(userQuery: string): string {
    return `
You are helping query the EQUITIE database.

USER QUERY: ${userQuery}

DATABASE SCHEMA:
${this.getSchemaSummary()}

COMMON QUERIES:
${this.getCommonQueriesForContext()}

Generate an optimized SQL query that:
1. Joins the correct tables
2. Uses proper indexes
3. Handles nulls appropriately
4. Returns meaningful results
5. Includes relevant calculations (IRR, MOIC, etc.)

Also explain what the query does and any assumptions made.
`;
  }

  /**
   * Get context for data import operations
   */
  getImportContext(dataType: string, data: any[]): string {
    const schema = this.getSchemaForType(dataType);
    const rules = BUSINESS_RULES[dataType as keyof typeof BUSINESS_RULES] || [];

    return `
You are importing ${dataType} data into EQUITIE's Supabase database.

TARGET TABLE: ${schema?.name || dataType}
SCHEMA: ${schema?.schema || "public"}

COLUMNS:
${schema?.columns
  .map((c: any) => `- ${c.name} (${c.type}): ${c.description}`)
  .join("\n")}

BUSINESS RULES:
${rules.join("\n")}

DATA TO IMPORT:
${JSON.stringify(data.slice(0, 3), null, 2)}
... and ${data.length - 3} more records

TASKS:
1. Validate all data against schema constraints
2. Check for duplicates (especially emails for investors)
3. Ensure foreign key relationships are valid
4. Generate INSERT statements with conflict handling
5. Suggest any data transformations needed
6. Identify potential issues before import
`;
  }

  /**
   * Get feature tree summary
   */
  private getFeatureTreeSummary(): string {
    return `
EQUITIE Feature Tree (500+ features):

1. DEALS (1.x)
   - Deal CRUD operations
   - Fee management
   - Calculations (IRR, MOIC, NAV)

2. COMPANIES (2.x)
   - Company profiles
   - Valuations
   - Metrics

3. TRANSACTIONS (3.x)
   - Primary transactions
   - Secondary transactions
   - Advisory fees

15. INVESTOR APP (15.x)
    15.1 Portal
        15.1.1 Dashboard (current feature)
        15.1.2 Portfolio
        15.1.3 Transactions
        15.1.4 Documents
`;
  }

  /**
   * Get API contracts
   */
  private getAPIContracts(): any {
    return {
      dashboard: {
        endpoint: "/api/investors/{id}/dashboard",
        response: {
          summary: {
            totalCommitted: "number",
            totalCalled: "number",
            currentValue: "number",
            portfolioIRR: "number",
            portfolioMOIC: "number",
          },
          recentActivity: "Transaction[]",
          portfolioTrend: "TrendPoint[]",
        },
      },
    };
  }

  /**
   * Get architecture overview
   */
  private getArchitectureOverview(): string {
    return `
ARCHITECTURE:
- Next.js 14 with App Router
- Service layer pattern for data operations
- Supabase for database (PostgreSQL)
- Mock adapter for development
- TypeScript for type safety

DATA FLOW:
Component → API Route → Service → Adapter → Database/Mock

CONFIGURATION:
- NEXT_PUBLIC_USE_MOCK_DATA: Use mock data
- NEXT_PUBLIC_ENABLE_SUPABASE: Use Supabase
- Automatic switching between modes
`;
  }

  /**
   * Get available services
   */
  private getAvailableServices(): string[] {
    return [
      "dealsService - Deal operations",
      "investorsService - Investor operations",
      "transactionsService - Transaction operations",
      "documentsService - Document management",
      "feesService - Fee calculations",
      "portfolioAggregator - Portfolio analytics",
    ];
  }

  /**
   * Get code patterns
   */
  private getCodePatterns(): string[] {
    return [
      "Service layer for all data operations",
      "TypeScript interfaces for type safety",
      "Async/await for all database calls",
      "Error boundaries for resilience",
      "Loading states for all async operations",
      "Mock data for development",
    ];
  }

  /**
   * Get schema summary for context
   */
  private getSchemaSummary(): string {
    const tables = Object.keys(SUPABASE_SCHEMA);
    return `
Available tables: ${tables.join(", ")}

Key relationships:
- investors → transactions (one-to-many)
- deals → companies (many-to-one)
- investors → investor_units → deals (many-to-many)
- documents → investors/deals (many-to-one)
`;
  }

  /**
   * Get common queries for context
   */
  private getCommonQueriesForContext(): string {
    return Object.entries(DASHBOARD_QUERIES)
      .map(([name, query]) => `${name}:\n${query}`)
      .join("\n\n");
  }

  /**
   * Get schema for specific data type
   */
  private getSchemaForType(dataType: string): any {
    const typeMap: { [key: string]: string } = {
      investors: "investors.investor",
      deals: "deals.deal",
      transactions: "transactions.transaction.primary",
      companies: "companies.company",
      documents: "documents",
    };

    return SUPABASE_SCHEMA[typeMap[dataType] || dataType];
  }

  /**
   * Generate SQL for data import
   */
  generateImportSQL(dataType: string, data: any[]): string {
    const schema = this.getSchemaForType(dataType);
    if (!schema) return "";

    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const values = data.map((row) => {
      const vals = columns.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return "NULL";
        if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
        return val;
      });
      return `(${vals.join(", ")})`;
    });

    return `
-- Import ${dataType} data
INSERT INTO ${schema.schema}.${schema.name} (${columns.join(", ")})
VALUES
${values.join(",\n")}
ON CONFLICT (${this.getPrimaryKey(schema)})
DO UPDATE SET
  ${columns.map((col) => `${col} = EXCLUDED.${col}`).join(",\n  ")};
`;
  }

  /**
   * Get primary key for schema
   */
  private getPrimaryKey(schema: any): string {
    const pkColumn = schema.columns.find(
      (c: any) => c.name.endsWith("_id") || c.name === "id"
    );
    return pkColumn?.name || "id";
  }

  /**
   * Analyze CSV and provide intelligent mapping
   */
  analyzeCSVMapping(csvColumns: string[], targetTable: string): any {
    const schema = this.getSchemaForType(targetTable);
    const mappings = CSV_MAPPINGS[targetTable as keyof typeof CSV_MAPPINGS];

    const columnMappings: { [key: string]: string } = {};
    const unmappedColumns: string[] = [];
    const missingRequired: string[] = [];

    // Try to map each CSV column
    csvColumns.forEach((csvCol) => {
      let mapped = false;
      if (mappings?.commonPatterns) {
        for (const pattern of mappings.commonPatterns) {
          if (pattern.csvColumn.test(csvCol)) {
            columnMappings[csvCol] = pattern.dbColumn;
            mapped = true;
            break;
          }
        }
      }
      if (!mapped) {
        unmappedColumns.push(csvCol);
      }
    });

    // Check for required fields
    if (schema) {
      schema.columns
        .filter((c: any) => !c.nullable)
        .forEach((c: any) => {
          if (!Object.values(columnMappings).includes(c.name)) {
            missingRequired.push(c.name);
          }
        });
    }

    return {
      mappings: columnMappings,
      unmapped: unmappedColumns,
      missingRequired,
      suggestions: this.generateMappingSuggestions(unmappedColumns, schema),
    };
  }

  /**
   * Generate mapping suggestions for unmapped columns
   */
  private generateMappingSuggestions(
    unmappedColumns: string[],
    schema: any
  ): string[] {
    const suggestions: string[] = [];

    unmappedColumns.forEach((col) => {
      const colLower = col.toLowerCase();
      if (schema) {
        schema.columns.forEach((dbCol: any) => {
          const dbColLower = dbCol.name.toLowerCase();
          if (dbColLower.includes(colLower) || colLower.includes(dbColLower)) {
            suggestions.push(`Consider mapping "${col}" to "${dbCol.name}"`);
          }
        });
      }
    });

    return suggestions;
  }
}

// Export singleton instance
export const systemContext = SystemContextService.getInstance();
