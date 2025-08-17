# Equitie Investor Portal with ARCHON Fee Engine

## 🚀 Quick Start

```bash
npm install
npm run dev   # http://localhost:3000
```

## ✅ Status

- ✅ All 25 Playwright tests passing
- ✅ Supabase fully integrated
- ✅ Mock/Production modes working
- ✅ ARCHON Fee Engine operational
- ✅ EQUITIE Bot AI assistant active

## 🎯 Key Features

### Investor Portal
- `/investor-portal/dashboard` - Main dashboard with portfolio metrics
- `/investor-portal/portfolio` - Holdings and performance
- `/investor-portal/transactions` - Transaction history
- `/investor-portal/deals` - Available investment opportunities
- `/investor-portal/documents` - Legal documents and reports

### Admin Tools
- `/admin/chat` - EQUITIE Bot with AI-powered data ingestion
- `/admin/fees/profiles` - Fee profile management
- `/admin/fees/import` - CSV fee import with preview

### ARCHON Fee Engine
- Precedence-based fee ordering
- Basis calculations (GROSS, NET, NET_AFTER_PREMIUM)
- Discounts as negative amounts
- Partner fee exclusion
- Full audit trail and validation

## 🔧 Environment Setup

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_USE_MOCK_DATA=false         # true for mock mode
OPENROUTER_API_KEY=your-openrouter-key  # For AI features
OPENROUTER_MODEL=openai/gpt-5           # Optional, defaults to auto
```

## 📚 Documentation

### Core Documentation
- **Main Guide**: `CLAUDE.md` - Complete project context
- **Fee Engine**: `ARCHON_FEE_ENGINE_CONTEXT.md` - Fee calculation system
- **AI Bot**: `DOCS/EQUITIE_BOT_CONTEXT.md` - Chat interface guide
- **Branding**: `BRANDING_SYSTEM_DOCUMENTATION.md` - Design system

### Quick References
- **IDE Setup**: `.cursorrules`, `.vscode/settings.json`
- **Legacy Fees**: `LEGACY_DEAL_ENGINE_DOCS.md`
- **API Routes**: See `CLAUDE.md` for complete list

## 🧪 Testing

```bash
npx playwright test              # Run all tests
npx playwright test --ui         # Interactive mode
npx playwright test --headed     # See browser
npm run test:fees               # Fee engine tests
```

## 💬 EQUITIE Bot Commands

### Chat Interface (`/admin/chat`)
```
"Calculate fees for deal 1 with $1M investment"
"Show fee schedule for deal 1"
"Validate fee configuration"
"Import this CSV to Supabase"
"Analyze investor commitments"
"Generate fee report"
```

### Supported File Types
- **CSV**: Investor data, fee schedules, transactions
- **PDF**: LPAs, fee schedules (extraction ready)
- **Excel**: Coming soon

## 🏗️ Project Structure

```
/
├── app/                    # Next.js app router
│   ├── admin/             # Admin interfaces
│   │   └── chat/         # EQUITIE Bot
│   └── investor-portal/   # Investor views
├── lib/
│   ├── services/
│   │   └── fee-engine/   # ARCHON Fee Engine
│   │       ├── enhanced-calculator.ts
│   │       ├── enhanced-service.ts
│   │       └── __tests__/
│   ├── db/               # Database layer
│   └── theme-utils.ts    # Theme utilities
├── BRANDING/             # Design system
├── components/           # React components
└── public/              # Static assets
```

## 🔄 Current Branch: `legacydealengines`

Working on enhanced fee management with ARCHON Fee Engine integration.

### Recent Updates
- Integrated ARCHON Fee Engine with chat interface
- Added precedence-based fee calculations
- Implemented discount handling as negative amounts
- Created comprehensive test suite
- Updated all documentation for consistency

## 🚦 Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Test Fee Calculations**
   - Upload CSV to `/admin/chat`
   - Use chat commands for calculations
   - Check `/admin/fees/profiles` for configuration

3. **Run Tests**
   ```bash
   npx playwright test
   ```

4. **Check Types**
   ```bash
   npm run typecheck
   ```

## 📊 Database Schema

### Fee Tables
- `fees.fee_schedule` - Fee configurations with precedence
- `fees.fee_application` - Applied fees (positive and negative)
- `fees.schedule_version` - Version control for schedules
- `fees.legacy_import` - Import staging area

### Key Rules
- PREMIUM always has precedence = 1
- Discounts stored as negative amounts
- Partner fees prefixed with `PARTNER_`
- All amounts rounded to 2 decimal places

## 🤝 Contributing

1. Follow patterns in existing code
2. Use brand tokens from `/BRANDING/`
3. No emojis in production code
4. Test with Playwright
5. Update relevant documentation

## 📞 Support

- Main documentation: `CLAUDE.md`
- Fee engine guide: `ARCHON_FEE_ENGINE_CONTEXT.md`
- Issues: Create in GitHub repository