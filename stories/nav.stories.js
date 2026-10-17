import { describe, icon } from './helpers.js';

const ITEMS = [['home', 'Home'], ['list', 'Lists'], ['grid', 'Items'], ['chart', 'Stats']];

const bottomNav = (current = 0, extra = '') => `
  <nav class="hx-bottom-nav" aria-label="Main">
    ${[...ITEMS, ['user', 'Profile']].map(([i, label], n) => `<a class="hx-bottom-nav__item${n === 1 ? extra : ''}" href="#"${n === current ? ' aria-current="page"' : ''}><span class="hx-bottom-nav__icon">${icon(i)}</span>${label}</a>`).join('')}
  </nav>`;

const sideNav = (current = 0, extra = '') => `
  <nav class="hx-side-nav" aria-label="Main">
    <a class="hx-side-nav__brand" href="#"><span class="hx-side-nav__mark">H</span>BRAND</a>
    <span class="hx-side-nav__label">Navigation</span>
    ${ITEMS.map(([i, label], n) => `<a class="hx-side-nav__item${n === 1 ? extra : ''}" href="#"${n === current ? ' aria-current="page"' : ''}><span class="hx-side-nav__icon">${icon(i)}</span>${label}</a>`).join('')}
    <div class="hx-side-nav__foot">VERSION 0.1.0</div>
  </nav>`;

const mobile = (nav) => `
  <div class="sb-stage sb-stage--mobile" aria-label="Mobile frame">
    <div class="hx-app-shell">
      <nav class="hx-side-nav" aria-label="Main"></nav>
      <main class="hx-app-shell__main">
        <span class="hx-eyebrow">Mobile · below 1100px</span>
        <h1>Overview</h1>
        <div class="hx-card"><h3 class="hx-card__title">Content area</h3><p class="hx-card__meta">Bottom padding clears nav and FAB</p></div>
      </main>
      ${nav}
    </div>
  </div>`;

const desktop = (nav) => `
  <div class="sb-scroll"><div class="sb-stage sb-stage--desktop" aria-label="Desktop frame">
    <div class="hx-app-shell">
      ${nav}
      <main class="hx-app-shell__main">
        <span class="hx-eyebrow">Desktop · from 1100px</span>
        <h1>Overview</h1>
        <p class="hx-lede">The side nav replaces the bottom nav; the FAB moves to the bottom-right corner.</p>
      </main>
      <nav class="hx-bottom-nav" aria-label="Main"></nav>
    </div>
  </div></div>`;

export default {
  title: 'Components/Navigation',
  parameters: describe('Inside `.hx-app-shell` the bottom nav shows below 1100px and the side nav from 1100px. The frames pin both statically; in an app they are fixed to the viewport. Active item: `aria-current="page"` or `.hx-is-active`.'),
};

export const BottomNav = { render: () => mobile(bottomNav()) };

export const BottomNavFocus = {
  parameters: describe('Second item with the static focus ring (`.hx-is-focus`).'),
  render: () => mobile(bottomNav(0, ' hx-is-focus')),
};

export const SideNav = { render: () => desktop(sideNav()) };

export const SideNavActiveClass = {
  parameters: describe('Second item active via `.hx-is-active` instead of `aria-current`.'),
  render: () => desktop(sideNav(-1, ' hx-is-active')),
};

export const SideNavFocus = { render: () => desktop(sideNav(0, ' hx-is-focus')) };

export const AppShell = {
  parameters: {
    layout: 'fullscreen',
    ...describe('The real responsive shell, fixed to the viewport. Switch the viewport toolbar between 390 and 1100/1440 to see the breakpoint.'),
  },
  render: () => `
    <div class="hx-app-shell">
      ${sideNav()}
      <main class="hx-app-shell__main">
        <span class="hx-eyebrow">App shell</span>
        <h1>Overview</h1>
        <p class="hx-lede">Bottom nav below 1100px, side nav from 1100px.</p>
      </main>
      ${bottomNav()}
    </div>`,
};
