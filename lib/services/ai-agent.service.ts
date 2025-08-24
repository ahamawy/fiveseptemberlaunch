import { ColumnMapper } from "./column-mapper.service";
import { extractDealDataWithOpenRouter } from "./openrouter.service";
import { createLogger } from "@/lib/utils/improved-logger";

const logger = createLogger("AIAgentService");

// Type definitions
interface CSVParseResult {
  columns: string[];
  rows: string[][];
}

interface ProcessedCSVResult {
  success: boolean;
  data?: unknown;
  columns?: string[];
  message?: string;
  detectedColumns?: string[];
  suggestedMappings?: unknown;
}

interface CSVAnalysisResult {
  type:
    | "investors"
    | "fees"
    | "transactions"
    | "allocations"
    | "portfolio"
    | "deals"
    | "unknown";
  columns: string[];
  rowCount: number;
  summary: string;
  suggestions: string[];
  interpretation?: string;
  columnMappings?: Record<string, string>;
  dataQuality?: {
    issues: string[];
    validationErrors: string[];
    duplicates: number;
  };
  importSQL?: string;
  businessInsights?: string[];
  metrics?: {
    totalRecords: number;
    totalValue: number;
    averageValue: number;
  };
}

interface InvestorData {
  full_name: string;
  primary_email: string;
  investor_type: string;
  commitment_amount: number;
  paid_amount: number;
  ownership_percentage: number;
  status: string;
  kyc_status: string;
  created_at: string;
}

interface CSVRow {
  [key: string]: string | number | undefined;
}

function parseCSVWithColumns(content: string): CSVParseResult {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { columns: [], rows: [] };
  const columns = lines[0].split(",").map((s) => s.trim());
  const rows = lines.slice(1).map((l) => l.split(",").map((s) => s.trim()));
  return { columns, rows };
}

export class AIAgentService {
  static async processCSVWithSchema(
    content: string,
    filename: string
  ): Promise<ProcessedCSVResult> {
    const { columns, rows } = parseCSVWithColumns(content);
    const sample = rows
      .slice(0, 10)
      .map((r) => r.join(","))
      .join("\n");
    const docText = `CSV FILE: ${filename}\nHEADERS: ${columns.join(
      ", "
    )}\nSAMPLE:\n${sample}`;

    try {
      const mapping = await extractDealDataWithOpenRouter({ docText });
      const mappingResult = mapping as {
        investor_fee_lines?: unknown;
        deal?: unknown;
      };
      if (mappingResult?.investor_fee_lines || mappingResult?.deal) {
        return { success: true, data: mapping, columns };
      }
    } catch {}

    // Fallback – suggest mappings
    const suggested = ColumnMapper.mapCSVToSchema(columns, "investors");
    return {
      success: false,
      message: "CSV Analysis Results",
      detectedColumns: columns,
      suggestedMappings: suggested,
      data: { rows: rows.slice(0, 20) },
    };
  }
}

import { createClient } from "@supabase/supabase-js";
import { systemContext } from "./system-context.service";
import { knowledgeBase } from "./knowledge-base.service";

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

// Parse CSV content into structured data
export function parseCSV(content: string): CSVRow[] {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  // Parse headers
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  // Parse data rows
  const data: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    data.push(row);
  }

  return data;
}

