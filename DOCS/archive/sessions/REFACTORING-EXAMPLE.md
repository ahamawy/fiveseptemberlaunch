# Refactoring Example: Using New Common Components

## Before (Old Pattern - 50+ lines)
```tsx
// app/investor-portal/transactions/page.tsx (OLD)
export default function TransactionsPage() {
  const [data, setData] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactionsData();
  }, []);

  const fetchTransactionsData = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error:", error); // Bad: console.log
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-300 rounded-full" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-8">
        Error: {error}
        <button onClick={fetchTransactionsData}>Retry</button>
      </div>
    );
  }

  if (!data || data.transactions.length === 0) {
    return <div className="p-8">No transactions found</div>;
  }

  return (
    <Table>
      {/* Table implementation */}
    </Table>
  );
}
```

## After (New Pattern - 20 lines)
```tsx
// app/investor-portal/transactions/page.tsx (NEW)
import { useFetch } from '@/hooks/useFetch';
import { DataTable, createColumns } from '@/components/common';
import { formatCurrency, formatDate } from '@/lib/theme-utils';
import type { Transaction } from '@/lib/types';

export default function TransactionsPage() {
  const { data, loading, error, refetch } = useFetch<Transaction[]>(
    '/api/transactions'
  );

  const columns = createColumns<Transaction>([
    {
      key: 'date',
      header: 'Date',
      accessor: (t) => formatDate(t.occurredOn),
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (t) => <Badge variant={t.type}>{t.type}</Badge>,
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: (t) => formatCurrency(t.amount, t.currency),
      align: 'right',
    },
  ]);

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      onRetry={refetch}
      rowKey={(t) => t.id}
      emptyMessage="No transactions found"
    />
  );
}
```

## Benefits
1. **75% less code** - From 50+ lines to ~20 lines
2. **Type-safe** - Full TypeScript support with generics
3. **Consistent UI** - Same loading/error/empty states everywhere
4. **No console.log** - Uses proper logger utility
5. **Reusable** - Same pattern works for all data tables

## Logger Usage Example
```tsx
// Before
console.log("Fetching data...");
console.error("Error:", error);

// After
import { logger } from '@/lib/utils/improved-logger';

const apiLogger = createLogger('API');
apiLogger.info('Fetching transactions');
apiLogger.error('Failed to fetch', error);
```

## Common Components Available

### LoadingState
```tsx
import { LoadingState, LoadingOverlay, LoadingSkeleton } from '@/components/common';

// Simple loading
<LoadingState message="Loading transactions..." size="lg" />

// Overlay loading
<LoadingOverlay message="Processing..." />

// Skeleton loading
<LoadingSkeleton lines={5} />
```

### ErrorState
```tsx
import { ErrorState } from '@/components/common';

<ErrorState
  title="Failed to load"
  error={error}
  onRetry={handleRetry}
/>
```

### EmptyState
```tsx
import { EmptyState, NoDataFound, ComingSoon } from '@/components/common';

<EmptyState
  title="No transactions"
  description="Start by creating your first transaction"
  action={{
    label: "Create Transaction",
    onClick: handleCreate
  }}
/>
```

### DataTable
```tsx
import { DataTable, createColumns } from '@/components/common';

const columns = createColumns<MyType>([
  { key: 'name', header: 'Name', accessor: (item) => item.name },
  // ... more columns
]);

<DataTable
  data={items}
  columns={columns}
  loading={loading}
  error={error}
  rowKey={(item) => item.id}
/>
```

## Migration Guide

### Step 1: Replace Loading States
Find: `if (loading) { return <div>Loading...</div> }`
Replace: `<LoadingState />`

### Step 2: Replace Error Handling
Find: `console.error`
Replace: `logger.error`

### Step 3: Use useFetch Hook
Find: `useEffect` with fetch
Replace: `useFetch` hook

### Step 4: Use DataTable
Find: Custom table implementations
Replace: `<DataTable />` component

## Files to Refactor (Priority)
1. `/app/investor-portal/transactions/page.tsx` - Has 9 `any` types
2. `/app/investor-portal/deals/page.tsx` - Has 6 `any` types  
3. `/app/investor-portal/dashboard/page.tsx` - 509 lines, needs splitting
4. `/app/investor-portal/portfolio/page.tsx` - 659 lines, needs splitting
5. All service files - Replace console.log with logger