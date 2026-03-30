# Codebase Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the tarzalt.dev Astro blog — remove dead code, add tooling, extract shared utilities, fix font tokens, improve accessibility and security.

**Architecture:** Approach C (inside-out): delete dead code first to reduce noise, add linting/formatting tooling on the cleaner codebase, then refactor shared utilities, fix font tokens + prose styling, and finish with a11y/security/misc fixes.

**Tech Stack:** Astro 6, React 19, Tailwind CSS 4, TypeScript, ESLint, Prettier, Husky

---

## File Map

### Files to delete
- `src/components/ProfileAvatar.tsx` — unused React duplicate
- `src/components/DinarScreenshotGallery.tsx` — replaced by generic Gallery
- `src/components/ScreenshotGallery.tsx` — replaced by generic Gallery

### Files to create
- `src/lib/date.ts` — shared date formatting utilities
- `src/config/social.ts` — centralized social links data
- `src/config/navigation.ts` — centralized nav items
- `src/components/Gallery.tsx` — generic screenshot gallery component
- `.prettierrc` — Prettier config
- `.prettierignore` — Prettier ignore patterns
- `eslint.config.js` — ESLint flat config

### Files to modify
- `src/styles/global.css` — remove dead CSS variables, add grain overlay class, add z-index token
- `src/layouts/Base.astro` — use font tokens, extract grain overlay to CSS class, use z-index token, add crossorigin, wrap easter egg
- `src/layouts/BlogPost.astro` — use shared formatDate, enhance prose styles
- `src/pages/index.astro` — use shared formatDateShort
- `src/pages/blog/index.astro` — use shared formatDate
- `src/pages/projects/x-dispatch.astro` — use Gallery component
- `src/pages/projects/dinar-echange.astro` — use Gallery component
- `src/components/Header.astro` — import nav items from config
- `src/components/SocialLinks.tsx` — import social links from config
- `src/components/MobileNav.tsx` — import social links from config
- `src/components/HeaderStatus.tsx` — fix contrast
- `src/components/Figure.astro` — fix alt text fallback
- `src/components/LinkPreview.astro` — fix User-Agent and alt text
- `public/_headers` — add CSP and Permissions-Policy
- `package.json` — add scripts, add dev dependencies, add lint-staged config

---

## Task 1: Delete Dead Code

**Files:**
- Delete: `src/components/ProfileAvatar.tsx`
- Modify: `src/styles/global.css:12-24` (theme block), `src/styles/global.css:78-91` (light theme), `src/styles/global.css:114-126` (dark theme)

- [ ] **Step 1: Delete unused ProfileAvatar.tsx**

```bash
rm src/components/ProfileAvatar.tsx
```

Verify it's not imported anywhere:
```bash
grep -r "ProfileAvatar.tsx\|from.*ProfileAvatar['\"]" src/ --include='*.tsx' --include='*.ts' --include='*.astro'
```
Expected: Only `ProfileAvatar.astro` imports remain (in `index.astro`, `about.astro`).

- [ ] **Step 2: Remove sidebar CSS variables from global.css**

In `src/styles/global.css`, remove these lines from the `@theme inline` block (lines 12-19):
```css
    --color-sidebar-ring: var(--sidebar-ring);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar: var(--sidebar);
```

Remove these lines from the `@theme inline` block (lines 20-24):
```css
    --color-chart-5: var(--chart-5);
    --color-chart-4: var(--chart-4);
    --color-chart-3: var(--chart-3);
    --color-chart-2: var(--chart-2);
    --color-chart-1: var(--chart-1);
```

- [ ] **Step 3: Remove sidebar variables from light theme `:root`**

