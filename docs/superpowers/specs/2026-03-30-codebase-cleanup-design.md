# Codebase Cleanup — Full Design Spec

**Date:** 2026-03-30
**Scope:** Full cleanup of tarzalt.dev Astro blog — code quality, structure, tooling, accessibility, security.
**Constraint:** Blog posts remain template-driven via content collections. Project pages remain hand-crafted for personality.

---

## Execution Order

1. Delete dead code & unused dependencies
2. Add tooling (Prettier, ESLint, pre-commit hooks)
3. Extract shared utilities & centralize config
4. Fix font token system & blog prose styling
5. Accessibility & security fixes
6. Miscellaneous cleanup

---

## 1. Delete Dead Code & Unused Dependencies

### Files to delete
- `src/components/ProfileAvatar.tsx` — React duplicate of `ProfileAvatar.astro`, never imported anywhere.
- `src/components/DinarScreenshotGallery.tsx` — duplicate of `ScreenshotGallery.tsx`, replaced by a generic `Gallery.tsx` in Phase 3.

### CSS variables to remove from `src/styles/global.css`
Remove from `:root`, `.dark`, and any light-theme blocks:
- `--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring` (8 variables x 2 themes = 16 declarations)
- `--chart-1` through `--chart-5` (5 variables x 2 themes = 10 declarations)

### Dependencies to remove from `package.json`
- `tw-animate-css` — not referenced in any source file.
- `radix-ui` metapackage — verify if individual `@radix-ui/*` packages already cover usage; remove metapackage if redundant.

---

## 2. Tooling — ESLint + Prettier + Pre-commit Hooks

### Prettier
- Add `.prettierrc`:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "plugins": ["prettier-plugin-astro"],
    "overrides": [
      { "files": "*.astro", "options": { "parser": "astro" } }
    ]
  }
  ```
- Run `npx prettier --write .` as a standalone commit before any other changes ("chore: format codebase with Prettier").

### ESLint
- Add `eslint.config.js` using flat config:
  - `@typescript-eslint` — type-aware rules for `.ts`/`.tsx`
  - `eslint-plugin-astro` — Astro-specific rules
  - `eslint-plugin-jsx-a11y` — accessibility lint rules for JSX
- Light ruleset: catch bugs and a11y, not style (Prettier handles style).

### Pre-commit hooks
- Install `husky` + `lint-staged`.
- `lint-staged` config in `package.json`:
  ```json
  {
    "lint-staged": {
      "*.{ts,tsx,js,astro}": ["prettier --write", "eslint --fix"],
      "*.{md,mdx,json,css}": ["prettier --write"]
    }
  }
  ```

### npm scripts to add
```json
{
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "astro check"
}
```

---

## 3. Extract Shared Utilities & Centralize Config

### `src/lib/date.ts` — shared date formatting
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

Replace duplicate `formatDate` in:
- `src/pages/index.astro` (uses short format, no day)
- `src/pages/blog/index.astro` (uses full format, with day)
- `src/layouts/BlogPost.astro` (uses full format, with day)

### `src/config/social.ts` — social links
```typescript
export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/lyestarzalt', icon: 'github' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/lyes-tarzalt', icon: 'linkedin' },
  { label: 'Email', href: 'mailto:lyes.trzlt@gmail.com', icon: 'mail' },
] as const;
```

Consumed by:
- `src/components/SocialLinks.tsx` — remove hardcoded array, import from config
- `src/components/MobileNav.tsx` — remove duplicated links, import from config

### `src/config/navigation.ts` — nav items
```typescript
export const navigationItems = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Writing', href: '/blog/' },
  { label: 'About', href: '/about/' },
] as const;
```

Consumed by:
- `src/components/Header.astro` — remove hardcoded array, import from config

### Merge gallery components — `src/components/Gallery.tsx`
Refactor `ScreenshotGallery.tsx` into a generic `Gallery.tsx`:

```typescript
interface GalleryProps {
  screenshots: { src: string; alt: string }[];
}
```

- Accepts screenshots as a prop instead of hardcoding them.
- Each project page passes its own array.
- Delete `DinarScreenshotGallery.tsx`.
- Update `src/pages/projects/x-dispatch.astro` and `dinar-echange.astro` to use `<Gallery screenshots={[...]} />`.

---

## 4. Font Token System & Blog Prose Styling

### Fix font tokens
**`src/styles/global.css`** already defines:
```css
--font-heading: 'Bricolage Grotesque', sans-serif;
--font-sans: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**`src/layouts/Base.astro`** — replace all hardcoded font references:
- `font-family: 'Bricolage Grotesque', sans-serif` → `font-family: var(--font-heading)`
- `font-family: 'JetBrains Mono'` → `font-family: var(--font-mono)`
- Any other hardcoded font-family declarations → use the appropriate CSS variable

