import { describe } from './helpers.js';

export default {
  title: 'Components/Focus',
  parameters: describe('`:focus-visible` draws a 2px gold-bright ring with a 4px offset (keyboard only). `.hx-is-focus` shows the same ring statically.'),
};

export const Static = {
  render: () => `
    <div class="sb-row">
      <a href="#" class="hx-is-focus">Focused link</a>
      <button type="button" class="hx-chip hx-is-focus" tabindex="-1">Focused chip</button>
      <button type="button" class="hx-btn hx-btn--secondary hx-is-focus" tabindex="-1"><span>Focused button</span></button>
      <button type="button" class="hx-btn hx-btn--primary hx-is-focus" tabindex="-1"><span>Focused primary</span></button>
      <input class="hx-input hx-is-focus" value="Focused input" aria-label="Focused input">
    </div>`,
};

export const Live = {
  parameters: describe('The play function focuses the button programmatically. Browsers only match `:focus-visible` for script focus when the last interaction was not a pointer click, so the ring may not show after clicking into the page; press Tab to see it live.'),
  render: () => `
    <div class="sb-row">
      <button type="button" class="hx-btn hx-btn--secondary"><span>Focus me</span></button>
      <button type="button" class="hx-chip">Then me</button>
      <input class="hx-input" value="And me" aria-label="Live input">
    </div>`,
  play: async ({ canvasElement }) => {
    canvasElement.querySelector('button').focus({ focusVisible: true });
  },
};
