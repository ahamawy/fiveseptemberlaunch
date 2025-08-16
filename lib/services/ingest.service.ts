import { extractDealDataWithOpenRouter, type ExtractedDealData } from './openrouter.service';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { DocumentProcessor, type ProcessedDocument } from './document-processor.service';

export type IngestParseResult = {
  mapping: ExtractedDealData;
  plan: {
    create_profile: boolean;
    stage_fee_lines: number;
  };
};

export async function parseDocumentWithAI(docText: string, apiKey?: string): Promise<ExtractedDealData> {
  return await extractDealDataWithOpenRouter({ docText, apiKey });
}

export async function parseFileWithAI(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  apiKey?: string
): Promise<ExtractedDealData> {
  // Process the document to extract text
  const processedDoc = await DocumentProcessor.processDocument(buffer, filename, mimeType);
  
  // Prepare text for AI with enhanced context
  const aiText = DocumentProcessor.prepareForAI(processedDoc);
  
  // Send to AI for extraction
  return await extractDealDataWithOpenRouter({ docText: aiText, apiKey });
}

export function buildLegacyProfileFromMapping(mapping: ExtractedDealData): any {
  const unitPrice = mapping?.deal?.unit_price_usd ?? 1000;
  const partnerMgmt = mapping?.partner?.management_fee_percent ?? 0;
  const adminFee = mapping?.partner?.admin_fee_amount ?? 0;
  const pre = mapping?.deal?.valuation?.pre_money_purchase;
  const sell = mapping?.deal?.valuation?.pre_money_sell;
  const premiumPct = mapping?.deal?.premium_percent ?? (pre && sell ? ((sell - pre) / pre) * 100 : undefined);
  return {
    unit_price_usd: unitPrice,
    rounding: { units: 'FLOOR', precision: 0 },
    ordering: ['PREMIUM','STRUCTURING','MANAGEMENT','ADMIN'],
    components: {
      PREMIUM: premiumPct != null ? { method: 'PCT_OF_GROSS', percent: Number(premiumPct.toFixed(5)), direction: 'DEDUCTS_NET' } : undefined,
      STRUCTURING: { method: 'PCT_OF_GROSS', percent: 4, direction: 'ADDS_TRANSFER' },
      MANAGEMENT: { method: 'PCT_OF_GROSS', percent: 2, direction: 'ADDS_TRANSFER' },
      ADMIN: { method: 'FLAT_PER_TX', amount: adminFee, currency: 'USD', direction: 'ADDS_TRANSFER' }
    },
    partner: {
      management_fee: { method: 'PCT_OF_NET', percent: partnerMgmt }
    },
    valuation: pre && sell ? { purchase_pre_money: pre, sell_pre_money: sell, premium_percent_formula: '(sell - purchase)/purchase' } : undefined
  };
}

export async function stageLegacyImport(dealId: number, mapping: ExtractedDealData): Promise<number> {
  const rows = mapping.investor_fee_lines || [];
  if (!rows.length) return 0;
  const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
  const insertRows = rows.map(r => ({
    deal_id: dealId,
    investor_id: r.investor_id ?? null,
    investor_name: r.investor_name ?? null,
    gross_capital_usd: r.gross_capital_usd,
    discount_structuring_pct: r.discount_structuring_pct ?? 0,
    discount_management_pct: r.discount_management_pct ?? 0,
    discount_admin_pct: r.discount_admin_pct ?? 0
  }));
  const { error } = await (client as any)
    .schema('fees')
    .from('legacy_import')
    .insert(insertRows);
  if (error) throw new Error(error.message);
  return insertRows.length;
}


