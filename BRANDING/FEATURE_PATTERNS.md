# Equitie Modular Feature Patterns

## Overview
This document defines reusable patterns for common feature implementations across the Equitie platform. Each pattern is designed to be modular, themeable, and consistent with our Figma designs.

## Feature Pattern Structure

Each feature should follow this structure:
```
feature-name/
├── components/       # Feature-specific components
├── hooks/           # Custom hooks
├── utils/           # Helper functions
├── types/           # TypeScript types
├── styles/          # Feature-specific styles
└── index.tsx        # Main feature export
```

## Common Feature Patterns

### 1. Dashboard Pattern

#### Layout Structure
```typescript
// Dashboard Layout Component
export const DashboardLayout = () => {
  const theme = useTheme();
  
  return (
    <div className="dashboard-container">
      {/* Header Section - 64px height */}
      <header className="dashboard-header">
        <h1>Dashboard Title</h1>
        <DateRangePicker />
        <QuickActions />
      </header>
      
      {/* Metrics Row - Key performance indicators */}
      <section className="dashboard-metrics">
        <MetricCard />
        <MetricCard />
        <MetricCard />
        <MetricCard />
      </section>
      
      {/* Main Content Grid - 12 column grid */}
      <section className="dashboard-grid">
        <div className="col-span-8">
          <ChartCard />
        </div>
        <div className="col-span-4">
          <ActivityFeed />
        </div>
      </section>
      
      {/* Secondary Content */}
      <section className="dashboard-secondary">
        <DataTable />
      </section>
    </div>
  );
};
```

