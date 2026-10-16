# helix-design

The Pantheon visual language for the Helix umbrella: design tokens and framework-agnostic CSS
components. Dark, gold accent, radius 0, DM Sans.

It is the single source of truth for:

- **Pantheon** (website)
- **Askesis** (Angular + Tailwind fitness app)
- **generated HTML reports** (`dist/pantheon-report.css`)

Everything is plain CSS (custom properties + component classes). The only JavaScript is the
optional, dependency-free button switcher (`src/switcher.js`).

## Install

As a git dependency (no build step on the consumer side; `dist/` is committed):

```sh
npm i github:ProgFroz/helix-design#v0.1.0
```

Or without npm, with a plain `<link>` to a copy of `dist/` (keep `dist/fonts/` next to the CSS):

```html
<link rel="stylesheet" href="/vendor/helix-design/dist/helix-design.css">
```

## Usage

| import | file | content |
| --- | --- | --- |
| `helix-design/css` | `dist/helix-design.css` | font, tokens, components (no global element styles) |
| `helix-design/base.css` | `dist/helix-base.css` | opt-in element base: `html`, `body`, headings, links, focus ring, reduced motion |
| `helix-design/tokens.css` | `src/tokens.css` | tokens only (`:root` custom properties, unlayered) |
| `helix-design/switcher.js` | `src/switcher.js` | optional button-variant switcher |
| `helix-design/report.css` | `dist/pantheon-report.css` | self-contained report theme |
| `helix-design/fonts/*` | `dist/fonts/*` | DM Sans (variable, latin, woff2) and its license `OFL.txt` |

```css
@import 'helix-design/css';
@import 'helix-design/base.css'; /* optional: whole-page element base */
```

`dist/helix-design.css` loads DM Sans from `fonts/dm-sans-latin-wght-normal.woff2` relative to
itself. Bundlers (Angular, Vite, webpack) copy the font automatically when the CSS is imported
from `node_modules`.

### Cascade layers and the hx- prefix

Every component class starts with `hx-` (`.hx-btn`, `.hx-card`, `.hx-input`, state classes such
as `.hx-is-pressed`; BEM modifiers follow: `.hx-btn--block`). Data attributes (`data-btn`,
`data-btn-switch`) and custom properties (`--gold`, ...) are not prefixed.

`dist/helix-design.css` starts with

```css
@layer helix.tokens, helix.base, helix.components;
```

and puts the tokens into `helix.tokens` and the components into `helix.components`. Only
`@font-face` and `@keyframes` stay outside a layer. The dotted names are sublayers of one
top-level layer `helix`, so every unlayered rule of the consuming app beats helix-design, and
within helix-design the components beat the base.

### Opt-in element base

`helix-design.css` never styles elements globally: no `html`, `body`, `h1`-`h4`, `p`, `a`,
`code`, `button` or `*` rules, no global `:focus-visible` rule and no global reduced-motion rule.
Components set their own box sizing and font inheritance on their `hx-` classes and draw their own
focus ring, so they work and stay accessible without the base.

The page base is a separate file, `helix-design/base.css` (`dist/helix-base.css`, layer
`helix.base`). It contains the box-sizing reset, the Pantheon page typography (mobile heading
sizes below 1100px, Pantheon sizes from 1100px, links inherit their colour), the global
`:focus-visible` ring and the `prefers-reduced-motion` rule. Import it in apps whose pages are
fully helix-styled (Pantheon); leave it out where another base (Tailwind preflight, daisyUI)
owns the elements.

Without the base, put `class="hx"` on a container to get DM Sans and ivory text for that subtree
only. Gold emphasis is the helper `.hx-em` (`<em class="hx-em">`); a bare `em` is not styled.

### Angular + Tailwind v4

Askesis uses Tailwind 4 with daisyUI 5; daisyUI stays during the bridge phase. In
`src/styles.css`, declare the layer order first, then import Tailwind's parts and helix-design
**without** `layer()`:

