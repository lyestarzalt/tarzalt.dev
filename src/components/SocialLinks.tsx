import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { socialLinks } from '@/config/social';

const iconMap: Record<string, React.ReactNode> = {
  GitHub: <FiGithub className="size-3.5" />,
  LinkedIn: <FiLinkedin className="size-3.5" />,
  Email: <FiMail className="size-3.5" />,
};

export function SocialLinks() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-2">
        {socialLinks.map((link) => (
          <Tooltip key={link.href}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={link.href}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener"
                  className="gap-1.5"
                >
                  {iconMap[link.label]}
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
