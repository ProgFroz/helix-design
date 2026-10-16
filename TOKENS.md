# helix-design tokens

`src/tokens.css` is the only file that defines design tokens. This document lists every
token with its value, source and purpose, every rename, and everything that was left out.
`npm test` fails if a token is missing here or if this file names a token that does not exist
(the "Dropped" section at the end is exempt).

Sources:

- **pantheon**: `ProgFroz/Pantheon` `apps/web/src/styles.css` and the report theme derived from it
  (`/opt/data/reports/theme/pantheon-report.src.css`).
- **askesis**: `askesis-design/out/askesis-tokens.css` (design system v0.3) and the button
  variant sheet `10-button-varianten.html` (round 5).
- **both**: same name and value in both.
- **new**: introduced by helix-design.

Reconciliation rule: Pantheon wins on conflicts (dark, gold accent, radius 0, DM Sans).
Existing names are kept wherever Pantheon and Askesis agree.

## Renamed or merged tokens

Every old name still resolves through a deprecated alias in `src/tokens.css` (marked
"alias" below). New code should use the new name; aliases go away in a future major version.

| old name -> new name | source | note |
| --- | --- | --- |
| `--sans` -> `--font-sans` | both | ambiguous short name; alias kept |
| `--serif` -> `--font-serif` | pantheon | Pantheon value (`var(--font-sans)`) wins over the Cinzel fallback stack of the askesis button sheet, so variants C/E render in DM Sans caps; alias kept |
| `--mono` -> `--font-mono` | pantheon | Pantheon stack (adds `Segoe UI Mono`); Askesis had it inline in `code`; alias kept |
| `--s-1` -> `--space-1` (4px) | askesis | spacing scale renamed for clarity; alias kept |
| `--s-2` -> `--space-2` (8px) | askesis | alias kept |
| `--s-3` -> `--space-3` (12px) | askesis | alias kept |
| `--s-4` -> `--space-4` (16px) | askesis | alias kept |
| `--s-5` -> `--space-5` (20px) | askesis | alias kept |
| `--s-6` -> `--space-6` (24px) | askesis | alias kept |
| `--s-7` -> `--space-7` (32px) | askesis | alias kept |
| `--s-8` -> `--space-8` (44px) | askesis | alias kept |
| `--radius` -> `--radius-none` | askesis | ambiguous; the value (0) is Pantheon's square geometry; alias kept |
| `--drop` -> `--shadow-drop` | askesis | shadow group; alias kept |
| `--press` -> `--shadow-press` | askesis | alias kept |
| `--edge-hi` -> `--shadow-edge-hi` | askesis | alias kept |
| `--edge-hi-soft` -> `--shadow-edge-hi-soft` | askesis | alias kept |
| `--edge-lo` -> `--shadow-edge-lo` | askesis | alias kept |
| `--fab` -> `--fab-size` | askesis | the name collided with the `.fab` class; alias kept |
| `--report-warn` (`#e0a39a`) merged with `--warn` | both | same value; `--report-warn` now points to `--warn` |
| `--report-bad` (`#c0392b`) merged with `--bad` | both | same value; `--report-bad` now points to `--bad` |
| `--report-bad-line` (`#8f5a53`) merged with `--bad-line` | both | same value; `--report-bad-line` now points to `--bad-line` |
| `--meander` (url to `/assets/ornaments/meander.svg`) | pantheon | the app loads a file; helix-design ships the byte-identical SVG as a data URI (as the report theme already did) so the CSS stays self-contained |

## All tokens

### Colour: surfaces and lines

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--stone` | `#0a0a0b` | both | page background |
| `--panel` | `#121214` | both | cards, sheets, lists |
| `--panel-alt` | `#17171a` | both | inputs, tracks, nested and raised surfaces, disabled fill |
| `--sidebar` | `#0d0d0f` | both | navigation surfaces (side nav, bottom nav) |
| `--scrim` | `#000000a6` | askesis | backdrop behind sheets and dialogs |
| `--line` | `#26262b` | both | neutral borders and dividers |
| `--line-gold` | `#3f3524` | both | chrome borders: chips, nav, accent cards, B inner frame |

### Colour: gold accent

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--gold` | `#c9a24e` | both | the accent: primary fill, selection, eyebrows |
| `--gold-bright` | `#e8cb7f` | both | values, links, focus ring |
| `--gold-deep` | `#8e7439` | both | icons, idle fills, secondary outlines |
| `--gold-edge` | `#6e5a2c` | askesis | plinth edge under gold buttons (variants A, E) |
| `--gold-wash` | `#c9a24e14` | both | selected / pressed background tint |
| `--gold-sheen` | `linear-gradient(115deg, …)` | pantheon | moving highlight for the status dot (report) and app sheens; never used in buttons |

