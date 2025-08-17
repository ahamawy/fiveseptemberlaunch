# EQUITIE Platform Documentation Index

## 📚 Core Documentation

### Primary Guides
- **[CLAUDE.md](./CLAUDE.md)** - Main project context for Claude Code and AI assistants
- **[README.md](./README.md)** - Quick start guide and project overview
- **[ARCHON_FEE_ENGINE_CONTEXT.md](./ARCHON_FEE_ENGINE_CONTEXT.md)** - Complete fee calculation system documentation

### System Components
- **[EQUITIE_BOT_CONTEXT.md](./DOCS/EQUITIE_BOT_CONTEXT.md)** - AI chat interface documentation
- **[LEGACY_DEAL_ENGINE_DOCS.md](./LEGACY_DEAL_ENGINE_DOCS.md)** - Historical fee system reference
- **[BRANDING_SYSTEM_DOCUMENTATION.md](./BRANDING_SYSTEM_DOCUMENTATION.md)** - Design system and brand guidelines

## 🛠️ Configuration Files

### IDE Configuration
- **[.cursorrules](./.cursorrules)** - Cursor IDE rules and context
- **[.vscode/settings.json](./.vscode/settings.json)** - VSCode workspace settings
- **[.vscode/extensions.json](./.vscode/extensions.json)** - Recommended extensions

### Environment
- **[.env.example](./.env.example)** - Environment variable template
- **[.env.development](./.env.development)** - Development environment defaults

## 🏗️ Architecture Documentation

### Fee Engine (`lib/services/fee-engine/`)
- **enhanced-calculator.ts** - Core calculation logic with precedence ordering
- **enhanced-service.ts** - Service orchestration and CSV import
- **types.ts** - TypeScript type definitions
- **__tests__/** - Comprehensive test suite

### Database Schema
- **[DB/migrations/](./DB/migrations/)** - SQL migration files
- **07_modularity_consolidated.sql** - Latest schema with fee tables

### API Routes
- **[app/api/admin/chat/](./app/api/admin/chat/)** - EQUITIE Bot endpoint
- **[app/api/admin/fees/](./app/api/admin/fees/)** - Fee management endpoints

## 📋 Feature Documentation

### Admin Features
- **Chat Interface** - `/admin/chat` - AI-powered data ingestion and fee calculations
- **Fee Profiles** - `/admin/fees/profiles` - Fee configuration management
- **Import System** - `/admin/fees/import` - CSV import with preview

### Investor Portal
- **Dashboard** - `/investor-portal/dashboard` - Main metrics view
- **Portfolio** - `/investor-portal/portfolio` - Holdings and performance
- **Transactions** - `/investor-portal/transactions` - Transaction history
- **Deals** - `/investor-portal/deals` - Investment opportunities

## 🧪 Testing Documentation

### Test Files
- **[e2e/](./e2e/)** - Playwright end-to-end tests
- **[lib/services/fee-engine/__tests__/](./lib/services/fee-engine/__tests__/)** - Fee engine unit tests

### Test Commands
```bash
npx playwright test              # Run all tests
npx playwright test --ui         # Interactive mode
npm run test:fees               # Fee engine tests only
```

## 📊 Data Models

### Fee Calculation
- **Precedence Order** - Fees applied in strict order (lower = earlier)
- **Basis Types** - GROSS, NET, NET_AFTER_PREMIUM
- **Discounts** - Stored as negative amounts
- **Partner Fees** - Prefixed with `PARTNER_` and excluded from investor analytics

### Database Tables
- `fees.fee_schedule` - Fee configurations
- `fees.fee_application` - Applied fees
- `fees.schedule_version` - Version control
- `fees.legacy_import` - Import staging

## 🔄 Version Control

### Git Workflow
- **Main Branch** - Production-ready code
- **legacydealengines** - Current development branch
- **Commit Messages** - Follow conventional commits

## 🚀 Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Public anonymous key
NEXT_PUBLIC_USE_MOCK_DATA       # Toggle mock/production
OPENROUTER_API_KEY              # AI features
```

### Build Commands
```bash
npm run build                    # Production build
npm run start                    # Start production server
```

## 📝 Documentation Standards

### When Adding New Features
1. Update `CLAUDE.md` with context
2. Add to this `DOCUMENTATION_INDEX.md`
3. Update `README.md` if user-facing
4. Add inline code comments
5. Create tests with documentation

### Documentation Style
- Use clear headings with emoji icons
- Include code examples
- Link to related documents
- Keep consistent formatting
- Update all related docs

## 🔗 Quick Links

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Internal Tools
- DevToolbar - Development navigation menu
- Theme Switcher - Dark/light mode toggle
- Color Schemes - Brand color variations

## 📅 Last Updated

- **Date**: 2025-08-16
- **Version**: 2.0.0 (ARCHON Fee Engine Integration)
- **Branch**: legacydealengines

---

*For questions or updates, refer to the main `CLAUDE.md` documentation or contact the development team.*