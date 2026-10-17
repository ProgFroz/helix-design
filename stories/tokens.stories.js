import tokensCss from '../src/tokens.css?raw';
import { groupTokens, parseTokens } from '../.storybook/tokens.mjs';
import { describe, esc } from './helpers.js';

// Everything on this page comes from src/tokens.css at render time; nothing is copied by hand.

const MAX_VALUE = 90;
const shown = (value) => (value.length > MAX_VALUE ? `${value.slice(0, MAX_VALUE)}…` : value);

// The raw declared value, plus what the browser resolves it to when it is an alias.
const valueCell = ({ name, value }) => {
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const alias = /var\(/.test(value) && resolved ? `<span class="sb-block hx-muted">→ ${esc(shown(resolved))}</span>` : '';
  return `<code title="${esc(value)}">${esc(shown(value))}</code>${alias}`;
};

// Visual sample per token; the browser resolves var() aliases.
const SAMPLES = [
  [/^--font-/, (n) => `<span style="font-family: var(${n})">DM Sans · Aa Bb 0123456789</span>`],
  [/^--fs-/, (n) => `<span style="font-size: var(${n})">Sample text</span>`],
  [/^--fw-/, (n) => `<span style="font-weight: var(${n})">Sample text</span>`],
  [/^--lh-/, (n) => `<span class="sb-block" style="line-height: var(${n}); max-width: 320px">Two lines of sample text to show the line height of this token.</span>`],
  [/^--tracking-/, (n) => `<span style="letter-spacing: var(${n}); text-transform: uppercase">Spaced capitals</span>`],
  [/^--(space|gutter|s)-?/, (n) => `<i class="sb-bar" style="width: var(${n})"></i>`],
  [/^--radius/, (n) => `<i class="sb-box sb-block" style="border-radius: var(${n})"></i>`],
  [/^--border-width$/, (n) => `<i class="sb-box sb-block" style="border-width: var(${n})"></i>`],
  [/^--(shadow-|drop$|press$|edge-)/, (n) => `<i class="sb-box sb-block" style="box-shadow: var(${n})"></i>`],
  [/^--meander/, (n) => (/^--meander$/.test(n) ? `<i class="sb-bar" style="width: 240px; height: var(--meander-h); background: var(${n}) repeat-x; background-size: auto 100%"></i>` : '')],
];
const sample = (name) => (SAMPLES.find(([re]) => re.test(name))?.[1](name)) || '';

const swatches = (tokens) => `
  <div class="sb-grid sb-grid--swatches">
    ${tokens.map((t) => `<div class="sb-swatch"><i style="background: var(${t.name})"></i><div><code>${t.name}</code><span>${valueCell(t)}</span></div></div>`).join('')}
  </div>`;

const table = (tokens) => `
  <table class="sb-table">
    <thead><tr><th>Token</th><th>Value</th><th>Sample</th></tr></thead>
    <tbody>${tokens.map((t) => `<tr><td><code>${t.name}</code></td><td>${valueCell(t)}</td><td>${sample(t.name)}</td></tr>`).join('')}</tbody>
  </table>`;

export default {
  title: 'Foundations/Tokens',
  parameters: { controls: { disable: true }, ...describe('All custom properties of `src/tokens.css`, parsed at render time and grouped by their section comment. Tokens outside the known sections land in "Other".') },
};

export const Tokens = {
  render: () => groupTokens(parseTokens(tokensCss))
    .filter((group) => group.tokens.length)
    .map((group) => `
      <section>
        <h2 class="sb-label">${group.title} <span class="hx-count">${group.tokens.length}</span></h2>
        ${group.title === 'Colors' ? swatches(group.tokens) : table(group.tokens)}
      </section>`).join(''),
};