### Colour: text and error

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--ivory` | `#f1ede4` | both | primary text |
| `--muted` | `#a6a39c` | both | secondary text |
| `--fg-disabled` | `#6b6964` | askesis | disabled labels (exempt from 4.5:1, WCAG 1.4.3) |
| `--bad` | `#c0392b` | askesis (= pantheon `--report-bad`) | the only semantic red: danger fill, error dot |
| `--bad-line` | `#8f5a53` | askesis (= pantheon `--report-bad-line`) | error borders |
| `--bad-edge` | `#7a2219` | askesis | plinth edge under danger buttons, danger pressed |
| `--warn` | `#e0a39a` | askesis (= pantheon `--report-warn`) | error text, over-target fills |

### Typography

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--font-sans` | `'DM Sans Variable', 'DM Sans', 'Segoe UI', Arial, sans-serif` | both | the only typeface |
| `--font-serif` | `var(--font-sans)` | pantheon | display slot (headings, faceted buttons); DM Sans by decision |
| `--font-mono` | `ui-monospace, 'Cascadia Code', 'Segoe UI Mono', Consolas, monospace` | pantheon | code |
| `--fs-micro` | `0.66rem` | askesis | eyebrow / micro caps (0.2em, 600, gold) |
| `--fs-head` | `0.62rem` | askesis | column heads, field labels (0.14em, caps, muted) |
| `--fs-small` | `0.75rem` | askesis | meta lines, hints |
| `--fs-body` | `0.9375rem` | askesis | body text (15px) |
| `--fs-title` | `1.0625rem` | askesis | card and list titles |
| `--fs-h4` | `1rem` | new | h4 below 1100px |
| `--fs-h4-lg` | `1.1rem` | pantheon | h4 from 1100px |
| `--fs-h3` | `1.125rem` | new | h3 below 1100px |
| `--fs-h3-lg` | `1.5rem` | pantheon | h3 from 1100px |
| `--fs-h2` | `1.375rem` | askesis | h2 below 1100px |
| `--fs-h2-lg` | `1.85rem` | pantheon | h2 from 1100px |
| `--fs-h1` | `1.875rem` | askesis | h1 below 1100px |
| `--fs-h1-lg` | `clamp(2.8rem, 4.6vw, 4.6rem)` | pantheon | h1 from 1100px |
| `--fs-value` | `2.25rem` | askesis | big numeric readouts |
| `--lh-tight` | `1.15` | pantheon | heading line height |
| `--lh-body` | `1.6` | pantheon | prose / lede line height |
| `--tracking-caps` | `0.14em` | both | letter spacing of uppercase heads |
| `--tracking-micro` | `0.2em` | both | letter spacing of eyebrows |

### Spacing and layout

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--space-1` | `4px` | askesis | spacing scale (4-based) |
| `--space-2` | `8px` | askesis | |
| `--space-3` | `12px` | askesis | |
| `--space-4` | `16px` | askesis | |
| `--space-5` | `20px` | askesis | |
| `--space-6` | `24px` | askesis | |
| `--space-7` | `32px` | askesis | |
| `--space-8` | `44px` | askesis | |
| `--gutter` | `18px` | askesis | mobile page gutter (= Pantheon compact-mode lower bound) |
| `--gutter-lg` | `clamp(24px, 5vw, 80px)` | pantheon | desktop page gutter (`--main-gutter` in the app) |
| `--sidebar-w` | `256px` | pantheon | side nav width |
| `--content-max` | `1500px` | pantheon | max content width |

### Shape

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--radius-none` | `0` | both | every surface, button, input, sheet |
| `--radius-round` | `50%` | askesis | dots, rings, spinners only |
| `--facet` | `6px` | askesis | corner cut of faceted buttons (variants C, E) |
| `--border-width` | `1px` | new | hairline used by every border |

### Shadow

Flat by design: hard edges, no glossy gradients. Derived from the askesis depth tokens.

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--shadow-edge-hi` | `inset 0 1px 0 #ffffff2e` | askesis | light catch on gold surfaces (active nav icon, FAB) |
| `--shadow-edge-hi-soft` | `inset 0 1px 0 #c9a24e1f` | askesis | light catch on dark surfaces (raised card) |
| `--shadow-edge-lo` | `inset 0 -1px 0 #00000059` | askesis | bottom shade |
| `--shadow-drop` | `0 1px 0 #000000cc, 0 3px 8px -2px #000000a6` | askesis | raised lift |
| `--shadow-press` | `inset 0 2px 5px #00000080` | askesis | pressed / sunk |
| `--shadow-float` | `0 6px 16px -4px #000000` | askesis | FAB, toast, dialog float (was inline on the askesis FAB) |
| `--shadow-halo` | `0 0 0 4px #0a0a0bcc` | askesis | stone ring that separates the FAB from content (was inline) |
| `--shadow-sheet` | `0 -8px 24px -8px #000000cc` | new | upward shadow of the bottom sheet |
| `--shadow-inset` | `inset 0 1px 3px #00000066` | askesis | sunk value field of the stepper (was inline) |