```css
@layer theme, base, helix, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "helix-design/css";
@import "helix-design/base.css"; /* optional, see "Opt-in element base" */
@import "tailwindcss/utilities.css" layer(utilities);

@plugin "daisyui";
```

How the layers resolve:

- The first line is the expanded form of `@import "tailwindcss";` (Tailwind's own
  `theme, base, components, utilities` order) with `helix` added between `base` and
  `components`. A `@layer` statement may precede `@import`, so this is valid CSS.
- helix-design declares `helix.tokens`, `helix.base` and `helix.components` itself. Imported
  without `layer()`, those names stay as they are: sublayers of the top-level `helix` layer, in
  that order. Importing with `layer(helix)` would nest them one level deeper
  (`helix.helix.tokens`, ...), so do not wrap the import.
- Sublayers cannot be interleaved with other top-level layers. A list such as
  `base, helix.tokens, helix.base, components, helix.components, utilities` places the whole
  `helix` layer at its first mention (after `base`); `helix.components` does not land after
  `components`. Declare `helix` once, as above.
- Result: Tailwind utilities override helix components; the helix tokens override Tailwind's
  theme variables of the same name (for example `--font-sans`); the optional helix base overrides
  preflight.

If your tooling does not resolve the `./css` export from a CSS `@import`, use the file path
`helix-design/dist/helix-design.css` (and `helix-design/dist/helix-base.css`).

Map the Tailwind theme to the tokens instead of copying values, so the library stays the single
source. Use `@theme inline`, because the values reference other variables:

```css
@theme inline {
  --color-stone: var(--stone);
  --color-panel: var(--panel);
  --color-panel-alt: var(--panel-alt);
  --color-sidebar: var(--sidebar);
  --color-line: var(--line);
  --color-line-gold: var(--line-gold);
  --color-gold: var(--gold);
  --color-gold-bright: var(--gold-bright);
  --color-gold-deep: var(--gold-deep);
  --color-gold-wash: var(--gold-wash);
  --color-ivory: var(--ivory);
  --color-muted: var(--muted);
  --color-bad: var(--bad);
  --color-warn: var(--warn);

  --spacing: var(--space-1);   /* p-1 = 4px, p-4 = 16px, matching --space-1 and --space-4 */

  --radius-*: initial;         /* drop Tailwind's rounded-* scale: radius is 0 everywhere */
}
```

`--font-sans` needs no entry: Tailwind's theme variable and the helix token share the name, and
the helix value wins because `helix` comes after `theme`, so the `font-sans` utility already
renders DM Sans. Do not write `--font-sans: var(--font-sans)` (a self-reference). Add
`--color-*: initial;` at the top of the block if the app should only know the helix colours.

**daisyUI 5 coexistence.** daisyUI defines its own `.btn`, `.card`, `.input` and similar classes.
The `hx-` prefix keeps the two sets apart, so both can be used during the bridge phase, and the
`helix` layer keeps helix-design below Tailwind's utilities. Migrate screens from daisyUI classes
to `hx-` classes one by one.

## Tokens

All tokens live in `src/tokens.css` (dark `color-scheme`). Groups:

- **colour**: surfaces (`--stone`, `--panel`, `--panel-alt`, `--sidebar`, `--scrim`), lines,
  gold accent (`--gold`, `--gold-bright`, `--gold-deep`, `--gold-edge`, `--gold-wash`),
  text (`--ivory`, `--muted`, `--fg-disabled`) and the only semantic hue, error red
  (`--bad`, `--bad-line`, `--bad-edge`, `--warn`)
- **typography**: `--font-sans`, `--fs-*` scale (mobile + `-lg` desktop sizes), line heights, tracking
- **spacing**: `--space-1` … `--space-8` (4-based), `--gutter`, `--gutter-lg`
- **shape**: `--radius-none` (0), `--radius-round`, `--facet`
- **shadow**: `--shadow-*` (flat, hard edges)
- **motion**: `--dur-fast`, `--dur`, `--dur-slow`, `--ease`
- **z-index**: `--z-nav`, `--z-fab`, `--z-scrim`, `--z-sheet`, `--z-dialog`, `--z-toast`, …
- **touch**: `--tap` (48px minimum), `--tap-xl`, `--fab-size`, `--bnav-h`

