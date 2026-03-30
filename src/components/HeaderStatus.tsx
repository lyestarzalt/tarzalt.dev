import { useEffect, useState } from 'react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return 'good morning';
  if (hour >= 12 && hour <= 17) return 'good afternoon';
  if (hour >= 18 && hour <= 21) return 'good evening';
  if (hour >= 22 || hour === 0) return "shouldn't you be sleeping?";
  return "ehh can't find sleep?";
}

export function HeaderStatus() {
  const [greeting, setGreeting] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setGreeting(getGreeting());
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className={`font-mono text-[0.625rem] text-muted-foreground/70 transition-opacity duration-1000 select-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {greeting}
    </span>
  );
}
