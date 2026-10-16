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
| `helix-design/css` | `dist/helix-design.css` | everything: font, tokens, base, components |
| `helix-design/tokens.css` | `src/tokens.css` | tokens only (`:root` custom properties) |
| `helix-design/switcher.js` | `src/switcher.js` | optional button-variant switcher |
| `helix-design/report.css` | `dist/pantheon-report.css` | self-contained report theme |
| `helix-design/fonts/*` | `dist/fonts/*` | DM Sans (variable, latin, woff2) |

```css
@import 'helix-design/css';
```

`dist/helix-design.css` loads DM Sans from `fonts/dm-sans-latin-wght-normal.woff2` relative to
itself. Bundlers (Angular, Vite, webpack) copy the font automatically when the CSS is imported
from `node_modules`.

### Angular + Tailwind

Add the CSS once, either in `angular.json`:

```json
"styles": ["node_modules/helix-design/dist/helix-design.css", "src/styles.scss"]
```

or at the top of `src/styles.scss` (the explicit `dist/` path avoids relying on Sass resolving
the `./css` export):

```scss
@import 'helix-design/dist/helix-design.css';
```

Map Tailwind to the tokens through CSS variables instead of copying values, so the library
stays the single source:

```js
// tailwind.config.js (excerpt)
theme: {
  extend: {
    colors: {
      stone: 'var(--stone)', panel: 'var(--panel)', 'panel-alt': 'var(--panel-alt)',
      line: 'var(--line)', gold: 'var(--gold)', 'gold-bright': 'var(--gold-bright)',
      ivory: 'var(--ivory)', muted: 'var(--muted)', bad: 'var(--bad)',
    },
    spacing: { 1: 'var(--space-1)', 2: 'var(--space-2)', 3: 'var(--space-3)', 4: 'var(--space-4)' },
    borderRadius: { DEFAULT: 'var(--radius-none)' },
    fontFamily: { sans: 'var(--font-sans)' },
  },
}
```

If the project uses Tailwind's preflight, load helix-design after it so the base typography wins.

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
<button class="btn btn--primary"><span>Save</span></button>
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
<button type="button" class="segmented__item" data-btn-switch="a">A</button>
```

To avoid a flash of variant E before the script runs, put this line in `<head>` before the CSS:

```html
<script>try{var b=localStorage.getItem('helix-design.btn');if(/^[abce]$/.test(b))document.documentElement.dataset.btn=b}catch(e){}</script>
```

Note: this is temporary. After Justin picks a variant, the library will be reduced to that one
variant and the switcher (and `data-btn`) will be removed in a later version.

## Components

| group | classes | file |
| --- | --- | --- |
| typography | `h1`-`h4`, `.eyebrow`, `.muted`, `.num`, `.sr-only`, `.ornament`, `.lede`, `.caps`, `.count`, `.readout` | `base.css`, `components/typography.css` |
| focus | `:focus-visible` ring (gold-bright, 2px, offset 2px), `.is-focus` | `components/focus.css` |
| buttons | `.btn` + `.btn--primary` / `.btn--secondary` / `.btn--ghost` / `.btn--danger`, sizes `.btn--xl`, `.btn--square`, `.btn--square.btn--lg`, `.btn--block`; states `:active`/`.is-pressed`, `[disabled]`/`[aria-disabled="true"]`; `.icon-btn`, `.icon-btn--bare` | `components/buttons.css` |
| stepper | `.stepper`, `.stepper__value`, `.stepper-label`, `.is-invalid`, `.is-disabled` | `components/stepper.css` |
| inputs | `.field`, `.field__label`, `.field__hint`, `.field__error`, `.input` (input, select, textarea), `.select`, `[aria-invalid="true"]`, `.is-invalid`, `.is-disabled` | `components/inputs.css` |
| chips | `.chip`, `.chip-row`, `.chip-row--scroll`, `.pill`, `.pill--muted`, `.pill--warn`, `.segmented`, `.segmented__item` (selected via `aria-pressed`/`aria-checked`/`aria-selected`/`.is-selected`) | `components/chips.css` |
| cards | `.card`, `.card--accent`, `.card--raised`, `.card--interactive`, `.card--ornament`, `.card__head`, `.card__title`, `.card__meta`, `.card__foot`, `.is-selected` | `components/cards.css` |
| list rows | `.list`, `.list--flush`, `.list-row`, `.list-row--interactive`, `.list-row__lead`, `.list-row__main`, `.list-row__title`, `.list-row__meta`, `.list-row__trail`, `.list-divider` | `components/list-rows.css` |
| navigation | `.app-shell`, `.app-shell__main`, `.bottom-nav`, `.bottom-nav__item`, `.bottom-nav__icon`, `.side-nav`, `.side-nav__brand`, `.side-nav__mark`, `.side-nav__label`, `.side-nav__item`, `.side-nav__icon`, `.side-nav__foot`; active via `aria-current="page"` or `.is-active`; bottom nav below 1100px, side nav from 1100px | `components/nav.css` |
| FAB | `.fab`, `.fab--extended` | `components/fab.css` |
| sheet + dialog | `.scrim`, `.sheet`, `.sheet--full`, `.sheet__handle`, `.sheet__head`, `.sheet__title`, `.sheet__body`, `.sheet__foot`, `.dialog`, `.dialog__title`, `.dialog__body`, `.dialog__actions` | `components/sheet.css` |
| toast | `.toast-region`, `.toast`, `.toast--error`, `.toast__text` | `components/toast.css` |
| states | `.empty`, `.empty__title`, `.empty__actions`, `.notice`, `.notice--error`, `.notice__title`, `.notice__actions`, `.skeleton` (`--line`, `--title`, `--block`, `--circle`), `.spinner` | `components/states.css` |
| progress | `.progress-ring` (`--sm`, `--idle`, `--over`), `.progress-ring__label`, `.progress-bar` (`--high`, `--over`, `--thin`), `.progress-head`, `.progress-steps` | `components/progress.css` |

Notes:

- **Sheet and dialog** work two ways: a native `<dialog class="sheet">` / `<dialog class="dialog">`
  opened with `showModal()` (its `::backdrop` is the scrim, focus trapping comes from the browser),
  or a plain element shown and hidden with the `[hidden]` attribute next to a `.scrim` element.
  There is no `.is-open` class.
- **Progress** is CSS-only: set `style="--value: 42"` (0-100) and mirror it in `aria-valuenow`.
- **Pressed / hover / focus helpers** (`.is-pressed`, `.is-hover`, `.is-focus`) exist for static
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
file, unless it is listed below.

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
npm run build   # src/ -> dist/helix-design.css and dist/pantheon-report.css
npm test        # node scripts/check.js
```

Node 18 or newer; no dependencies. `npm test` checks that every `var(--x)` is a defined token,
that buttons contain no gradients, the a/b/c/e variants, that `dist/` matches a fresh build, that
TOKENS.md is complete, the switcher logic, the demo sections and the report parity.

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

MIT, see [LICENSE](LICENSE).