In `src/styles/global.css`, remove from the `:root` block (lines 78-82, 84-91):
```css
    --chart-1: oklch(0.55 0.14 55);
    --chart-2: oklch(0.65 0.15 160);
    --chart-3: oklch(0.60 0.15 250);
    --chart-4: oklch(0.65 0.15 310);
    --chart-5: oklch(0.70 0.12 25);
```
```css
    --sidebar: oklch(0.95 0.005 70);
    --sidebar-foreground: oklch(0.14 0.02 250);
    --sidebar-primary: oklch(0.55 0.14 55);
    --sidebar-primary-foreground: oklch(0.98 0 0);
    --sidebar-accent: oklch(0.93 0.005 70);
    --sidebar-accent-foreground: oklch(0.14 0.02 250);
    --sidebar-border: oklch(0.88 0.005 70);
    --sidebar-ring: oklch(0.55 0.14 55);
```

- [ ] **Step 4: Remove sidebar variables from dark theme `.dark`**

In `src/styles/global.css`, remove from the `.dark` block (lines 114-118, 119-126):
```css
    --chart-1: oklch(0.76 0.14 55);
    --chart-2: oklch(0.70 0.15 160);
    --chart-3: oklch(0.65 0.15 250);
    --chart-4: oklch(0.70 0.15 310);
    --chart-5: oklch(0.75 0.12 25);
```
```css
    --sidebar: oklch(0.16 0.015 250);
    --sidebar-foreground: oklch(0.92 0.01 70);
    --sidebar-primary: oklch(0.76 0.14 55);
    --sidebar-primary-foreground: oklch(0.12 0.015 250);
    --sidebar-accent: oklch(0.20 0.015 250);
    --sidebar-accent-foreground: oklch(0.92 0.01 70);
    --sidebar-border: oklch(0.24 0.015 250);
    --sidebar-ring: oklch(0.76 0.14 55);
```

- [ ] **Step 5: Verify build passes**

```bash
npx astro build
```
Expected: Build completes with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove dead code and unused CSS variables

Delete unused ProfileAvatar.tsx React duplicate.
Remove sidebar and chart CSS variables (template leftovers, never referenced)."
```

---

## Task 2: Add Prettier

**Files:**
- Create: `.prettierrc`, `.prettierignore`
- Modify: `package.json`

- [ ] **Step 1: Install Prettier and Astro plugin**

```bash
npm install -D prettier prettier-plugin-astro
```

- [ ] **Step 2: Create .prettierrc**

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

- [ ] **Step 3: Create .prettierignore**

Create `.prettierignore`:
```
dist
node_modules
.astro
pnpm-lock.yaml
package-lock.json
```

- [ ] **Step 4: Add format scripts to package.json**

Add to `"scripts"` in `package.json`:
```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 5: Run Prettier on entire codebase**

```bash
npx prettier --write .
```

- [ ] **Step 6: Verify build still passes**

```bash
npx astro build
```

- [ ] **Step 7: Commit formatted codebase**

```bash
git add -A
git commit -m "chore: format codebase with Prettier"
```

---

## Task 3: Add ESLint

**Files:**
- Create: `eslint.config.js`
- Modify: `package.json`

- [ ] **Step 1: Install ESLint and plugins**

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-astro eslint-plugin-jsx-a11y
```

- [ ] **Step 2: Create eslint.config.js**

Create `eslint.config.js`:
```js
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astroPlugin from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },
  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Astro files
  ...astroPlugin.configs.recommended,
];
```

- [ ] **Step 3: Add lint script to package.json**

Add to `"scripts"` in `package.json`:
```json
"lint": "eslint .",
"typecheck": "astro check"
```

- [ ] **Step 4: Run ESLint and fix auto-fixable issues**

```bash
npx eslint . --fix
```

Review any remaining warnings. Fix or suppress with inline comments only if the warning is a false positive.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add ESLint with TypeScript, Astro, and a11y plugins"
```

---

## Task 4: Add Pre-commit Hooks

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install husky and lint-staged**

```bash
npm install -D husky lint-staged
```

- [ ] **Step 2: Initialize husky**

```bash
npx husky init
```

This creates `.husky/pre-commit`. Replace its contents with:
```bash
npx lint-staged
```

- [ ] **Step 3: Add lint-staged config to package.json**

