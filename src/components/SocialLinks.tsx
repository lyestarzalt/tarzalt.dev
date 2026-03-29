import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface SocialLink {
  label: string
  href: string
  handle: string
}

const links: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/lyestarzalt", handle: "lyestarzalt" },
  { label: "LinkedIn", href: "https://linkedin.com/in/lyes-tarzalt", handle: "lyes-tarzalt" },
  { label: "Email", href: "mailto:lyes.trzlt@gmail.com", handle: "lyes.trzlt@gmail.com" },
]

export function SocialLinks() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex gap-2">
        {links.map((link) => (
          <Tooltip key={link.href}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" asChild>
                <a href={link.href} target={link.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener">
                  {link.label}
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{link.handle}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
