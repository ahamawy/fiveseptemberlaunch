# 🚀 Quick Start Guide - Equitie Investor Portal

Get up and running in **5 minutes** with this zero-configuration setup!

## Prerequisites

- Node.js 18+ installed
- Git (optional, for version control)
- A code editor (VS Code recommended)

## 1. Clone & Setup (2 minutes)

```bash
# Clone the repository
git clone <repository-url> equitie-portal
cd equitie-portal

# Run the automated setup
npm run setup
```

The setup script will:
- ✅ Check prerequisites
- ✅ Create environment files
- ✅ Install dependencies
- ✅ Validate the installation

## 2. Start Development (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Default Credentials (Mock Mode):**
- User: John Doe (Investor ID: 1)
- No authentication required in development

## 3. Project Structure

```
equitie-portal/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (mock data)
│   └── investor-portal/   # Portal pages
├── components/            # React components
├── lib/                   # Core libraries
│   ├── db/               # Database abstraction
│   ├── services/         # Business logic
│   └── mock-data/        # Mock data
├── BRANDING/             # Brand configuration
└── DB/                   # Database schema
```

## 4. Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Check code quality |
| `npm run typecheck` | Check TypeScript types |

## 5. Key Features Out-of-the-Box

### Data Layer
- **Mock Data Mode** (default): Full mock data for all entities
- **Supabase Ready**: Switch to real database with one flag
- **Service Layer**: Cached, type-safe data operations

### Available Services
```typescript
import { dealsService, investorsService } from '@/lib/services';

// Get deals
const deals = await dealsService.getDeals();

// Get investor dashboard
const dashboard = await investorsService.getDashboardData();
```

### API Routes (Mock)
- `GET /api/deals` - List all deals
- `GET /api/investors/[id]` - Get investor details
- `GET /api/investors/[id]/dashboard` - Dashboard data
- `GET /api/transactions` - List transactions
- `GET /api/documents` - List documents

## 6. Environment Configuration

The project uses `.env.local` for configuration:

```env
# Toggle between mock and real data
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_SUPABASE=false

# When ready for Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## 7. For Claude Code Users

This project is optimized for zero-shot prompts. Try these examples:

```
"Create a deals list page with filtering by stage and search"
"Add a portfolio performance chart to the dashboard"
"Create a document viewer component for term sheets"
"Build a commitment wizard with 3 steps"
```

Claude Code has access to:
- Complete type definitions
- Service layer with caching
- Mock data for testing
- Branding system
- Component library

## 8. Switching to Supabase (When Ready)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations from `DB/migrations/` in order
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_ENABLE_SUPABASE=true
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart the dev server

## 9. Common Tasks

### Add a New Page
```bash
# Pages go in app/investor-portal/
# Example: app/investor-portal/analytics/page.tsx
```

### Add a New API Route
```bash
# API routes go in app/api/
# Example: app/api/analytics/route.ts
```

### Use the Service Layer
```typescript
// In any component or API route
import { dealsService } from '@/lib/services';

const deals = await dealsService.getActiveDeals();
```

### Access Mock Data Directly
```typescript
import { mockDeals } from '@/lib/mock-data/deals';
```

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change port: `PORT=3001 npm run dev` |
| Module not found | Run `npm install` |
| TypeScript errors | Run `npm run typecheck` |
| Environment not loading | Check `.env.local` exists |

## Need Help?

- Check `CLAUDE.md` for project context
- Review `ZERO_SHOT_PROMPTS.md` for Claude Code examples
- See `BRANDING_SYSTEM_DOCUMENTATION.md` for UI guidelines

---

**Ready to build!** 🎨 Start with `npm run dev` and create your first feature.