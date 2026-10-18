import { cx, describe, esc, icon } from './helpers.js';

const STATES = { normal: '', pressed: 'hx-is-pressed', focus: 'hx-is-focus' };

const fab = ({ state, disabled, extended, label }) => `
  <div class="${cx('sb-stage sb-stage--fab', extended && 'sb-stage--fab-wide')}">
    <button type="button" class="${cx('hx-fab', extended && 'hx-fab--extended', STATES[state])}"${extended ? '' : ` aria-label="${esc(label)}"`}${state !== 'normal' ? ' tabindex="-1"' : ''}${disabled ? ' disabled' : ''}>${icon('plus')}${extended ? esc(label) : ''}</button>
  </div>`;

export default {
  title: 'Components/FAB',
  render: fab,
  argTypes: {
    state: { control: 'inline-radio', options: Object.keys(STATES) },
    disabled: { control: 'boolean' },
    extended: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { state: 'normal', disabled: false, extended: false, label: 'Add' },
  parameters: describe('Square, flat gold, above the bottom nav. Shown in a static frame; hide it with `[hidden]` while a sheet is open.'),
};

export const Normal = {};

export const Pressed = { args: { state: 'pressed' } };

export const Focus = { args: { state: 'focus' } };

export const Disabled = { args: { disabled: true } };

export const Extended = { args: { extended: true, label: 'New item' } };