[TOKENS.md](TOKENS.md) lists every token with value, source and purpose, every rename (with the
deprecated alias that keeps the old name working) and what stays in the projects.

## Button variants and the switcher

Four flat button variants are available while one is being chosen:

| `data-btn` | variant |
| --- | --- |
| `a` | Plinth (Sockel): solid fill on a hard 3px edge |
| `b` | Inscription (Inschrift): double gold line, inner tablet |
| `c` | Faceted (Facettiert): cut corners, spaced capitals |
| `e` | Facet + plinth (Facette + Sockel), **default** |

Select one on the root element: `<html data-btn="a">`. A missing or invalid value renders E.
Put `data-btn` on `<html>` only; nested scopes are not supported.

Markup: always wrap the label in a `<span>` (variant B frames it):

```html
<button class="hx-btn hx-btn--primary"><span>Save</span></button>
```

### Switcher API

`src/switcher.js` stores the choice in `localStorage` under `helix-design.btn` and applies it on
load.

```js
import { setButtonStyle, getButtonStyle } from 'helix-design/switcher.js'; // bundlers
setButtonStyle('b');   // validates a|b|c|e, sets <html data-btn>, persists; returns false for invalid input
getButtonStyle();      // current valid value, 'e' by default
```

Without a bundler, load it as a plain script; the same API is on `window.HelixDesign`:

```html
<script src="node_modules/helix-design/src/switcher.js"></script>
<script>HelixDesign.setButtonStyle('c');</script>
```

The file is a classic script (IIFE) that also sets `module.exports`, so bundlers resolve the
named import; a native browser `import` without a bundler is not supported (use the script tag).

Buttons with `data-btn-switch="a|b|c|e"` work without extra code: a click selects the variant and
`aria-pressed` stays in sync.

```html
<button type="button" class="hx-segmented__item" data-btn-switch="a">A</button>
```

To avoid a flash of variant E before the script runs, put this line in `<head>` before the CSS:

```html
<script>try{var b=localStorage.getItem('helix-design.btn');if(/^[abce]$/.test(b))document.documentElement.dataset.btn=b}catch(e){}</script>
```

Under a strict Content Security Policy an inline script only runs with a nonce
(`<script nonce="...">`) or a `'sha256-...'` hash of its exact text in `script-src`. The
alternative is the external file, loaded in `<head>` as a classic blocking script, without
`defer`, `async` or `type="module"`:

```html
<script src="/vendor/helix-design/src/switcher.js"></script>
```

It then runs before first paint: it applies the stored variant to `<html>` immediately, and only
the `aria-pressed` sync of `[data-btn-switch]` buttons waits for `DOMContentLoaded` (when
`document.readyState` is still `loading`).

Note: this is temporary. After Justin picks a variant, the library will be reduced to that one
variant and the switcher (and `data-btn`) will be removed in a later version.

## Components

