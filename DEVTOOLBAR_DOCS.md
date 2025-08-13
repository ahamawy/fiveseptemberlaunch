# DevToolbar Documentation

## Overview
The DevToolbar is a development-only navigation tool that provides quick access to all pages in the Equitie investor portal. It appears as a floating toolbar in the bottom-right corner and is only visible in development mode.

## Features

### 🚀 Quick Navigation
- **Categorized page list** with icons and descriptions
- **One-click navigation** to any page in the application
- **Current page indicator** showing where you are
- **Direct URL display** for each page

### 🎨 Integrated Theme Controls
- **Theme switching** (Dark/Light) without page reload
- **Color scheme selection** (Purple/Blue/Green/Monochrome)
- **Real-time preview** of changes

### 📋 Page Categories

#### Investor Portal
- Dashboard (`/investor-portal/dashboard`) - Main metrics dashboard
- Portfolio (`/investor-portal/portfolio`) - Investment overview
- Transactions (`/investor-portal/transactions`) - Transaction history
- Documents (`/investor-portal/documents`) - Document management
- Deals (`/investor-portal/deals`) - Available deals
- Profile (`/investor-portal/profile`) - User settings

#### Development
- Style Guide (`/style-guide`) - Component library
- API Documentation (`/api-docs`) - API endpoints
- Settings (`/settings`) - Application settings

#### Authentication
- Login (`/login`) - User login
- Register (`/register`) - User registration
- Forgot Password (`/forgot-password`) - Password recovery

## Usage

### Accessing the DevToolbar
1. Start the development server: `npm run dev`
2. Navigate to any page (e.g., `http://localhost:3002/style-guide`)
3. Look for the **"Dev Menu"** button in the bottom-right corner
4. Click to open the navigation dropdown

### Navigation
1. **Browse categories** to find the page you need
2. **Click any page** to navigate instantly
3. **Current page** is highlighted with a purple border
4. **Close menu** by clicking outside or selecting a page

### Theme Controls
- **Theme Toggle**: Switch between Dark/Light modes
- **Color Schemes**: Choose from 4 color variations
- **Live Preview**: Changes apply immediately

## Configuration

### Adding New Pages
Edit `components/dev/DevToolbar.tsx` and add pages to the `PAGE_ROUTES` array:

```typescript
{
  name: 'New Page',
  path: '/new-page',
  icon: Icons.home,
  description: 'Description of the new page'
}
```

### Customizing Icons
The toolbar uses professional inline SVG icons. Update the `Icons` object:

```typescript
const Icons = {
  newIcon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
    </svg>
  ),
  // ... other icons
};
```

### Environment Detection
The toolbar automatically hides in production. It checks:
```typescript
process.env.NODE_ENV === 'development'
```

## Technical Details

### Dependencies
- **React**: Hooks (useState, useEffect)
- **ThemeProvider**: For theme/color scheme control
- **Tailwind CSS**: For styling
- **No external icon libraries**: Uses inline SVG icons for professional appearance

### File Structure
```
components/
  dev/
    DevToolbar.tsx     # Main toolbar component
app/
  layout.tsx          # DevToolbar integration
```

### Integration
The DevToolbar is integrated in the root layout:

```tsx
// app/layout.tsx
import { DevToolbar } from '@/components/dev/DevToolbar'

export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        {children}
        <DevTools />
        <DevToolbar />  {/* Added here */}
      </ErrorBoundary>
    </ThemeProvider>
  )
}
```

## Benefits for Team

### For Interns
- **Quick learning** of application structure
- **Easy navigation** between features
- **Visual overview** of all available pages

### For Developers
- **Fast testing** across different pages
- **Theme testing** with instant switching
- **No URL typing** required

### For QA Team
- **Complete page coverage** in one menu
- **Theme combinations** testing
- **Efficient bug reproduction**

### For Designers
- **Visual consistency** checking across pages
- **Theme variations** preview
- **Component library** quick access

## Troubleshooting

### DevToolbar Not Showing
1. Check you're in development mode (`NODE_ENV=development`)
2. Verify the server is running on correct port
3. Check browser console for errors

### Navigation Not Working
1. Ensure target pages exist
2. Check for JavaScript errors
3. Verify correct port (3002) in URLs

### Theme Controls Not Working
1. Check ThemeProvider is properly set up
2. Verify color scheme files exist
3. Check CSS variables are defined

## Best Practices

### DO
✅ Use for quick navigation during development  
✅ Test theme combinations before deploying  
✅ Add new pages as you create them  
✅ Keep descriptions concise and helpful  

### DON'T
❌ Rely on it in production (it won't be there)  
❌ Add sensitive development information  
❌ Overcomplicate the icon system  
❌ Break the existing page structure  

## Future Enhancements

### Potential Features
- **Recent pages** history
- **Bookmarked pages** for frequent access
- **Component search** within style guide
- **API endpoint** testing integration
- **Performance metrics** display
- **Git branch** information

### Enhancement Ideas
- **Keyboard shortcuts** for power users
- **Custom page groups** for different roles
- **Page status indicators** (working/broken)
- **Integration with testing** tools

---

*This documentation should be updated whenever new pages or features are added to the DevToolbar.*