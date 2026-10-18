import { cx, describe, esc, icon } from './helpers.js';

const row = (state, title, meta, attrs = '') => `
  <li><a class="${cx('hx-list-row hx-list-row--interactive', state)}" href="#"${attrs}><div class="hx-list-row__main"><div class="hx-list-row__title">${title}</div><div class="hx-list-row__meta">${meta}</div></div><span class="hx-list-row__trail">${icon('right', ' width="18" height="18"')}</span></a></li>`;

const list = (items) => `<div class="sb-narrow"><ul class="hx-list">${items}</ul></div>`;

export default {
  title: 'Components/List rows',
  parameters: describe('Rows with leading, main and trailing parts, separated by dividers.'),
};

export const Normal = {
  argTypes: { title: { control: 'text' }, meta: { control: 'text' }, trail: { control: 'text' } },
  args: { title: 'Row title', meta: 'Meta line', trail: '158' },
  render: ({ title, meta, trail }) => list(`
    <li class="hx-list-divider">Plain</li>
    <li class="hx-list-row"><div class="hx-list-row__main"><div class="hx-list-row__title">${esc(title)}</div><div class="hx-list-row__meta">${esc(meta)}</div></div></li>
    <li class="hx-list-row"><span class="hx-list-row__lead">AB</span><div class="hx-list-row__main"><div class="hx-list-row__title">With leading</div><div class="hx-list-row__meta">Thumbnail or icon</div></div><div class="hx-list-row__trail hx-num">${esc(trail)}<small>units</small></div></li>
    <li class="hx-list-row"><span class="hx-list-row__lead">${icon('list')}</span><div class="hx-list-row__main"><div class="hx-list-row__title">With trailing action</div><div class="hx-list-row__meta">Icon button at the end</div></div><button type="button" class="hx-icon-btn hx-icon-btn--bare" aria-label="Add row item">${icon('plus')}</button></li>`),
};

export const Interactive = { render: () => list(row('', 'Default', 'Tap target is the whole row')) };

export const Hover = { render: () => list(row('hx-is-hover', 'Hover', 'Pointer devices only')) };

export const Pressed = { render: () => list(row('hx-is-pressed', 'Pressed', 'Gold rail', ' tabindex="-1"')) };

export const Selected = {
  parameters: describe('`aria-current="page"` (or `.hx-is-selected`).'),
  render: () => list(row('', 'Selected', 'aria-current="page"', ' aria-current="page"')),
};

export const Focus = { render: () => list(row('hx-is-focus', 'Focus', 'Keyboard focus ring', ' tabindex="-1"')) };

export const Disabled = {
  render: () => list(`
    <li><button type="button" class="hx-list-row hx-list-row--interactive" disabled><div class="hx-list-row__main"><div class="hx-list-row__title">Disabled</div><div class="hx-list-row__meta">Not available</div></div><span class="hx-list-row__trail">—</span></button></li>`),
};

export const Flush = {
  render: () => `
    <div class="sb-narrow"><ul class="hx-list hx-list--flush">
      <li class="hx-list-row"><div class="hx-list-row__main"><div class="hx-list-row__title">Flush list</div></div></li>
      <li class="hx-list-row"><div class="hx-list-row__main"><div class="hx-list-row__title">No dividers</div></div></li>
    </ul></div>`,
};

export const Empty = {
  parameters: describe('A list without rows shows `.hx-empty` (see Components/States).'),
  render: () => `
    <div class="sb-narrow"><div class="hx-empty"><strong class="hx-empty__title">No entries yet</strong>Entries appear here once they are created.<div class="hx-empty__actions"><button type="button" class="hx-btn hx-btn--secondary"><span>Add entry</span></button></div></div></div>`,
};

export const Loading = {
  render: () => list(`
    <li class="hx-list-row" aria-busy="true"><span class="hx-skeleton hx-skeleton--circle sb-avatar sb-avatar--sm"></span><div class="hx-list-row__main"><span class="hx-skeleton hx-skeleton--title"></span><span class="hx-skeleton hx-skeleton--line"></span></div></li>
    <li class="hx-list-row" aria-busy="true"><span class="hx-skeleton hx-skeleton--circle sb-avatar sb-avatar--sm"></span><div class="hx-list-row__main"><span class="hx-skeleton hx-skeleton--title"></span><span class="hx-skeleton hx-skeleton--line"></span></div></li>`),
};

export const ErrorState = {
  name: 'Error',
  render: () => `
    <div class="sb-narrow"><div class="hx-notice hx-notice--error" role="alert"><strong class="hx-notice__title">Could not load the list</strong>Only this block is affected.<div class="hx-notice__actions"><button type="button" class="hx-btn hx-btn--secondary"><span>Try again</span></button></div></div></div>`,
};
