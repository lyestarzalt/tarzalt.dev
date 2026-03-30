import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { socialLinks } from '@/config/social';

const iconMap: Record<string, React.ReactNode> = {
  GitHub: <FiGithub className="size-3.5" />,
  LinkedIn: <FiLinkedin className="size-3.5" />,
};

function getIcon(label: string): React.ReactNode {
  if (label.includes('@')) return <FiMail className="size-3.5" />;
  return iconMap[label] ?? null;
}

export function SocialLinks() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {socialLinks.map((link, i) => (
          <>
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <a
                  href={link.href}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {getIcon(link.label)}
                  <span>{link.label}</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-mono text-xs">
                <p>{link.tip}</p>
              </TooltipContent>
            </Tooltip>
            {i < socialLinks.length - 1 && (
              <span key={`sep-${i}`} className="text-muted-foreground/20">
                ·
              </span>
            )}
          </>
        ))}
      </div>
    </TooltipProvider>
  );
}
