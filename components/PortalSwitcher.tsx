'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowsRightLeftIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type PortalType = 'investor' | 'admin' | 'root';

export default function PortalSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentPortal, setCurrentPortal] = useState<PortalType>('root');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/investor-portal')) {
      setCurrentPortal('investor');
    } else if (pathname?.startsWith('/admin')) {
      setCurrentPortal('admin');
    } else {
      setCurrentPortal('root');
    }
  }, [pathname]);

  const switchPortal = (targetPortal: PortalType) => {
    let targetPath = '/';
    
    if (targetPortal === 'investor') {
      targetPath = '/investor-portal/dashboard';
    } else if (targetPortal === 'admin') {
      targetPath = '/admin/dashboard';
    }
    
    router.push(targetPath);
    setIsOpen(false);
  };

  // Don't show on root page
  if (currentPortal === 'root') {
    return null;
  }

  return (
    <>
      {/* Desktop Portal Switcher */}
      <div className="fixed top-4 right-4 z-50 hidden md:block">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-white/90 dark:bg-background-surface/90 backdrop-blur-md",
              "border border-surface-border",
              "shadow-lg dark:shadow-glow-purple/10",
              "hover:bg-gray-50 dark:hover:bg-background-surface",
              "transition-all duration-200"
            )}
          >
            <ArrowsRightLeftIcon className="w-4 h-4 text-primary-300" />
            <span className="text-sm font-medium text-text-primary">
              {currentPortal === 'investor' ? 'Investor Portal' : 'Admin Portal'}
            </span>
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 rounded-lg bg-white dark:bg-background-surface shadow-xl dark:shadow-glow-purple/20 border border-surface-border overflow-hidden">
              <div className="p-2">
                <button
                  onClick={() => switchPortal('investor')}
                  disabled={currentPortal === 'investor'}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                    "transition-colors duration-200",
                    currentPortal === 'investor'
                      ? "bg-primary-500/10 text-primary-300 cursor-not-allowed"
                      : "hover:bg-gray-100 dark:hover:bg-background-surface/50 text-text-primary"
                  )}
                >
                  <UserIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Investor Portal</div>
                    <div className="text-xs text-text-secondary">View as investor</div>
                  </div>
                </button>

                <button
                  onClick={() => switchPortal('admin')}
                  disabled={currentPortal === 'admin'}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                    "transition-colors duration-200",
                    currentPortal === 'admin'
                      ? "bg-primary-500/10 text-primary-300 cursor-not-allowed"
                      : "hover:bg-gray-100 dark:hover:bg-background-surface/50 text-text-primary"
                  )}
                >
                  <CogIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Admin Portal</div>
                    <div className="text-xs text-text-secondary">Manage platform</div>
                  </div>
                </button>
              </div>

              {/* Journey Indicator */}
              <div className="border-t border-surface-border px-3 py-2 bg-gray-50 dark:bg-background-deep">
                <div className="text-xs text-text-secondary">
                  Current journey: <span className="font-medium text-primary-300">
                    {pathname?.split('/').slice(2).join(' → ') || 'Dashboard'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Portal Switcher */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "bg-primary-500 dark:bg-primary-300",
            "shadow-lg dark:shadow-glow-purple/30",
            "hover:scale-110 active:scale-95",
            "transition-all duration-200"
          )}
        >
          <ArrowsRightLeftIcon className="w-6 h-6 text-white dark:text-background-deep" />
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-white dark:bg-background-surface shadow-xl dark:shadow-glow-purple/20 border border-surface-border">
            <div className="p-2">
              <button
                onClick={() => switchPortal(currentPortal === 'investor' ? 'admin' : 'investor')}
                className="w-full px-3 py-2 text-sm font-medium text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-300/10 rounded-md transition-colors"
              >
                Switch to {currentPortal === 'investor' ? 'Admin' : 'Investor'} Portal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}