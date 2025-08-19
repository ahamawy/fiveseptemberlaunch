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

  static async loadFullContext(): Promise<string> {
    // Simplified - load single master context file
    const masterContext = await safeRead('MASTER_CONTEXT.md');
    return trimTo(masterContext, 100_000); // Hard limit for GPT
  }
}


