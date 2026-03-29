import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FiMenu, FiEdit3, FiUser, FiGithub, FiLinkedin, FiMail, FiSun, FiMoon } from "react-icons/fi"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
}

interface MobileNavProps {
  items: NavItem[]
}

const navIcons: Record<string, React.ReactNode> = {
  Writing: <FiEdit3 className="size-4" />,
  About: <FiUser className="size-4" />,
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu">
          <FiMenu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-4">
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

        {/* Profile */}
        <div className="mb-5 flex items-center gap-3 px-2">
          <Avatar className="size-10 ring-1 ring-border">
            <AvatarImage src="/images/profile.png" alt="Lyes Tarzalt" />
            <AvatarFallback>LT</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">Lyes Tarzalt</p>
            <p className="font-mono text-[0.625rem] text-muted-foreground">Product Engineer</p>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="text-muted-foreground">{navIcons[item.label]}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <Separator className="my-4" />

        {/* Social */}
        <div className="flex flex-col gap-1">
          <a href="https://github.com/lyestarzalt" target="_blank" rel="noopener"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <FiGithub className="size-4" />
            <span className="flex-1">GitHub</span>
            <span className="font-mono text-[0.625rem] opacity-40">lyestarzalt</span>
          </a>
          <a href="https://linkedin.com/in/lyes-tarzalt" target="_blank" rel="noopener"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <FiLinkedin className="size-4" />
            <span className="flex-1">LinkedIn</span>
            <span className="font-mono text-[0.625rem] opacity-40">lyes-tarzalt</span>
          </a>
          <a href="mailto:lyes.trzlt@gmail.com"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <FiMail className="size-4" />
            <span className="flex-1">Email</span>
            <span className="font-mono text-[0.625rem] opacity-40">lyes.trzlt</span>
          </a>
        </div>

        <Separator className="my-4" />

        {/* Theme */}
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-muted-foreground">Theme</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="gap-1.5"
              onClick={() => { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }}>
              <FiSun className="size-3.5" /> Light
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5"
              onClick={() => { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }}>
              <FiMoon className="size-3.5" /> Dark
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
