'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button, ButtonGroup, IconButton } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { colors } from '@/BRANDING/tokens/colors';
import { gradients } from '@/BRANDING/tokens/gradients';
import { shadows } from '@/BRANDING/tokens/shadows';
import { typography } from '@/BRANDING/tokens/typography';
import { animations } from '@/BRANDING/tokens/animations';
import { useTheme } from '@/providers/ThemeProvider';

// Inner component that uses the theme
function StyleGuideContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('option1');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'components', label: 'Components' },
    { id: 'forms', label: 'Forms' },
    { id: 'data', label: 'Data Display' },
    { id: 'motion', label: 'Motion' },
    { id: 'patterns', label: 'Patterns' },
  ];

  const mockTableData = [
    { id: 1, name: 'Series A Investment', value: 5000000, status: 'active', irr: 28.5, moic: 2.3 },
    { id: 2, name: 'Growth Fund II', value: 10000000, status: 'active', irr: 35.2, moic: 3.1 },
    { id: 3, name: 'Seed Round', value: 1500000, status: 'exited', irr: 42.8, moic: 4.5 },
    { id: 4, name: 'Series B Extension', value: 7500000, status: 'active', irr: 22.1, moic: 1.8 },
  ];

  return (
    <div className="min-h-screen bg-background-deep">
      <div className="relative">
        {/* Background gradient mesh */}
        <div className="fixed inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-background-deep/80 backdrop-blur-xl border-b border-surface-border">
            <div className="p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-300 via-accent-blue to-accent-green text-gradient animate-gradient">
                    Equitie Design System
                  </h1>
                  <p className="mt-3 text-lg text-text-secondary">
                    Complete style guide with modern components, animations, and interactions
                  </p>
                </div>
                
                {/* Theme and Color Scheme Toggle */}
                <div className="flex flex-col gap-3 ml-8">
                  {/* Theme Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Theme:</span>
                    <div className="flex items-center p-1 bg-surface-elevated rounded-lg border border-surface-border">
                      <button
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          theme === 'dark' 
                            ? 'bg-primary-300 text-white shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme('light')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          theme === 'light' 
                            ? 'bg-primary-300 text-white shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>
                  
                  {/* Color Scheme Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Colors:</span>
                    <div className="flex items-center gap-1 p-1 bg-surface-elevated rounded-lg border border-surface-border">
                      <button
                        onClick={() => setColorScheme('purple')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          colorScheme === 'purple' 
                            ? 'bg-purple-500 text-white shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-purple-500/10'
                        }`}
                      >
                        Purple
                      </button>
                      <button
                        onClick={() => setColorScheme('blue')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          colorScheme === 'blue' 
                            ? 'bg-blue-500 text-white shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-blue-500/10'
                        }`}
                      >
                        Blue
                      </button>
                      <button
                        onClick={() => setColorScheme('green')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          colorScheme === 'green' 
                            ? 'bg-green-500 text-white shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-green-500/10'
                        }`}
                      >
                        Green
                      </button>
                      <button
                        onClick={() => setColorScheme('monochrome')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          colorScheme === 'monochrome' 
                            ? 'bg-gray-600 text-white shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-gray-500/10'
                        }`}
                      >
                        Mono
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="mt-6 flex space-x-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'primary' : 'glass'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="whitespace-nowrap"
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8 space-y-12">
            {/* Overview Section */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Hero Card */}
                <Card variant="glass" className="overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-hero opacity-10" />
                  <CardHeader className="relative">
                    <CardTitle className="text-3xl" gradient>
                      Welcome to Equitie Design System
                    </CardTitle>
                    <CardDescription className="text-lg">
                      A modern, dark-themed design system with iOS-inspired interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary-300">157</div>
                        <div className="text-text-secondary">Components</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-accent-blue">12</div>
                        <div className="text-text-secondary">Color Themes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-accent-green">Unlimited</div>
                        <div className="text-text-secondary">Possibilities</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card variant="gradient" hover glow>
                    <CardHeader>
                      <CardTitle>Gradient Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-text-secondary">Card with gradient background and glow effect on hover</p>
                    </CardContent>
                  </Card>

                  <Card variant="glass" hover className="group">
                    <CardHeader>
                      <CardTitle>Glass Morphism</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-text-secondary">Semi-transparent with backdrop blur</p>
                      <div className="mt-4 h-2 bg-gradient-to-r from-primary-300 to-accent-blue rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </CardContent>
                  </Card>

                  <Card variant="elevated" hover>
                    <CardHeader>
                      <CardTitle>Elevated Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-text-secondary">Shadow elevation for depth</p>
                      <div className="mt-4 flex space-x-2">
                        <StatusDot status="online" pulse />
                        <span className="text-sm text-text-secondary">Live updates</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Colors Section */}
            {activeTab === 'colors' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Primary Colors</CardTitle>
                    <CardDescription>Main brand colors with Equitie purple</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(colors.primary).map(([name, value]) => (
                        <div key={name} className="group cursor-pointer">
                          <div 
                            className="h-24 rounded-lg shadow-lg border border-surface-border transform transition-all duration-300 hover:scale-105 hover:shadow-glow-purple"
                            style={{ backgroundColor: value as string }}
                          />
                          <div className="mt-2 text-xs">
                            <p className="font-medium text-text-primary">primary-{name}</p>
                            <p className="text-text-tertiary">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Secondary Colors</CardTitle>
                    <CardDescription>Supporting colors for various UI elements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(colors.secondary).map(([name, value]) => (
                        <div key={name} className="group cursor-pointer">
                          <div 
                            className="h-24 rounded-lg shadow-lg border border-surface-border transform transition-all duration-300 hover:scale-105"
                            style={{ backgroundColor: value as string }}
                          />
                          <div className="mt-2 text-xs">
                            <p className="font-medium text-text-primary">secondary-{name}</p>
                            <p className="text-text-tertiary">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Gradients</CardTitle>
                    <CardDescription>Brand gradients for backgrounds and effects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(gradients.brand).map(([name, value]) => (
                        <div key={name} className="group cursor-pointer">
                          <div 
                            className="h-32 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
                            style={{ background: value }}
                          />
                          <p className="mt-2 text-sm font-medium text-text-primary">{name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Typography Section */}
            {activeTab === 'typography' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Type Scale</CardTitle>
                    <CardDescription>Typography hierarchy and text styles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-6xl font-bold text-text-primary">Display Large</h1>
                      <h2 className="text-5xl font-bold text-text-primary">Display Medium</h2>
                      <h3 className="text-4xl font-semibold text-text-primary">Display Small</h3>
                      <h4 className="text-3xl font-semibold text-text-primary">Heading 1</h4>
                      <h5 className="text-2xl font-semibold text-text-primary">Heading 2</h5>
                      <h6 className="text-xl font-semibold text-text-primary">Heading 3</h6>
                      <p className="text-lg text-text-primary">Body Large - Used for emphasis</p>
                      <p className="text-base text-text-primary">Body Medium - Default body text</p>
                      <p className="text-sm text-text-secondary">Body Small - Supporting text</p>
                      <p className="text-xs text-text-tertiary">Caption - Smallest text size</p>
                    </div>

                    <div className="pt-8 border-t border-surface-border">
                      <h4 className="text-xl font-semibold text-text-primary mb-4">Special Text Effects</h4>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
                          Gradient Text Effect
                        </h3>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-accent-green via-accent-blue to-primary-300 text-gradient animate-gradient">
                          Animated Gradient Text
                        </h3>
                        <h3 className="text-3xl font-bold text-primary-300 animate-pulse">
                          Pulsing Text Effect
                        </h3>
                        <h3 className="text-3xl font-bold text-text-primary" style={{ textShadow: shadows.text.glow }}>
                          Glowing Text Effect
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Components Section */}
            {activeTab === 'components' && (
              <div className="space-y-8">
                {/* Buttons */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Buttons</CardTitle>
                    <CardDescription>Interactive button components with various styles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-4">Variants</h4>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="glass">Glass</Button>
                        <Button variant="gradient">Gradient</Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-4">With Effects</h4>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="primary" glow>Glow Effect</Button>
                        <Button variant="primary" loading>Loading</Button>
                        <Button variant="primary" disabled>Disabled</Button>
                        <Button variant="gradient" className="animate-pulse">Pulsing</Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-4">Sizes</h4>
                      <div className="flex flex-wrap items-center gap-4">
                        <Button variant="primary" size="sm">Small</Button>
                        <Button variant="primary" size="md">Medium</Button>
                        <Button variant="primary" size="lg">Large</Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-4">Button Group</h4>
                      <ButtonGroup>
                        <Button variant="outline">Previous</Button>
                        <Button variant="primary">Current</Button>
                        <Button variant="outline">Next</Button>
                      </ButtonGroup>
                    </div>
                  </CardContent>
                </Card>

                {/* Badges */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Badges & Status</CardTitle>
                    <CardDescription>Labels and status indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-4">Badge Variants</h4>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="error">Error</Badge>
                        <Badge variant="info">Info</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="gradient">Gradient</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-4">With Effects</h4>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="success" glow>Glow</Badge>
                        <Badge variant="error" pulse>Pulse</Badge>
                        <Badge variant="info" glow pulse>Both</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-4">Status Dots</h4>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <StatusDot status="online" pulse />
                          <span className="text-sm text-text-secondary">Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusDot status="away" />
                          <span className="text-sm text-text-secondary">Away</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusDot status="busy" />
                          <span className="text-sm text-text-secondary">Busy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusDot status="offline" />
                          <span className="text-sm text-text-secondary">Offline</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cards */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Card Variants</CardTitle>
                    <CardDescription>Different card styles and effects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card variant="default">
                        <CardHeader>
                          <CardTitle>Default Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Standard card style</p>
                        </CardContent>
                      </Card>

                      <Card variant="glass">
                        <CardHeader>
                          <CardTitle>Glass Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Glass morphism effect</p>
                        </CardContent>
                      </Card>

                      <Card variant="gradient">
                        <CardHeader>
                          <CardTitle>Gradient Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Subtle gradient background</p>
                        </CardContent>
                      </Card>

                      <Card variant="outline">
                        <CardHeader>
                          <CardTitle>Outline Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Prominent border</p>
                        </CardContent>
                      </Card>

                      <Card variant="elevated">
                        <CardHeader>
                          <CardTitle>Elevated Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Shadow elevation</p>
                        </CardContent>
                      </Card>

                      <Card variant="glass" hover glow>
                        <CardHeader>
                          <CardTitle gradient>Interactive Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Hover & glow effects</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Forms Section */}
            {activeTab === 'forms' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Form Elements</CardTitle>
                    <CardDescription>Input components and form controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Default Input
                          </label>
                          <Input 
                            placeholder="Enter text..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Glass Input
                          </label>
                          <Input 
                            variant="glass"
                            placeholder="Glass morphism style..." 
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Outline Input
                          </label>
                          <Input 
                            variant="outline"
                            placeholder="Outline style..." 
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Ghost Input
                          </label>
                          <Input 
                            variant="ghost"
                            placeholder="Minimal style..." 
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            With Icon
                          </label>
                          <Input 
                            variant="glass"
                            placeholder="Search..." 
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Error State
                          </label>
                          <Input 
                            placeholder="Invalid input..." 
                            error
                          />
                          <p className="mt-1 text-xs text-error-400">This field is required</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Select Dropdown
                          </label>
                          <Select 
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                          >
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Glass Select
                          </label>
                          <Select variant="glass">
                            <option>Choose an option</option>
                            <option>Series A</option>
                            <option>Series B</option>
                            <option>Series C</option>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Textarea
                          </label>
                          <Textarea 
                            placeholder="Enter description..." 
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-text-secondary mb-2 block">
                            Glass Textarea
                          </label>
                          <Textarea 
                            variant="glass"
                            placeholder="Glass morphism textarea..." 
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Data Display Section */}
            {activeTab === 'data' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Data Table</CardTitle>
                    <CardDescription>Modern table with hover effects and status indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Deal Name</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>IRR</TableHead>
                          <TableHead>MOIC</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockTableData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>${(row.value / 1000000).toFixed(1)}M</TableCell>
                            <TableCell>
                              <Badge 
                                variant={row.status === 'active' ? 'success' : 'info'}
                                glow
                              >
                                {row.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={row.irr > 30 ? 'text-success-400' : 'text-text-primary'}>
                                {row.irr}%
                              </span>
                            </TableCell>
                            <TableCell>{row.moic}x</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Charts Preview */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Chart Components</CardTitle>
                    <CardDescription>Data visualization with animations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Bar Chart Mock */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-text-secondary">Portfolio Performance</h4>
                        <div className="flex items-end gap-2 h-40">
                          {[60, 80, 45, 90, 70, 85].map((height, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-gradient-to-t from-primary-300 to-accent-blue rounded-t opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer"
                              style={{ 
                                height: `${height}%`,
                                animation: `slideInUp ${0.3 + i * 0.1}s ease-out`
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-text-tertiary">
                          <span>Q1</span>
                          <span>Q2</span>
                          <span>Q3</span>
                          <span>Q4</span>
                          <span>Q5</span>
                          <span>Q6</span>
                        </div>
                      </div>

                      {/* Line Chart Mock */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-text-secondary">Growth Trend</h4>
                        <div className="relative h-40 border-l border-b border-surface-border">
                          <svg className="absolute inset-0 w-full h-full">
                            <defs>
                              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#C898FF" />
                                <stop offset="100%" stopColor="#66D0FF" />
                              </linearGradient>
                            </defs>
                            <polyline
                              fill="none"
                              stroke="url(#lineGradient)"
                              strokeWidth="3"
                              points="10,120 60,80 110,90 160,40 210,60 260,20"
                              className="animate-draw"
                            />
                            {[
                              { x: 10, y: 120 },
                              { x: 60, y: 80 },
                              { x: 110, y: 90 },
                              { x: 160, y: 40 },
                              { x: 210, y: 60 },
                              { x: 260, y: 20 },
                            ].map((point, i) => (
                              <circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="#C898FF"
                                className="animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card variant="gradient" hover>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-secondary text-sm">Total AUM</p>
                          <p className="text-3xl font-bold text-text-primary mt-1">$2.5B</p>
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-success-400">↑</span>
                            <span className="text-sm text-success-400">12.5%</span>
                          </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-300/20 to-accent-blue/20 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-300">$</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="gradient" hover>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-secondary text-sm">Active Deals</p>
                          <p className="text-3xl font-bold text-text-primary mt-1">47</p>
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-success-400">↑</span>
                            <span className="text-sm text-success-400">8 new</span>
                          </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-teal/20 flex items-center justify-center">
                          <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="gradient" hover>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-secondary text-sm">Avg IRR</p>
                          <p className="text-3xl font-bold text-text-primary mt-1">28.7%</p>
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-warning-400">→</span>
                            <span className="text-sm text-warning-400">Stable</span>
                          </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-orange/20 to-accent-pink/20 flex items-center justify-center">
                          <span className="text-2xl font-bold text-accent-orange">%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Motion Section */}
            {activeTab === 'motion' && (
              <div className="space-y-8">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Animation Library</CardTitle>
                    <CardDescription>iOS-inspired spring animations and transitions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Spring Animations */}
                    <div>
                      <h4 className="text-lg font-medium text-text-primary mb-4">Spring Effects</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-primary-300 to-accent-blue rounded-lg animate-bounce" />
                          <p className="text-sm text-text-secondary">Bounce</p>
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-accent-green to-accent-teal rounded-lg animate-pulse" />
                          <p className="text-sm text-text-secondary">Pulse</p>
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-accent-orange to-accent-pink rounded-lg animate-spin-slow" />
                          <p className="text-sm text-text-secondary">Rotate</p>
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-primary-300 to-accent-pink rounded-lg hover:scale-110 transition-transform duration-300" />
                          <p className="text-sm text-text-secondary">Scale</p>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effects */}
                    <div>
                      <h4 className="text-lg font-medium text-text-primary mb-4">Hover Interactions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card variant="glass" className="group cursor-pointer">
                          <CardContent className="py-8">
                            <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary-300 to-accent-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            </div>
                            <p className="text-sm text-text-secondary mt-4">Progress Fill</p>
                          </CardContent>
                        </Card>

                        <Card variant="glass" className="group cursor-pointer overflow-hidden">
                          <CardContent className="py-8 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-300/0 to-primary-300/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <p className="text-sm text-text-secondary relative z-10">Slide Overlay</p>
                          </CardContent>
                        </Card>

                        <Card variant="glass" className="group cursor-pointer">
                          <CardContent className="py-8">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-300 to-accent-blue rounded-full transform group-hover:rotate-180 transition-transform duration-700" />
                            <p className="text-sm text-text-secondary mt-4">Rotate on Hover</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Loading States */}
                    <div>
                      <h4 className="text-lg font-medium text-text-primary mb-4">Loading States</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card variant="glass">
                          <CardContent className="py-8">
                            <div className="flex justify-center">
                              <div className="w-12 h-12 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <p className="text-sm text-text-secondary mt-4 text-center">Spinner</p>
                          </CardContent>
                        </Card>

                        <Card variant="glass">
                          <CardContent className="py-8">
                            <div className="flex justify-center gap-2">
                              <div className="w-3 h-3 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-3 h-3 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-3 h-3 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <p className="text-sm text-text-secondary mt-4 text-center">Dots</p>
                          </CardContent>
                        </Card>

                        <Card variant="glass">
                          <CardContent className="py-8">
                            <div className="space-y-2">
                              <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-gradient-to-r from-primary-300 to-accent-blue animate-shimmer" />
                              </div>
                            </div>
                            <p className="text-sm text-text-secondary mt-4 text-center">Progress</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skeleton Loaders */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Skeleton Loaders</CardTitle>
                    <CardDescription>Content placeholders while loading</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-surface-hover rounded w-3/4 mb-4" />
                        <div className="h-4 bg-surface-hover rounded w-full mb-4" />
                        <div className="h-4 bg-surface-hover rounded w-5/6" />
                      </div>
                      
                      <div className="pt-4 border-t border-surface-border">
                        <div className="flex items-center space-x-4 animate-pulse">
                          <div className="w-12 h-12 bg-surface-hover rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-surface-hover rounded w-1/4" />
                            <div className="h-4 bg-surface-hover rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Patterns Section */}
            {activeTab === 'patterns' && (
              <div className="space-y-8">
                {/* Notification Pattern */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Notifications & Toasts</CardTitle>
                    <CardDescription>Alert and notification patterns</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-success-500/10 border border-success-400/30 flex items-start gap-3">
                      <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-success-400">Success!</p>
                        <p className="text-sm text-text-secondary mt-1">Transaction completed successfully</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-warning-500/10 border border-warning-400/30 flex items-start gap-3">
                      <svg className="w-4 h-4 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-warning-400">Warning</p>
                        <p className="text-sm text-text-secondary mt-1">Please review before proceeding</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-error-500/10 border border-error-400/30 flex items-start gap-3">
                      <svg className="w-4 h-4 text-error-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-error-400">Error</p>
                        <p className="text-sm text-text-secondary mt-1">Failed to process request</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-info-500/10 border border-info-400/30 flex items-start gap-3">
                      <svg className="w-4 h-4 text-info-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-info-400">Information</p>
                        <p className="text-sm text-text-secondary mt-1">New features available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Modal Pattern */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Modal & Dialog</CardTitle>
                    <CardDescription>Overlay patterns for user interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="p-8 rounded-lg bg-background-card border border-surface-border shadow-modal">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Confirm Action</h3>
                        <p className="text-text-secondary mb-6">Are you sure you want to proceed with this action?</p>
                        <div className="flex gap-3 justify-end">
                          <Button variant="ghost">Cancel</Button>
                          <Button variant="primary" glow>Confirm</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Empty State Pattern */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Empty States</CardTitle>
                    <CardDescription>Placeholder content when no data is available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-300/20 to-accent-blue/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-primary-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-text-primary mb-2">No Data Available</h3>
                      <p className="text-text-secondary mb-6">Start by adding your first investment</p>
                      <Button variant="primary" glow>Add Investment</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes draw {
          from {
            stroke-dasharray: 400;
            stroke-dashoffset: 400;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-draw {
          animation: draw 2s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Main export that handles the case where ThemeProvider might not be available
export default function StyleGuidePage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }
  
  // Render the content that uses useTheme
  return <StyleGuideContent />;
}