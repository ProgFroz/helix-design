import { cx, describe, esc, icon } from './helpers.js';

const VARIANTS = { primary: 'hx-btn--primary', secondary: 'hx-btn--secondary', ghost: 'hx-btn--ghost', danger: 'hx-btn--danger' };
const SIZES = { default: '', xl: 'hx-btn--xl' };
const STATES = { normal: '', pressed: 'hx-is-pressed', focus: 'hx-is-focus' };

const button = ({ variant, size, block, disabled, state, label }) => {
  const forced = state !== 'normal' ? ' tabindex="-1"' : '';
  return `<button type="button" class="${cx('hx-btn', VARIANTS[variant], SIZES[size], block && 'hx-btn--block', STATES[state])}"${forced}${disabled ? ' disabled' : ''}><span>${esc(label)}</span></button>`;
};

export default {
  title: 'Components/Buttons',
  render: button,
  argTypes: {
    variant: { control: 'select', options: Object.keys(VARIANTS) },
    size: { control: 'inline-radio', options: Object.keys(SIZES) },
    state: { control: 'inline-radio', options: Object.keys(STATES), description: 'Forced static state (.hx-is-pressed / .hx-is-focus)' },
    block: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { variant: 'primary', size: 'default', state: 'normal', block: false, disabled: false, label: 'Start' },
  parameters: describe('Wrap the label in a `<span>` (variant B frames it). Use the "Buttons" toolbar to compare variants A, B, C and E.'),
};

export const Normal = {};

export const Pressed = {
  args: { state: 'pressed' },
  parameters: describe('`:active` feedback, shown statically with `.hx-is-pressed`. There is no separate hover style (touch-first).'),
};

export const Disabled = {
  args: { disabled: true },
  parameters: describe('`[disabled]` (or `[aria-disabled="true"]` on links).'),
};

export const Focus = {
  args: { state: 'focus' },
  parameters: describe('The keyboard ring comes from `:focus-visible`; `.hx-is-focus` shows it statically. Faceted variants (C, E) draw it inside the facet.'),
};

export const Matrix = {
  parameters: { controls: { disable: true }, ...describe('Every variant in every state: default, pressed, disabled, focus.') },
  render: () => {
    const labels = { primary: 'Start', secondary: 'Edit', ghost: 'Later', danger: 'Delete' };
    const rows = Object.keys(VARIANTS).map((variant) => {
      const base = { variant, size: 'default', block: true, label: labels[variant] };
      return `<tr><th scope="row" class="hx-caps">${variant}</th>
        <td>${button({ ...base, state: 'normal', disabled: false })}</td>
        <td>${button({ ...base, state: 'pressed', disabled: false })}</td>
        <td>${button({ ...base, state: 'normal', disabled: true })}</td>
        <td>${button({ ...base, state: 'focus', disabled: false })}</td></tr>`;
    }).join('');
    return `<div class="sb-scroll"><table class="sb-table"><thead><tr><th></th><th>Default</th><th>Pressed</th><th>Disabled</th><th>Focus</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  },
};

export const SizesAndShapes = {
  parameters: { controls: { disable: true } },
  render: () => `
    <div class="sb-row">
      <button type="button" class="hx-btn hx-btn--primary"><span>Default · 48px</span></button>
      <button type="button" class="hx-btn hx-btn--primary hx-btn--xl"><span>Extra large · 64px</span></button>
      <button type="button" class="hx-btn hx-btn--secondary hx-btn--square" aria-label="Add"><span>+</span></button>
      <button type="button" class="hx-btn hx-btn--secondary hx-btn--square hx-btn--lg" aria-label="Add"><span>+</span></button>
      <button type="button" class="hx-btn hx-btn--secondary"><span>${icon('plus')}With icon</span></button>
      <a class="hx-btn hx-btn--secondary" href="#"><span>Link as button</span></a>
      <a class="hx-btn hx-btn--secondary" aria-disabled="true"><span>aria-disabled link</span></a>
    </div>
    <div class="sb-narrow sb-gap-top">
      <button type="button" class="hx-btn hx-btn--primary hx-btn--xl hx-btn--block"><span>Full width call to action</span></button>
    </div>`,
};

export const IconButton = {
  parameters: { controls: { disable: true }, ...describe('Normal, pressed, disabled, focus and the bare variant.') },
  render: () => `
    <div class="sb-row">
      <button type="button" class="hx-icon-btn" aria-label="Close">${icon('close')}</button>
      <button type="button" class="hx-icon-btn hx-is-pressed" aria-label="Close" tabindex="-1">${icon('close')}</button>
      <button type="button" class="hx-icon-btn" aria-label="Close" disabled>${icon('close')}</button>
      <button type="button" class="hx-icon-btn hx-is-focus" aria-label="Close" tabindex="-1">${icon('close')}</button>
      <button type="button" class="hx-icon-btn hx-icon-btn--bare" aria-label="Close">${icon('close')}</button>
    </div>`,
};