| group | classes | file |
| --- | --- | --- |
| typography | `h1`-`h4` (opt-in base), `.hx`, `.hx-em`, `.hx-eyebrow`, `.hx-muted`, `.hx-num`, `.hx-sr-only`, `.hx-ornament`, `.hx-lede`, `.hx-caps`, `.hx-count`, `.hx-readout` | `base.css`, `components/typography.css` |
| focus | `:focus-visible` ring on every focusable `hx-` component (gold-bright, 2px, offset 4px), `.hx-is-focus`; the global ring is in the opt-in base | `components/focus.css` |
| buttons | `.hx-btn` + `.hx-btn--primary` / `.hx-btn--secondary` / `.hx-btn--ghost` / `.hx-btn--danger`, sizes `.hx-btn--xl`, `.hx-btn--square`, `.hx-btn--square.hx-btn--lg`, `.hx-btn--block`; states `:active`/`.hx-is-pressed`, `[disabled]`/`[aria-disabled="true"]`; `.hx-icon-btn`, `.hx-icon-btn--bare` | `components/buttons.css` |
| stepper | `.hx-stepper`, `.hx-stepper__value`, `.hx-stepper-label`, `.hx-is-invalid`, `.hx-is-disabled` | `components/stepper.css` |
| inputs | `.hx-field`, `.hx-field__label`, `.hx-field__hint`, `.hx-field__error`, `.hx-input` (input, select, textarea), `.hx-select`, `[aria-invalid="true"]`, `.hx-is-invalid`, `.hx-is-disabled` | `components/inputs.css` |
| chips | `.hx-chip`, `.hx-chip-row`, `.hx-chip-row--scroll`, `.hx-pill`, `.hx-pill--muted`, `.hx-pill--warn`, `.hx-segmented`, `.hx-segmented__item` (selected via `aria-pressed`/`aria-checked`/`aria-selected`/`.hx-is-selected`) | `components/chips.css` |
| cards | `.hx-card`, `.hx-card--accent`, `.hx-card--raised`, `.hx-card--interactive`, `.hx-card--ornament`, `.hx-card__head`, `.hx-card__title`, `.hx-card__meta`, `.hx-card__foot`, `.hx-is-selected` | `components/cards.css` |
| list rows | `.hx-list`, `.hx-list--flush`, `.hx-list-row`, `.hx-list-row--interactive`, `.hx-list-row__lead`, `.hx-list-row__main`, `.hx-list-row__title`, `.hx-list-row__meta`, `.hx-list-row__trail`, `.hx-list-divider` | `components/list-rows.css` |
| navigation | `.hx-app-shell`, `.hx-app-shell__main`, `.hx-bottom-nav`, `.hx-bottom-nav__item`, `.hx-bottom-nav__icon`, `.hx-side-nav`, `.hx-side-nav__brand`, `.hx-side-nav__mark`, `.hx-side-nav__label`, `.hx-side-nav__item`, `.hx-side-nav__icon`, `.hx-side-nav__foot`; active via `aria-current="page"` or `.hx-is-active`; bottom nav below 1100px, side nav from 1100px | `components/nav.css` |
| FAB | `.hx-fab`, `.hx-fab--extended` | `components/fab.css` |
| sheet + dialog | `.hx-scrim`, `.hx-sheet`, `.hx-sheet--full`, `.hx-sheet__handle`, `.hx-sheet__head`, `.hx-sheet__title`, `.hx-sheet__body`, `.hx-sheet__foot`, `.hx-dialog`, `.hx-dialog__title`, `.hx-dialog__body`, `.hx-dialog__actions` | `components/sheet.css` |
| toast | `.hx-toast-region`, `.hx-toast`, `.hx-toast--error`, `.hx-toast__text` | `components/toast.css` |
| states | `.hx-empty`, `.hx-empty__title`, `.hx-empty__actions`, `.hx-notice`, `.hx-notice--error`, `.hx-notice__title`, `.hx-notice__actions`, `.hx-skeleton` (`--line`, `--title`, `--block`, `--circle`), `.hx-spinner` | `components/states.css` |
| progress | `.hx-progress-ring` (`--sm`, `--idle`, `--over`), `.hx-progress-ring__label`, `.hx-progress-bar` (`--high`, `--over`, `--thin`), `.hx-progress-head`, `.hx-progress-steps` | `components/progress.css` |

Notes:

- **Sheet and dialog** work two ways: a native `<dialog class="hx-sheet">` / `<dialog class="hx-dialog">`
  opened with `showModal()` (its `::backdrop` is the scrim, focus trapping comes from the browser),
  or a plain element shown and hidden with the `[hidden]` attribute next to a `.hx-scrim` element.
  There is no `.hx-is-open` class.
- **Progress** is CSS-only: set `style="--value: 42"` (0-100) and mirror it in `aria-valuenow`.
- **Pressed / hover / focus helpers** (`.hx-is-pressed`, `.hx-is-hover`, `.hx-is-focus`) exist for static
  demos and screenshots; real interaction uses `:active`, `:hover`, `:focus-visible`.
