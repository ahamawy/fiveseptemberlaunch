"use client";

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  defaultValue?: string;
  className?: string;
  showClear?: boolean;
  autoFocus?: boolean;
  variant?: 'default' | 'compact' | 'large';
  showResults?: boolean;
  resultCount?: number;
  loading?: boolean;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  defaultValue = '',
  className = '',
  showClear = true,
  autoFocus = false,
  variant = 'default',
  showResults = false,
  resultCount = 0,
  loading = false
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const getSizeClasses = () => {
    switch (variant) {
      case 'compact':
        return 'h-8 text-sm';
      case 'large':
        return 'h-12 text-lg';
      default:
        return 'h-10 text-base';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon 
            className={`${variant === 'large' ? 'h-6 w-6' : 'h-5 w-5'} text-gray-400`}
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            block w-full rounded-lg border border-gray-300
            bg-white dark:bg-gray-900
            pl-10 ${showClear && query ? 'pr-10' : 'pr-3'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-gray-400
            transition-all duration-200
            ${getSizeClasses()}
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
            ${className}
          `}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
        
        {/* Clear button */}
        {showClear && query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Results count */}
      {showResults && query && !loading && (
        <div className="absolute mt-1 text-sm text-gray-500">
          {resultCount > 0 ? (
            <span>{resultCount} result{resultCount !== 1 ? 's' : ''} found</span>
          ) : (
            <span>No results found</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Advanced search with filters
 */
interface AdvancedSearchProps extends SearchBarProps {
  filters?: Array<{
    label: string;
    value: string;
    count?: number;
  }>;
  selectedFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  showFilters?: boolean;
}

export function AdvancedSearchBar({
  filters = [],
  selectedFilters = [],
  onFilterChange,
  showFilters = true,
  ...searchProps
}: AdvancedSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterToggle = (filterValue: string) => {
    if (!onFilterChange) return;
    
    const newFilters = selectedFilters.includes(filterValue)
      ? selectedFilters.filter(f => f !== filterValue)
      : [...selectedFilters, filterValue];
    
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <SearchBar {...searchProps} className="flex-1" />
        
        {showFilters && filters.length > 0 && (
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Filters
            {selectedFilters.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                {selectedFilters.length}
              </span>
            )}
          </button>
        )}
      </div>
      
      {/* Filter dropdown */}
      {showFilters && isFilterOpen && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="space-y-2">
            {filters.map((filter) => (
              <label
                key={filter.value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(filter.value)}
                  onChange={() => handleFilterToggle(filter.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {filter.label}
                  {filter.count !== undefined && (
                    <span className="ml-1 text-gray-500">({filter.count})</span>
                  )}
                </span>
              </label>
            ))}
          </div>
          
          {selectedFilters.length > 0 && (
            <button
              onClick={() => onFilterChange && onFilterChange([])}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Global search component for header
 */
export function GlobalSearch({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    // TODO: Implement global search API call
    if (searchQuery) {
      // Mock results for now
      setResults([
        { type: 'deal', name: 'SpaceX Series G', url: '/investor-portal/deals' },
        { type: 'company', name: 'OpenAI', url: '/investor-portal/portfolio' },
        { type: 'document', name: 'Q3 2024 Report', url: '/investor-portal/documents' }
      ]);
    } else {
      setResults([]);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 px-3 py-1.5
          text-sm text-gray-500 bg-gray-100 dark:bg-gray-800
          rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
          transition-colors duration-200
          ${className}
        `}
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
        <span>Search</span>
        <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-20 px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-4">
                <SearchBar
                  placeholder="Search deals, companies, documents..."
                  onSearch={handleSearch}
                  autoFocus
                  variant="large"
                  showResults={false}
                />
              </div>
              
              {results.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <a
                      key={index}
                      href={result.url}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 uppercase">
                            {result.type}
                          </span>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {result.name}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          Enter to open
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              
              {query && results.length === 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}