Add to `package.json` (top level):
```json
"lint-staged": {
  "*.{ts,tsx,js,astro}": ["prettier --write", "eslint --fix"],
  "*.{md,mdx,json,css}": ["prettier --write"]
}
```

- [ ] **Step 4: Test the hook with a dummy change**

```bash
echo "// test" >> src/lib/utils.ts
git add src/lib/utils.ts
git commit -m "test: verify pre-commit hook"
```

Expected: Prettier and ESLint run on the staged file. Then revert:
```bash
git reset HEAD~1
git checkout -- src/lib/utils.ts
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add husky pre-commit hooks with lint-staged"
```

---

## Task 5: Extract Shared Date Utilities

**Files:**
- Create: `src/lib/date.ts`
- Modify: `src/pages/index.astro:17-19`, `src/pages/blog/index.astro:10-12`, `src/layouts/BlogPost.astro:27-29`

- [ ] **Step 1: Create src/lib/date.ts**

Create `src/lib/date.ts`:
```typescript
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}
```

- [ ] **Step 2: Update src/pages/index.astro**

In `src/pages/index.astro`, replace the inline `formatDate` function (lines 17-19):
```astro
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
```

With an import at the top of the frontmatter (after line 11):
```astro
import { formatDateShort } from '@/lib/date';
```

Then update the usage on line 128 from `{formatDate(post.data.date)}` to `{formatDateShort(post.data.date)}`.

- [ ] **Step 3: Update src/pages/blog/index.astro**

In `src/pages/blog/index.astro`, replace the inline `formatDate` function (lines 10-12):
```astro
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
```

With an import at the top of the frontmatter (after line 5):
```astro
import { formatDate } from '@/lib/date';
```

The usage on line 37 `{formatDate(post.data.date)}` stays the same — function name matches.

- [ ] **Step 4: Update src/layouts/BlogPost.astro**

In `src/layouts/BlogPost.astro`, replace the inline `formatDate` function (lines 27-29):
```astro
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
```

With an import at the top of the frontmatter (after line 14):
```astro
import { formatDate } from '@/lib/date';
```

The usages on lines 52 and 56 stay the same.

- [ ] **Step 5: Verify build passes**

```bash
npx astro build
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/date.ts src/pages/index.astro src/pages/blog/index.astro src/layouts/BlogPost.astro
git commit -m "refactor: extract shared date formatting to src/lib/date.ts"
```

---

## Task 6: Centralize Social Links Config

**Files:**
- Create: `src/config/social.ts`
- Modify: `src/components/SocialLinks.tsx`, `src/components/MobileNav.tsx`

- [ ] **Step 1: Create src/config/social.ts**

Create `src/config/social.ts`:
```typescript
export interface SocialLink {
  label: string;
  href: string;
  tip: string;
  username: string;
}

export const socialLinks: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/lyestarzalt',
    tip: 'where the code lives',
    username: 'lyestarzalt',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/lyes-tarzalt',
    tip: 'the professional one',
    username: 'lyes-tarzalt',
  },
  {
    label: 'Email',
    href: 'mailto:lyes.trzlt@gmail.com',
    tip: 'old school',
    username: 'lyes.trzlt',
  },
];
```

- [ ] **Step 2: Update SocialLinks.tsx to use config**

Replace the hardcoded `links` array in `src/components/SocialLinks.tsx`. The file becomes:

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi"
import { socialLinks } from "@/config/social"

const iconMap: Record<string, React.ReactNode> = {
  GitHub: <FiGithub className="size-3.5" />,
  LinkedIn: <FiLinkedin className="size-3.5" />,
  Email: <FiMail className="size-3.5" />,
}

