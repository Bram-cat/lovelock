import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { themes, ThemeColors, ThemeName, themeMetadata } from '../constants/Themes';

// Re-export for backward compatibility
export { ThemeColors, ThemeName, themeMetadata } from '../constants/Themes';

interface ThemeContextType {
  currentTheme: ThemeName;
  theme: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: typeof themes;
  themeMetadata: typeof themeMetadata;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('light');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && savedTheme in themes) {
        setCurrentTheme(savedTheme as ThemeName);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (themeName: ThemeName) => {
    try {
      await AsyncStorage.setItem('selectedTheme', themeName);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (themeName: ThemeName) => {
    setCurrentTheme(themeName);
    saveThemePreference(themeName);
  };

  const theme = themes[currentTheme];
  const isDarkMode = currentTheme === 'dark' || currentTheme === 'midnight';

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        theme,
        isDarkMode,
        toggleTheme,
        setTheme,
        availableThemes: themes,
        themeMetadata,
      }}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to create themed styles
export function createThemedStyles<T>(
  styleFunction: (theme: ThemeColors) => T
) {
  return (theme: ThemeColors) => styleFunction(theme);
}
