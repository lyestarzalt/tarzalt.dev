import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

interface SocialLink {
  label: string;
  href: string;
  tip: string;
  icon: React.ReactNode;
}

const links: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/lyestarzalt',
    tip: 'where the code lives',
    icon: <FiGithub className="size-3.5" />,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/lyes-tarzalt',
    tip: 'the professional one',
    icon: <FiLinkedin className="size-3.5" />,
  },
  {
    label: 'Email',
    href: 'mailto:lyes.trzlt@gmail.com',
    tip: 'old school',
    icon: <FiMail className="size-3.5" />,
  },
];

export function SocialLinks() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-2">
        {links.map((link) => (
          <Tooltip key={link.href}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={link.href}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener"
                  className="gap-1.5"
                >
                  {link.icon}
                  {link.label}
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-mono text-xs">
              <p>{link.tip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
