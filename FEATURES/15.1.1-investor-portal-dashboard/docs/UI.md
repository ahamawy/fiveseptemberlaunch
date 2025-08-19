# Investor Portal Dashboard - UI Documentation

## Page Structure

### Main Dashboard Page
**Location**: `/app/investor-portal/dashboard/page.tsx`

```typescript
export default function DashboardPage() {
  // Fetches data from API
  // Handles loading and error states
  // Renders dashboard layout
}
```

### Layout Hierarchy
```
<DashboardPage>
  <Header />
  <PortfolioCards />
  <PerformanceMetrics />
  <QuickActions />
  <RecentActivity />
</DashboardPage>
```

---

## Components

### PortfolioCard
Displays key portfolio metrics in card format.

**Props**:
```typescript
interface PortfolioCardProps {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'percent' | 'number';
}
```

**Usage**:
```tsx
<PortfolioCard 
  title="Total Portfolio Value"
  value={2500000}
  change={12.5}
  trend="up"
  format="currency"
/>
```

---

### PerformanceMetrics
Shows performance indicators in a grid.

**Metrics Displayed**:
- IRR (Internal Rate of Return)
- MOIC (Multiple on Invested Capital)
- DPI (Distributions to Paid-In)
- TVPI (Total Value to Paid-In)

---

### RecentActivity
Scrollable feed of recent transactions and events.

**Features**:
- Transaction type icons
- Amount formatting
- Relative date display
- Click to view details

---

### QuickActions
Navigation cards to other portal sections.

**Links**:
- View Active Deals
- Documents
- Transactions
- Profile Settings

---

## Styling Guidelines

### Color Palette
```scss
// From brand tokens
$primary: #C898FF;
$background-deep: #040210;
$surface-elevated: #1A111F;
$text-primary: #FFFFFF;
$text-secondary: #B3B3B3;
```

### Card Styles
```tsx
// Glass morphism effect
className="bg-surface-elevated rounded-xl p-6 border border-surface-border backdrop-blur-sm"

// Gradient border
className="border-primary-300/20 bg-primary-300/5"

// Hover effect
className="hover:border-primary-300/30 transition-all hover:scale-[1.02]"
```

### Typography
```tsx
// Page title
className="text-4xl font-bold text-white"

// Section header
className="text-xl font-semibold text-white"

// Metric value
className="text-2xl font-bold text-white"

// Label
className="text-sm text-text-secondary"
```

---

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Grid Layouts
```tsx
// Portfolio cards (responsive columns)
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"

// Performance section
className="grid grid-cols-1 lg:grid-cols-3 gap-6"
```

---

## Loading States

### Skeleton Loading
```tsx
<div className="animate-pulse">
  <div className="h-32 bg-surface-elevated rounded-xl" />
</div>
```

### Spinner
```tsx
<div className="w-12 h-12 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
```

---

## Error States

### Error Display
```tsx
<div className="text-error-400 text-xl">
  Failed to load dashboard
</div>
<button onClick={retry} className="...">
  Retry
</button>
```

---

## Accessibility

### ARIA Labels
```tsx
<div role="region" aria-label="Portfolio Summary">
  <h2 id="portfolio-heading">Portfolio</h2>
  <div aria-labelledby="portfolio-heading">...</div>
</div>
```

### Keyboard Navigation
- All interactive elements focusable
- Tab order follows visual hierarchy
- Skip links for main sections

---

## Animation

### Transitions
```tsx
// Smooth color transitions
className="transition-colors duration-200"

// Scale on hover
className="transition-transform hover:scale-105"

// Fade in
className="animate-fadeIn"
```

### Custom Animations
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Component State Management

### Local State
```typescript
const [data, setData] = useState<DashboardData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Data Fetching
```typescript
useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  try {
    const response = await fetch('/api/investors/1/dashboard');
    const data = await response.json();
    setData(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Performance Optimization

### Code Splitting
```typescript
const PerformanceChart = dynamic(
  () => import('./components/PerformanceChart'),
  { loading: () => <ChartSkeleton /> }
);
```

### Memoization
```typescript
const PortfolioCards = React.memo(({ portfolio }) => {
  // Component implementation
});
```

### Virtual Scrolling
For activity feed with many items:
```typescript
import { FixedSizeList } from 'react-window';
```

---

## Theme Support

Dashboard fully supports light/dark themes:

```tsx
// Automatic theme detection
className="text-white dark:text-black"

// Glass effects adapt
className="bg-white/5 dark:bg-black/5"
```