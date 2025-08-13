# Equitie Brand Design Guidelines

## Executive Summary

Equitie is a modern investment platform that combines sophisticated financial tools with an elegant, user-friendly interface. Our design language reflects trust, innovation, and accessibility while maintaining a premium feel that resonates with serious investors and newcomers alike.

### Core Design Principles

1. **Clarity Through Simplicity** - Complex financial data presented in digestible, clear formats
2. **Trust Through Consistency** - Unified design language across all touchpoints
3. **Sophistication Through Details** - Premium feel through thoughtful micro-interactions and polish
4. **Accessibility Through Hierarchy** - Information architecture that guides users naturally

---

## 1. Brand Identity

### 1.1 Brand Personality

**Primary Attributes:**
- **Professional** - Serious about wealth management
- **Innovative** - Leveraging cutting-edge technology
- **Approachable** - Democratizing investment for everyone
- **Trustworthy** - Secure and reliable platform

### 1.2 Visual Language

The Equitie visual language combines modern minimalism with rich, expressive gradients that suggest growth and prosperity. We use:

- **Geometric shapes** with rounded corners for approachability
- **Gradient overlays** to add depth and sophistication
- **Card-based layouts** for content organization
- **Dark theme primary** with light mode support for accessibility

---

## 2. Color System

### 2.1 Primary Brand Colors

#### Hero Purple
- **Primary**: `#C898FF` - Main brand identifier
- **Light**: `#C18AFF` - Hover states and highlights
- **Dark**: `#9B7AC1` - Pressed states and depth

The purple palette represents innovation, wealth, and premium quality. It's used for primary CTAs, active states, and brand moments.

### 2.2 Semantic Colors

#### Success (Growth)
- **Accent Green**: `#62FF7F` - Positive changes, profits, successful transactions
  
#### Warning (Attention)
- **Accent Orange**: `#EFB494` - Warnings, important notices
- **Accent Peach**: `#F8BB98` - Soft warnings, tips

#### Information
- **Accent Blue**: `#007AFF` - Links, information, iOS native feel
- **Accent Teal**: `#0B5B7D` - Secondary information, charts

#### Error
- **Error Red**: `#EF4444` - Errors, losses, critical alerts

### 2.3 Background Colors

#### Dark Theme (Primary)
- **Deep Background**: `#040210` - Main app background
- **Card Surface**: `#302141` - Elevated card backgrounds
- **Surface Alt**: `#131016` - Section backgrounds

#### Light Theme
- **Background**: `#FFFFFF` - Clean base
- **Surface**: `#F8F9FA` - Subtle elevation

### 2.4 Neutral Palette

- **Pure White**: `#FFFFFF`
- **Pure Black**: `#000000`
- **Gray Light**: `#BCBABE` - Disabled states, borders
- **Gray Medium**: `#787880` - Secondary text
- **Gray Dark**: `#3C3C43` - iOS system gray
- **Gray Card**: `#3D3D3D` - Dark theme cards

### 2.5 Text Colors

- **Primary Text**: `#FFFFFF` (dark) / `#000000` (light)
- **Secondary Text**: `#BCBABE` (dark) / `#787880` (light)
- **Subtle Text**: `#F6E2E2` - Low emphasis
- **Tertiary Text**: 60% opacity of secondary

### 2.6 Color Usage Guidelines

1. **Contrast Ratios**: Maintain WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
2. **Color Hierarchy**: Use color intensity to guide attention
3. **Consistency**: Same colors for same actions across the app
4. **Accessibility**: Never rely solely on color to convey information

---

## 3. Typography System

### 3.1 Font Families

#### Primary: SF Pro Display
- **Usage**: Headlines, UI elements, iOS native feel
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

#### Secondary: Inter
- **Usage**: Body text, long-form content
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold)

#### Accent: Outfit
- **Usage**: Special components, marketing materials
- **Weights**: 500 (Medium), 600 (Semibold)

### 3.2 Type Scale

#### Display
- **Display Large**: 32px / 1.2 line-height / Bold
- **Display Medium**: 28px / 1.2 line-height / Semibold
- **Display Small**: 24px / 1.2 line-height / Semibold

#### Headlines
- **Headline Large**: 22px / 1.3 line-height / Semibold
- **Headline Medium**: 20px / 1.3 line-height / Semibold
- **Headline Small**: 18px / 1.3 line-height / Medium

#### Body
- **Body Large**: 16px / 1.5 line-height / Regular
- **Body Medium**: 14px / 1.5 line-height / Regular
- **Body Small**: 12px / 1.4 line-height / Regular

#### Labels
- **Label Large**: 14px / 1.2 line-height / Medium
- **Label Medium**: 12px / 1.2 line-height / Medium
- **Label Small**: 11px / 1.2 line-height / Regular