// Analyze CSV data using GPT-5 to understand what it contains
export async function analyzeCSVDataWithAI(
  data: CSVRow[]
): Promise<CSVAnalysisResult> {
  if (!data || data.length === 0) {
    return {
      type: "unknown",
      columns: [],
      rowCount: 0,
      summary: "No data found",
      suggestions: [],
    };
  }

  const columns = Object.keys(data[0]);
  const sampleData = data.slice(0, 3);

  // Use GPT-5 to understand the data with full system context
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";

  // Get system context for intelligent analysis
  const csvContext = systemContext.getCSVAnalysisContext(columns);
  const mappingAnalysis = systemContext.analyzeCSVMapping(columns, "investors");

  // Search knowledge base for relevant context
  const kbSearch = await knowledgeBase.ragSearch({
    query: `CSV import ${columns.slice(0, 3).join(" ")}`,
    strategy: "hybrid",
    limit: 3,
  });

  if (apiKey) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: csvContext,
              },
              {
                role: "user",
                content: `Analyze this CSV data for the EQUITIE platform:

CSV COLUMNS: ${columns.join(", ")}

SAMPLE DATA (first 3 rows):
${JSON.stringify(sampleData, null, 2)}

INITIAL MAPPING ANALYSIS:
- Mapped columns: ${JSON.stringify(mappingAnalysis.mappings, null, 2)}
- Unmapped columns: ${mappingAnalysis.unmapped.join(", ")}
- Missing required fields: ${mappingAnalysis.missingRequired.join(", ")}

KNOWLEDGE BASE CONTEXT:
${kbSearch.context}

RELEVANT SUGGESTIONS:
${kbSearch.suggestions.join("\n")}

Provide a comprehensive analysis with:
1. Exact data type (investors, deals, transactions, fees, portfolio)
2. Column mappings to Supabase schema
3. Data validation issues
4. SQL import statements
5. Business insights

Respond with JSON:
{
  "type": "investors|deals|transactions|fees|portfolio|unknown",
  "interpretation": "detailed analysis of the data",
  "columnMappings": {"csv_column": "db_table.db_column"},
  "dataQuality": {
    "issues": ["list of issues"],
    "validationErrors": ["validation problems"],
    "duplicates": 0
  },
  "importSQL": "INSERT INTO ... statement",
  "businessInsights": ["key insights from the data"],
  "suggestions": ["actionable next steps"],
  "metrics": {
    "totalRecords": 0,
    "totalValue": 0,
    "averageValue": 0
  }
}`,
              },
            ],
            temperature: 0.1,
            max_tokens: 2000,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const analysis = JSON.parse(
          result?.choices?.[0]?.message?.content || "{}"
        );

        // Calculate metrics if not provided by AI
        let totalValue = 0;
        if (analysis.type === "investors" && data.length > 0) {
          totalValue = data.reduce((sum, row) => {
            const raw = row["Commitment"] ?? row["commitment_amount"] ?? 0;
            const commitment =
              typeof raw === "number" ? raw : parseFloat(raw || "0");
            return sum + (isNaN(commitment) ? 0 : commitment);
          }, 0);
        }

        return {
          type: analysis.type || "unknown",
          columns,
          rowCount: data.length,
          summary:
            analysis.interpretation || `Data with ${data.length} records`,
          suggestions: analysis.suggestions || [
            "Import to Supabase",
            "Analyze further",
          ],
          interpretation: analysis.interpretation,
          columnMappings: analysis.columnMappings,
          dataQuality: analysis.dataQuality,
          importSQL: analysis.importSQL,
          businessInsights: analysis.businessInsights,
          metrics: analysis.metrics || {
            totalRecords: data.length,
            totalValue: totalValue,
            averageValue: totalValue / data.length,
          },
        };
      }
    } catch (error) {
      logger.error("GPT-5 analysis failed:", error);
    }
  }

  // Fallback to basic analysis if GPT-5 fails
  return analyzeCSVData(data);
}

