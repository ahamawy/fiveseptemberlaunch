interface QuickActionsProps {
  activeDeals: number;
}

export default function QuickActions({ activeDeals }: QuickActionsProps) {
  const actions = [
    {
      title: 'View Active Deals',
      description: `${activeDeals} deals available`,
      href: '/investor-portal/deals',
      icon: '🏢',
      color: 'bg-blue-500',
    },
    {
      title: 'Documents',
      description: 'Access your documents',
      href: '/investor-portal/documents',
      icon: '📁',
      color: 'bg-green-500',
    },
    {
      title: 'Transactions',
      description: 'View transaction history',
      href: '/investor-portal/transactions',
      icon: '💳',
      color: 'bg-purple-500',
    },
    {
      title: 'Profile & KYC',
      description: 'Manage your profile',
      href: '/investor-portal/profile',
      icon: '👤',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {actions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="block hover:bg-gray-50 rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md ${action.color} text-white`}
                >
                  <span className="text-lg">{action.icon}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}