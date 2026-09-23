import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'campuscare-theme';

type ThemeContextValue = {
  theme: Theme;
  hasPreference: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = storedTheme();
  const [theme, updateTheme] = useState<Theme>(initial ?? 'light');
  const [hasPreference, setHasPreference] = useState(Boolean(initial));

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function setTheme(nextTheme: Theme) {
    updateTheme(nextTheme);
    setHasPreference(true);
    try { localStorage.setItem(STORAGE_KEY, nextTheme); } catch { /* Theme still applies for this session. */ }
  }

  const value = useMemo(() => ({
    theme,
    hasPreference,
    setTheme,
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light')
  }), [hasPreference, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
