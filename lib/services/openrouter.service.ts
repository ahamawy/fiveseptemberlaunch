import { ContextAggregator } from "./context-aggregator.service";

export type ExtractedDealData = {
  deal?: {
    deal_id?: number;
    name?: string;
    unit_price_usd?: number;
    valuation?: {
      pre_money_purchase?: number;
      pre_money_sell?: number;
    };
    premium_percent?: number;
    premium_formula?: string;
  };
  partner?: {
    management_fee_percent?: number;
    admin_fee_amount?: number;
    subscription_fee_percent?: number;
    performance_fee_percent?: number;
  };
  profile?: any;
  investor_fee_lines?: Array<{
    investor_name?: string;
    investor_id?: number;
    gross_capital_usd: number;
    discount_structuring_pct?: number;
    discount_management_pct?: number;
    discount_admin_pct?: number;
  }>;
};

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/auto";

async function buildPrompt(docText: string): Promise<string> {
  const fullContext = await ContextAggregator.loadFullContext();
  return [
    "You are EQUITIE BACKEND BOT with complete schema and fee engine context. Extract structured data.",
    "Output strictly as minified JSON matching ExtractedDealData. Use discounts as negative fee lines.",
    "CONTEXT START",
    fullContext,
    "CONTEXT END",
    "Document:\n",
    docText,
  ].join("\n");
}

export async function extractDealDataWithOpenRouter(params: {
  docText: string;
  apiKey?: string;
  model?: string;
}): Promise<ExtractedDealData> {
  const { docText, apiKey, model } = params;
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("Missing OpenRouter API key. Set OPENROUTER_API_KEY.");
  }

  // Provide project context to improve extractions
  let context = "";
  try {
    // Dynamically import to avoid bundling issues
    const res = await import("fs/promises");
    const path = await import("path");
    const ctxPath = path.resolve(
      process.cwd(),
      "DOCS",
      "EQUITIE_BOT_CONTEXT.md"
    );
    context = await res.readFile(ctxPath, "utf8");
  } catch {}

  const prompt = await buildPrompt(docText);
  const body = {
    model: model || DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a precise extraction engine that outputs only JSON.",
      },
      context
        ? { role: "system", content: `PROJECT CONTEXT:\n${context}` }
        : undefined,
      { role: "user", content: prompt },
    ],
    temperature: 0,
    top_p: 0.1,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  } as any;

  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://equitie.local",
      "X-Title": "EquiTie Backend Extraction",
    },
    body: JSON.stringify(body),
  } as any;

  const res = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    init
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${text}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(content) as ExtractedDealData;
  } catch (e) {
    // Fallback: attempt to extract JSON substring
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as ExtractedDealData;
    }
    throw new Error("Failed to parse JSON from OpenRouter response");
  }
}
