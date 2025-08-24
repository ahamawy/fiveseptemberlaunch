import {
  extractDealDataWithOpenRouter,
  type ExtractedDealData,
} from "./openrouter.service";
import {
  DocumentProcessor,
  type ProcessedDocument,
} from "./document-processor.service";

export type { IngestParseResult } from "./ingest-core.service";
export {
  parseDocumentWithAI,
  buildLegacyProfileFromMapping,
  stageLegacyImport,
} from "./ingest-core.service";

// parseDocumentWithAI is exported from ingest-core.service

export async function parseFileWithAI(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  apiKey?: string
): Promise<ExtractedDealData> {
  // Process the document to extract text
  const processedDoc = await DocumentProcessor.processDocument(
    buffer,
    filename,
    mimeType
  );

  // Prepare text for AI with enhanced context
  const aiText = DocumentProcessor.prepareForAI(processedDoc);

  // Send to AI for extraction
  return await extractDealDataWithOpenRouter({ docText: aiText, apiKey });
}

// buildLegacyProfileFromMapping is exported from ingest-core.service

// stageLegacyImport is exported from ingest-core.service
