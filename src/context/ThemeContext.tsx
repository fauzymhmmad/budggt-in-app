import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'oled' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark' | 'oled';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSavedTheme = (): ThemeMode => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('aurabudget_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'oled' || saved === 'system') {
        return saved;
      }
    }
  } catch {
    // ignore
  }
  return 'dark';
};

const getInitialSystemDark = (): boolean => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch {
    // ignore
  }
  return true;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getSavedTheme);
  const [systemDark, setSystemDark] = useState<boolean>(getInitialSystemDark);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } catch {
      // ignore
    }
  }, []);

  const resolvedTheme: 'light' | 'dark' | 'oled' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('aurabudget_theme', theme);
      }
    } catch {
      // ignore
    }

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'oled', 'light');

      if (resolvedTheme === 'oled') {
        root.classList.add('dark', 'oled');
      } else if (resolvedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }
  }, [theme, resolvedTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'oled' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