### 3.3 Typography Guidelines

1. **Hierarchy**: Use size and weight to establish clear information hierarchy
2. **Readability**: Body text minimum 14px on mobile, 16px on desktop
3. **Line Length**: Optimal 50-75 characters for body text
4. **Spacing**: Use consistent line heights for rhythm

---

## 4. Spacing & Layout System

### 4.1 Base Unit

8px grid system for consistent spacing and alignment

### 4.2 Spacing Scale

- **xs**: 4px - Tight spacing, inline elements
- **sm**: 8px - Related elements
- **md**: 16px - Standard spacing
- **lg**: 24px - Section spacing
- **xl**: 32px - Major sections
- **2xl**: 48px - Page sections
- **3xl**: 64px - Hero sections

### 4.3 Layout Principles

#### Container Widths
- **Mobile**: 100% - 32px padding
- **Tablet**: 768px max
- **Desktop**: 1280px max
- **Wide**: 1920px max

#### Grid System
- **Columns**: 12-column grid
- **Gutters**: 16px (mobile), 24px (desktop)
- **Margins**: Responsive based on viewport

### 4.4 Border Radius

- **xs**: 4px - Small elements, tags
- **sm**: 8px - Buttons, inputs
- **md**: 12px - Cards, modals
- **lg**: 16px - Large cards
- **xl**: 24px - Special elements
- **Full**: 50% - Circular elements

---

## 5. Component Library

### 5.1 Core Components

#### Cards
- **Investment Card**: Gradient backgrounds with glass morphism
- **Data Card**: Clean white/dark backgrounds for data display
- **Action Card**: Interactive cards with hover states

#### Buttons
- **Primary**: Purple gradient, white text
- **Secondary**: Outlined, purple border
- **Tertiary**: Text only, purple color
- **Danger**: Red background for destructive actions

#### Navigation
- **Tab Bar**: iOS-style bottom navigation
- **Top Bar**: Minimal with back action
- **Side Menu**: Slide-out with blur background

### 5.2 Investment-Specific Components

#### Portfolio Cards
- Gradient overlays indicating performance
- Real-time data updates with subtle animations
- Rank badges (Bronze, Silver, Gold, Platinum, Diamond, Champion)

#### Trading Tickets
- Clean, scannable layout
- Color-coded by asset type
- Quick action buttons

#### Charts & Graphs
- Consistent color palette
- Interactive tooltips
- Responsive scaling

### 5.3 Component States

1. **Default**: Base state
2. **Hover**: Subtle elevation or brightness change
3. **Active/Pressed**: Darker shade, reduced elevation
4. **Disabled**: 40% opacity
5. **Loading**: Skeleton screens or progress indicators
6. **Error**: Red border with error message

---

## 6. Motion & Animation

### 6.1 Animation Principles

Following iOS Human Interface Guidelines:

- **Spring animations**: Natural, physics-based movements
- **Duration**: 200-400ms for most transitions
- **Easing**: Custom spring curves for organic feel

### 6.2 Common Animations

#### Page Transitions
- **Push**: Slide from right (iOS standard)
- **Modal**: Slide up with backdrop fade
- **Tab Switch**: Fade with subtle scale

#### Micro-interactions
- **Button Press**: Scale down to 0.95
- **Card Hover**: Elevate with shadow
- **Data Update**: Pulse or highlight change

### 6.3 Performance Guidelines

- Maintain 60 FPS for all animations
- Use hardware acceleration where possible
- Implement reduced motion for accessibility

---

## 7. Iconography

### 7.1 Icon Style

- **Line weight**: 2px for consistency
- **Style**: Outlined for most, filled for active states
- **Size classes**: 16px (small), 24px (default), 32px (large)

### 7.2 Icon Categories

#### Navigation
- Home, Portfolio, News, Profile, Settings

#### Financial
- Buy, Sell, Trade, Analytics, Wallet

#### System
- Notifications, Search, Filter, More, Close

### 7.3 Icon Guidelines

1. Use SF Symbols where possible for iOS consistency
2. Maintain consistent stroke width
3. Ensure icons are recognizable at small sizes
4. Include text labels for clarity

---

## 8. Data Visualization

### 8.1 Chart Types

- **Line Charts**: Price trends over time
- **Bar Charts**: Volume comparisons
- **Pie Charts**: Portfolio allocation
- **Candlestick**: Detailed trading data

### 8.2 Color Usage in Charts

- Green (`#62FF7F`): Positive/growth
- Red (`#EF4444`): Negative/decline
- Purple (`#C898FF`): Neutral/selected
- Gradient overlays for area charts

### 8.3 Chart Guidelines

1. Always include axis labels
2. Use consistent scale across related charts
3. Implement touch interactions for details
4. Provide alternative text descriptions

---

## 9. Responsive Design

