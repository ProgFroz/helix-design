import { cx, describe, esc } from './helpers.js';

const PILLS = { default: '', muted: 'hx-pill--muted', warn: 'hx-pill--warn' };

export default {
  title: 'Components/Chips',
  parameters: describe('Selected via `aria-pressed`, `aria-checked`, `aria-selected` or `.hx-is-selected`.'),
};

export const Normal = {
  argTypes: { label: { control: 'text' }, selected: { control: 'boolean' }, disabled: { control: 'boolean' } },
  args: { label: 'Chip', selected: false, disabled: false },
  render: ({ label, selected, disabled }) =>
    `<button type="button" class="hx-chip" aria-pressed="${selected}"${disabled ? ' disabled' : ''}>${esc(label)}</button>`,
};

export const Selected = { ...Normal, args: { ...Normal.args, label: 'Selected', selected: true } };

export const Pressed = {
  render: () => `<button type="button" class="hx-chip hx-is-pressed" aria-pressed="false" tabindex="-1">Pressed</button>`,
};

export const Disabled = {
  render: () => `
    <div class="hx-chip-row">
      <button type="button" class="hx-chip" aria-pressed="false" disabled>Disabled</button>
      <button type="button" class="hx-chip" aria-pressed="true" disabled>Disabled selected</button>
    </div>`,
};

export const Focus = {
  render: () => `<button type="button" class="hx-chip hx-is-focus" aria-pressed="false" tabindex="-1">Focused</button>`,
};

export const ChipRow = {
  render: () => `
    <div class="hx-chip-row" role="radiogroup" aria-label="Example choice">
      <button type="button" class="hx-chip" role="radio" aria-checked="false">Unselected</button>
      <button type="button" class="hx-chip" role="radio" aria-checked="true">Selected</button>
      <button type="button" class="hx-chip hx-is-pressed" role="radio" aria-checked="false" tabindex="-1">Pressed</button>
      <button type="button" class="hx-chip" role="radio" aria-checked="false" disabled>Disabled</button>
    </div>
    <div class="hx-chip-row hx-chip-row--scroll sb-narrow sb-gap-top">
      <button type="button" class="hx-chip" aria-pressed="true">Scrolling</button>
      <button type="button" class="hx-chip" aria-pressed="false">row</button>
      <button type="button" class="hx-chip" aria-pressed="false">of</button>
      <button type="button" class="hx-chip" aria-pressed="false">many</button>
      <button type="button" class="hx-chip" aria-pressed="false">chips</button>
      <button type="button" class="hx-chip" aria-pressed="false">overflowing</button>
    </div>`,
};

export const Pill = {
  parameters: describe('Read-only labels.'),
  argTypes: { kind: { control: 'inline-radio', options: Object.keys(PILLS) }, label: { control: 'text' } },
  args: { kind: 'default', label: 'Label' },
  render: ({ kind, label }) => `<span class="${cx('hx-pill', PILLS[kind])}">${esc(label)}</span>`,
};

export const Segmented = {
  render: () => `
    <div class="sb-narrow">
      <div class="hx-segmented" role="group" aria-label="Range">
        <button type="button" class="hx-segmented__item" aria-pressed="false">Day</button>
        <button type="button" class="hx-segmented__item" aria-pressed="true">Week</button>
        <button type="button" class="hx-segmented__item" aria-pressed="false">Month</button>
        <button type="button" class="hx-segmented__item" aria-pressed="false" disabled>Year</button>
      </div>
    </div>`,
};
