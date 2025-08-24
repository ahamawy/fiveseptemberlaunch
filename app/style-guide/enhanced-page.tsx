'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { designTokens, componentGuidelines, featurePatterns } from '@/components/style-guide';

export default function EnhancedStyleGuidePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showCode, setShowCode] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'design-tokens', label: 'Design Tokens' },
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'components', label: 'Components' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'motion', label: 'Motion' },
    { id: 'guidelines', label: 'Guidelines' },
  ];

  const currentTheme = designTokens.themes[theme];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab theme={theme} currentTheme={currentTheme} />;
      case 'design-tokens':
        return <DesignTokensTab theme={theme} showCode={showCode} />;
      case 'colors':
        return <ColorsTab theme={theme} currentTheme={currentTheme} />;
      case 'typography':
        return <TypographyTab theme={theme} />;
      case 'components':
        return <ComponentsTab theme={theme} currentTheme={currentTheme} />;
      case 'patterns':
        return <PatternsTab theme={theme} />;
      case 'spacing':
        return <SpacingTab />;
      case 'motion':
        return <MotionTab theme={theme} />;
      case 'guidelines':
        return <GuidelinesTab theme={theme} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#040210]' : 'bg-white'}`}>
      <div className="relative">
        {/* Background gradient mesh */}
        {theme === 'dark' && (
          <div className="fixed inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0" style={{ background: designTokens.gradients.mesh.purple }} />
            <div className="absolute inset-0" style={{ background: designTokens.gradients.mesh.blue }} />
            <div className="absolute inset-0" style={{ background: designTokens.gradients.mesh.green }} />
          </div>
        )}
        
        <div className="relative z-10">
          {/* Header */}
          <div className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{
            backgroundColor: theme === 'dark' ? 'rgba(4, 2, 16, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: currentTheme.surface.border,
          }}>
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#C898FF] via-[#66D0FF] to-[#34D399] bg-clip-text text-transparent">
                    Equitie Design System
                  </h1>
                  <p className="mt-3 text-lg" style={{ color: currentTheme.text.secondary }}>
                    Comprehensive style guide with Figma integration and modular patterns
                  </p>
                </div>
                
                {/* Theme Toggle */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? 'Hide' : 'Show'} Code
                  </Button>
                  <div className="flex items-center gap-2 p-1 rounded-lg" style={{
                    background: currentTheme.surface.border,
                  }}>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`px-4 py-2 rounded-md transition-all ${
                        theme === 'dark' ? 'bg-[#C898FF] text-white' : 'text-gray-500'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`px-4 py-2 rounded-md transition-all ${
                        theme === 'light' ? 'bg-[#C898FF] text-white' : 'text-gray-500'
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#C898FF] to-[#8F4AD2] text-white'
                        : `${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} hover:bg-opacity-10 hover:bg-[#C898FF]`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ theme, currentTheme }: { theme: 'dark' | 'light'; currentTheme: any }) {
  return (
    <div className="space-y-8">
      <Card className="p-6" style={{
        background: theme === 'dark' ? currentTheme.background.surface : currentTheme.background.surface,
        borderColor: currentTheme.surface.border,
      }}>
        <CardHeader>
          <CardTitle className="text-2xl">Design System Overview</CardTitle>
          <CardDescription>Unified design language for consistent user experiences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p style={{ color: currentTheme.text.secondary }}>
            The Equitie Design System provides a comprehensive set of design tokens, components, and patterns
            to build consistent and beautiful user interfaces across all products.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg" style={{ background: currentTheme.surface.hover }}>
              <h3 className="font-semibold mb-2">Design Tokens</h3>
              <p className="text-sm" style={{ color: currentTheme.text.secondary }}>
                Colors, typography, spacing, and motion values
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: currentTheme.surface.hover }}>
              <h3 className="font-semibold mb-2">Components</h3>
              <p className="text-sm" style={{ color: currentTheme.text.secondary }}>
                Reusable UI components with multiple variants
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: currentTheme.surface.hover }}>
              <h3 className="font-semibold mb-2">Patterns</h3>
              <p className="text-sm" style={{ color: currentTheme.text.secondary }}>
                Common UI patterns and layouts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DesignTokensTab({ theme, showCode }: { theme: 'dark' | 'light'; showCode: boolean }) {
  const currentTheme = designTokens.themes[theme];
  
  return (
    <div className="space-y-8">
      <Card className="p-6" style={{
        background: theme === 'dark' ? currentTheme.background.surface : currentTheme.background.surface,
        borderColor: currentTheme.surface.border,
      }}>
        <CardHeader>
          <CardTitle>Design Tokens</CardTitle>
          <CardDescription>Core design values that power the system</CardDescription>
        </CardHeader>
        <CardContent>
          {showCode && (
            <pre className="p-4 rounded-lg overflow-x-auto" style={{
              background: theme === 'dark' ? '#0B071A' : '#F5F5F5',
            }}>
              <code className="text-sm">
{`import { designTokens } from '@/components/style-guide';

const theme = designTokens.themes.${theme};
const primaryColor = theme.primary[300];
const spacing = designTokens.spacing.scale['4'];`}
              </code>
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ColorsTab({ theme, currentTheme }: { theme: 'dark' | 'light'; currentTheme: any }) {
  const colors = currentTheme.primary;
  const accentColors = currentTheme.accent;
  const semanticColors = currentTheme.semantic;
  
  return (
    <div className="space-y-8">
      <Card className="p-6" style={{
        background: theme === 'dark' ? currentTheme.background.surface : currentTheme.background.surface,
        borderColor: currentTheme.surface.border,
      }}>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Primary, accent, and semantic colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Primary Colors</h3>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-20 rounded-lg mb-2"
                    style={{ backgroundColor: value as string }}
                  />
                  <p className="text-xs font-medium">{key}</p>
                  <p className="text-xs" style={{ color: currentTheme.text.tertiary }}>
                    {value as string}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Accent Colors</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(accentColors).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-20 rounded-lg mb-2"
                    style={{ backgroundColor: value as string }}
                  />
                  <p className="text-xs font-medium capitalize">{key}</p>
                  <p className="text-xs" style={{ color: currentTheme.text.tertiary }}>
                    {value as string}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Semantic Colors</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(semanticColors).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-20 rounded-lg mb-2"
                    style={{ backgroundColor: value as string }}
                  />
                  <p className="text-xs font-medium capitalize">{key}</p>
                  <p className="text-xs" style={{ color: currentTheme.text.tertiary }}>
                    {value as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TypographyTab({ theme }: { theme: 'dark' | 'light' }) {
  const currentTheme = designTokens.themes[theme];
  const typographyScale = designTokens.typography.scale;
  
  return (
    <div className="space-y-8">
      <Card className="p-6" style={{
        background: theme === 'dark' ? currentTheme.background.surface : currentTheme.background.surface,
        borderColor: currentTheme.surface.border,
      }}>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Type scale and text styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(typographyScale).map(([category, scales]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
              {Object.entries(scales as any).map(([key, value]: [string, any]) => (
                <div key={key} className="mb-4">
                  <p
                    style={{
                      fontSize: value.size,
                      lineHeight: value.lineHeight,
                      fontWeight: value.weight,
                      letterSpacing: value.tracking,
                    }}
                  >
                    {category} {key} - {value.size}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ComponentsTab({ theme, currentTheme }: { theme: 'dark' | 'light'; currentTheme: any }) {
  const buttonVariants = componentGuidelines.buttons.variants;
  const cardVariants = componentGuidelines.cards.variants;
  
  return (
    <div className="space-y-8">
      <Card className="p-6" style={{
        background: theme === 'dark' ? currentTheme.background.surface : currentTheme.background.surface,
        borderColor: currentTheme.surface.border,
      }}>
        <CardHeader>
          <CardTitle>Components</CardTitle>
          <CardDescription>UI component examples and guidelines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Buttons</h3>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(buttonVariants).map(([variant, config]) => (
                <div key={variant}>
                  <Button variant={variant as any}>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
                  </Button>
                  <p className="text-xs mt-2" style={{ color: currentTheme.text.tertiary }}>
                    {(config as any).description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(cardVariants).map(([variant, config]) => (
                <Card
                  key={variant}
                  className="p-4"
                  style={(config as any).styles[theme]}
                >
                  <h4 className="font-medium capitalize">{variant} Card</h4>
                  <p className="text-sm mt-2" style={{ color: currentTheme.text.secondary }}>
                    {(config as any).description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Badges</h3>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(componentGuidelines.badges.variants).map(([variant, config]) => (
                <Badge
                  key={variant}
                  style={(config as any).styles[theme]}
                >
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PatternsTab({ theme }: { theme: 'dark' | 'light' }) {
  const currentTheme = designTokens.themes[theme];
  
  return (
    <div className="space-y-8">
      <Card className="p-6" style={{
        background: theme === 'dark' ? currentTheme.background.surface : currentTheme.background.surface,
        borderColor: currentTheme.surface.border,
      }}>
        <CardHeader>
          <CardTitle>Feature Patterns</CardTitle>
          <CardDescription>Common UI patterns and layouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(featurePatterns).map(([pattern, config]) => (
            <div key={pattern} className="border-l-2 border-[#C898FF] pl-4">
              <h3 className="text-lg font-semibold capitalize mb-2">{pattern}</h3>
              <p className="text-sm mb-3" style={{ color: currentTheme.text.secondary }}>
                {(config as any).description}
              </p>
              <div className="text-sm space-y-1">
                <p><strong>Components:</strong> {(config as any).components.join(', ')}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SpacingTab() {
  const spacing = designTokens.spacing.scale;
  
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Spacing System</CardTitle>
          <CardDescription>Consistent spacing scale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(spacing).slice(0, 16).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <div
                  className="bg-[#C898FF]"
                  style={{
                    width: value as string,
                    height: '24px',
                  }}
                />
                <span className="text-sm">
                  {key}: {value as string}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MotionTab({ theme }: { theme: 'dark' | 'light' }) {
  const currentTheme = designTokens.themes[theme];
  const motion = designTokens.motion;
  
  return (
    <div className="space-y-8">
      <Card className="p-6" style={{
        background: theme === 'dark' ? currentTheme.background.surface : currentTheme.background.surface,
        borderColor: currentTheme.surface.border,
      }}>
        <CardHeader>
          <CardTitle>Motion & Animation</CardTitle>
          <CardDescription>Animation timing and easing functions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Duration</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(motion.duration).map(([key, value]) => (
                <div key={key}>
                  <p className="font-medium capitalize">{key}</p>
                  <p className="text-sm" style={{ color: currentTheme.text.secondary }}>
                    {value as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Easing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(motion.easing).map(([key, value]) => (
                <div key={key}>
                  <p className="font-medium capitalize">{key}</p>
                  <p className="text-sm font-mono" style={{ color: currentTheme.text.secondary }}>
                    {value as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GuidelinesTab({ theme }: { theme: 'dark' | 'light' }) {
  const currentTheme = designTokens.themes[theme];
  
  return (
    <div className="space-y-8">
      <Card className="p-6" style={{
        background: theme === 'dark' ? currentTheme.background.surface : currentTheme.background.surface,
        borderColor: currentTheme.surface.border,
      }}>
        <CardHeader>
          <CardTitle>Design Guidelines</CardTitle>
          <CardDescription>Best practices and usage guidelines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Component Usage</h3>
            <ul className="space-y-2 list-disc list-inside" style={{ color: currentTheme.text.secondary }}>
              <li>Use primary buttons for main actions only (one per view)</li>
              <li>Glass morphism works best on overlaid content</li>
              <li>Maintain consistent spacing using the 4px base unit</li>
              <li>Use semantic colors for status and feedback</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Accessibility</h3>
            <ul className="space-y-2 list-disc list-inside" style={{ color: currentTheme.text.secondary }}>
              <li>Ensure color contrast ratios meet WCAG AA standards</li>
              <li>Provide keyboard navigation for all interactive elements</li>
              <li>Include proper ARIA labels and descriptions</li>
              <li>Test with screen readers regularly</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Performance</h3>
            <ul className="space-y-2 list-disc list-inside" style={{ color: currentTheme.text.secondary }}>
              <li>Use CSS transforms for animations when possible</li>
              <li>Implement virtualization for long lists</li>
              <li>Lazy load heavy components and images</li>
              <li>Minimize re-renders with proper React patterns</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}