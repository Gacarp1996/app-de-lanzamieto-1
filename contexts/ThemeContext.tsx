import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

export type Theme = 'interiores' | 'exteriores';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem('appTheme') as Theme | null;
      return storedTheme || 'exteriores'; // Default to 'exteriores' (dark)
    } catch (error) {
      console.warn('Failed to read theme from localStorage', error);
      return 'exteriores';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('appTheme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage or set attribute', error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'interiores' ? 'exteriores' : 'interiores'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