#### Metric Card Component
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
}) => {
  const theme = useTheme();
  
  const trendColors = {
    up: theme.colors.semantic.success,
    down: theme.colors.semantic.error,
    neutral: theme.colors.text.secondary,
  };
  
  return (
    <Card variant="gradient" className="metric-card">
      <CardContent>
        <div className="metric-header">
          <span className="metric-title">{title}</span>
          {icon && <div className="metric-icon">{icon}</div>}
        </div>
        
        <div className="metric-value">{value}</div>
        
        {change !== undefined && (
          <div className="metric-change" style={{ color: trendColors[trend] }}>
            <TrendIcon trend={trend} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### Styling Guidelines
```scss
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6); // 24px
  
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 var(--spacing-6);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
  }
  
  .dashboard-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-4);
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--spacing-6);
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}
```

### 2. Data Table Pattern

#### Table Component Structure
```typescript
interface TableColumn<T> {
  key: keyof T;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading,
  onSort,
  onRowClick,
  emptyMessage = 'No data available',
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }
  
  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  
  return (
    <div className="data-table-container">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                width={column.width}
                sortable={column.sortable}
                onSort={() => handleSort(column.key)}
              >
                {column.header}
                {sortConfig?.key === column.key && (
                  <SortIcon direction={sortConfig.direction} />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

#### Table Patterns
```typescript
// Status Badge Renderer
const statusRenderer = (status: string) => {
  const variants = {
    active: 'success',
    pending: 'warning',
    inactive: 'error',
  };
  
  return (
    <Badge variant={variants[status] || 'default'}>
      {status}
    </Badge>
  );
};

// Currency Renderer
const currencyRenderer = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Date Renderer
const dateRenderer = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Progress Bar Renderer
const progressRenderer = (value: number, max: number = 100) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${percentage}%` }} />
      <span className="progress-text">{percentage.toFixed(0)}%</span>
    </div>
  );
};
```

### 3. Form Pattern

#### Form Structure
```typescript
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | undefined;
  options?: { label: string; value: string }[];
}

export const FormPattern = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const fields: FormField[] = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      validation: (value) => {
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
      },
    },
    // ... more fields
  ];
  
  return (
    <form className="form-container">
      {fields.map((field) => (
        <FormFieldComponent
          key={field.name}
          field={field}
          value={formData[field.name]}
          error={touched[field.name] && errors[field.name]}
          onChange={(value) => handleFieldChange(field.name, value)}
          onBlur={() => handleFieldBlur(field.name)}
        />
      ))}
      
      <div className="form-actions">
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </form>
  );
};
```

#### Form Field Component
```typescript
const FormFieldComponent = ({ field, value, error, onChange, onBlur }) => {
  const theme = useTheme();
  
  const renderField = () => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            error={!!error}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
        
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            error={!!error}
            rows={4}
          />
        );
        
      case 'checkbox':
        return (
          <Checkbox
            checked={value}
            onChange={(checked) => onChange(checked)}
            label={field.label}
          />
        );
        
      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            error={!!error}
          />
        );
    }
  };
  
  return (
    <div className="form-field">
      {field.type !== 'checkbox' && (
        <label className="form-label">
          {field.label}
          {field.required && <span className="required">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {error && (
        <div className="form-error">
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
```

### 4. Chart Pattern

#### Chart Container
```typescript
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  actions,
  loading,
}) => {
  return (
    <Card variant="glass" className="chart-container">
      <CardHeader>
        <div className="chart-header">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
          {actions && <div className="chart-actions">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="chart-wrapper">{children}</div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### Chart Color Schemes
```typescript
export const chartColors = {
  // Single series
  primary: ['#C898FF', '#B67EF0', '#A364E1', '#8F4AD2', '#7A30C3'],
  
  // Multiple series
  rainbow: ['#C898FF', '#66D0FF', '#34D399', '#FFD166', '#FF9A62', '#FF66B3'],
  
  // Semantic
  performance: {
    positive: '#22C55E',
    negative: '#EF4444',
    neutral: '#B3B3B3',
  },
  
  // Gradients for area charts
  gradients: {
    purple: {
      start: 'rgba(200, 152, 255, 0.3)',
      end: 'rgba(200, 152, 255, 0)',
    },
    blue: {
      start: 'rgba(102, 208, 255, 0.3)',
      end: 'rgba(102, 208, 255, 0)',
    },
  },
};

// Chart configuration helper
export const getChartConfig = (theme: 'dark' | 'light') => ({
  grid: {
    color: theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.06)' 
      : 'rgba(0, 0, 0, 0.06)',
  },
  axis: {
    color: theme === 'dark'
      ? '#808080'
      : '#666666',
  },
  tooltip: {
    background: theme === 'dark'
      ? 'rgba(19, 16, 22, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    border: theme === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)',
  },
});
```

### 5. Modal Pattern

#### Modal Component
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  actions,
}) => {
  const sizeClasses = {
    sm: 'max-w-[400px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[720px]',
    xl: 'max-w-[900px]',
  };
  
  if (!isOpen) return null;
  
  return (
    <Portal>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className={`modal-content ${sizeClasses[size]}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          
          <div className="modal-body">{children}</div>
          
          {actions && (
            <div className="modal-footer">{actions}</div>
          )}
        </div>
      </div>
    </Portal>
  );
};
```

#### Modal Patterns
```typescript
// Confirmation Modal
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    actions={
      <>
        <Button variant="ghost" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </>
    }
  >
    <p>{message}</p>
  </Modal>
);

