# shadcn Fallbacks

If shadcn primitives are not installed yet, use the components in `UI_FALLBACKS`:
- `ErrorBoundary`, `ErrorState`, `LoadingSkeleton`, `EmptyState`, `SafeForm`, `SafeTable`.

When shadcn is available, replace imports with:
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

Keep Tailwind aliases consistent (e.g., `equitie-purple` -> brand config).
