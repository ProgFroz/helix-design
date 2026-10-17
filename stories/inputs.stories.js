import { describe, esc } from './helpers.js';

export default {
  title: 'Components/Inputs',
  parameters: describe('Text, number, select and textarea share `.hx-input`. Hover (pointer devices) brightens the border to line-gold.'),
};

export const Normal = {
  argTypes: { label: { control: 'text' }, placeholder: { control: 'text' }, hint: { control: 'text' } },
  args: { label: 'Text', placeholder: 'Placeholder text', hint: 'Hint text below the control.' },
  render: ({ label, placeholder, hint }) => `
    <label class="hx-field sb-narrow"><span class="hx-field__label">${esc(label)}</span><input class="hx-input" type="text" placeholder="${esc(placeholder)}"><span class="hx-field__hint">${esc(hint)}</span></label>`,
};

export const Kinds = {
  render: () => `
    <div class="sb-grid">
      <label class="hx-field"><span class="hx-field__label">Number</span><input class="hx-input" type="number" value="42" inputmode="decimal"></label>
      <label class="hx-field"><span class="hx-field__label">Select</span><span class="hx-select"><select class="hx-input"><option>First option</option><option>Second option</option><option>Third option</option></select></span></label>
      <label class="hx-field"><span class="hx-field__label">Textarea</span><textarea class="hx-input" placeholder="Longer free text"></textarea></label>
    </div>`,
};

export const Focus = {
  render: () => `
    <label class="hx-field sb-narrow"><span class="hx-field__label">Focused</span><input class="hx-input hx-is-focus" type="text" value="Focused value"></label>`,
};

export const ErrorState = {
  name: 'Error',
  parameters: describe('`aria-invalid="true"` (or `.hx-is-invalid` on the field) with an `.hx-field__error` message.'),
  render: () => `
    <label class="hx-field hx-is-invalid sb-narrow"><span class="hx-field__label">Error</span><input class="hx-input" type="text" value="Wrong value" aria-invalid="true" aria-describedby="input-error"><span class="hx-field__error" id="input-error">Explain what is wrong and how to fix it.</span></label>`,
};

export const Disabled = {
  render: () => `
    <div class="sb-grid">
      <label class="hx-field hx-is-disabled"><span class="hx-field__label">Disabled</span><input class="hx-input" type="text" value="Not editable" disabled></label>
      <label class="hx-field hx-is-disabled"><span class="hx-field__label">Disabled select</span><span class="hx-select"><select class="hx-input" disabled><option>Unavailable</option></select></span></label>
    </div>`,
};
