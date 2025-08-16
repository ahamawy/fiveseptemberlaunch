# AI-Powered Fee Extraction Testing Guide

## Overview
This guide covers testing the multi-format document ingestion system that processes PDFs, Excel files, images, and text documents to extract fee profiles and investor data.

## Prerequisites

### 1. Environment Setup
```bash
# Required: Set OpenRouter API key in .env.local
OPENROUTER_API_KEY=your-api-key-here

# Get your key from: https://openrouter.ai/keys
```

### 2. Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 3. Access Admin Tools
- Open Dev Menu (bottom-right corner)
- Navigate to "Admin Tools" section
- Available pages:
  - Fee Profiles: `/admin/fees/profiles`
  - Legacy Import: `/admin/fees/import`

## Feature Testing Checklist

### ✅ Dev Menu Accessibility
- [x] Admin pages added to DevToolbar
- [x] Fee Profiles link works
- [x] Legacy Import link works
- [x] Icons display correctly

### ✅ Document Processing Libraries
- [x] pdf-parse installed
- [x] xlsx installed
- [x] tesseract.js installed
- [x] sharp installed
- [x] multer installed

### ✅ File Upload UI
- [x] Drag-and-drop zone functional
- [x] File type validation
- [x] Size limit enforcement (10MB)
- [x] Progress indicators
- [x] Error messages display

## Testing Workflows

### Test 1: PDF Term Sheet → Fee Profile

**Steps:**
1. Navigate to `/admin/fees/profiles`
2. Open "Extract profile from document (AI)"
3. Upload a PDF term sheet
4. Wait for processing
5. Click "Parse & Prefill"
6. Verify extracted data:
   - Deal ID populated
   - Fee percentages correct
   - JSON configuration valid
7. Click "Create Profile"

**Expected Result:**
- Profile created with correct fee structure
- Premium, structuring, management, admin fees extracted

### Test 2: Excel Investor List → Import

**Steps:**
1. Navigate to `/admin/fees/import`
2. Open "Parse document with AI and stage"
3. Enter Deal ID: 1
4. Upload Excel file with investor data
5. Wait for processing
6. Click "Parse & Stage"
7. Review preview table
8. Click "Apply Import"

**Expected Result:**
- Investor data parsed correctly
- Discounts applied properly
- Calculations match expected totals

### Test 3: Image Screenshot → Data Extraction

**Steps:**
1. Take screenshot of fee table
2. Save as PNG/JPG
3. Upload to either admin page
4. Wait for OCR processing
5. Verify extracted text

**Expected Result:**
- Text extracted from image
- Table structure preserved
- Numbers and percentages accurate

### Test 4: Direct Text Input

**Steps:**
1. Copy term sheet text
2. Paste into text area (Option 2)
3. Click "Parse & Prefill"
4. Verify extraction

**Expected Result:**
- Same as file upload
- AI extracts structured data

## File Format Support

### Supported Formats
| Format | Extension | Use Case | Processing Method |
|--------|-----------|----------|-------------------|
| PDF | .pdf | Term sheets, agreements | pdf-parse |
| Excel | .xlsx, .xls | Investor lists, calculations | xlsx |
| CSV | .csv | Structured data | xlsx |
| Images | .png, .jpg, .jpeg | Screenshots, scanned docs | tesseract.js OCR |
| Text | .txt | Plain text documents | Direct parsing |

### File Size Limits
- Maximum: 10MB per file
- Recommended: <5MB for faster processing
- OCR works best with images <2MB

## Sample Test Data

### Location
`/test-documents/`
- `sample-term-sheet.txt` - Groq Series E terms
- `sample-investor-list.csv` - 10 test investors
- `README.md` - Test file documentation

### Using Existing Data
1. **Groq Deal Profile**: `/groq-deal-profile.json`
   - Complete fee configuration
   - Copy and paste into JSON field

2. **Groq Investors**: `/groq-investors.csv`
   - 25 real investor allocations
   - Expected totals provided

## API Testing

### Upload Endpoint
```bash
curl -X POST http://localhost:3000/api/admin/ingest/upload \
  -F "file=@test-documents/sample-term-sheet.txt" \
  -F "purpose=profile"
```

### Parse Endpoint
```bash
curl -X POST http://localhost:3000/api/admin/ingest/parse \
  -H "Content-Type: application/json" \
  -d '{"doc_text": "Deal ID: 1..."}'
```

## Troubleshooting

### Common Issues

#### 1. "Missing OpenRouter API key"
**Solution:** Add `OPENROUTER_API_KEY` to `.env.local`

#### 2. "File too large"
**Solution:** Reduce file size to under 10MB

#### 3. OCR not working
**Solution:** 
- Ensure image is clear and high contrast
- Try preprocessing (grayscale, sharpen)
- Check tesseract.js is installed

#### 4. Excel parsing fails
**Solution:**
- Verify file format (xlsx/xls/csv)
- Check for corrupted file
- Ensure proper column headers

#### 5. AI extraction incorrect
**Solution:**
- Check bot context file exists: `DOCS/EQUITIE_BOT_CONTEXT.md`
- Verify OpenRouter service is running
- Review extracted text format

## Performance Expectations

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| PDF parsing | 1-3 seconds | Depends on pages |
| Excel parsing | <1 second | Fast for most files |
| OCR processing | 5-15 seconds | Varies with image size |
| AI extraction | 2-5 seconds | OpenRouter API call |
| Database staging | <1 second | Supabase insert |

## Security Considerations

1. **API Keys**: Never commit API keys to git
2. **File Validation**: Always validate file types
3. **Size Limits**: Enforce to prevent DOS
4. **Sanitization**: Clean extracted data before DB insert
5. **Error Handling**: Don't expose internal errors

## Next Steps

### Enhancements
- [ ] Add batch file processing
- [ ] Implement progress bars for OCR
- [ ] Add file preview before processing
- [ ] Support more document formats
- [ ] Improve OCR accuracy with preprocessing

### Testing Coverage
- [ ] Unit tests for document processor
- [ ] Integration tests for API endpoints
- [ ] E2E tests with Playwright
- [ ] Load testing for large files
- [ ] Security testing for file uploads

## Support

For issues or questions:
1. Check error messages in browser console
2. Review server logs in terminal
3. Verify all dependencies installed
4. Ensure API keys are configured
5. Test with sample files first

## Summary

The AI-powered ingestion system successfully:
- ✅ Processes multiple file formats (PDF, Excel, Images, Text)
- ✅ Extracts structured data using AI
- ✅ Integrates with existing admin UI
- ✅ Provides clear user feedback
- ✅ Handles errors gracefully
- ✅ Accessible from dev menu
- ✅ Works with Supabase backend

Ready for production testing with real documents!