// Original pattern-based analysis (kept as fallback)
export function analyzeCSVData(data: CSVRow[]): {
  type: "investors" | "fees" | "transactions" | "unknown";
  columns: string[];
  rowCount: number;
  summary: string;
  suggestions: string[];
} {
  if (!data || data.length === 0) {
    return {
      type: "unknown",
      columns: [],
      rowCount: 0,
      summary: "No data found",
      suggestions: [],
    };
  }

  const columns = Object.keys(data[0]);
  const columnLower = columns.map((c) => c.toLowerCase());

  let type: "investors" | "fees" | "transactions" | "unknown" = "unknown";
  let summary = "";
  const suggestions = [];

  // Detect investor data
  if (
    columnLower.some((c) => c.includes("investor") || c.includes("name")) &&
    columnLower.some((c) => c.includes("commit") || c.includes("amount"))
  ) {
    type = "investors";
    summary = `Investor data with ${data.length} records`;
    suggestions.push("Import investors to Supabase investors table");
    suggestions.push("Calculate total commitments");
    suggestions.push("Generate fee calculations");
  }
  // Detect fee data
  else if (
    columnLower.some(
      (c) =>
        c.includes("fee") || c.includes("carry") || c.includes("management")
    )
  ) {
    type = "fees";
    summary = `Fee data with ${data.length} records`;
    suggestions.push("Apply fee profile to deals");
    suggestions.push("Calculate fee distributions");
  }
  // Detect transaction data
  else if (
    columnLower.some(
      (c) =>
        c.includes("transaction") ||
        c.includes("payment") ||
        c.includes("distribution")
    )
  ) {
    type = "transactions";
    summary = `Transaction data with ${data.length} records`;
    suggestions.push("Import transactions to Supabase");
    suggestions.push("Update investor balances");
  }

  return {
    type,
    columns,
    rowCount: data.length,
    summary,
    suggestions,
  };
}

// Transform and validate investor data for Supabase
export function transformInvestorData(data: any[]): any[] {
  return data.map((row) => {
    // Map common CSV column names to Supabase schema
    const transformed: any = {
      full_name: String(
        row["Investor Name"] || row["Name"] || row["investor_name"] || ""
      ),
      primary_email: String(
        row["Email"] ||
          row["email"] ||
          `${String(row["Name"] || "")
            .toLowerCase()
            .replace(/\s+/g, ".")}@example.com`
      ),
      investor_type: String(
        row["Type"] || row["Investor Type"] || "individual"
      ),
      commitment_amount: parseFloat(
        String(
          row["Commitment"] || row["Committed Amount"] || row["Amount"] || "0"
        )
      ),
      paid_amount: parseFloat(String(row["Paid"] || row["Paid Amount"] || "0")),
      ownership_percentage: parseFloat(
        String(row["Ownership %"] || row["Percentage"] || "0")
      ),
      status: "active",
      kyc_status: "pending",
      created_at: new Date().toISOString(),
    };

    // Clean up the data
    if (!transformed.full_name) {
      transformed.full_name = "Unknown Investor";
    }

    return transformed;
  });
}

// Main AI Agent that processes files and updates Supabase
export class EquitieAIAgent {
  private supabase = getSupabaseClient();