### Motion

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--dur-fast` | `120ms` | new | micro feedback |
| `--dur` | `160ms` | askesis | press and colour transitions |
| `--dur-slow` | `250ms` | pantheon | nav hover, sheet in, bar fills (Pantheon uses 0.2-0.25s) |
| `--ease` | `cubic-bezier(.2, .7, .2, 1)` | askesis | all transitions |

All motion is reduced under `prefers-reduced-motion: reduce` (base.css), and shimmer/spinner
animations only run under `prefers-reduced-motion: no-preference`.

### Focus ring

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--focus-ring-width` | `2px` | both | `:focus-visible` outline width |
| `--focus-ring-offset` | `2px` | askesis | outline offset (Pantheon links used 4px) |
| `--focus-ring-color` | `var(--gold-bright)` | both | outline colour |

### Z-index

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--z-base` | `0` | new | default layer |
| `--z-raised` | `1` | new | overlapping content inside a component |
| `--z-sticky` | `4` | pantheon | sticky top bars (Pantheon topbar) |
| `--z-nav` | `20` | askesis | bottom nav |
| `--z-fab` | `21` | askesis | FAB |
| `--z-scrim` | `30` | askesis | scrim |
| `--z-sheet` | `40` | askesis | bottom sheet |
| `--z-dialog` | `45` | new | dialog |
| `--z-toast` | `60` | new | toasts; above sheets and dialogs (askesis had 25, below the scrim) |

### Touch sizes

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--tap` | `48px` | askesis | minimum touch target |
| `--tap-xl` | `64px` | askesis | thumb CTAs (extra-large buttons) |
| `--fab-size` | `56px` | askesis | FAB edge length |
| `--bnav-h` | `64px` | askesis | bottom nav height |

### Ornament

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--meander` | `url("data:image/svg+xml;base64,…")` | pantheon | Greek-key tile for friezes (`.ornament`, ornament card, report) |
| `--meander-h` | `14px` | pantheon | frieze height |
| `--meander-h-long` | `clamp(18px, 2.2vw, 26px)` | pantheon | wide frieze height |

### Deprecated aliases

Kept so existing consumers keep resolving; see the rename table above.

| alias | resolves to |
| --- | --- |
| `--sans` | `var(--font-sans)` |
| `--serif` | `var(--font-serif)` |
| `--mono` | `var(--font-mono)` |
| `--s-1` … `--s-8` (`--s-1`, `--s-2`, `--s-3`, `--s-4`, `--s-5`, `--s-6`, `--s-7`, `--s-8`) | `var(--space-1)` … `var(--space-8)` |
| `--radius` | `var(--radius-none)` |
| `--drop` | `var(--shadow-drop)` |
| `--press` | `var(--shadow-press)` |
| `--edge-hi` | `var(--shadow-edge-hi)` |
| `--edge-hi-soft` | `var(--shadow-edge-hi-soft)` |
| `--edge-lo` | `var(--shadow-edge-lo)` |
| `--fab` | `var(--fab-size)` |

### Report-only tokens

Defined in `src/report/report-root.css` and shipped only in `dist/pantheon-report.css`.

| token | value | source | purpose |
| --- | --- | --- | --- |
| `--report-ok` | `var(--gold)` | pantheon | "fine" tone in reports (the theme has no green) |
| `--report-warn` | `var(--warn)` | pantheon | warning text in reports |
| `--report-bad` | `var(--bad)` | pantheon | error dot, over-budget meter |
| `--report-bad-line` | `var(--bad-line)` | pantheon | error borders in reports |

### Component-local custom properties

Not tokens: declared and consumed inside one component file, set per element.
`npm test` enforces that each one is declared in the file listed here.

| property | file | purpose |
| --- | --- | --- |
| `--value` | `src/components/progress.css` | progress 0-100 for ring and bars (set inline) |
| `--ring-size` | `src/components/progress.css` | ring diameter |
| `--ring-width` | `src/components/progress.css` | ring stroke width |
| `--main-gutter` | `src/report/report.css` | report main gutter (from the old report theme) |

## Dropped / stays in project

Not part of helix-design. Projects keep these locally if they need them.

| token | source | reason |
| --- | --- | --- |
| `--ok`, `--macro`, `--ok-wash` | askesis | Askesis green semantics (goal reached, macro fill) stay in Askesis |
| `--fs-focus` | askesis | focus-mode numerals and rest timer; focus-mode layout stays in Askesis |
| `--grad-gold`, `--grad-gold-pressed`, `--grad-raised`, `--grad-raised-pressed`, `--grad-danger` | askesis | gradient depth (round 3) is superseded by the flat button variants; no component needs them |
| `--gold-hi`, `--gold-lo`, `--panel-hi`, `--bad-hi`, `--bad-lo` | askesis | gradient stops of the tokens above |
| `--gold-field-base`, `--gold-field`, `--gold-field-sheen` | pantheon | profile-portrait fills, app-specific |
| `--portrait-outline` | pantheon | portrait drop-shadow filter, app-specific |
| `--ivy-h`, `--ivy-corner`, `--ivy-end`, `--ivy-seg`, `--m` | askesis | deco SVG / ivy overlay proposals (`deko/`) stay out |
| `--sq` | askesis | stepper-local size; the stepper now uses square buttons |
