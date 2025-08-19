# EQUITIE Bot Integration Guide

> For the canonical docs of each feature that the bot touches, see `FEATURES/<feature-code>-<feature-name>/README.md`. Fees canonical doc: `FEATURES/fees/README.md`.

## Overview

The EQUITIE bot is now a fully integrated chat interface that connects all the document processing, AI extraction, and admin tools into a unified workflow.

## Architecture

```
┌─────────────────┐
│  Chat Interface │ (/admin/chat)
│   - Messages    │
│   - File Upload │
│   - Quick Acts  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Chat API      │ (/api/admin/chat)
│   - Commands    │
│   - Context     │
│   - Routing     │
└────────┬────────┘
         │
         ├──────────────────────┐
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Document        │    │ OpenRouter AI   │
│ Processor       │    │ - GPT-4/5       │
│ - PDF           │    │ - Context       │
│ - Excel         │    │ - Extraction    │
│ - OCR           │    └─────────────────┘
└─────────────────┘             │
         │                      │
         └──────────┬───────────┘
                    ▼
         ┌─────────────────┐
         │ Existing Services│
         │ - Ingest        │
         │ - Fees          │
         │ - Supabase      │
         └─────────────────┘
                    │
                    ▼
         ┌─────────────────┐
         │ Admin Pages     │
         │ - Fee Profiles  │
         │ - Legacy Import │
         └─────────────────┘
```

## Integrated Workflow

### 1. Chat Entry Point

Users start at `/admin/chat` where they can:

- Type questions or commands
- Upload documents (PDF, Excel, Images, Text)
- Use quick action buttons

### 2. Document Processing

When a file is uploaded:

1. **Document Processor** extracts text based on file type
2. **AI Service** analyzes the extracted text with context
3. **Structured data** is extracted (fees, investors, deals)

### 3. AI Intelligence

The bot uses:

- **EQUITIE_BOT_CONTEXT.md** for domain knowledge
- **OpenRouter API** for natural language understanding
- **Existing services** for data operations

### 4. Actionable Results

The bot provides:

- **Extracted data** in JSON format
- **Direct links** to relevant admin pages
- **Suggested next steps** based on the data
- **Database operations** when requested

## Key Features

### Smart Commands

The chat recognizes commands like:

- "Extract fee profile from this document" → Parses and suggests profile
- "Calculate fees for Deal ID 1" → Queries DB and calculates
- "Stage import for Deal 1" → Prepares data for import
- "Show me the database schema" → Returns table structure

### Contextual Links

Based on conversation, the bot adds links:

- Extracted profile → Link to `/admin/fees/profiles`
- Investor data → Link to `/admin/fees/import`
- Deal information → Link to relevant admin page

### File Processing

Supports all formats through unified pipeline:

- **PDFs** → pdf-parse → text → AI
- **Excel** → xlsx → structured data → AI
- **Images** → tesseract OCR → text → AI
- **Text** → direct → AI

## Usage Examples

### Example 1: Term Sheet to Profile

```
User: [Uploads PDF term sheet]
User: "Extract the fee structure"

Bot: "I've extracted the following fee structure from the document:
- Premium: 3.77%
- Structuring: 4%
- Management: 2%
- Admin: $450

📝 Next Steps:
• [Open Fee Profiles](/admin/fees/profiles) to create this profile"

[Shows extracted JSON data]
```

### Example 2: Excel to Import

```
User: [Uploads investor Excel file]
User: "Parse and stage for Deal 1"

Bot: "Successfully parsed 25 investors from the Excel file.
Staged for Deal #1 with total capital of $1,453,750.

📝 Next Steps:
• [Open Legacy Import](/admin/fees/import) to review and apply"

[Shows parsed investor data]
```

### Example 3: Database Query

```
User: "Show me all active deals"

Bot: "I found 3 active deals in the database:
1. Groq Series E - $5.5B valuation
2. OpenAI Series F - $80B valuation
3. Anthropic Series C - $18B valuation

Would you like to see fee profiles for any of these?"
```

## Configuration

### Required Environment Variables

```env
# OpenRouter API Key (Required)
OPENROUTER_API_KEY=your-key-here

# Optional: Specify model
OPENROUTER_MODEL=openrouter/auto
```

### File Limits

- Maximum file size: 10MB
- Supported formats: PDF, XLSX, XLS, CSV, PNG, JPG, JPEG, TXT

## Testing the Integration

### Quick Test Flow

1. Open chat: http://localhost:3000/admin/chat
2. Upload `/test-documents/sample-term-sheet.txt`
3. Type: "Extract fee profile"
4. Bot extracts data and provides link
5. Click link to go to Fee Profiles page
6. Data is pre-filled and ready to save

### Command Tests

Try these commands in the chat:

- "Show database schema"
- "Calculate fees for Deal 1"
- "Create profile from this document" (with file)
- "Parse investor data" (with CSV)
- "What tables are in the fees schema?"

## Benefits of Integration

1. **Unified Interface**: Single chat for all operations
2. **Context Awareness**: Bot understands your documents and data
3. **Seamless Workflow**: Extracted data flows to admin pages
4. **Smart Routing**: Bot knows where to send you next
5. **File Flexibility**: Upload any document format
6. **Database Access**: Query and modify data through chat

## Troubleshooting

### "OpenRouter API key not configured"

Add `OPENROUTER_API_KEY` to `.env.local`

### "Failed to process file"

- Check file size (<10MB)
- Verify file format is supported
- For images, ensure good quality for OCR

### "No response from bot"

- Check dev server is running
- Verify OpenRouter API key is valid
- Check console for errors

## Next Steps

The EQUITIE bot can be extended with:

- Streaming responses for real-time feedback
- Voice input/output
- Multi-turn conversations with memory
- Direct database modifications
- Automated workflow execution
- Integration with more admin pages

The bot is now your AI assistant for all fee management and document processing tasks!
