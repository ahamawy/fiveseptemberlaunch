'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { COLORS, GRADIENTS, SHADOWS, COMPONENT_STYLES } from '@/BRANDING/brand.config';

// Enhanced demo colors with brand tokens
const demoColors = {
  primary: { 
    DEFAULT: COLORS.primary,
    light: COLORS.primaryLight,
    dark: COLORS.primaryDark,
    300: '#C898FF',
    400: '#B07FFF',
    500: COLORS.primary,
    600: '#7A4DE8',
    700: '#6B3FD4'
  },
  accent: { 
    DEFAULT: COLORS.secondary,
    blue: COLORS.accentBlue,
    teal: COLORS.secondary,
    purple: '#C898FF',
    pink: '#FF98E2'
  },
  semantic: { 
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    info: COLORS.info
  },
  gradients: GRADIENTS,
  shadows: SHADOWS
};

export function OverviewSection() {
  return (
    <div className="space-y-8">
      <Card className="glass-card shadow-elevated backdrop-blur-xl bg-gradient-to-br from-card/80 to-card/60">
        <CardHeader>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent animate-gradient">
            Design System Overview
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            A comprehensive guide to building consistent, beautiful UI with advanced effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-glow-primary hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-6">
                <div className="mb-3 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-purpleSubtle">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Foundation</h3>
                <p className="text-sm text-muted-foreground">
                  Core design tokens including colors, typography, spacing, shadows, and animations
                </p>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:border-secondary/40 transition-all duration-500 hover:shadow-glow-blueSubtle hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-6">
                <div className="mb-3 w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent-blue flex items-center justify-center shadow-glow-blueSubtle">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Components</h3>
                <p className="text-sm text-muted-foreground">
                  Reusable UI components with glass effects, animations, and interactions
                </p>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/40 transition-all duration-500 hover:shadow-glow-greenSubtle hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-6">
                <div className="mb-3 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-glow-greenSubtle">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Patterns</h3>
                <p className="text-sm text-muted-foreground">
                  Common UI patterns and layout templates for rapid feature development
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Statistics with animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Components', value: '50+', color: 'from-primary to-primary-dark' },
              { label: 'Animations', value: '30+', color: 'from-secondary to-accent-blue' },
              { label: 'Colors', value: '24', color: 'from-green-500 to-green-600' },
              { label: 'Patterns', value: '15+', color: 'from-orange-500 to-pink-500' },
            ].map((stat, i) => (
              <div key={stat.label} 
                className="relative p-4 rounded-xl bg-card/50 backdrop-blur border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent" 
                  style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                  className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  className={`bg-gradient-to-r ${stat.color}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ColorsSection() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  
  const colorCategories = {
    primary: demoColors.primary as Record<string, string>,
    accent: demoColors.accent as Record<string, string>,
    semantic: demoColors.semantic as Record<string, string>,
  };
  
  const gradientExamples = [
    { name: 'Hero', gradient: demoColors.gradients.hero, class: 'bg-gradient-hero' },
    { name: 'Mesh', gradient: demoColors.gradients.mesh, class: 'bg-gradient-mesh' },
    { name: 'Card', gradient: demoColors.gradients.card, class: 'from-primary/10 to-primary/5' },
    { name: 'Glow', gradient: demoColors.gradients.glow, class: 'from-primary/20 to-transparent' },
    { name: 'Dark', gradient: demoColors.gradients.dark, class: 'from-background to-background/60' },
    { name: 'Radial', gradient: demoColors.gradients.radial, class: 'bg-gradient-radial' },
  ];
  
  const shadowExamples = [
    { name: 'Card', shadow: demoColors.shadows.card, class: 'shadow-card' },
    { name: 'Card Hover', shadow: demoColors.shadows.cardHover, class: 'shadow-cardHover' },
    { name: 'Elevated', shadow: demoColors.shadows.elevated, class: 'shadow-elevated' },
    { name: 'Glow Primary', shadow: demoColors.shadows.glowPrimary, class: 'shadow-glow-primary' },
    { name: 'Glow Subtle', shadow: demoColors.shadows.glowSubtle, class: 'shadow-glow-purpleSubtle' },
  ];
  
  const copyToClipboard = (value: string, name: string) => {
    navigator.clipboard.writeText(value);
    setCopiedColor(name);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Colors */}
      <Card className="glass-card shadow-elevated backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
            Color Palette
          </CardTitle>
          <CardDescription className="text-lg">Core colors that define the visual language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(colorCategories).map(([category, palette]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
                <span className={`w-1 h-6 rounded-full bg-gradient-to-b ${
                  category === 'primary' ? 'from-primary to-primary-dark' :
                  category === 'accent' ? 'from-secondary to-accent-blue' :
                  'from-green-500 to-red-500'
                }`} />
                {category} Colors
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(palette).map(([shade, value]) => (
                  <div key={shade} 
                    className="group cursor-pointer"
                    onClick={() => copyToClipboard(value, `${category}-${shade}`)}
                  >
                    <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105">
                      <div
                        className="h-24 border border-border group-hover:border-primary/50 transition-all duration-300"
                        style={{ backgroundColor: value }}
                      >
                        {copiedColor === `${category}-${shade}` && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Copied!</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-2 text-xs space-y-1">
                      <p className="font-semibold text-foreground">{shade}</p>
                      <p className="text-muted-foreground font-mono">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Gradients */}
      <Card className="glass-card shadow-elevated backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gradients</CardTitle>
          <CardDescription>Beautiful gradient combinations for dynamic interfaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gradientExamples.map((grad) => (
              <div key={grad.name} className="group">
                <div className={`h-32 rounded-xl ${grad.class} border border-border group-hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`} />
                <div className="mt-3 space-y-1">
                  <p className="font-semibold text-sm">{grad.name}</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {grad.class}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Shadows */}
      <Card className="glass-card shadow-elevated backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Shadow System</CardTitle>
          <CardDescription>Elevation and glow effects for depth and emphasis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shadowExamples.map((shadow) => (
              <div key={shadow.name} className="space-y-3">
                <div className={`h-24 rounded-xl bg-card border border-border flex items-center justify-center ${shadow.class} transition-all duration-300 hover:scale-[1.02]`}>
                  <span className="text-sm font-medium text-muted-foreground">{shadow.name}</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-mono text-muted-foreground break-all">{shadow.class}</p>
                </div>
              </div>
            ))}
          </div>
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
            <div key={example.name} className="py-4 border-b border-border last:border-0">
              <p className="text-sm text-muted-foreground mb-2">{example.name}</p>
              <p className={example.className}>{example.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ComponentsSection() {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  
  const buttonSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
  const buttonVariants = [
    { name: 'primary', class: 'bg-primary hover:bg-primary/90 text-white shadow-glow-purpleSubtle' },
    { name: 'secondary', class: 'bg-secondary hover:bg-secondary/90 text-white shadow-glow-blueSubtle' },
    { name: 'glass', class: 'bg-card/20 backdrop-blur-md hover:bg-card/30 border border-border/50' },
    { name: 'outline', class: 'border-2 border-primary hover:bg-primary/10 text-primary' },
    { name: 'ghost', class: 'hover:bg-muted/50 text-muted-foreground hover:text-foreground' },
    { name: 'gradient', class: 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg' },
  ];
  
  const cardVariants = [
    { 
      name: 'Glass Dark',
      class: 'bg-card/20 backdrop-blur-xl border border-border/50 shadow-elevated',
      content: 'Ultra glass morphism with heavy blur'
    },
    { 
      name: 'Glass Light',
      class: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg',
      content: 'Light glass effect with soft edges'
    },
    { 
      name: 'Gradient Border',
      class: 'bg-card border-2 border-transparent bg-gradient-to-r from-primary via-secondary to-accent-blue bg-clip-padding',
      content: 'Animated gradient border effect'
    },
    { 
      name: 'Elevated',
      class: 'bg-card shadow-elevated hover:shadow-2xl transition-shadow duration-300',
      content: 'Deep shadow for elevated appearance'
    },
    { 
      name: 'Neon Glow',
      class: 'bg-card border border-primary/50 shadow-glow-primary',
      content: 'Neon glow effect for emphasis'
    },
    { 
      name: 'Holographic',
      class: 'bg-gradient-to-br from-primary/20 via-secondary/20 to-accent-blue/20 backdrop-blur border border-border/30',
      content: 'Holographic shimmer effect'
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="glass-card shadow-elevated backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
            Component Library
          </CardTitle>
          <CardDescription className="text-lg">Advanced UI components with multiple variants and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          {/* Buttons */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary-dark" />
              Buttons
            </h3>
            
            {/* Button Variants */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Variants</p>
                <div className="flex flex-wrap gap-3">
                  {buttonVariants.map((variant) => (
                    <Button
                      key={variant.name}
                      className={`${variant.class} transition-all duration-300`}
                      onClick={() => setSelectedButton(variant.name)}
                    >
                      {variant.name}
                      {selectedButton === variant.name && (
                        <span className="ml-2 text-xs">✓</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Button Sizes */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Sizes</p>
                <div className="flex flex-wrap items-center gap-3">
                  {buttonSizes.map((size) => (
                    <Button
                      key={size}
                      variant="primary"
                      size={size as any}
                      className="shadow-glow-purpleSubtle"
                    >
                      Size {size.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Icon Buttons */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">With Icons</p>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-glow-purpleSubtle">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white shadow-glow-purpleSubtle">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600 text-white shadow-glow-greenSubtle">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-gradient-to-b from-secondary to-accent-blue" />
              Badges
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge variant="default" className="shadow-sm">Default</Badge>
                <Badge variant="success" className="shadow-glow-greenSubtle">Success</Badge>
                <Badge variant="warning" className="shadow-sm">Warning</Badge>
                <Badge variant="error" className="shadow-sm">Error</Badge>
                <Badge variant="info" className="shadow-glow-blueSubtle">Info</Badge>
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">Gradient</Badge>
                <Badge className="bg-card/20 backdrop-blur-md border border-border/50">Glass</Badge>
                <Badge className="bg-black text-white border border-white/20">Dark</Badge>
              </div>
              
              {/* Badge with icons */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="success" className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </Badge>
                <Badge variant="warning" className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pending
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium
                </Badge>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-gradient-to-b from-green-500 to-green-600" />
              Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cardVariants.map((variant) => (
                <Card key={variant.name} className={`${variant.class} transition-all duration-300 hover:scale-[1.02]`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{variant.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{variant.content}</p>
                  </CardContent>
                </Card>
              ))}
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
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  
  const animations = [
    { name: 'Fade In', class: 'animate-fadeIn', duration: '0.5s' },
    { name: 'Slide Up', class: 'animate-slideUp', duration: '0.5s' },
    { name: 'Scale', class: 'animate-scale', duration: '0.3s' },
    { name: 'Rotate', class: 'animate-rotate', duration: '1s' },
    { name: 'Glow Pulse', class: 'animate-glowPulse', duration: '2s' },
    { name: 'Shimmer', class: 'animate-shimmer', duration: '2s' },
  ];
  
  const transitions = [
    { name: 'Scale', hover: 'hover:scale-110', base: 'transition-transform duration-300' },
    { name: 'Lift', hover: 'hover:-translate-y-2', base: 'transition-transform duration-300' },
    { name: 'Glow', hover: 'hover:shadow-glow-primary', base: 'transition-shadow duration-300' },
    { name: 'Rotate', hover: 'hover:rotate-3', base: 'transition-transform duration-300' },
    { name: 'Brightness', hover: 'hover:brightness-110', base: 'transition-all duration-300' },
    { name: 'Blur', hover: 'hover:blur-sm', base: 'transition-all duration-300' },
  ];
  
  const complexAnimations = [
    {
      name: 'Morphing Gradient',
      element: (
        <div className="h-32 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent-blue animate-gradient bg-[length:200%_200%]" />
      )
    },
    {
      name: 'Floating Card',
      element: (
        <div className="h-32 rounded-xl bg-card border border-border shadow-elevated animate-float" />
      )
    },
    {
      name: 'Glowing Border',
      element: (
        <div className="relative h-32 rounded-xl bg-card overflow-hidden">
          <div className="absolute inset-0 rounded-xl border-2 border-primary animate-glowBorder" />
        </div>
      )
    },
    {
      name: 'Wave Effect',
      element: (
        <div className="relative h-32 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent animate-wave" />
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Animation Showcase */}
      <Card className="glass-card shadow-elevated backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent-blue bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
            Motion & Animation
          </CardTitle>
          <CardDescription className="text-lg">Bring your interface to life with smooth animations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Animation Speed Control */}
          <div className="flex items-center gap-4 p-4 bg-card/50 rounded-xl border border-border">
            <span className="text-sm font-medium">Speed:</span>
            <div className="flex gap-2">
              {['slow', 'normal', 'fast'].map((speed) => (
                <Button
                  key={speed}
                  size="sm"
                  variant={animationSpeed === speed ? 'primary' : 'ghost'}
                  onClick={() => setAnimationSpeed(speed)}
                  className="capitalize"
                >
                  {speed}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Basic Animations */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Basic Animations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {animations.map((anim) => (
                <div key={anim.name} className="space-y-2">
                  <div 
                    className={`h-24 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center ${
                      anim.class
                    }`}
                    style={{
                      animationDuration: animationSpeed === 'slow' ? '2s' : 
                                       animationSpeed === 'fast' ? '0.3s' : anim.duration
                    }}
                  >
                    <span className="text-sm font-medium">{anim.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hover Transitions */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Hover Transitions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {transitions.map((trans) => (
                <div key={trans.name} className="space-y-2">
                  <div 
                    className={`h-24 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer ${trans.base} ${trans.hover}`}
                  >
                    <span className="text-sm font-medium">Hover: {trans.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Complex Animations */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Complex Animations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complexAnimations.map((anim) => (
                <div key={anim.name} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{anim.name}</p>
                  {anim.element}
                </div>
              ))}
            </div>
          </div>
          
          {/* Loading States */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Loading States</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Spinner</p>
                <div className="h-24 rounded-xl bg-card border border-border flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pulse</p>
                <div className="h-24 rounded-xl bg-card border border-border p-4 space-y-2">
                  <div className="h-2 bg-muted animate-pulse rounded" />
                  <div className="h-2 bg-muted animate-pulse rounded" style={{ animationDelay: '0.1s' }} />
                  <div className="h-2 bg-muted animate-pulse rounded" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Dots</p>
                <div className="h-24 rounded-xl bg-card border border-border flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glowBorder {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 1); }
        }
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
        .animate-scale { animation: scale 0.3s ease-in-out infinite; }
        .animate-rotate { animation: rotate 1s linear infinite; }
        .animate-glowPulse { animation: glowPulse 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glowBorder { animation: glowBorder 2s ease-in-out infinite; }
        .animate-wave { animation: wave 3s linear infinite; }
      `}</style>
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
                  <Card key={i} className="bg-card">
                    <CardContent className="p-4">
                      <h4 className="font-medium">List Item {i}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
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
                  <Card key={stat} className="bg-card">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{stat}</p>
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