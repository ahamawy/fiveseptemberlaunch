import type { RequestInit } from 'node-fetch';

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

const DEFAULT_MODEL = 'openrouter/auto';

function buildPrompt(docText: string): string {
  return [
    'You are EQUITIE BACKEND BOT. Extract structured deal and fee data from the document below.',
    'Output strictly as minified JSON, no prose. Schema:',
    '{"deal":{"deal_id":number?,"name":string?,"unit_price_usd":number?,"valuation":{"pre_money_purchase":number?,"pre_money_sell":number?},"premium_percent":number?,"premium_formula":string?},',
    ' "partner":{"management_fee_percent":number?,"admin_fee_amount":number?,"subscription_fee_percent":number?,"performance_fee_percent":number?},',
    ' "profile":object?,',
    ' "investor_fee_lines":[{"investor_name":string?,"investor_id":number?,"gross_capital_usd":number,"discount_structuring_pct":number?,"discount_management_pct":number?,"discount_admin_pct":number?}]}
    ',
    'Document:\n',
    docText
  ].join('\n');
}

export async function extractDealDataWithOpenRouter(params: {
  docText: string;
  apiKey?: string;
  model?: string;
}): Promise<ExtractedDealData> {
  const { docText, apiKey, model } = params;
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('Missing OpenRouter API key. Set OPENROUTER_API_KEY.');
  }

  const body = {
    model: model || DEFAULT_MODEL,
    messages: [
      { role: 'system', content: 'You are a precise extraction engine that outputs only JSON.' },
      { role: 'user', content: buildPrompt(docText) }
    ],
    temperature: 0,
    response_format: { type: 'json_object' }
  } as any;

  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://equitie.local',
      'X-Title': 'EquiTie Backend Extraction'
    },
    body: JSON.stringify(body)
  } as any;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${text}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(content) as ExtractedDealData;
  } catch (e) {
    // Fallback: attempt to extract JSON substring
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as ExtractedDealData;
    }
    throw new Error('Failed to parse JSON from OpenRouter response');
  }
}


