import { useEffect, useState } from 'react';

const statuses = [
  'shipping code',
  'parsing things',
  'based in KL',
  "fixing what ain't broke",
  'reading the docs (lying)',
  'refactoring again',
  'one more commit',
  'it works on my machine',
  'thinking out loud',
  '// TODO: sleep',
  'rm -rf node_modules',
  'git push --force (sorry)',
  'fighting CSS',
  'overthrowing the cursor',
];

export function HeaderStatus() {
  const [status, setStatus] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pick random status on mount
    setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    // Fade in after a beat
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className={`hidden md:inline-block font-mono text-[0.625rem] text-muted-foreground/50 transition-opacity duration-1000 select-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      title="Refresh for a new one"
    >
      {status}
    </span>
  );
}
