'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import PortalSwitcher from '@/components/PortalSwitcher';

interface InvestorPortalLayoutProps {
  children: ReactNode;
}

export default function InvestorPortalLayout({ children }: InvestorPortalLayoutProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/investor-portal/dashboard', label: 'Dashboard' },
    { href: '/investor-portal/deals', label: 'Deals' },
    { href: '/investor-portal/portfolio', label: 'Portfolio' },
    { href: '/investor-portal/transactions', label: 'Transactions' },
    { href: '/investor-portal/documents', label: 'Documents' },
    { href: '/investor-portal/profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background-deep">
      <PortalSwitcher />
      <nav className="bg-white dark:bg-background-surface/80 backdrop-blur-md shadow-md dark:shadow-glow-purple/10 border-b border-gray-200 dark:border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
                Investor Portal
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-500 text-white dark:bg-primary-300/20 dark:text-primary-300 shadow-lg dark:shadow-glow-purple/20'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-background-surface'
                    )}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}