# Easter Eggs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 easter eggs to tarzalt.dev — time-aware header greeting, evolving console message, Algerian flag logo flash, and terminal-style /wtf page.

**Architecture:** Each egg is an isolated inline script or component rewrite. No shared framework. They don't know about each other and can be added/removed independently.

**Tech Stack:** Astro, React (HeaderStatus only), vanilla JS (inline scripts), CSS animations

---

## File Map

### Files to modify
- `src/components/HeaderStatus.tsx` — rewrite: replace random statuses with time-aware greeting
- `src/components/Header.astro` — add `data-logo` attribute to logo `<a>` element
- `src/layouts/Base.astro` — rewrite console script, add logo flash script

### Files to rewrite
- `src/pages/wtf.astro` — complete rewrite: standalone terminal page

---

## Task 1: Time-Aware Header Greeting

**Files:**
- Modify: `src/components/HeaderStatus.tsx`

- [ ] **Step 1: Rewrite HeaderStatus.tsx**

Replace the entire contents of `src/components/HeaderStatus.tsx` with:

```tsx
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
      className={`hidden md:inline-block font-mono text-[0.625rem] text-muted-foreground/70 transition-opacity duration-1000 select-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {greeting}
    </span>
  );
}
```

Changes from original:
- Removed `statuses` array and random selection
- Added `getGreeting()` function with time-based logic
- Removed `title="Refresh for a new one"` (no longer random)
- State renamed from `status` to `greeting`

- [ ] **Step 2: Verify build**

```bash
npx astro build
```
Expected: Build completes, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/HeaderStatus.tsx
git commit -m "feat: replace random header status with time-aware greeting"
```

---

## Task 2: Evolving Console Message

**Files:**
- Modify: `src/layouts/Base.astro:94-103`

- [ ] **Step 1: Replace the console easter egg script**

In `src/layouts/Base.astro`, replace the entire console easter egg script block (lines 94-103):

```astro
    <!-- Console easter egg -->
    <script is:inline>
      document.addEventListener('DOMContentLoaded', function () {
        console.log(
          "%c hey. %c\n\nYou're either debugging my site or you're curious.\nEither way, I respect it.\n\n— Lyes\n\nhttps://github.com/lyestarzalt",
          'font-size: 24px; font-weight: bold; color: #d4a054;',
          'font-size: 13px; color: #8a8a8a; line-height: 1.6;',
        );
      });
    </script>
```

With:

```astro
    <!-- Console easter egg -->
    <script is:inline>
      document.addEventListener('DOMContentLoaded', function () {
        // Track visits: increment once per session
        if (!sessionStorage.getItem('lt-session')) {
          var count = parseInt(localStorage.getItem('lt-visits') || '0', 10) + 1;
          localStorage.setItem('lt-visits', String(count));
          sessionStorage.setItem('lt-session', '1');
        }
        var visits = parseInt(localStorage.getItem('lt-visits') || '1', 10);

        var heading, body;
        if (visits === 1) {
          heading = ' hey. ';
          body = "\n\nYou're either debugging my site or you're curious.\nEither way, I respect it.\n\n— Lyes\n\nhttps://github.com/lyestarzalt";
        } else if (visits === 2) {
          heading = " oh, you're back. ";
          body = '';
        } else {
          heading = ' you keep coming back. I like that. ';
          body = '';
        }

        if (body) {
          console.log(
            '%c' + heading + '%c' + body,
            'font-size: 24px; font-weight: bold; color: #d4a054;',
            'font-size: 13px; color: #8a8a8a; line-height: 1.6;',
          );
        } else {
          console.log(
            '%c' + heading,
            'font-size: 24px; font-weight: bold; color: #d4a054;',
          );
        }
      });
    </script>
```

- [ ] **Step 2: Verify build**

```bash
npx astro build
```
Expected: Build completes, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: evolving console message based on visit count"
```

---

## Task 3: Logo Algerian Flag Flash

**Files:**
- Modify: `src/components/Header.astro:12-17` (add data attribute)
- Modify: `src/layouts/Base.astro` (add new script block)

- [ ] **Step 1: Add data-logo attribute to Header.astro**

In `src/components/Header.astro`, add `data-logo` to the logo `<a>` element. Replace lines 12-17:

```astro
      <a
        href="/"
        class="group flex size-8 items-center justify-center rounded-md border border-border font-heading text-sm font-bold text-foreground no-underline transition-all hover:border-primary hover:text-primary hover:shadow-[0_0_12px_-3px] hover:shadow-primary/30"
      >
        LT
      </a>
```

With:

```astro
      <a
        href="/"
        data-logo
        class="group flex size-8 items-center justify-center rounded-md border border-border font-heading text-sm font-bold text-foreground no-underline transition-all hover:border-primary hover:text-primary hover:shadow-[0_0_12px_-3px] hover:shadow-primary/30"
      >
        LT
      </a>
```

- [ ] **Step 2: Add flag flash script to Base.astro**

In `src/layouts/Base.astro`, add a new `<script is:inline>` block after the console easter egg script (after the closing `</script>` on line ~113, before `</body>`):

```astro
    <!-- Flag flash easter egg -->
    <script is:inline>
      document.addEventListener('DOMContentLoaded', function () {
        var logo = document.querySelector('[data-logo]');
        if (!logo) return;

        var clicks = [];
        var flashing = false;

        function flash() {
          if (flashing) return;
          flashing = true;

          var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          var prop = reduced ? 'borderColor' : 'boxShadow';
          var colors = reduced
            ? ['#006233', '#ffffff', '#d21034']
            : ['0 0 12px -3px #006233', '0 0 12px -3px #ffffff', '0 0 12px -3px #d21034'];

          var i = 0;
          function next() {
            if (i < colors.length) {
              logo.style[prop] = colors[i];
              i++;
              setTimeout(next, 200);
            } else {
              logo.style.removeProperty('box-shadow');
              logo.style.removeProperty('border-color');
              flashing = false;
            }
          }
          next();
        }

        function onActivate(e) {
          var now = Date.now();
          clicks.push(now);
          clicks = clicks.filter(function (t) { return now - t < 1000; });
          if (clicks.length >= 5) {
            e.preventDefault();
            clicks = [];
            flash();
          }
        }

        logo.addEventListener('click', function (e) {
          onActivate(e);
        });

        logo.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            onActivate(e);
          }
        });
      });
    </script>
