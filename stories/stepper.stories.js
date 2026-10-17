import { cx, describe, esc } from './helpers.js';

// Static state of one stepper button: '' (normal), 'pressed' or 'disabled'.
const stepButton = (label, sign, state) =>
  `<button type="button" class="${cx('hx-btn hx-btn--secondary hx-btn--square hx-btn--lg', state === 'pressed' && 'hx-is-pressed')}" aria-label="${label}"${state === 'disabled' ? ' disabled' : ''}${state === 'pressed' ? ' tabindex="-1"' : ''}><span>${sign}</span></button>`;

const STATES = { normal: '', invalid: 'hx-is-invalid', disabled: 'hx-is-disabled' };
const hidden = { table: { disable: true } };

export default {
  title: 'Components/Stepper',
  render: ({ label, note, value, unit, decrease, increase, state }) => `
    <div class="sb-narrow">
      <div class="hx-stepper-label"><span>${esc(label)}</span><span>${esc(note)}</span></div>
      <div class="${cx('hx-stepper', STATES[state])}">
        ${stepButton('Decrease', '−', decrease)}
        <output class="hx-stepper__value">${esc(value)}<small>${esc(unit)}</small></output>
        ${stepButton('Increase', '+', increase)}
      </div>
    </div>`,
  argTypes: {
    value: { control: { type: 'number' } },
    unit: { control: 'text' },
    label: { control: 'text' },
    note: { control: 'text' },
    state: { control: 'inline-radio', options: Object.keys(STATES) },
    decrease: hidden,
    increase: hidden,
  },
  args: { label: 'Amount', note: 'Default', value: 80, unit: 'units', state: 'normal', decrease: '', increase: '' },
  parameters: describe('Two square buttons around a value. The buttons follow the active button variant.'),
};

export const Normal = {};

export const Pressed = { args: { note: 'Pressed (+)', value: 85, increase: 'pressed' } };

export const AtMinimum = { args: { note: 'At minimum', value: 0, decrease: 'disabled' } };

export const Invalid = { args: { note: 'Invalid', value: 999, increase: 'disabled', state: 'invalid' } };

export const Disabled = { args: { note: 'Disabled', value: 40, decrease: 'disabled', increase: 'disabled', state: 'disabled' } };
