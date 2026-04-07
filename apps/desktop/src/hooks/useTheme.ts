import { useState, useEffect } from 'react';

export type Theme = 'noir' | 'warm-light' | 'dark';

export const THEMES: { id: Theme; name: string; emoji: string; description: string }[] = [
  { id: 'noir', name: 'Noir', emoji: '🌌', description: 'Dark, modern Indigo/Black' },
  { id: 'warm-light', name: 'Warm Light Theme', emoji: '☀️', description: 'Clean, warm workspace' },
  { id: 'dark', name: 'Dark Theme', emoji: '🌑', description: 'Midnight obsidian mode' },
];

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('noir');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && THEMES.find(t => t.id === savedTheme)) {
      setTheme(savedTheme as Theme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'noir');
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    console.log(`Theme changed to: ${newTheme}`);
  };

  return { theme, changeTheme, themes: THEMES };
}
