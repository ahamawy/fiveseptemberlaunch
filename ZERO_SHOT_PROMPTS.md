# Zero-Shot Prompts for Claude Code

This document contains example prompts that interns can use with Claude Code to ship features quickly. Each prompt is self-contained and will produce a working feature.

## How to Use These Prompts

1. Copy the prompt exactly as shown
2. Paste into Claude Code
3. Claude will implement the feature using the existing infrastructure
4. Test the feature with `npm run dev`

---

## 📊 Dashboard Features

### 1. Performance Metrics Widget
```
Create a performance metrics widget for the investor dashboard that shows IRR, MOIC, and total returns with trend indicators. Use the existing dashboard data from investorsService.getDashboardData() and display it using the Card component from the branding system.
```

### 2. Upcoming Capital Calls Alert
```
Build an upcoming capital calls alert component that shows the next 3 capital calls with amounts and dates. Style it as a gradient card with the Equitie purple theme. Place it in the dashboard page.
```

### 3. Portfolio Allocation Chart
```
Create a portfolio allocation pie chart showing distribution across sectors. Use the portfolio data from the investors service and make it responsive. Add hover effects showing percentages.
```

---

## 💼 Deals Features

### 4. Deals List with Filters
```
Create a deals list page at /investor-portal/deals that shows all active deals with filters for stage (active, closing, exited) and search by name. Use the dealsService.getDeals() method and implement pagination.
```

### 5. Deal Detail Page
```
Build a deal detail page at /investor-portal/deals/[slug] that shows full deal information including company details, documents, and a commitment button. Use getDealBySlug from the deals service.
```

### 6. Featured Deals Carousel
```
Create a featured deals carousel component for the homepage showing the top 3 deals by current raise amount. Include deal name, company, percentage raised, and a "View Deal" button.
```

---

## 📄 Documents Features

### 7. Document Library
```
Build a document library page at /investor-portal/documents that lists all investor documents grouped by type (term sheets, agreements, etc). Use the documents API route and add download buttons.
```

### 8. Document Viewer Modal
```
Create a document viewer modal component that opens when clicking on a document. Show document metadata and a download button. Style with glass morphism effect.
```

---

## 📈 Transactions Features

### 9. Transaction History Table
```
Create a transaction history page showing all transactions with columns for date, type, deal, amount, and status. Add filters for transaction type and date range. Use the transactions API.
```

### 10. Transaction Detail Drawer
```
Build a slide-out drawer component that shows full transaction details when clicking on a transaction row. Include all metadata and related deal information.
```

---

## 👤 Profile Features

### 11. Investor Profile Settings
```
Create a profile settings page at /investor-portal/profile with sections for personal information, banking details, and notification preferences. Use form components with validation.
```

### 12. KYC Status Banner
```
Build a KYC status banner component that shows at the top of pages when KYC is pending or expired. Include action buttons to complete KYC. Use the investor's kyc_status field.
```

---

## 📊 Analytics Features

### 13. Portfolio Performance Page
```
Create a portfolio performance analytics page showing historical performance charts, deal-by-deal returns, and comparison metrics. Use the portfolio service data.
```

### 14. Investment Timeline
```
Build an investment timeline component showing all commitments and capital events chronologically. Make it vertical on mobile and horizontal on desktop.
```

---

## 🔔 Notification Features

### 15. Activity Feed
```
Create an activity feed component for the dashboard showing recent transactions, document uploads, and deal updates. Limit to 10 items with "Load More" functionality.
```

### 16. Email Digest Preview
```
Build an email digest preview component that shows what the investor's weekly email will look like, pulling data from dashboard and recent activity.
```

---

## 🎯 Complex Features (Multi-Step)

### 17. Commitment Wizard
```
Create a 3-step commitment wizard for making new deal commitments:
Step 1: Select deal and amount
Step 2: Review terms and documents
Step 3: Confirm and sign
Use the existing wizard pattern from the codebase.
```

