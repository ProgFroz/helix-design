import { describe } from './helpers.js';

const STATES = {
  empty: `<div class="hx-empty"><strong class="hx-empty__title">Nothing here yet</strong>Short explanation of what will appear here and how to start.<div class="hx-empty__actions"><button type="button" class="hx-btn hx-btn--secondary"><span>Create first item</span></button></div></div>`,
  loading: `
    <div class="hx-card" aria-busy="true" aria-label="Loading">
      <div class="sb-inline">
        <span class="hx-skeleton hx-skeleton--circle sb-avatar"></span>
        <div class="sb-grow"><span class="hx-skeleton hx-skeleton--title"></span><span class="hx-skeleton hx-skeleton--line sb-w-80"></span><span class="hx-skeleton hx-skeleton--line sb-w-55"></span></div>
      </div>
      <span class="hx-skeleton hx-skeleton--block sb-gap-top"></span>
    </div>`,
  spinner: `<div class="hx-card"><div class="sb-inline"><span class="hx-spinner" role="progressbar" aria-label="Loading"></span><span class="hx-muted">Loading…</span></div></div>`,
  error: `<div class="hx-notice hx-notice--error" role="alert"><strong class="hx-notice__title">Could not load data</strong>Only this block is affected; the rest of the page stays usable.<div class="hx-notice__actions"><button type="button" class="hx-btn hx-btn--secondary"><span>Try again</span></button></div></div>`,
  notice: `<div class="hx-notice"><strong class="hx-notice__title">Notice</strong>Neutral information that needs no action.</div>`,
};

export default {
  title: 'Components/States',
  render: ({ kind }) => `<div class="sb-narrow">${STATES[kind]}</div>`,
  argTypes: { kind: { control: 'inline-radio', options: Object.keys(STATES) } },
  args: { kind: 'empty' },
  parameters: describe('Empty, loading and error states. The skeleton shimmer and the spinner only animate when `prefers-reduced-motion` allows it.'),
};

export const Empty = {};

export const Loading = { args: { kind: 'loading' } };

export const LoadingSpinner = { args: { kind: 'spinner' } };

export const ErrorState = { name: 'Error', args: { kind: 'error' } };

export const Notice = { args: { kind: 'notice' } };
