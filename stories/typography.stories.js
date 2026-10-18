import { describe } from './helpers.js';

export default {
  title: 'Components/Typography',
  parameters: describe('DM Sans throughout. Mobile sizes first; headings switch to the Pantheon desktop sizes from 1100px (opt-in base).'),
};

export const Headings = {
  render: () => `
    <span class="hx-eyebrow">Eyebrow · section label</span>
    <h1>Heading one</h1>
    <h2>Heading two</h2>
    <h3>Heading three</h3>
    <h4>Heading four</h4>`,
};

export const BodyText = {
  render: () => `
    <p class="hx-lede">Lede paragraph: a short introduction in muted text with a relaxed line height.</p>
    <p>Body paragraph with <strong>strong text</strong>, <em class="hx-em">gold emphasis (.hx-em)</em>, <a href="#">a link (inherits the text colour)</a> and <code>inline code</code>.</p>
    <p class="hx-muted">Muted secondary text for supporting information.</p>`,
};

export const Helpers = {
  parameters: describe('`.hx-caps`, `.hx-count`, `.hx-num` (tabular numerals), `.hx-sr-only`, `.hx-readout` and the `.hx-ornament` frieze.'),
  render: () => `
    <p><span class="hx-caps">Column head</span> · <span class="hx-count">03 / 12</span> · <span class="hx-num">1,234.50</span> · <span class="hx-sr-only">Screen-reader-only text</span></p>
    <p class="hx-readout hx-num">72.5<small>units</small></p>
    <span class="hx-ornament hx-ornament--wide" aria-hidden="true"></span>`,
};

export const ScopedWithoutBase = {
  parameters: describe('Without the opt-in base, `class="hx"` gives a subtree DM Sans and ivory text.'),
  render: () => `<div class="hx"><p>Text inside an <code>.hx</code> container.</p></div>`,
};
