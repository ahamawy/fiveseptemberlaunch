'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * FeeHubBanner Component
 * 
 * A non-intrusive banner that appears at the top of fee admin pages
 * to guide users to the central fee management hub.
 */
export function FeeHubBanner() {
  return (
    <div className="bg-primary-300/10 border border-primary-300/20 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          This is one of several fee management interfaces. View all tools in the unified dashboard.
        </p>
        <a 
          href="/admin/fees" 
          className="inline-flex items-center text-sm text-primary-300 hover:text-primary-400 hover:underline transition-colors"
        >
          <span>View Fee Hub</span>
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}

/**
 * FeeHubBannerCompact Component
 * 
 * A more compact version for pages with limited space
 */
export function FeeHubBannerCompact() {
  return (
    <a 
      href="/admin/fees"
      className="inline-flex items-center text-xs text-muted-foreground hover:text-primary-300 mb-2 transition-colors"
    >
      <span>← Back to Fee Hub</span>
    </a>
  );
}