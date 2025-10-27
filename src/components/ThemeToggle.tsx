/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

import React, { useState, useEffect } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

/**
 * ThemeToggle component for switching between light and dark themes
 */
const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // TEMPORARY: Force light mode only
    setIsDark(false);
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const toggleTheme = () => {
    // TEMPORARY: Disabled - always stay in light mode
    return;
  };

  return (
    <button 
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'gap-2 transition-colors'
      )}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      type="button"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="text-sm">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="text-sm">Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;