import pdf from 'pdf-parse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export type ProcessedDocument = {
  text: string;
  metadata: {
    type: 'pdf' | 'excel' | 'image' | 'text';
    originalName: string;
    pageCount?: number;
    sheets?: string[];
    confidence?: number;
  };
  structuredData?: any;
};

export class DocumentProcessor {
  /**
   * Process any document type and extract text
   */
  static async processDocument(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<ProcessedDocument> {
    const lowerName = filename.toLowerCase();
    
    // Determine processing method based on file type
    if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
      return await this.processPDF(buffer, filename);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel' ||
      lowerName.endsWith('.xlsx') ||
      lowerName.endsWith('.xls') ||
      lowerName.endsWith('.csv')
    ) {
      return await this.processExcel(buffer, filename);
    } else if (
      mimeType.startsWith('image/') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg')
    ) {
      return await this.processImage(buffer, filename);
    } else {
      // Assume text/plain
      return {
        text: buffer.toString('utf-8'),
        metadata: {
          type: 'text',
          originalName: filename
        }
      };
    }
  }

  /**
   * Extract text from PDF
   */
  static async processPDF(buffer: Buffer, filename: string): Promise<ProcessedDocument> {
    try {
      const data = await pdf(buffer);
      
      return {
        text: data.text,
        metadata: {
          type: 'pdf',
          originalName: filename,
          pageCount: data.numpages
        },
        structuredData: {
          info: data.info,
          metadata: data.metadata
        }
      };
    } catch (error) {
      throw new Error(`Failed to process PDF: ${error}`);
    }
  }

  /**
   * Process Excel/CSV files
   */
  static async processExcel(buffer: Buffer, filename: string): Promise<ProcessedDocument> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      
      let allText = '';
      const structuredData: any = {};
      
      // Process each sheet
      for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON for structured data
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        structuredData[sheetName] = jsonData;
        
        // Convert to CSV for text extraction
        const csvText = XLSX.utils.sheet_to_csv(sheet);
        allText += `\n=== Sheet: ${sheetName} ===\n${csvText}\n`;
      }
      
      return {
        text: allText.trim(),
        metadata: {
          type: 'excel',
          originalName: filename,
          sheets: sheetNames
        },
        structuredData
      };
    } catch (error) {
      throw new Error(`Failed to process Excel file: ${error}`);
    }
  }

  /**
   * Process images with OCR
   */
  static async processImage(buffer: Buffer, filename: string): Promise<ProcessedDocument> {
    try {
      // Preprocess image for better OCR results
      const processedBuffer = await sharp(buffer)
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();
      
      // Perform OCR
      const result = await Tesseract.recognize(processedBuffer, 'eng', {
        logger: (m) => {
          // Optional: Log OCR progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      return {
        text: result.data.text,
        metadata: {
          type: 'image',
          originalName: filename,
          confidence: result.data.confidence
        },
        structuredData: {
          words: result.data.words,
          lines: result.data.lines,
          paragraphs: result.data.paragraphs
        }
      };
    } catch (error) {
      throw new Error(`Failed to process image: ${error}`);
    }
  }

  /**
   * Extract tables from text (useful for all document types)
   */
  static extractTables(text: string): any[] {
    const tables: any[] = [];
    const lines = text.split('\n');
    
    let currentTable: string[] = [];
    let inTable = false;
    
    for (const line of lines) {
      // Simple heuristic: lines with multiple tabs or pipes might be table rows
      if (line.includes('\t') || line.includes('|') || line.match(/\s{2,}/)) {
        inTable = true;
        currentTable.push(line);
      } else if (inTable && line.trim() === '') {
        // Empty line might signal end of table
        if (currentTable.length > 1) {
          tables.push(this.parseTable(currentTable));
        }
        currentTable = [];
        inTable = false;
      }
    }
    
    // Don't forget the last table
    if (currentTable.length > 1) {
      tables.push(this.parseTable(currentTable));
    }
    
    return tables;
  }

  /**
   * Parse a table from text lines
   */
  private static parseTable(lines: string[]): any {
    const rows = lines.map(line => {
      // Split by tabs, pipes, or multiple spaces
      return line
        .split(/\t|\||\s{2,}/)
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
    });
    
    if (rows.length === 0) return null;
    
    // Assume first row is headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return { headers, data };
  }

  /**
   * Extract financial data patterns
   */
  static extractFinancialData(text: string): any {
    const patterns = {
      amounts: /\$[\d,]+(?:\.\d{2})?/g,
      percentages: /\d+(?:\.\d+)?%/g,
      dates: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
      dealIds: /deal[\s#:]*(\d+)/gi,
      investorNames: /^[A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/gm
    };
    
    const extracted: any = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        extracted[key] = matches;
      }
    }
    
    return extracted;
  }

  /**
   * Prepare text for AI processing
   */
  static prepareForAI(processedDoc: ProcessedDocument): string {
    let aiText = processedDoc.text;
    
    // Add structured data context if available
    if (processedDoc.structuredData) {
      if (processedDoc.metadata.type === 'excel') {
        aiText += '\n\n=== STRUCTURED DATA ===\n';
        for (const [sheetName, data] of Object.entries(processedDoc.structuredData)) {
          aiText += `\nSheet: ${sheetName}\n`;
          aiText += JSON.stringify(data, null, 2);
        }
      }
    }
    
    // Extract and append any tables found
    const tables = this.extractTables(processedDoc.text);
    if (tables.length > 0) {
      aiText += '\n\n=== EXTRACTED TABLES ===\n';
      tables.forEach((table, index) => {
        aiText += `\nTable ${index + 1}:\n`;
        aiText += JSON.stringify(table, null, 2);
      });
    }
    
    // Extract and append financial data
    const financialData = this.extractFinancialData(processedDoc.text);
    if (Object.keys(financialData).length > 0) {
      aiText += '\n\n=== EXTRACTED FINANCIAL DATA ===\n';
      aiText += JSON.stringify(financialData, null, 2);
    }
    
    return aiText;
  }
}