- **Motion** respects `prefers-reduced-motion`; the skeleton shimmer and spinner only animate
  under `no-preference`.
- **Touch targets** are at least `--tap` (48px).

The gallery in [`demo/index.html`](demo/index.html) shows every component in every state. It opens
straight from the file system (`file://`).

## Report theme

`dist/pantheon-report.css` is generated by `scripts/build-report-theme` from `src/tokens.css`,
`src/report/report-root.css` (report-only tones `--report-ok`, `--report-warn`, `--report-bad`,
`--report-bad-line`) and `src/report/report.css` (report shell and components: section heading,
detail panel and list, usage meters, schedule table, notice, meander friezes, gold-rim and
gold-sheen motion). DM Sans is embedded as a data URI so a report stays self-contained. It is a
drop-in replacement for the hand-maintained `pantheon-report.css`; copy it over the old file to
switch reports to the library.

Parity is enforced by `npm test` (check 8): every class selector, custom property and keyframe
name of the old `/opt/data/reports/theme/pantheon-report.css` must still exist in the generated
file, unless it is listed below, and every `:root` custom property must resolve (following
`var()` chains) to the same value. The report keeps its own unprefixed class names and its own
element rules (including `em`); the `hx-` prefix, the layers and the opt-in base apply to
`helix-design.css` only. A missing reference file fails the check; set
`HELIX_DESIGN_REFERENCE=<path>` to point elsewhere, or `HELIX_DESIGN_SKIP_REFERENCE=1` to skip it
with a visible `SKIPPED` line (exit 0 locally, exit 2 when `CI=1`).

### Intentional differences

No class selectors, custom properties or keyframes were removed. Differences that do not change
rendering:

- the header comment says the file is generated from helix-design
- the generated file additionally defines all helix-design tokens (additive)
- `--report-warn`, `--report-bad` and `--report-bad-line` now reference `--warn`, `--bad` and
  `--bad-line`; the values are unchanged
- `--sans`, `--serif` and `--mono` are now aliases of `--font-sans`, `--font-serif` and
  `--font-mono`; the values are unchanged

## Development

```sh
npm run build   # src/ -> dist/helix-design.css, dist/helix-base.css and dist/pantheon-report.css
npm test        # node scripts/check.js
```

Node 18 or newer; no dependencies. `npm test` checks that every `var(--x)` is a defined token,
that buttons contain no gradients, the a/b/c/e variants, that `dist/` matches a fresh build, that
TOKENS.md is complete, the switcher logic, the demo sections, the report parity (names and token
values), that `helix-design.css` has no unlayered rule, only `hx-` classes and no global element
selector, the font license, the Pantheon base decisions (focus offset 4px, inheriting links, no
`em` rule, DM Sans only, heading scale) and that default E weighs the same as A/B/C.

## Versioning

- Semantic versioning. The maintainer creates git tags `vX.Y.Z`; consumers pin a tag
  (`github:ProgFroz/helix-design#v0.1.0`).
- `dist/` is committed so consumers need no build step. Run `npm run build` before committing;
  `npm test` fails when `dist/` is stale.
- Renamed tokens keep a deprecated alias until the next major version.

## Scope

Not included; these stay in the projects:

- Askesis green semantics (goal reached, macro fills) and anything green
- decorative SVGs and meander/deco proposals from `askesis-design/out/deko/`
- the Askesis focus-mode layout (rest timer, focus numerals, set list)
- button variant D (Relief), which was rejected
- framework wrappers (Angular components etc.); add them only when needed

## License

Code MIT, fonts OFL-1.1. The code is MIT, see [LICENSE](LICENSE). DM Sans
(`dist/fonts/dm-sans-latin-wght-normal.woff2`, the Fontsource variable latin file, also embedded
in `dist/pantheon-report.css`) is licensed under the SIL Open Font License 1.1, see
[`dist/fonts/OFL.txt`](dist/fonts/OFL.txt).
