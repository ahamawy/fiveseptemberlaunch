'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface InvestorPortalLayoutProps {
  children: ReactNode;
}

export default function InvestorPortalLayout({ children }: InvestorPortalLayoutProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/investor-portal/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/investor-portal/deals', label: 'Deals', icon: '🤝' },
    { href: '/investor-portal/portfolio', label: 'Portfolio', icon: '💼' },
    { href: '/investor-portal/transactions', label: 'Transactions', icon: '💰' },
    { href: '/investor-portal/documents', label: 'Documents', icon: '📄' },
    { href: '/investor-portal/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-background-deep">
      <nav className="bg-background-surface/80 backdrop-blur-md shadow-glow-purple/10 border-b border-surface-border">
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
                        ? 'bg-primary-300/20 text-primary-300 shadow-glow-purple/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-surface'
                    )}
                  >
                    <span className="hidden sm:inline">{link.icon}</span>
                    <span className="ml-1">{link.label}</span>
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