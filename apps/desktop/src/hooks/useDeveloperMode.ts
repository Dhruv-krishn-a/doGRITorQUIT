import { useState, useEffect } from 'react';

const DEV_MODE_KEY = 'gritorquit_dev_mode';

export function useDeveloperMode() {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DEV_MODE_KEY);
    if (saved === 'true') {
      setIsDevMode(true);
    }
  }, []);

  const toggleDevMode = () => {
    setIsDevMode((prev) => {
      const next = !prev;
      localStorage.setItem(DEV_MODE_KEY, next.toString());
      return next;
    });
  };

  return { isDevMode, toggleDevMode };
}
