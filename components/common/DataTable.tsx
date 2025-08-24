import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[] | null;
  columns: Column<T>[];
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  onRetry?: () => void;
  className?: string;
  rowKey: (item: T) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  loading,
  error,
  emptyMessage = "No data available",
  onRetry,
  className,
  rowKey
}: DataTableProps<T>) {
  // Loading state
  if (loading) {
    return (
      <div className={cn("bg-card-background rounded-lg p-8", className)}>
        <LoadingState message="Loading data..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("bg-card-background rounded-lg p-8", className)}>
        <ErrorState title="Error loading data" message={error.message || 'Unexpected error'} onRetry={onRetry} />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={cn("bg-card-background rounded-lg p-8", className)}>
        <EmptyState title={emptyMessage} />
      </div>
    );
  }

  // Data table
  return (
    <div className={cn("bg-card-background rounded-lg overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={rowKey(item)}>
              {columns.map((column) => (
                <TableCell
                  key={`${rowKey(item)}-${column.key}`}
                  className={cn(
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                >
                  {column.accessor(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Type-safe column builder helper
export function createColumns<T>(columns: Column<T>[]): Column<T>[] {
  return columns;
}