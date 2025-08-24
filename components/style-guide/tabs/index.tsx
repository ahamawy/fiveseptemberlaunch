import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { colors } from '@/BRANDING/tokens/colors';
import { typography } from '@/BRANDING/tokens/typography';
import { animations } from '@/BRANDING/tokens/animations';

export function OverviewSection() {
  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-3xl">Design System Overview</CardTitle>
          <CardDescription>A comprehensive guide to building consistent UI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-surface-elevated border-surface-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Foundation</h3>
                <p className="text-sm text-text-secondary">
                  Core design tokens including colors, typography, spacing, and shadows
                </p>
              </CardContent>
            </Card>
            <Card className="bg-surface-elevated border-surface-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Components</h3>
                <p className="text-sm text-text-secondary">
                  Reusable UI components with consistent styling and behavior
                </p>
              </CardContent>
            </Card>
            <Card className="bg-surface-elevated border-surface-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Patterns</h3>
                <p className="text-sm text-text-secondary">
                  Common UI patterns and layout templates for rapid development
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ColorsSection() {
  const colorCategories = {
    primary: colors.primary,
    accent: colors.accent,
    semantic: colors.semantic,
  };

  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Color Palette</CardTitle>
          <CardDescription>Core colors that define the visual language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(colorCategories).map(([category, palette]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4 capitalize">{category} Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(palette).map(([shade, value]) => (
                  <div key={shade} className="space-y-2">
                    <div
                      className="h-24 rounded-lg border border-surface-border"
                      style={{ backgroundColor: value }}
                    />
                    <div className="text-xs">
                      <p className="font-medium">{shade}</p>
                      <p className="text-text-tertiary">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function TypographySection() {
  const typographyExamples = [
    { name: 'Display', className: 'text-5xl font-bold', text: 'Display Text' },
    { name: 'Heading 1', className: 'text-4xl font-semibold', text: 'Heading 1' },
    { name: 'Heading 2', className: 'text-3xl font-semibold', text: 'Heading 2' },
    { name: 'Heading 3', className: 'text-2xl font-medium', text: 'Heading 3' },
    { name: 'Body Large', className: 'text-lg', text: 'Body text large' },
    { name: 'Body', className: 'text-base', text: 'Regular body text' },
    { name: 'Small', className: 'text-sm', text: 'Small text' },
    { name: 'Caption', className: 'text-xs', text: 'Caption text' },
  ];

  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Typography Scale</CardTitle>
          <CardDescription>Consistent type hierarchy for clear communication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {typographyExamples.map((example) => (
            <div key={example.name} className="py-4 border-b border-surface-border last:border-0">
              <p className="text-sm text-text-secondary mb-2">{example.name}</p>
              <p className={example.className}>{example.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ComponentsSection() {
  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Component Library</CardTitle>
          <CardDescription>Core UI components with variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="glass">Glass</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-surface-main">
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">Standard card styling</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Glass Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">Glass morphism effect</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FormsSection() {
  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Form Elements</CardTitle>
          <CardDescription>Input components and form patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text Input</label>
              <Input placeholder="Enter text..." />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select</label>
              <Select>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Textarea</label>
              <Textarea placeholder="Enter description..." rows={4} />
            </div>
            
            <div className="flex gap-4">
              <Button variant="primary">Submit</Button>
              <Button variant="secondary">Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DataDisplaySection() {
  const mockData = [
    { id: 1, name: 'Series A', amount: '$5M', status: 'Active', irr: '28.5%' },
    { id: 2, name: 'Series B', amount: '$10M', status: 'Active', irr: '35.2%' },
    { id: 3, name: 'Seed Round', amount: '$1.5M', status: 'Exited', irr: '42.8%' },
  ];

  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Data Display</CardTitle>
          <CardDescription>Tables and data visualization components</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">IRR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{row.irr}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function MotionSection() {
  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Motion & Animation</CardTitle>
          <CardDescription>Animation patterns and transitions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transitions</h3>
              <div className="space-y-3">
                <Button className="transition-all hover:scale-105">Hover Scale</Button>
                <Button className="transition-all hover:translate-y-[-2px]">Hover Lift</Button>
                <div className="p-4 bg-surface-elevated rounded-lg transition-all hover:bg-surface-hover">
                  Hover Background
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Animated Elements</h3>
              <div className="space-y-3">
                <div className="animate-pulse bg-primary-300/20 p-4 rounded-lg">
                  Pulse Animation
                </div>
                <div className="animate-bounce text-primary-300">
                  Bounce Animation
                </div>
                <div className="animate-spin w-8 h-8 border-2 border-primary-300 border-t-transparent rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PatternsSection() {
  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">UI Patterns</CardTitle>
          <CardDescription>Common interface patterns and layouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Card List</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-surface-elevated">
                    <CardContent className="p-4">
                      <h4 className="font-medium">List Item {i}</h4>
                      <p className="text-sm text-text-secondary mt-1">
                        Description for item {i}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Stats Grid</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Total Value', 'Active Deals', 'IRR', 'MOIC'].map((stat) => (
                  <Card key={stat} className="bg-surface-elevated">
                    <CardContent className="p-4">
                      <p className="text-xs text-text-secondary">{stat}</p>
                      <p className="text-2xl font-bold mt-1">
                        {Math.floor(Math.random() * 100)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}