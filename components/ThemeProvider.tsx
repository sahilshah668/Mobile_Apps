import React, { createContext, useContext, useEffect, useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import theme, { Theme } from '../constants/theme';

interface ThemeContextType {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from app config
  useEffect(() => {
    const initializeTheme = () => {
      const configTheme = APP_CONFIG?.theme as any;
      const storeBranding = APP_CONFIG?.store?.branding as any;
      
      if (configTheme || storeBranding) {
        const newTheme = {
          ...theme,
          colors: {
            ...theme.colors,
            ...(configTheme?.colors || {}),
            ...(storeBranding?.colors || {}),
            // Ensure status colors are properly merged
            orderStatus: {
              ...theme.colors.orderStatus,
              ...(configTheme?.colors?.orderStatus || {}),
              ...(storeBranding?.colors?.orderStatus || {}),
            },
            paymentStatus: {
              ...theme.colors.paymentStatus,
              ...(configTheme?.colors?.paymentStatus || {}),
              ...(storeBranding?.colors?.paymentStatus || {}),
            },
          },
        };
        setCurrentTheme(newTheme);
      }
    };

    initializeTheme();
  }, []);

  const updateTheme = (newTheme: Partial<Theme>) => {
    setCurrentTheme(prev => ({
      ...prev,
      ...newTheme,
      colors: {
        ...prev.colors,
        ...(newTheme.colors || {}),
      },
    }));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    // You can implement dark mode logic here
  };

  const value: ThemeContextType = {
    theme: currentTheme,
    updateTheme,
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
