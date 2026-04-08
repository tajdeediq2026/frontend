'use client';

import { useTheme } from '@/lib/theme';
import { useContext } from 'react';

export function ThemeToggle() {
  let theme = 'light';
  let toggleTheme = () => {};

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    // Not within ThemeProvider context, render a placeholder
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700 transition-colors text-white"
      title={theme === 'light' ? 'تحويل إلى الوضع الليلي' : 'تحويل إلى الوضع النهاري'}
    >
      {theme === 'light' ? (
        // Moon icon (for switching to dark mode)
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        // Sun icon (for switching to light mode)
        <svg
          className="w-5 h-5 text-yellow-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a4 4 0 00-5.656 5.656l2.12 2.12a4 4 0 005.656-5.656zM9 16.9a1 1 0 011.414 1.414l-2 2a1 1 0 01-1.414-1.414l2-2zM3 12a1 1 0 100-2H1a1 1 0 100 2h2zm14-4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1.414-6.414a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414-1.414l-2-2zm-14.97 14.97a1 1 0 01-1.414-1.414l2-2a1 1 0 011.414 1.414l-2 2z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
