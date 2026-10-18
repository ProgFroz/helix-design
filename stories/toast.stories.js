import { describe, esc } from './helpers.js';

const KINDS = {
  info: { className: 'hx-toast', role: 'status' },
  error: { className: 'hx-toast hx-toast--error', role: 'alert' },
};

const toast = ({ kind, text, action }) =>
  `<div class="${KINDS[kind].className}" role="${KINDS[kind].role}"><span class="hx-toast__text">${esc(text)}</span>${action ? `<button type="button" class="hx-btn hx-btn--ghost"><span>${esc(action)}</span></button>` : ''}</div>`;

export default {
  title: 'Components/Toast',
  render: (args) => `<div class="sb-stage sb-stage--toast"><div class="hx-toast-region">${toast(args)}</div></div>`,
  argTypes: {
    kind: { control: 'inline-radio', options: Object.keys(KINDS) },
    text: { control: 'text' },
    action: { control: 'text' },
  },
  args: { kind: 'info', text: 'Item saved.', action: 'Undo' },
  parameters: describe('Info toasts use `role="status"`, error toasts `.hx-toast--error` with `role="alert"`. In an app the region sits above the bottom nav.'),
};

export const Info = {};

export const ErrorToast = { name: 'Error', args: { kind: 'error', text: 'Could not save. Check the connection.', action: 'Retry' } };

export const Stacked = {
  parameters: { controls: { disable: true } },
  render: () => `<div class="sb-stage sb-stage--toast"><div class="hx-toast-region">
    ${toast({ kind: 'info', text: 'Item saved.', action: 'Undo' })}
    ${toast({ kind: 'error', text: 'Could not save. Check the connection.', action: 'Retry' })}
  </div></div>`,
};
