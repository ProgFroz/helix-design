// Shared helpers for the stories (not a story file itself).

// Line icons used by the old demo, inlined instead of an SVG sprite.
const ICONS = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  home: 'M4 11l8-6 8 6v8H4z',
  list: 'M5 7h14M5 12h14M5 17h14',
  grid: 'M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z',
  chart: 'M5 19V9M12 19V5M19 19v-7',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.5-4 4.5-6 8-6s6.5 2 8 6',
  close: 'M6 6l12 12M18 6L6 18',
  right: 'M9 6l6 6-6 6',
};

export const icon = (name, attrs = '') => `<svg viewBox="0 0 24 24" aria-hidden="true"${attrs}><path d="${ICONS[name]}"/></svg>`;

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);

// Join class names, dropping empty ones.
export const cx = (...names) => names.filter(Boolean).join(' ');

// Story description shown on the docs page.
export const describe = (text) => ({ docs: { description: { story: text } } });
