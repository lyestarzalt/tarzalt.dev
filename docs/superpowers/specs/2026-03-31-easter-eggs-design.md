# Easter Eggs — Design Spec

**Date:** 2026-03-31
**Scope:** 4 hidden/contextual features for tarzalt.dev — time greeting, evolving console, logo flag flash, terminal /wtf page.
**Approach:** Inline scripts per egg, no shared framework. Each egg is isolated, self-contained, zero dependencies on other eggs.

---

## Egg 1: Time-Aware Header Greeting

**Type:** Contextual (time-based)
**Trigger:** Automatic on every page load
**Location:** `src/components/HeaderStatus.tsx` — replaces the current random status rotation

### Behavior

Check visitor's local time via `new Date().getHours()` and display a greeting:

| Hours (local) | Text |
|---------------|------|
| 5–11 | good morning |
| 12–17 | good afternoon |
| 18–21 | good evening |
| 22–24 | shouldn't you be sleeping? |
| 0–4 | ehh can't find sleep? |

The greeting replaces the random status entirely. Same position, same styling (`font-mono text-[0.625rem] text-muted-foreground/70`), same fade-in animation.

### Implementation

Rewrite `HeaderStatus.tsx`. Remove the `statuses` array. On mount, read `new Date().getHours()`, pick the greeting, display it with the existing fade-in behavior.

### Accessibility

Text-based, no interaction required, works with screen readers.

---

## Egg 2: Evolving Console Message

**Type:** Cumulative (visit-based)
**Trigger:** Automatic on page load
**Location:** `src/layouts/Base.astro` — modifies the existing console easter egg `<script is:inline>` block

### Behavior

Track visits using `localStorage('lt-visits')`. Use `sessionStorage('lt-session')` as a guard so refreshes within the same session don't inflate the count.

| Visit count | Console output |
|-------------|---------------|
| 1 | `hey.` + existing message ("You're either debugging my site or you're curious...") |
| 2 | `oh, you're back.` (styled the same, no additional text) |
| 3+ | `you keep coming back. I like that.` (styled the same, no additional text) |

The `%c` styled formatting stays the same across all variants — large amber heading, smaller gray body text.

### Implementation

Modify the existing `<script is:inline>` block in `Base.astro`. On DOMContentLoaded:
1. Check `sessionStorage.getItem('lt-session')` — if absent, increment `localStorage('lt-visits')` and set the session flag
2. Read visit count
3. Pick the appropriate message
4. `console.log()` with the same `%c` styling

### State management

- `localStorage('lt-visits')` — integer, persists across sessions
- `sessionStorage('lt-session')` — flag ('1'), prevents double-counting within a session

---

## Egg 3: Logo Algerian Flag Flash

**Type:** Exploration (accidental/curious)
**Trigger:** 5 rapid clicks on the "LT" header logo within 1 second
**Location:** `src/layouts/Base.astro` — new `<script is:inline>` block

### Behavior

When the "LT" logo `<a>` element receives 5 clicks within a 1-second window:
1. The existing `hover:shadow-primary/30` glow changes to green (`#006233`) — holds 200ms
2. Changes to white (`#ffffff`) — holds 200ms
3. Changes to red (`#d21034`) — holds 200ms
4. Returns to normal state

The effect targets the `box-shadow` CSS property on the logo element, using inline style overrides that are removed after the sequence completes.

### Accessibility

- Also triggered by pressing Enter 5 times rapidly when the logo is focused (keyboard accessible)
- Respects `prefers-reduced-motion`: if enabled, changes border-color instead of box-shadow (no glow animation, just color swap)
- Can be repeated unlimited times
- No hint that this exists — pure exploration reward

### Implementation

New `<script is:inline>` block in `Base.astro`:
- Query the logo `<a>` by a data attribute (add `data-logo` to the logo element in `Header.astro`)
- Track click timestamps in an array, filter to last 1 second, trigger on length >= 5
- Use `setTimeout` chain to cycle through the three colors
- Clean up inline styles after the sequence

---

## Egg 4: Terminal /wtf Page

**Type:** Exploration (hinted in HTML source comment)
**Trigger:** Visiting `/wtf` (hint: `P.S. try /wtf` in HTML source comment of every page)
**Location:** `src/pages/wtf.astro` — complete rewrite, standalone page (no Base layout)

### Behavior

Full-screen terminal-style page:
- Dark background using `--card` color, monospace font via `var(--font-mono)`
- No header, no footer, no site chrome — just the terminal
- Text types out character by character at ~40ms per character with slight random variance (30–50ms)
- Amber terminal text color using `--primary` (matches site accent)
- Lines prefixed with `>`

### Terminal text

```
> you found this.
> I put it here to see who reads source code.
> turns out, you do.
>
> anyway.
>
> I once mass-deleted a production database
> because the variable was named temp_backup.
> it was not a backup.
```

After typing completes:
- A blinking cursor (`_`) remains on the last line
- A subtle "back to safety" link fades in at the bottom after a 1-second delay
- The link uses the same style as existing `LinkButton` but plain text: `← back`

### Implementation

Rewrite `src/pages/wtf.astro` as a standalone page:
- No `Base` layout import — custom minimal HTML structure
- All styles scoped to the page via `<style>` block
- Typewriter effect via `<script is:inline>`: iterate through characters, append to a `<pre>` element, use `setTimeout` with random delay
- Blinking cursor via CSS animation (`@keyframes blink`)
- "back" link hidden initially, fades in via class toggle after typing completes
- Import `global.css` for access to CSS variables (fonts, colors)

### Accessibility

- Text is in the DOM as it types (screen reader accessible)
- No timing-dependent interaction required — it's a passive viewing experience
- "back" link is keyboard accessible
- `prefers-reduced-motion`: if enabled, show all text immediately (no typewriter effect), cursor still blinks
