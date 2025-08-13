import { ReactNode } from 'react';

interface InvestorPortalLayoutProps {
  children: ReactNode;
}

export default function InvestorPortalLayout({ children }: InvestorPortalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Investor Portal</h1>
            </div>
            <div className="flex items-center space-x-8">
              <a href="/investor-portal/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</a>
              <a href="/investor-portal/deals" className="text-gray-700 hover:text-gray-900">Deals</a>
              <a href="/investor-portal/portfolio" className="text-gray-700 hover:text-gray-900">Portfolio</a>
              <a href="/investor-portal/transactions" className="text-gray-700 hover:text-gray-900">Transactions</a>
              <a href="/investor-portal/documents" className="text-gray-700 hover:text-gray-900">Documents</a>
              <a href="/investor-portal/profile" className="text-gray-700 hover:text-gray-900">Profile</a>
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