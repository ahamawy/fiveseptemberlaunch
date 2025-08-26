'use client';

import { useState } from 'react';
import { 
  CalculatorIcon, 
  DocumentTextIcon,
  ArrowUpTrayIcon,
  CogIcon,
  BeakerIcon,
  ChartBarIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';

interface FeeToolCard {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: 'import' | 'calculation' | 'configuration';
  status: 'stable' | 'beta' | 'legacy';
}

const feeTools: FeeToolCard[] = [
  {
    title: 'Fee Profiles',
    description: 'Configure and manage fee calculation profiles for deals. Primary tool for fee structure setup.',
    href: '/admin/fees/profiles',
    icon: CogIcon,
    category: 'configuration',
    status: 'stable'
  },
  {
    title: 'Legacy Import',
    description: 'Original CSV import tool for fee schedules. Simple format with basic validation.',
    href: '/admin/fees/import',
    icon: ArrowUpTrayIcon,
    category: 'import',
    status: 'legacy'
  },
  {
    title: 'Import V2',
    description: 'Enhanced import with component-based rows, basis/percent/amount fields, and validation.',
    href: '/admin/fees/import-v2',
    icon: DocumentTextIcon,
    category: 'import',
    status: 'stable'
  },
  {
    title: 'Smart Import',
    description: 'AI-powered CSV mapping with automatic column detection and session-based staging.',
    href: '/admin/fees/smart-import',
    icon: SparklesIcon,
    category: 'import',
    status: 'beta'
  },
  {
    title: 'ARCHON Fee Engine',
    description: 'Interactive calculator for testing fee scenarios with ARCHON precedence algorithm.',
    href: '/admin/equitie-fee-engine',
    icon: CalculatorIcon,
    category: 'calculation',
    status: 'stable'
  },
  {
    title: 'Deal Equations',
    description: 'View and manage complex fee equations for specific deals with custom formulas.',
    href: '/admin/deal-equations',
    icon: ChartBarIcon,
    category: 'calculation',
    status: 'beta'
  },
  {
    title: 'Bespoke Import',
    description: 'Custom import interface for non-standard fee structures and edge cases.',
    href: '/admin/fees/bespoke',
    icon: DocumentDuplicateIcon,
    category: 'import',
    status: 'beta'
  },
  {
    title: 'Fee Editor',
    description: 'Direct editing interface for fee schedules with real-time validation.',
    href: '/admin/fees/editor',
    icon: BeakerIcon,
    category: 'configuration',
    status: 'beta'
  }
];

const categoryColors = {
  import: 'border-blue-500/20 bg-blue-500/5',
  calculation: 'border-green-500/20 bg-green-500/5',
  configuration: 'border-purple-500/20 bg-purple-500/5'
};

const statusBadges = {
  stable: 'bg-green-500/20 text-green-400',
  beta: 'bg-yellow-500/20 text-yellow-400',
  legacy: 'bg-gray-500/20 text-gray-400'
};

export default function FeeHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Fee Management Hub
          </h1>
          <p className="text-muted-foreground">
            Central dashboard for all fee calculation and import tools
          </p>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-8 border-primary-300/20 bg-primary-300/5">
          <CardHeader>
            <CardTitle className="text-primary-300">Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-white">New Deal Setup:</strong> Start with Fee Profiles to configure your fee structure</p>
              <p><strong className="text-white">Importing Fees:</strong> Use Smart Import for automatic mapping or Import V2 for manual control</p>
              <p><strong className="text-white">Testing Calculations:</strong> Use ARCHON Fee Engine to validate your fee logic</p>
              <p><strong className="text-white">Complex Scenarios:</strong> Deal Equations for custom formulas and edge cases</p>
            </div>
          </CardContent>
        </Card>

        {/* Tool Categories */}
        <div className="space-y-6">
          {/* Configuration Tools */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CogIcon className="w-5 h-5 mr-2 text-purple-400" />
              Configuration Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeTools.filter(tool => tool.category === 'configuration').map(tool => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </div>

          {/* Import Tools */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ArrowUpTrayIcon className="w-5 h-5 mr-2 text-blue-400" />
              Import Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeTools.filter(tool => tool.category === 'import').map(tool => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </div>

          {/* Calculation Tools */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CalculatorIcon className="w-5 h-5 mr-2 text-green-400" />
              Calculation Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeTools.filter(tool => tool.category === 'calculation').map(tool => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <Card className="mt-8 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  View the complete documentation for fee management and ARCHON engine
                </p>
              </div>
              <a
                href="/docs/fees"
                className="px-4 py-2 bg-primary-300/20 text-primary-300 rounded-lg hover:bg-primary-300/30 transition-colors"
              >
                View Documentation
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: FeeToolCard }) {
  const Icon = tool.icon;
  
  return (
    <a href={tool.href} className="block">
      <Card className={`h-full border ${categoryColors[tool.category]} hover:border-primary-300/30 transition-all hover:scale-[1.02]`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <Icon className="w-6 h-6 text-primary-300 flex-shrink-0" />
            <span className={`text-xs px-2 py-1 rounded ${statusBadges[tool.status]}`}>
              {tool.status}
            </span>
          </div>
          <CardTitle className="text-white mt-2">{tool.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground text-sm">
            {tool.description}
          </CardDescription>
        </CardContent>
      </Card>
    </a>
  );
}