export function SocialLinks() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-2">
        {socialLinks.map((link) => (
          <Tooltip key={link.href}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" asChild>
                <a href={link.href} target={link.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener" className="gap-1.5">
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
  )
}
```

- [ ] **Step 3: Update MobileNav.tsx to use config**

In `src/components/MobileNav.tsx`, replace the hardcoded social links section (lines 69-88).

Add import at top:
```tsx
import { socialLinks } from "@/config/social"
```

Replace the hardcoded `<div className="flex flex-col gap-1">` social section (lines 69-88) with:

```tsx
        <div className="flex flex-col gap-1">
          {socialLinks.map((link) => (
            <a key={link.href} href={link.href} target={link.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              {socialIconMap[link.label]}
              <span className="flex-1">{link.label}</span>
              <span className="font-mono text-[0.625rem] opacity-40">{link.username}</span>
            </a>
          ))}
        </div>
```

Also add above the `MobileNav` function:
```tsx
const socialIconMap: Record<string, React.ReactNode> = {
  GitHub: <FiGithub className="size-4" />,
  LinkedIn: <FiLinkedin className="size-4" />,
  Email: <FiMail className="size-4" />,
}
```

- [ ] **Step 4: Verify build passes**

```bash
npx astro build
```

- [ ] **Step 5: Commit**

```bash
git add src/config/social.ts src/components/SocialLinks.tsx src/components/MobileNav.tsx
git commit -m "refactor: centralize social links in src/config/social.ts"
```

---

## Task 7: Centralize Navigation Config

**Files:**
- Create: `src/config/navigation.ts`
- Modify: `src/components/Header.astro:7-11`

- [ ] **Step 1: Create src/config/navigation.ts**

Create `src/config/navigation.ts`:
```typescript
export interface NavItem {
  label: string;
  href: string;
}

export const navigationItems: NavItem[] = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Writing', href: '/blog/' },
  { label: 'About', href: '/about/' },
];
```

- [ ] **Step 2: Update Header.astro**

In `src/components/Header.astro`, replace the hardcoded `navItems` (lines 7-11):
```astro
const navItems = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Writing', href: '/blog/' },
  { label: 'About', href: '/about/' },
];
```

With an import:
```astro
import { navigationItems } from '@/config/navigation';
```

Then update references on lines 26 and 28 from `navItems` to `navigationItems`:
```astro
<DesktopNav items={navigationItems} client:load />
```
```astro
<MobileNav items={navigationItems} client:load />
```

- [ ] **Step 3: Verify build passes**

```bash
npx astro build
```

- [ ] **Step 4: Commit**

```bash
git add src/config/navigation.ts src/components/Header.astro
git commit -m "refactor: centralize navigation items in src/config/navigation.ts"
```

---

## Task 8: Merge Gallery Components

**Files:**
- Create: `src/components/Gallery.tsx`
- Delete: `src/components/ScreenshotGallery.tsx`, `src/components/DinarScreenshotGallery.tsx`
- Modify: `src/pages/projects/x-dispatch.astro:8,50`, `src/pages/projects/dinar-echange.astro:8,47`

- [ ] **Step 1: Create src/components/Gallery.tsx**

Create `src/components/Gallery.tsx`:
```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useState, useEffect, useCallback } from "react"
import type { CarouselApi } from "@/components/ui/carousel"

export interface Screenshot {
  src: string;
  alt: string;
}

interface GalleryProps {
  screenshots: Screenshot[];
  maxWidth?: string;
  showNav?: boolean;
}

