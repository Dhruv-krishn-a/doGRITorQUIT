import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'noir' | 'warm-light' | 'dark';

export const THEME_COLORS = {
  noir: {
    primary: '#050508',
    secondary: '#0f111a',
    card: '#121420',
    paper: '#161821',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#6366f1',
    border: '#1e293b',
    hover: '#1e293b',
  },
  'warm-light': {
    primary: '#faf9f5',
    secondary: '#f1f0e8',
    card: '#ffffff',
    paper: '#ffffff',
    text: '#1d1d1d',
    textSecondary: '#666666',
    accent: '#d97706',
    border: '#e5e2d9',
    hover: '#f5f2e9',
  },
  dark: {
    primary: '#111111',
    secondary: '#1a1a1a',
    card: '#1f1f1f',
    paper: '#242424',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    accent: '#f59e0b',
    border: '#333333',
    hover: '#222222',
  }
};

interface ThemeContextType {
  theme: Theme;
  colors: typeof THEME_COLORS['noir'];
  changeTheme: (theme: Theme) => void;
  themes: { id: Theme; name: string; emoji: string; description: string }[];
}

const THEMES: { id: Theme; name: string; emoji: string; description: string }[] = [
  { id: 'noir', name: 'Noir', emoji: '🌌', description: 'Dark, modern Indigo/Black' },
  { id: 'warm-light', name: 'Warm Light Theme', emoji: '☀️', description: 'Clean, warm workspace' },
  { id: 'dark', name: 'Dark Theme', emoji: '🌑', description: 'Midnight obsidian mode' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('noir');

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && THEMES.find(t => t.id === savedTheme)) {
          setTheme(savedTheme as Theme);
        }
      } catch (e) {
        console.warn("Failed to load theme:", e);
      }
    })();
  }, []);

  const changeTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn("Failed to save theme:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colors: THEME_COLORS[theme], 
      changeTheme, 
      themes: THEMES 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within an AppThemeProvider');
  }
  return context;
}