```

- [ ] **Step 3: Verify build**

```bash
npx astro build
```
Expected: Build completes, no errors.

- [ ] **Step 4: Manual test**

```bash
npx astro dev
```

Open `http://localhost:4321`. Click the "LT" logo 5 times rapidly. The glow should cycle green → white → red → back to normal. Also test with keyboard: Tab to the logo, press Enter 5 times rapidly.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/layouts/Base.astro
git commit -m "feat: Algerian flag flash on logo rapid click"
```

---

## Task 4: Terminal /wtf Page

**Files:**
- Rewrite: `src/pages/wtf.astro`

- [ ] **Step 1: Rewrite wtf.astro**

Replace the entire contents of `src/pages/wtf.astro` with:

```astro
---
import '@/styles/global.css';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>? — Lyes Tarzalt</title>
    <script is:inline>
      (function () {
        var t = localStorage.getItem('theme') || 'dark';
        if (t === 'dark') document.documentElement.classList.add('dark');
      })();
    </script>
  </head>
  <body>
    <div class="terminal">
      <pre id="output"></pre>
      <span id="cursor" class="cursor">_</span>
      <a id="back" href="/" class="back-link">← back</a>
    </div>

    <script is:inline>
      document.addEventListener('DOMContentLoaded', function () {
        var lines = [
          '> you found this.',
          '> I put it here to see who reads source code.',
          '> turns out, you do.',
          '>',
          '> anyway.',
          '>',
          '> I once mass-deleted a production database',
          '> because the variable was named temp_backup.',
          '> it was not a backup.',
        ];

        var text = lines.join('\n');
        var output = document.getElementById('output');
        var cursor = document.getElementById('cursor');
        var back = document.getElementById('back');

        // Respect prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          output.textContent = text;
          cursor.style.display = 'inline';
          setTimeout(function () { back.classList.add('visible'); }, 500);
          return;
        }

        var i = 0;
        function type() {
          if (i < text.length) {
            output.textContent += text.charAt(i);
            i++;
            var delay = 30 + Math.random() * 20;
            // Pause slightly longer after newlines
            if (text.charAt(i - 1) === '\n') delay += 80;
            setTimeout(type, delay);
          } else {
            // Typing done — show cursor and back link
            cursor.style.display = 'inline';
            setTimeout(function () { back.classList.add('visible'); }, 1000);
          }
        }

        cursor.style.display = 'none';
        type();
      });
    </script>
  </body>
</html>

<style>
  @reference "@/styles/global.css";

  body {
    margin: 0;
    background: var(--card);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .terminal {
    @apply max-w-lg px-6;
    font-family: var(--font-mono);
  }

  #output {
    @apply text-sm leading-relaxed;
    color: oklch(0.76 0.14 55);
    white-space: pre-wrap;
    margin: 0;
    background: none;
    border: none;
    padding: 0;
  }

  .cursor {
    @apply text-sm;
    color: oklch(0.76 0.14 55);
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .back-link {
    @apply mt-10 block font-mono text-xs no-underline transition-opacity duration-500;
    color: var(--muted-foreground);
    opacity: 0;
  }

  .back-link.visible {
    opacity: 1;
  }

  .back-link:hover {
    color: oklch(0.76 0.14 55);
  }
</style>
```

Key details:
- Standalone page — no Base layout, no header/footer
- Imports `global.css` for CSS variables (fonts, colors)
- Theme script duplicated (same as Base.astro) so dark mode works
- Terminal text color uses `oklch(0.76 0.14 55)` — the dark theme primary/amber
- `prefers-reduced-motion`: shows all text immediately, no typewriter
- `<pre>` tag overridden with no background/border/padding (Base.astro global styles would add these, but since we import global.css for variables only, we reset them explicitly)
- Back link fades in 1 second after typing completes

- [ ] **Step 2: Verify build**

```bash
npx astro build
```
Expected: Build completes, 13 pages (same as before — wtf was already a page).

- [ ] **Step 3: Manual test**

```bash
npx astro dev
```

Open `http://localhost:4321/wtf`. Verify:
- Dark background, no header/footer
- Text types out character by character with amber color
- Cursor blinks after typing finishes
- "← back" link fades in after 1 second
- Click "← back" returns to homepage

- [ ] **Step 4: Commit**

```bash
git add src/pages/wtf.astro
git commit -m "feat: terminal-style /wtf easter egg page"
```

---

## Task 5: Final Verification

- [ ] **Step 1: Full build**

```bash
npx astro build
```
Expected: Clean build, no errors.

- [ ] **Step 2: Lint check**

```bash
npx eslint . && npx prettier --check .
```
Expected: All pass.

- [ ] **Step 3: Visual smoke test**

```bash
npx astro dev
```

Check:
- **Header greeting**: Shows time-appropriate greeting (e.g. "good morning" if it's morning)
- **Console**: Open DevTools console — should show "hey." message on first visit. Open new incognito window, visit twice to test evolving messages.
- **Logo flash**: Click "LT" logo 5 times rapidly — glow should cycle green → white → red
- **`/wtf`**: Visit `/wtf` — terminal typewriter effect with the database joke, cursor blinks, back link fades in