export function Gallery({ screenshots, maxWidth, showNav = true }: GalleryProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const onSelect = useCallback(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on("select", onSelect)
    return () => { api.off("select", onSelect) }
  }, [api, onSelect])

  return (
    <div className={maxWidth ?? undefined}>
      <Carousel setApi={setApi} opts={{ loop: true }} className="relative">
        <CarouselContent>
          {screenshots.map((s, i) => (
            <CarouselItem key={i}>
              <div className="overflow-hidden rounded-xl border border-border">
                <img
                  src={s.src}
                  alt={s.alt}
                  className="w-full"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showNav && (
          <>
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
          </>
        )}
      </Carousel>

      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground">
          {screenshots[current]?.alt}
        </p>
        <div className="flex gap-1.5">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`size-1.5 rounded-full transition-all ${
                i === current
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to ${screenshots[i].alt}`}
            />
          ))}
        </div>
        {showNav && (
          <p className="font-mono text-[0.625rem] text-muted-foreground/40">
            {current + 1} / {screenshots.length}
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update x-dispatch.astro**

In `src/pages/projects/x-dispatch.astro`, replace the import (line 8):
```astro
import { ScreenshotGallery } from '@/components/ScreenshotGallery';
```
With:
```astro
import { Gallery } from '@/components/Gallery';
```

Replace the usage (line 50):
```astro
<ScreenshotGallery client:load />
```
With:
```astro
<Gallery
  client:load
  screenshots={[
    { src: "/images/projects/x-dispatch/x-dispatch-map.png", alt: "World Map" },
    { src: "/images/projects/x-dispatch/x-dispatch-airport.png", alt: "Airport Detail" },
    { src: "/images/projects/x-dispatch/x-dispatch-terrain.png", alt: "3D Terrain" },
    { src: "/images/projects/x-dispatch/x-dispatch-flight-setup.png", alt: "Flight Setup" },
    { src: "/images/projects/x-dispatch/x-dispatch-procedures.png", alt: "SID/STAR" },
    { src: "/images/projects/x-dispatch/x-dispatch-simbrief1.png", alt: "SimBrief" },
    { src: "/images/projects/x-dispatch/x-dispatch-weather.png", alt: "Weather" },
    { src: "/images/projects/x-dispatch/x-dispatch-tracking.png", alt: "Live Tracking" },
    { src: "/images/projects/x-dispatch/x-dispatch-fuel.png", alt: "Fuel & Payload" },
    { src: "/images/projects/x-dispatch/x-dispatch-starting.png", alt: "Start Position" },
    { src: "/images/projects/x-dispatch/x-dispatch-addon1.png", alt: "Addon Browser" },
  ]}
/>
```

- [ ] **Step 3: Update dinar-echange.astro**

In `src/pages/projects/dinar-echange.astro`, replace the import (line 8):
```astro
import { DinarScreenshotGallery } from '@/components/DinarScreenshotGallery';
```
With:
```astro
import { Gallery } from '@/components/Gallery';
```

Replace the usage (line 47):
```astro
<DinarScreenshotGallery client:load />
```
With:
```astro
<Gallery
  client:load
  maxWidth="mx-auto max-w-xs"
  showNav={false}
  screenshots={[
    { src: "/images/projects/dinar-echange/screenshot-currencies.png", alt: "Currency Rates" },
    { src: "/images/projects/dinar-echange/screenshot-converter.png", alt: "Converter" },
    { src: "/images/projects/dinar-echange/screenshot-trends.png", alt: "Trends" },
  ]}
/>
```

- [ ] **Step 4: Delete old gallery components**

```bash
rm src/components/ScreenshotGallery.tsx src/components/DinarScreenshotGallery.tsx
```

- [ ] **Step 5: Verify build passes**

```bash
npx astro build
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: merge gallery components into generic Gallery.tsx"
```

---

## Task 9: Fix Font Token System

**Files:**
- Modify: `src/layouts/Base.astro:99-107`

- [ ] **Step 1: Replace hardcoded font references in Base.astro**

In `src/layouts/Base.astro`, in the `<style is:global>` block, replace lines 99-100:
```css
  .font-heading, h1, h2, h3, h4 {
    font-family: 'Bricolage Grotesque', sans-serif;
```
With:
```css
  .font-heading, h1, h2, h3, h4 {
    font-family: var(--font-heading);
```

Replace lines 106-107:
```css
    font-family: 'JetBrains Mono', var(--font-mono, monospace);
```
With (in both `pre` and `code` rules):
```css
    font-family: var(--font-mono);
```

The `pre` block (line 107) becomes:
```css
    font-family: var(--font-mono);
```

The `code` block (line 112) becomes:
```css
    font-family: var(--font-mono);
```

- [ ] **Step 2: Verify build and visual check**

```bash
npx astro dev
```

Open `http://localhost:4321` and verify headings use Bricolage Grotesque and code blocks use JetBrains Mono. Check a blog post too.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "fix: use CSS custom properties for fonts instead of hardcoded values"
```

---

## Task 10: Solidify Blog Prose Styling

**Files:**
- Modify: `src/layouts/BlogPost.astro:87-105`

- [ ] **Step 1: Enhance prose styles in BlogPost.astro**

In `src/layouts/BlogPost.astro`, replace the `<style>` block (lines 87-105) with:

```astro
<style>
  @reference "@/styles/global.css";

  .prose { @apply leading-relaxed text-muted-foreground; }
  .prose :global(h2) {
    @apply mt-14 mb-4 font-heading text-xl font-semibold tracking-tight text-foreground;
  }
  .prose :global(h3) { @apply mt-8 mb-3 font-heading text-lg font-semibold text-foreground; }
  .prose :global(h4) { @apply mt-6 mb-2 font-heading text-base font-semibold text-foreground; }
  .prose :global(p) { @apply mb-5; }
  .prose :global(ul), .prose :global(ol) { @apply mb-5; }
  .prose :global(strong) { @apply text-foreground font-medium; }
  .prose :global(a) {
    @apply text-primary underline underline-offset-[3px] decoration-primary/30 transition-colors;
  }
  .prose :global(a:hover) { @apply decoration-primary; }
  .prose :global(img) { @apply my-8 border border-border; }
  .prose :global(figure) { @apply my-8; }
  .prose :global(figcaption) { @apply mt-3 text-center font-mono text-xs text-muted-foreground/60; }
  .prose :global(hr) { @apply my-10; }
</style>
```

Changes from original:
- Added `h4` styling (was missing)
- Added `hr` prose styling
- All heading styles use `font-heading` class which now flows from the CSS variable

- [ ] **Step 2: Visual check with dev server**

```bash
npx astro dev
```

Open a blog post and verify: h2, h3, h4 headings render with correct font and spacing. Code blocks, blockquotes, lists, tables, links all look correct.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BlogPost.astro
git commit -m "fix: enhance blog prose styling with h4 and hr defaults"
```

---

## Task 11: Accessibility Fixes

**Files:**
- Modify: `src/components/HeaderStatus.tsx:34`, `src/components/Figure.astro:12`, `src/components/LinkPreview.astro:49`

- [ ] **Step 1: Fix HeaderStatus contrast**

In `src/components/HeaderStatus.tsx`, on line 34, replace:
```tsx
text-muted-foreground/50
```
With:
```tsx
text-muted-foreground/70
```

- [ ] **Step 2: Fix Figure.astro alt text fallback**

In `src/components/Figure.astro`, replace line 12:
```astro
  <img src={src} alt={alt || caption || ''} loading="lazy" class="w-full rounded-lg border border-border" />
```
With:
```astro
  <img src={src} alt={alt || caption || 'Illustration'} loading="lazy" class="w-full rounded-lg border border-border" />
```

This ensures images always have meaningful alt text. If neither `alt` nor `caption` is provided, "Illustration" is a better fallback than empty string (which marks the image as decorative).

- [ ] **Step 3: Fix LinkPreview.astro alt text**

In `src/components/LinkPreview.astro`, replace line 49:
```astro
        alt={title}
```
With:
```astro
        alt={`Preview of ${siteName}`}
```

- [ ] **Step 4: Verify build**

```bash
npx astro build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/HeaderStatus.tsx src/components/Figure.astro src/components/LinkPreview.astro
git commit -m "fix: improve accessibility - contrast, alt text fallbacks"
```

---

## Task 12: Security Fixes

**Files:**
- Modify: `public/_headers`, `src/layouts/Base.astro:47`, `src/components/LinkPreview.astro:15`

- [ ] **Step 1: Add security headers to public/_headers**

In `public/_headers`, add to the `/*` block (after the existing `X-Frame-Options` line at line 21):

Replace the entire `/*` block (lines 18-22):
```
/*
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
```

With:
```
/*
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self'
```

- [ ] **Step 2: Add crossorigin to Google Fonts link in Base.astro**

In `src/layouts/Base.astro`, line 47, replace:
```astro
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```
With:
```astro
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
```

- [ ] **Step 3: Fix User-Agent in LinkPreview.astro**

In `src/components/LinkPreview.astro`, replace line 15:
```astro
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
With:
```astro
  const res = await fetch(url, { headers: { 'User-Agent': 'tarzalt.dev-bot/1.0 (+https://tarzalt.dev)' } });
```

- [ ] **Step 4: Verify build**

```bash
npx astro build
```

- [ ] **Step 5: Commit**

```bash
git add public/_headers src/layouts/Base.astro src/components/LinkPreview.astro
git commit -m "fix: add CSP headers, crossorigin for fonts, proper bot User-Agent"
```

---

## Task 13: Miscellaneous Cleanup

**Files:**
- Modify: `src/styles/global.css`, `src/layouts/Base.astro:68-69,84-91`

- [ ] **Step 1: Move grain overlay to CSS class**

In `src/styles/global.css`, add before the `@layer base` block:
```css
.grain-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

In `src/layouts/Base.astro`, replace the grain overlay div (line 69):
```astro
    <div class="pointer-events-none fixed inset-0 z-[9999] opacity-[0.025] dark:opacity-[0.04]" style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;);"></div>
```
With:
```astro
    <div class="grain-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.025] dark:opacity-[0.04]"></div>
```

Note: `z-[9999]` is replaced with `z-50` (Tailwind's built-in scale, sufficient since no other element uses z-index higher than 50 in this layout).

- [ ] **Step 2: Wrap console easter egg in DOMContentLoaded**

In `src/layouts/Base.astro`, replace lines 85-91:
```astro
    <script is:inline>
      console.log(
        '%c hey. %c\n\nYou\'re either debugging my site or you\'re curious.\nEither way, I respect it.\n\n— Lyes\n\nhttps://github.com/lyestarzalt',
        'font-size: 24px; font-weight: bold; color: #d4a054;',
        'font-size: 13px; color: #8a8a8a; line-height: 1.6;'
      );
    </script>
```
With:
```astro
    <script is:inline>
      document.addEventListener('DOMContentLoaded', function() {
        console.log(
          '%c hey. %c\n\nYou\'re either debugging my site or you\'re curious.\nEither way, I respect it.\n\n— Lyes\n\nhttps://github.com/lyestarzalt',
          'font-size: 24px; font-weight: bold; color: #d4a054;',
          'font-size: 13px; color: #8a8a8a; line-height: 1.6;'
        );
      });
    </script>
```

- [ ] **Step 3: Verify build and visual check**

```bash
npx astro build && npx astro preview
```

Open `http://localhost:4321` — verify grain overlay is visible, console log appears after page load.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/Base.astro
git commit -m "chore: move grain overlay to CSS class, defer console easter egg, simplify z-index"
```

---

## Task 14: Final Verification

- [ ] **Step 1: Full production build**

```bash
npx astro build
```

Expected: Clean build, no errors.

- [ ] **Step 2: Run all linting**

```bash
npx eslint .
npx prettier --check .
npx astro check
```

Expected: All pass clean.

- [ ] **Step 3: Visual smoke test**

```bash
npx astro preview
```

Check these pages:
- Home page (`/`)
- Blog index (`/blog/`)
- A blog post (`/blog/building-x-dispatch/`)
- X-Dispatch project (`/projects/x-dispatch/`)
- Dinar Echange project (`/projects/dinar-echange/`)

Verify:
- Fonts render correctly (headings = Bricolage Grotesque, body = Inter, code = JetBrains Mono)
- Gallery works on both project pages
- Social links appear in header and mobile nav
- Dark/light theme toggle works
- Grain overlay visible
- Console easter egg fires