### 18. Deal Comparison Tool
```
Build a deal comparison tool that allows selecting 2-3 deals and comparing them side-by-side with metrics like minimum investment, target raise, sector, and stage.
```

### 19. Portfolio Rebalancing Calculator
```
Create a portfolio rebalancing calculator that suggests optimal allocation across deals based on risk tolerance and investment goals. Show current vs recommended allocation.
```

### 20. Document Bulk Download
```
Build a document bulk download feature with checkboxes to select multiple documents and download as a zip file. Add "Select All" and category filters.
```

---

## 🎨 UI Enhancement Features

### 21. Dark Mode Toggle
```
Add a dark mode toggle to the DevToolbar that persists the theme preference in localStorage. The theme system already supports dark mode.
```

### 22. Mobile Navigation Drawer
```
Create a mobile navigation drawer that slides in from the left on mobile devices. Include all investor portal navigation items with icons.
```

### 23. Dashboard Customization
```
Build a dashboard customization feature allowing users to show/hide and reorder dashboard widgets. Save preferences to localStorage.
```

### 24. Quick Actions Menu
```
Create a floating quick actions button (FAB) in the bottom right that expands to show common actions like "New Commitment", "View Documents", "Contact Support".
```

---

## 📱 Responsive Features

### 25. Mobile-First Deal Cards
```
Redesign the deal cards to be mobile-first with swipe gestures for actions. Include pull-to-refresh functionality on the deals list page.
```

### 26. Responsive Data Tables
```
Convert all data tables to be responsive using a card layout on mobile that expands to show full details. Maintain table layout on desktop.
```

---

## 🔍 Search & Filter Features

### 27. Global Search
```
Implement a global search component in the header that searches across deals, documents, and transactions. Show results in a dropdown with categories.
```

### 28. Advanced Deal Filters
```
Create an advanced filter panel for deals with filters for sector, currency, minimum investment range, and closing date. Add a "Save Filter" option.
```

---

## 📧 Communication Features

### 29. Support Ticket System
```
Build a support ticket component where investors can submit questions about deals. Show ticket history and status. Store in mock data.
```

### 30. Deal Q&A Section
```
Create a Q&A section for each deal detail page where investors can ask questions. Display questions and answers chronologically.
```

---

## Tips for Using These Prompts

1. **Be Specific**: Add details about styling, data sources, or behavior
2. **Reference Existing Code**: Mention existing services, components, or patterns to use
3. **Specify Location**: Tell Claude where to place the new feature
4. **Include Edge Cases**: Mention loading states, error handling, empty states
5. **Request Tests**: Ask for unit tests or e2e tests if needed

## Example of Enhanced Prompt

Instead of:
```
"Create a deals page"
```

Use:
```
"Create a deals list page at /investor-portal/deals that:
- Uses dealsService.getDeals() for data
- Shows deals in a grid layout (3 columns on desktop, 1 on mobile)
- Includes filters for stage and type
- Has a search bar that filters by name
- Shows loading skeleton while fetching
- Displays an empty state when no deals match
- Uses the Card component with gradient variant
- Includes pagination with 9 deals per page"
```

---

## Service Layer Reference

When writing prompts, reference these available services:

```typescript
// Available services
import { dealsService } from '@/lib/services';
import { investorsService } from '@/lib/services';

// Available methods
dealsService.getDeals()
dealsService.getDealById(id)
dealsService.getDealBySlug(slug)
dealsService.getActiveDeals()
dealsService.getFeaturedDeals()

investorsService.getCurrentInvestor()
investorsService.getDashboardData()
investorsService.getPortfolioData()
investorsService.getCommitments()
investorsService.getTransactions()
```

---

## Component Library Reference

Reference these existing components:

```typescript
// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

// Branding
import { BRAND_CONFIG } from '@/BRANDING/brand.config';
```

---

Happy shipping! 🚀