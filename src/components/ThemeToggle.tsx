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
    // Check for saved theme preference or default to light theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
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