// Form Modal
export const FormModal = ({ isOpen, onClose, onSubmit, fields }) => {
  const [formData, setFormData] = useState({});
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Form Modal"
      size="md"
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onSubmit(formData)}>
            Submit
          </Button>
        </>
      }
    >
      <FormPattern fields={fields} onChange={setFormData} />
    </Modal>
  );
};
```

### 6. List Pattern

#### List Component
```typescript
interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export const ListPattern = ({ 
  items, 
  onItemClick, 
  loading,
  emptyMessage = 'No items found',
}) => {
  if (loading) {
    return <ListSkeleton count={5} />;
  }
  
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  
  return (
    <div className="list-container">
      {items.map((item) => (
        <div
          key={item.id}
          className="list-item"
          onClick={() => onItemClick?.(item)}
        >
          {item.avatar && (
            <div className="list-item-avatar">
              <img src={item.avatar} alt={item.title} />
            </div>
          )}
          
          <div className="list-item-content">
            <div className="list-item-title">{item.title}</div>
            {item.subtitle && (
              <div className="list-item-subtitle">{item.subtitle}</div>
            )}
          </div>
          
          {item.badge && (
            <Badge variant="default">{item.badge}</Badge>
          )}
          
          {item.actions && (
            <div className="list-item-actions">{item.actions}</div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 7. Filter Pattern

#### Filter Component
```typescript
interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  name: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'date';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export const FilterPanel = ({ 
  groups, 
  values, 
  onChange,
  onReset,
}) => {
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="filter-reset" onClick={onReset}>
          Reset All
        </button>
      </div>
      
      {groups.map((group) => (
        <div key={group.name} className="filter-group">
          <h4 className="filter-group-label">{group.label}</h4>
          
          {group.type === 'checkbox' && (
            <div className="filter-options">
              {group.options?.map((option) => (
                <label key={option.value} className="filter-option">
                  <input
                    type="checkbox"
                    checked={values[group.name]?.includes(option.value)}
                    onChange={(e) => handleCheckboxChange(group.name, option.value)}
                  />
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className="filter-count">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          )}
          
          {group.type === 'range' && (
            <RangeSlider
              min={group.min}
              max={group.max}
              value={values[group.name]}
              onChange={(value) => onChange(group.name, value)}
            />
          )}
        </div>
      ))}
    </div>
  );
};
```

### 8. Search Pattern

#### Search Component
```typescript
export const SearchPattern = ({
  placeholder = 'Search...',
  onSearch,
  suggestions = [],
  showRecent = true,
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <SearchIcon className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            <CloseIcon />
          </button>
        )}
      </div>
      
      {focused && (
        <div className="search-dropdown">
          {query ? (
            <div className="search-suggestions">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="search-suggestion"
                  onClick={() => handleSearch(suggestion)}
                >
                  <SearchIcon />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          ) : showRecent && recentSearches.length > 0 && (
            <div className="search-recent">
              <h4>Recent Searches</h4>
              {recentSearches.map((search) => (
                <div
                  key={search}
                  className="search-recent-item"
                  onClick={() => handleSearch(search)}
                >
                  <ClockIcon />
                  <span>{search}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## Responsive Patterns

### Mobile Navigation
```typescript
export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button className="mobile-nav-toggle" onClick={() => setIsOpen(!isOpen)}>
        <MenuIcon />
      </button>
      
      <div className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <Logo />
          <button onClick={() => setIsOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        
        <nav className="mobile-nav-menu">
          {/* Navigation items */}
        </nav>
      </div>
      
      {isOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};
```

### Responsive Grid
```scss
.responsive-grid {
  display: grid;
  gap: var(--spacing-6);
  
  // Mobile: 1 column
  grid-template-columns: 1fr;
  
  // Tablet: 2 columns
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  // Desktop: 3 columns
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  // Large desktop: 4 columns
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## State Patterns

### Loading States
```typescript
export const LoadingPattern = ({ type = 'spinner' }) => {
  const patterns = {
    spinner: <Spinner />,
    skeleton: <Skeleton />,
    shimmer: <Shimmer />,
    progress: <ProgressBar />,
    dots: <LoadingDots />,
  };
  
  return patterns[type];
};
```

### Empty States
```typescript
export const EmptyState = ({
  icon,
  title,
  message,
  action,
}) => (
  <div className="empty-state">
    {icon && <div className="empty-state-icon">{icon}</div>}
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-message">{message}</p>
    {action && <div className="empty-state-action">{action}</div>}
  </div>
);
```

### Error States
```typescript
export const ErrorState = ({
  error,
  onRetry,
}) => (
  <div className="error-state">
    <ErrorIcon className="error-state-icon" />
    <h3 className="error-state-title">Something went wrong</h3>
    <p className="error-state-message">{error.message}</p>
    {onRetry && (
      <Button variant="primary" onClick={onRetry}>
        Try Again
      </Button>
    )}
  </div>
);
```

## Performance Patterns

### Lazy Loading
```typescript
// Component lazy loading
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Image lazy loading
export const LazyImage = ({ src, alt, ...props }) => {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef}>
      {isInView ? (
        <img src={src} alt={alt} {...props} />
      ) : (
        <div className="lazy-image-placeholder" />
      )}
    </div>
  );
};
```

### Virtualization
```typescript
// Virtual list for large datasets
export const VirtualList = ({ items, itemHeight, visibleItems = 10 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleItems
  );
  
  const visibleItemsArray = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return (
    <div
      className="virtual-list"
      style={{ height: visibleItems * itemHeight, overflowY: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItemsArray.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {/* Render item */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## Integration Examples

### Complete Feature Example
```typescript
// Investment Dashboard Feature
export const InvestmentDashboard = () => {
  const theme = useTheme();
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading, error } = useInvestmentData();
  
  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <DashboardLayout>
      {/* Search and Filters */}
      <div className="dashboard-controls">
        <SearchPattern
          placeholder="Search investments..."
          onSearch={setSearchQuery}
        />
        <FilterPanel
          groups={filterGroups}
          values={filters}
          onChange={setFilters}
        />
      </div>
      
      {/* Metrics */}
      <div className="dashboard-metrics">
        <MetricCard
          title="Total AUM"
          value="$2.5B"
          change={12.5}
          trend="up"
        />
        <MetricCard
          title="Active Deals"
          value="47"
          change={8}
          trend="up"
        />
        <MetricCard
          title="Avg IRR"
          value="28.7%"
          change={0}
          trend="neutral"
        />
        <MetricCard
          title="Total Returns"
          value="$450M"
          change={-2.3}
          trend="down"
        />
      </div>
      
      {/* Charts */}
      <div className="dashboard-charts">
        <ChartContainer
          title="Portfolio Performance"
          subtitle="Last 12 months"
        >
          <LineChart data={data.performance} />
        </ChartContainer>
        
        <ChartContainer
          title="Asset Allocation"
        >
          <PieChart data={data.allocation} />
        </ChartContainer>
      </div>
      
      {/* Data Table */}
      <DataTable
        columns={investmentColumns}
        data={data.investments}
        onRowClick={(row) => navigateToInvestment(row.id)}
      />
    </DashboardLayout>
  );
};
```

## Best Practices

### Pattern Usage
1. **Consistency**: Use the same pattern for similar features
2. **Composition**: Build complex features from simple patterns
3. **Customization**: Extend patterns, don't replace them
4. **Documentation**: Document any pattern modifications
5. **Testing**: Test patterns across all themes and breakpoints

### Performance
1. **Lazy load** heavy components
2. **Virtualize** large lists
3. **Memoize** expensive computations
4. **Debounce** user inputs
5. **Optimize** re-renders

### Accessibility
1. **Keyboard navigation** for all interactive elements
2. **ARIA labels** for screen readers
3. **Focus management** in modals and drawers
4. **Color contrast** meets WCAG standards
5. **Error messages** are descriptive

## Pattern Checklist

Before implementing a feature:
- [ ] Identify which patterns apply
- [ ] Check if patterns need customization
- [ ] Ensure theme support
- [ ] Plan responsive behavior
- [ ] Consider loading states
- [ ] Handle error states
- [ ] Add empty states
- [ ] Test accessibility
- [ ] Document deviations

## Resources

- **Pattern Library**: `/app/style-guide/enhanced-page.tsx`
- **Design Tokens**: `/BRANDING/tokens/design-system.ts`
- **Component Guidelines**: `/BRANDING/COMPONENT_GUIDELINES.md`
- **Live Examples**: Run `npm run dev` and visit `/style-guide`