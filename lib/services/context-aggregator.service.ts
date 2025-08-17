import fs from 'fs/promises';
import path from 'path';

async function safeRead(filePath: string): Promise<string> {
  try {
    const full = path.resolve(process.cwd(), filePath);
    return await fs.readFile(full, 'utf8');
  } catch {
    return '';
  }
}

function trimTo(text: string, max = 120_000): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '\n\n[...truncated]';
}

export class ContextAggregator {
  static async loadCSVExamples(): Promise<string> {
    return await safeRead('DOCS/CSV_FORMATS.md');
  }

  static async loadSchemaAsMarkdown(): Promise<string> {
    // Fallback: include raw TypeScript schema file if markdown not available
    const tsSchema = await safeRead('lib/knowledge/supabase-schema.ts');
    if (!tsSchema) return '';
    return '```typescript\n' + trimTo(tsSchema, 60_000) + '\n```';
  }

  static async loadFullContext(): Promise<string> {
    const parts: string[] = [];
    parts.push(await safeRead('DOCS/EQUITIE_BOT_CONTEXT.md'));
    parts.push(await safeRead('ARCHON_FEE_ENGINE_CONTEXT.md'));
    parts.push(await safeRead('LEGACY_DEAL_ENGINE_DOCS.md'));
    parts.push(await safeRead('DB/feature_tables_map.md'));
    parts.push(await this.loadSchemaAsMarkdown());
    parts.push(await this.loadCSVExamples());
    return trimTo(parts.filter(Boolean).join('\n\n=== NEXT CONTEXT ===\n\n'), 140_000);
  }
}


