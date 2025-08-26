'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import PortalSwitcher from '@/components/PortalSwitcher';
import { Logo } from '@/components/ui/Logo';

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
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-mesh opacity-10 pointer-events-none" />
      <PortalSwitcher />
      <nav className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-lg font-semibold text-muted-foreground">Investor Portal</span>
            </div>
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/20 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}