'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { brand, DEFAULT_COLOR_SCHEME } from "@/lib/brand";

type Theme = 'dark' | 'light';
type ColorScheme = 'purple' | 'blue' | 'green' | 'monochrome';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children,
  defaultTheme = 'dark',
  defaultColorScheme = DEFAULT_COLOR_SCHEME as ColorScheme,
  storageKey = 'equitie-theme',
  colorSchemeKey = 'equitie-color-scheme'
}: { 
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorScheme?: ColorScheme;
  storageKey?: string;
  colorSchemeKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(defaultColorScheme);
  const [mounted, setMounted] = useState(false);

  function getColorSchemeVars(scheme: ColorScheme): Record<string, string> {
    // Minimal scheme mapping – extend as needed
    switch (scheme) {
      case 'blue':
        return { '--primary': '221 83% 53%' };
      case 'green':
        return { '--primary': '142 71% 45%' };
      case 'monochrome':
        return { '--primary': '0 0% 100%' };
      case 'purple':
      default:
        return { '--primary': '263 70% 50%' };
    }
  }

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    const storedScheme = localStorage.getItem(colorSchemeKey) as ColorScheme;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    if (storedScheme) {
      setColorSchemeState(storedScheme);
    }
  }, [storageKey, colorSchemeKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const colorVars = getColorSchemeVars(colorScheme);
    
    // Apply color scheme CSS variables to root
    Object.entries(colorVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    localStorage.setItem(colorSchemeKey, colorScheme);
  }, [colorScheme, colorSchemeKey, mounted]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
  };

  const value = {
    theme,
    colorScheme,
    toggleTheme,
    setTheme,
    setColorScheme
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}