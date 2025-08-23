### Investor Contracts Index

Location: `lib/contracts/**`

Canonical shapes consumed by investor pages and API routes. Pages/components must not infer fields from API responses directly.

DashboardSummary

- portfolio: { totalValue: number; totalCommitted: number; totalDistributed: number; unrealizedGain: number }
- performance: { irr: number; moic: number; dpi: number; tvpi: number }
- recentActivity: Array<{ id: string; type: string; description: string; amount?: number; date: string }>
- activeDeals: number

PortfolioResponse

- deals: PortfolioDeal[]
- allocation:
  - bySector: Array<{ sector: string; value: number; percentage: number; dealCount: number }>
  - byType: Array<{ type: string; value: number; percentage: number; dealCount: number }>
- summary: { totalDeals: number; activeDeals: number; exitedDeals: number; totalValue: number }
- historicalPerformance?: Array<{ date: string; nav: number }>

PortfolioDeal

- dealId: number
- dealName: string
- companyName: string
- sector: string
- dealType: string
- committed: number
- called: number
- distributed: number
- currentValue: number
- irr: number
- moic: number
- status: string
- currency: string
- stage: string
- documentsCount: number
- companyLogoUrl?: string | null

TransactionItem

- transaction_id: number
- deal_id: number
- investor_id: number
- deal_name: string
- deal_currency: string
- company_name: string | null
- company_sector: string | null
- transaction_date: string
- transaction_type: string
- amount: number
- documents_count: number

DealListItem (excerpt)

- id: number
- name: string
- stage: string
- type: string
- company_id: number | null
- currency: string
- moic: number
- irr: number | null
- investor_count: number
- tx_count: number
- documents_count: number
- company_logo_url?: string | null
- company_background_url?: string | null

Notes

- All money rounded to 2 decimals in UI; don’t mutate server values.
- Discounts negative; precedence in fees handled elsewhere, not part of these contracts.