  async processCSVFile(
    content: string,
    filename: string
  ): Promise<{
    success: boolean;
    data: any;
    message: string;
    actions?: string[];
  }> {
    try {
      // Parse CSV
      const parsedData = parseCSV(content);
      const analysis = await analyzeCSVDataWithAI(parsedData);

      if (analysis.type === "unknown") {
        return {
          success: false,
          data: analysis,
          message: "Could not determine the type of data in this CSV file.",
          actions: ["Please specify what this data represents"],
        };
      }

      // Handle investor data
      if (analysis.type === "investors") {
        const transformedData = transformInvestorData(parsedData);

        return {
          success: true,
          data: {
            analysis,
            preview: transformedData.slice(0, 5),
            totalCommitment: transformedData.reduce(
              (sum, inv) => sum + inv.commitment_amount,
              0
            ),
            investorCount: transformedData.length,
          },
          message: `Found ${
            transformedData.length
          } investors with total commitments of $${transformedData
            .reduce((sum, inv) => sum + inv.commitment_amount, 0)
            .toLocaleString()}`,
          actions: [
            "Import all investors to Supabase",
            "Update existing investor records",
            "Calculate fee distributions",
            "Generate investor reports",
          ],
        };
      }

      return {
        success: true,
        data: {
          analysis,
          preview: parsedData.slice(0, 5),
        },
        message: `Analyzed ${analysis.type} data with ${analysis.rowCount} records`,
        actions: analysis.suggestions,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Error processing file: ${error.message}`,
      };
    }
  }

  async importInvestorsToSupabase(investors: InvestorData[]): Promise<{
    success: boolean;
    message: string;
    imported: number;
    errors: Array<{ investor: string; error: string }>;
  }> {
    const errors: Array<{ investor: string; error: string }> = [];
    let imported = 0;

    for (const investor of investors) {
      try {
        const { data, error } = await this.supabase.from("investors").upsert(
          {
            ...investor,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "primary_email",
          }
        );

        if (error) {
          errors.push({ investor: investor.full_name, error: error.message });
        } else {
          imported++;
        }
      } catch (err) {
        errors.push({
          investor: investor.full_name,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return {
      success: errors.length === 0,
      message: `Imported ${imported} investors${
        errors.length > 0 ? ` with ${errors.length} errors` : " successfully"
      }`,
      imported,
      errors,
    };
  }

  async querySupabase(
    query: string
  ): Promise<{
    count?: number;
    total?: number;
    data?: unknown;
    message: string;
  }> {
    // Parse the natural language query and execute Supabase operations
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("count") && lowerQuery.includes("investor")) {
      const { count } = await this.supabase
        .from("investors")
        .select("*", { count: "exact", head: true });
      const countNumber = typeof count === "number" ? count : undefined;
      return {
        count: countNumber,
        message: `There are ${countNumber ?? 0} investors in the database`,
      };
    }

    if (lowerQuery.includes("total") && lowerQuery.includes("commitment")) {
      const { data } = await this.supabase
        .from("investors")
        .select("commitment_amount");
      const total =
        data?.reduce((sum, inv) => sum + (inv.commitment_amount || 0), 0) || 0;
      return {
        total,
        message: `Total commitments: $${total.toLocaleString()}`,
      };
    }

    if (lowerQuery.includes("list") && lowerQuery.includes("investor")) {
      const { data } = await this.supabase
        .from("investors")
        .select("full_name, primary_email, commitment_amount")
        .limit(10);
      return { data, message: `Showing ${data?.length || 0} investors` };
    }

    return {
      message:
        "Query not understood. Try asking about investor counts, total commitments, or listing investors.",
    };
  }
}

// GPT-5 style reasoning for complex operations
export async function reasonAboutData(
  data: CSVRow[],
  context: string,
  apiKey: string
): Promise<{
  insights: string[];
  recommendations: string[];
  risks: string[];
  nextSteps: string[];
}> {
  // Call OpenRouter with advanced reasoning prompt
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are an advanced GPT-5 reasoning agent for the EQUITIE private equity platform. Use chain-of-thought reasoning to analyze data and provide deep insights. Consider multiple perspectives, identify patterns, and provide actionable intelligence.`,
          },
          {
            role: "user",
            content: `Context: ${context}\n\nData Summary: ${JSON.stringify(
              data.slice(0, 5)
            )}\n\nProvide deep analysis with insights, recommendations, risks, and next steps. Use step-by-step reasoning.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    }
  );

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content || "";

  // Parse the AI response into structured format
  return {
    insights: extractSection(content, "insights") || [
      "Data analyzed successfully",
    ],
    recommendations: extractSection(content, "recommendations") || [
      "Import data to Supabase",
      "Validate all records",
    ],
    risks: extractSection(content, "risks") || [
      "Ensure data accuracy before import",
    ],
    nextSteps: extractSection(content, "next steps") || [
      "Review the data",
      "Confirm import action",
    ],
  };
}

function extractSection(content: string, section: string): string[] {
  const regex = new RegExp(
    `${section}:?([^\\n]*(?:\\n(?!\\w+:)[^\\n]*)*)`,
    "i"
  );
  const match = content.match(regex);
  if (match && match[1]) {
    return match[1]
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter((line) => line.length > 0);
  }
  return [];
}
