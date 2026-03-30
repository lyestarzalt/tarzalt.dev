import { Button } from '@/components/ui/button';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const initial = stored || 'dark';
    setTheme(initial as 'light' | 'dark');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? <FiSun className="size-4" /> : <FiMoon className="size-4" />}
    </Button>
  );
}
