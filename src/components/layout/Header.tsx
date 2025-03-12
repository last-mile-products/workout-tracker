// Header component to display the wedding countdown
'use client';

import { useState, useEffect } from 'react';
import { getDaysUntilWedding } from '@/lib/utils/date-utils';
import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function Header() {
  const [daysUntil, setDaysUntil] = useState<number>(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Calculate days until wedding and update daily
  useEffect(() => {
    // Update on mount
    setDaysUntil(getDaysUntilWedding());
    
    // Set mounting state for theme toggle to prevent hydration mismatch
    setMounted(true);
    
    // Update every 24 hours
    const interval = setInterval(() => {
      setDaysUntil(getDaysUntilWedding());
    }, 1000 * 60 * 60 * 24);
    
    return () => clearInterval(interval);
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <header className="bg-primary text-primary-foreground py-3 px-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10 shadow-md">
      <div className="text-lg md:text-xl font-semibold">
        <span className="inline-block">
          {daysUntil} days until Angela&apos;s wedding
        </span>
      </div>
      
      {/* Theme toggle button */}
      {mounted && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleTheme} 
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>
      )}
    </header>
  );
} 