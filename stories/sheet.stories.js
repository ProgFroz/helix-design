import { cx, describe, icon } from './helpers.js';

const sheet = (full) => `
  <div class="sb-stage sb-stage--sheet">
    <div class="hx-card"><h3 class="hx-card__title">Page behind the sheet</h3><p class="hx-card__meta">Dimmed by the scrim</p></div>
    <div class="hx-scrim"></div>
    <div class="${cx('hx-sheet', full && 'hx-sheet--full')}" role="dialog" aria-modal="true" aria-label="Sheet title">
      <div class="hx-sheet__handle"></div>
      <div class="hx-sheet__head">
        <div><span class="hx-eyebrow">Sheet eyebrow</span><h2 class="hx-sheet__title">Sheet title</h2></div>
        <button type="button" class="hx-icon-btn hx-icon-btn--bare" aria-label="Close">${icon('close')}</button>
      </div>
      <div class="hx-sheet__body">
        <div class="hx-chip-row"><button type="button" class="hx-chip" aria-pressed="true">Option one</button><button type="button" class="hx-chip" aria-pressed="false">Option two</button></div>
        <ul class="hx-list">
          <li class="hx-list-row"><div class="hx-list-row__main"><div class="hx-list-row__title">Sheet row</div><div class="hx-list-row__meta">Meta line</div></div><div class="hx-list-row__trail hx-num">12</div></li>
          <li class="hx-list-row"><div class="hx-list-row__main"><div class="hx-list-row__title">Another row</div><div class="hx-list-row__meta">Meta line</div></div><div class="hx-list-row__trail hx-num">34</div></li>
        </ul>
      </div>
      <div class="hx-sheet__foot">
        <button type="button" class="hx-btn hx-btn--ghost hx-btn--block"><span>Cancel</span></button>
        <button type="button" class="hx-btn hx-btn--primary hx-btn--block"><span>Confirm</span></button>
      </div>
    </div>
  </div>`;

export default {
  title: 'Components/Sheet',
  parameters: describe('Use `<dialog class="hx-sheet">` / `<dialog class="hx-dialog">` with `showModal()` (the backdrop is the scrim), or a plain element toggled with `[hidden]` next to a `.hx-scrim`. Shown open and static here.'),
};

export const BottomSheet = { render: () => sheet(false) };

export const FullSheet = { render: () => sheet(true) };

export const Dialog = {
  render: () => `
    <div class="sb-stage sb-stage--dialog">
      <div class="hx-scrim"></div>
      <div class="hx-dialog" role="dialog" aria-modal="true" aria-label="Discard changes?">
        <span class="hx-eyebrow">Confirm</span>
        <h2 class="hx-dialog__title">Discard changes?</h2>
        <div class="hx-dialog__body">The changes made in this form will be lost. This cannot be undone.</div>
        <div class="hx-dialog__actions">
          <button type="button" class="hx-btn hx-btn--secondary"><span>Keep editing</span></button>
          <button type="button" class="hx-btn hx-btn--danger"><span>Discard</span></button>
        </div>
      </div>
    </div>`,
};

export const Closed = {
  parameters: describe('Hidden with `[hidden]`: nothing renders over the page.'),
  render: () => `
    <div class="sb-stage sb-stage--dialog">
      <div class="hx-card"><h3 class="hx-card__title">Page</h3><p class="hx-card__meta">No sheet open</p></div>
      <div class="hx-scrim" hidden></div>
      <div class="hx-sheet" role="dialog" aria-label="Hidden sheet" hidden><div class="hx-sheet__body">Hidden</div></div>
    </div>`,
};
