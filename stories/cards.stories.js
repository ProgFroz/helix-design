import { cx, describe, esc } from './helpers.js';

const KINDS = { plain: '', accent: 'hx-card--accent', raised: 'hx-card--raised', ornament: 'hx-card--ornament' };

const interactive = (state, title, meta, attrs = '') => `
  <a class="${cx('hx-card hx-card--interactive', state)}" href="#"${attrs}><span class="hx-eyebrow">Interactive</span><span class="hx-card__title sb-block">${title}</span><span class="hx-card__meta sb-block">${meta}</span></a>`;

export default {
  title: 'Components/Cards',
  parameters: describe('Plain, accent, raised, ornament and interactive cards.'),
};

export const Normal = {
  argTypes: { kind: { control: 'inline-radio', options: Object.keys(KINDS) }, title: { control: 'text' }, meta: { control: 'text' } },
  args: { kind: 'plain', title: 'Card title', meta: 'Meta line · 3 items' },
  render: ({ kind, title, meta }) => `
    <div class="sb-narrow">
      <article class="${cx('hx-card', KINDS[kind])}"><span class="hx-eyebrow">${esc(kind)}</span><h3 class="hx-card__title">${esc(title)}</h3><p class="hx-card__meta">${esc(meta)}</p></article>
    </div>`,
};

export const Kinds = {
  render: () => `
    <div class="sb-grid">
      <article class="hx-card"><span class="hx-eyebrow">Plain</span><h3 class="hx-card__title">Card title</h3><p class="hx-card__meta">Meta line · 3 items</p></article>
      <article class="hx-card hx-card--accent"><div class="hx-card__head"><h3 class="hx-card__title">Accent card</h3><span class="hx-count">02</span></div><p class="hx-muted">Gold line border for grouped content.</p></article>
      <article class="hx-card hx-card--raised"><span class="hx-eyebrow">Raised</span><h3 class="hx-card__title">Raised card</h3><p class="hx-card__meta">Edge light and drop shadow</p><div class="hx-card__foot"><button type="button" class="hx-btn hx-btn--secondary"><span>Action</span></button></div></article>
      <article class="hx-card hx-card--ornament"><h3 class="hx-card__title">Ornament card</h3><p class="hx-card__meta">Meander frieze, at most one per screen</p></article>
    </div>`,
};

export const Interactive = { render: () => `<div class="sb-narrow">${interactive('', 'Default', 'Tap to open')}</div>` };

export const Hover = {
  parameters: describe('Pointer devices only; `.hx-is-hover` shows it statically.'),
  render: () => `<div class="sb-narrow">${interactive('hx-is-hover', 'Hover', 'Pointer devices only')}</div>`,
};

export const Pressed = { render: () => `<div class="sb-narrow">${interactive('hx-is-pressed', 'Pressed', 'Sinks by 1px', ' tabindex="-1"')}</div>` };

export const Selected = { render: () => `<div class="sb-narrow">${interactive('hx-is-selected', 'Selected', 'Gold border and rail')}</div>` };

export const Focus = { render: () => `<div class="sb-narrow">${interactive('hx-is-focus', 'Focus', 'Keyboard focus ring', ' tabindex="-1"')}</div>` };

export const Disabled = {
  render: () => `
    <div class="sb-narrow">
      <button type="button" class="hx-card hx-card--interactive" disabled><span class="hx-eyebrow">Interactive</span><span class="hx-card__title sb-block">Disabled</span><span class="hx-card__meta sb-block">Not available</span></button>
    </div>`,
};

export const Loading = {
  parameters: describe('A card waiting for data, built from `.hx-skeleton` (see Components/States).'),
  render: () => `
    <div class="sb-narrow">
      <div class="hx-card" aria-busy="true" aria-label="Loading">
        <span class="hx-skeleton hx-skeleton--title"></span>
        <span class="hx-skeleton hx-skeleton--line sb-w-80"></span>
        <span class="hx-skeleton hx-skeleton--line sb-w-55"></span>
      </div>
    </div>`,
};
