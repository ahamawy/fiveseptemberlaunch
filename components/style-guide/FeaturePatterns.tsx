/**
 * Feature Patterns for Common UI Layouts
 * 
 * Defines reusable patterns for common UI features like dashboards,
 * data visualization, forms, tables, navigation, and modals.
 * 
 * @example
 * ```typescript
 * import { featurePatterns } from '@/components/style-guide';
 * 
 * // Get dashboard layout configuration
 * const dashboard = featurePatterns.dashboard;
 * console.log(dashboard.layout.grid); // "12 columns with 24px gap"
 * 
 * // Get chart color palette
 * const chartColors = featurePatterns.dataVisualization.colors.primary;
 * // ['#C898FF', '#B67EF0', '#A364E1', '#8F4AD2', '#7A30C3']
 * ```
 * 
 * @module FeaturePatterns
 */
export const featurePatterns = {
  dashboard: {
    description: 'Dashboard layout and components',
    components: ['MetricCard', 'Chart', 'ActivityFeed', 'QuickActions'],
    layout: {
      grid: '12 columns with 24px gap',
      sidebar: 'Optional 280px fixed width',
      header: '64px height with sticky positioning',
    },
    colors: {
      metrics: {
        positive: '#22C55E',
        negative: '#EF4444',
        neutral: '#B3B3B3',
      },
    },
  },
  
  dataVisualization: {
    description: 'Charts and data visualization',
    components: ['LineChart', 'BarChart', 'PieChart', 'Sparkline'],
    colors: {
      primary: ['#C898FF', '#B67EF0', '#A364E1', '#8F4AD2', '#7A30C3'],
      secondary: ['#66D0FF', '#34D399', '#FFD166', '#FF9A62', '#FF66B3'],
    },
    guidelines: {
      gridLines: 'Use subtle opacity (0.06)',
      animations: 'Stagger data points by 50ms',
      tooltips: 'Glass morphism with 8px blur',
    },
  },
  
  forms: {
    description: 'Form layouts and validation',
    components: ['FormField', 'FormGroup', 'ValidationMessage'],
    layout: {
      labelPosition: 'Above input with 8px spacing',
      fieldSpacing: '24px between fields',
      groupSpacing: '32px between groups',
    },
    validation: {
      realTime: 'Validate on blur',
      errorDisplay: 'Below field with 4px spacing',
      successFeedback: 'Optional checkmark icon',
    },
  },
  
  tables: {
    description: 'Data tables and lists',
    components: ['Table', 'TableRow', 'TablePagination', 'TableFilters'],
    styles: {
      header: {
        background: 'Slightly darker than surface',
        borderBottom: '1px solid divider',
        fontWeight: 500,
      },
      rows: {
        hover: 'Subtle background change',
        striped: 'Optional alternating backgrounds',
        selected: 'Primary color with 0.1 opacity',
      },
    },
  },
  
  navigation: {
    description: 'Navigation patterns',
    components: ['Navbar', 'Sidebar', 'Breadcrumb', 'TabNav'],
    patterns: {
      activeIndicator: '2px bottom border or left border',
      hoverEffect: 'Background with 0.05 opacity',
      transition: '200ms ease-out',
    },
  },
  
  modals: {
    description: 'Modal and overlay patterns',
    components: ['Modal', 'Dialog', 'Drawer', 'Toast'],
    styles: {
      overlay: 'Black with 0.5 opacity',
      content: {
        background: 'Elevated surface color',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '560px',
      },
      animations: {
        enter: 'Fade in + scale from 0.95',
        exit: 'Fade out + scale to 0.95',
        duration: '200ms',
      },
    },
  },
};