### Solidify blog prose styling
**`src/layouts/BlogPost.astro`** — ensure complete prose defaults so markdown renders correctly without per-post CSS:
- Headings (`h1`–`h4`): use `var(--font-heading)`, consistent sizing scale, proper margins
- Code blocks: use `var(--font-mono)`, proper background/padding
- Inline code: subtle background, `var(--font-mono)`, slightly smaller size
- Blockquotes: left border, italic, muted color
- Lists (`ul`, `ol`): proper indentation and bullet/number styling
- Tables: bordered, alternating row backgrounds
- Links: accent color, underline on hover
- Images: max-width, centered, optional caption via `Figure.astro`

**Result:** Write a new blog post in markdown, it looks correct automatically. No CSS fiddling needed.

---

## 5. Accessibility & Security

### Accessibility
| File | Issue | Fix |
|------|-------|-----|
| `HeaderStatus.tsx` | `text-muted-foreground/50` fails WCAG AA | Bump to `/70` or higher |
| `Gallery.tsx` (new) | Prev/next buttons hidden on mobile but keyboard-focusable | Add `aria-hidden="true"` and `tabindex="-1"` at mobile breakpoint |
| `Figure.astro` | Falls back to empty `alt=""` even for meaningful images | When `alt` is missing but `caption` exists, use caption as alt |
| `LinkPreview.astro` | `alt={title}` can be very long | Use `alt="${siteName} preview"` or truncated title |
| Gallery images | Raw `<img>` tags, no optimization | Pre-optimize images in the Astro parent page using `getImage()`, pass optimized URLs as props to the React gallery |

### Security
| File | Issue | Fix |
|------|-------|-----|
| `public/_headers` | Empty file, no security headers | Add CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| `Base.astro` | Google Fonts `<link>` missing `crossorigin` | Add `crossorigin` attribute |
| `LinkPreview.astro` | Spoofed browser User-Agent | Use proper bot identifier: `User-Agent: tarzalt.dev-bot/1.0` |

### Security headers for `public/_headers`
```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP will be scoped to allow Google Fonts, KaTeX CDN, and inline scripts/styles already in use.

---

## 6. Miscellaneous Cleanup

### Grain overlay (`Base.astro`)
Move the inline SVG data URI from the HTML template to a CSS class in `global.css`:
```css
.grain-overlay {
  background-image: url("data:image/svg+xml,...");
}
```
The `<div>` in `Base.astro` becomes `<div class="grain-overlay ...">`.

### Z-index scale
Define in `global.css` or Tailwind config:
```css
:root {
  --z-overlay: 50;
}
```
Replace `z-[9999]` with `z-[var(--z-overlay)]` or a Tailwind extend value.

### Shiki dual-theme CSS
Replace fragile `.dark` class-based selectors with `data-theme` attribute selectors, or use Astro's built-in dark mode mechanism for Shiki if available. Current implementation:
```css
.dark pre code .line span { color: var(--shiki-dark, inherit) !important; }
html:not(.dark) pre code .line span { color: var(--shiki-light, inherit) !important; }
```
Replace with a single rule using CSS `light-dark()` or media queries if the theme toggle supports it.

### Console easter egg
Move to `<script is:inline>` with `defer`-like behavior (wrap in `DOMContentLoaded` or place at end of body).

### Dependency audit
- Verify `radix-ui` metapackage vs individual `@radix-ui/*` imports — remove metapackage if redundant.
- Confirm Astro v6 in `package.json` matches actually installed version.