### 9.1 Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Wide**: 1440px+

### 9.2 Responsive Strategies

#### Mobile First
- Design for mobile, enhance for larger screens
- Touch-friendly tap targets (minimum 44x44px)
- Simplified navigation for small screens

#### Progressive Disclosure
- Show essential information first
- Reveal details on interaction
- Use accordions and tabs effectively

### 9.3 Adaptive Components

Components that change based on screen size:
- Navigation (bottom on mobile, side on desktop)
- Cards (stack on mobile, grid on desktop)
- Tables (simplified on mobile, full on desktop)

---

## 10. Accessibility Guidelines

### 10.1 Visual Accessibility

- **Contrast**: Minimum WCAG AA compliance
- **Text Size**: User-adjustable with system settings
- **Color**: Never sole indicator of information
- **Focus States**: Clear, visible focus indicators

### 10.2 Interactive Accessibility

- **Touch Targets**: Minimum 44x44px
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Reduced Motion**: Respect system preferences

### 10.3 Content Accessibility

- **Alternative Text**: For all images and icons
- **Clear Labels**: Descriptive, not just visual
- **Error Messages**: Clear, actionable guidance
- **Help Text**: Context-sensitive assistance

---

## 11. Dark Mode Specifications

### 11.1 Design Approach

Dark mode is the primary theme, optimized for:
- Reduced eye strain in low light
- Battery efficiency on OLED screens
- Premium, sophisticated appearance

### 11.2 Color Adjustments

- Backgrounds: Deep purples and blacks
- Text: High contrast white/gray
- Accents: Slightly desaturated for comfort
- Shadows: Subtle glows instead of drops

### 11.3 Implementation

- System preference detection
- Manual toggle in settings
- Smooth transition between modes
- Consistent component appearance

---

## 12. Platform-Specific Guidelines

### 12.1 iOS Optimization

- **Navigation**: Standard iOS patterns
- **Gestures**: Swipe back, pull to refresh
- **Haptics**: Subtle feedback for actions
- **Safe Areas**: Respect notch and home indicator

### 12.2 Android Adaptation

- **Material Design**: Incorporate where appropriate
- **Navigation**: Support back button
- **Animations**: Material motion principles
- **System UI**: Match system theme

### 12.3 Web Responsive

- **Desktop**: Hover states, keyboard shortcuts
- **Touch Devices**: Touch-optimized interactions
- **Progressive Web**: Offline capability
- **Browser Compatibility**: Modern browser support

---

## 13. Content Guidelines

### 13.1 Voice & Tone

- **Professional**: Knowledgeable without jargon
- **Encouraging**: Positive about financial growth
- **Clear**: Simple explanations of complex topics
- **Trustworthy**: Transparent about risks and fees

### 13.2 Writing Principles

1. **Clarity First**: Simple words, short sentences
2. **Action-Oriented**: Clear CTAs and next steps
3. **Educational**: Explain financial concepts
4. **Reassuring**: Build confidence in decisions

### 13.3 Microcopy

- **Empty States**: Helpful, action-oriented
- **Error Messages**: Clear problem and solution
- **Success Messages**: Celebratory but professional
- **Loading States**: Informative about progress

---

## 14. Implementation Notes

### 14.1 Design Tokens

All design values are available as tokens:
- Colors: `lib/theme/equitie_theme.dart`
- Typography: `lib/theme/figma/figma_typography.dart`
- Spacing: `lib/theme/figma/figma_spacing.dart`
- Components: `lib/theme/figma/figma_components.dart`

### 14.2 Component Architecture

- **Atomic Design**: Build from atoms to organisms
- **Composition**: Prefer composition over inheritance
- **Reusability**: Create flexible, configurable components
- **Documentation**: Comment complex implementations

### 14.3 Performance Optimization

- **Lazy Loading**: Load content as needed
- **Image Optimization**: Multiple resolutions, WebP
- **Code Splitting**: Separate bundles by route
- **Caching**: Strategic caching for static assets

---

## 15. Future Considerations

### 15.1 Scalability

- Design system built to accommodate growth
- Component library expandable
- Token-based for easy updates
- Platform-agnostic core

### 15.2 Internationalization

- RTL language support ready
- Flexible layouts for text expansion
- Cultural color considerations
- Number and date formatting

### 15.3 Innovation Areas

- AR visualization for portfolios
- Voice interface integration
- Advanced gesture controls
- AI-powered personalization

---

## Conclusion

The Equitie design system represents a careful balance between financial sophistication and user accessibility. By maintaining consistency across these guidelines, we ensure a premium, trustworthy experience that empowers users to take control of their financial future.

These guidelines are living documents, evolving with user needs and platform capabilities while maintaining the core essence of the Equitie brand.

---

*Version 1.0 - January 2025*
*For questions or clarifications, contact the design team*