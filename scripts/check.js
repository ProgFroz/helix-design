#!/usr/bin/env node
// Automated contract check for helix-design. Plain node >= 18, no dependencies.
// Run with `npm test`. Exits non-zero when any check fails.
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const OLD_REPORT = '/opt/data/reports/theme/pantheon-report.css';
const VARIANTS = ['a', 'b', 'c', 'e'];
const DEFAULT_E = ':root:not([data-btn="a"]):not([data-btn="b"]):not([data-btn="c"])';
const BUTTON_MODIFIERS = ['--primary', '--secondary', '--ghost', '--danger'];

// Component-local custom properties: allowed outside tokens.css, but only when the
// listed file declares them itself. Anything not listed here must live in tokens.css.
const LOCAL_PROPERTIES = {
  '--value': ['src/components/progress.css'],
  '--ring-size': ['src/components/progress.css'],
  '--ring-width': ['src/components/progress.css'],
  '--sq': ['src/components/stepper.css'],
  '--main-gutter': ['src/report/report.css'],
};
// var(--x, fallback) is NOT exempt from check 1: no documented exemptions exist.

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const exists = (p) => fs.existsSync(abs(p));

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function listCss(dir) {
  const out = [];
  if (!exists(dir)) return out;
  for (const entry of fs.readdirSync(abs(dir), { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...listCss(p));
    else if (entry.name.endsWith('.css')) out.push(p);
  }
  return out.sort();
}

function declaredProps(css) {
  const set = new Set();
  for (const m of stripComments(css).matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) set.add(m[1]);
  return set;
}

function usedVars(css) {
  const set = new Set();
  for (const m of stripComments(css).matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) set.add(m[1]);
  return set;
}

// Selector preludes of every rule (text before each `{`), comments and url() bodies removed.
function preludes(css) {
  const clean = stripComments(css).replace(/url\((?:[^()"']|"[^"]*"|'[^']*')*\)/g, 'url()');
  const parts = [];
  const re = /([^{};]*)\{/g;
  let m;
  while ((m = re.exec(clean))) parts.push(m[1].trim());
  return parts;
}

function classSelectors(css) {
  const set = new Set();
  for (const p of preludes(css)) {
    if (p.startsWith('@')) continue;
    for (const m of p.matchAll(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g)) set.add(`.${m[1]}`);
  }
  return set;
}

// Rules as { selector, body } pairs (flat; at-rule preludes are skipped).
function rules(css) {
  const clean = stripComments(css);
  const out = [];
  const re = /([^{}]*)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}

function tokenSources() {
  const tokens = exists('src/tokens.css') ? declaredProps(read('src/tokens.css')) : new Set();
  const report = exists('src/report/report-root.css') ? declaredProps(read('src/report/report-root.css')) : new Set();
  return { tokens, report };
}

function loadSwitcher({ stored, throwOnStorage = false, readyState = 'complete', initialBtn } = {}) {
  const storage = new Map();
  if (stored !== undefined) storage.set('helix-design.btn', stored);
  const localStorage = {
    getItem(k) { if (throwOnStorage) throw new Error('denied'); return storage.has(k) ? storage.get(k) : null; },
    setItem(k, v) { if (throwOnStorage) throw new Error('denied'); storage.set(k, String(v)); },
    removeItem(k) { storage.delete(k); },
  };
  const listeners = {};
  const makeButton = (v) => {
    const attrs = {};
    return {
      dataset: { btnSwitch: v },
      setAttribute(k, val) { attrs[k] = String(val); },
      getAttribute(k) { return k in attrs ? attrs[k] : null; },
      closest(sel) { return sel === '[data-btn-switch]' ? this : null; },
      attrs,
    };
  };
  const buttons = VARIANTS.map(makeButton);
  const documentElement = { dataset: {} };
  if (initialBtn !== undefined) documentElement.dataset.btn = initialBtn;
  const document = {
    documentElement,
    readyState,
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    querySelectorAll(sel) { return sel === '[data-btn-switch]' ? buttons : []; },
  };
  const window = { document, localStorage };
  const context = vm.createContext({ window, document, localStorage });
  vm.runInContext(read('src/switcher.js'), context, { filename: 'switcher.js' });
  return { api: window.HelixDesign, window, document, storage, buttons, listeners };
}

const checks = [];
const check = (name, fn) => checks.push({ name, fn });

check('package.json: name, version, exports, files, scripts', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.name, 'helix-design');
  assert.equal(pkg.version, '0.1.0');
  assert.equal(pkg.scripts.test, 'node scripts/check.js');
  assert.match(pkg.scripts.build, /scripts\/build\b/);
  assert.match(pkg.scripts.build, /scripts\/build-report-theme/);
  assert.ok(pkg.exports, 'exports missing');
  assert.equal(pkg.exports['./css'], './dist/helix-design.css');
  assert.equal(pkg.exports['./tokens.css'], './src/tokens.css');
  assert.equal(pkg.exports['./switcher.js'], './src/switcher.js');
  for (const f of ['dist', 'src', 'README.md', 'TOKENS.md']) assert.ok(pkg.files?.includes(f), `files lacks ${f}`);
  assert.ok(!pkg.dependencies || Object.keys(pkg.dependencies).length === 0, 'no runtime dependencies allowed');
  for (const t of Object.values(pkg.exports)) {
    if (!t.includes('*')) assert.ok(exists(t.replace(/^\.\//, '')), `export target missing: ${t}`);
  }
  for (const f of ['LICENSE', 'README.md', 'TOKENS.md', '.gitignore', 'dist/fonts/dm-sans-latin-wght-normal.woff2']) {
    assert.ok(exists(f), `${f} missing`);
  }
});

check('1. every var(--x) in src/**/*.css is defined in tokens.css (or a declared local property)', () => {
  const { tokens, report } = tokenSources();
  assert.ok(tokens.size > 0, 'src/tokens.css defines no tokens');
  const files = listCss('src');
  assert.ok(files.includes('src/base.css'), 'src/base.css missing');
  const problems = [];
  for (const file of files) {
    const css = read(file);
    const declared = declaredProps(css);
    const isReport = file.startsWith('src/report/');
    for (const name of usedVars(css)) {
      if (tokens.has(name)) continue;
      if (isReport && report.has(name)) continue;
      if (LOCAL_PROPERTIES[name]?.includes(file) && declared.has(name)) continue;
      problems.push(`${file}: var(${name}) is not defined in src/tokens.css`);
    }
    if (file === 'src/tokens.css' || file === 'src/report/report-root.css') continue;
    for (const name of declared) {
      if (!LOCAL_PROPERTIES[name]?.includes(file)) {
        problems.push(`${file}: declares ${name}; tokens belong in src/tokens.css (or add it to LOCAL_PROPERTIES)`);
      }
    }
  }
  for (const out of ['dist/helix-design.css', 'dist/pantheon-report.css']) {
    if (!exists(out)) { problems.push(`${out} missing`); continue; }
    const css = read(out);
    const declared = declaredProps(css);
    for (const name of usedVars(css)) if (!declared.has(name)) problems.push(`${out}: var(${name}) undefined`);
  }
  assert.deepEqual(problems, []);
});

check('2. no gradients in src/components/buttons.css', () => {
  const css = stripComments(read('src/components/buttons.css'));
  const hits = css.match(/(?:repeating-)?(?:linear|radial|conic)-gradient|var\(\s*--grad-/g) || [];
  assert.deepEqual(hits, [], 'buttons.css must stay flat');
});

check('3. button variants a/b/c/e (+ default to e) in CSS, switcher and demo', () => {
  const css = stripComments(read('src/components/buttons.css'));
  const sel = rules(css).map((r) => r.selector);
  for (const v of VARIANTS) {
    const scoped = sel.filter((s) => s.includes(`[data-btn="${v}"]`));
    assert.ok(scoped.length > 0, `no rules for [data-btn="${v}"]`);
    for (const mod of BUTTON_MODIFIERS) {
      assert.ok(scoped.some((s) => s.includes(`.btn${mod}`)), `[data-btn="${v}"] has no .btn${mod} rule`);
    }
  }
  assert.ok(css.includes(DEFAULT_E), `missing default-to-e selector ${DEFAULT_E}`);
  // every E rule must also apply by default, so E and the default never drift apart
  for (const s of sel.filter((x) => x.includes('[data-btn="e"]'))) {
    for (const part of s.split(/,(?![^(]*\))/)) {
      if (part.includes('[data-btn="e"]')) assert.ok(part.includes(DEFAULT_E), `E selector without default: ${part.trim()}`);
    }
  }
  assert.ok(!/data-btn="d"|data-btn-switch="d"/.test(css + read('demo/index.html')), 'variant D is rejected');
  const { api } = loadSwitcher();
  assert.deepEqual(Array.from(api.VARIANTS), VARIANTS);
  const demo = read('demo/index.html');
  const demoValues = [...demo.matchAll(/data-btn-switch="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(demoValues)].sort(), VARIANTS, 'demo switcher must offer exactly a/b/c/e');
});

check('4. dist/ is byte-identical to a fresh build of src/', () => {
  const { build } = require('./build');
  const { buildReport } = require('./build-report-theme');
  const fresh = build();
  const report = buildReport();
  assert.ok(fresh.endsWith('\n') && !fresh.endsWith('\n\n'), 'helix-design.css needs exactly one trailing newline');
  assert.ok(report.endsWith('\n'), 'pantheon-report.css needs a trailing newline');
  assert.equal(build(), fresh, 'build is not deterministic');
  assert.ok(read('dist/helix-design.css') === fresh, 'dist/helix-design.css is stale: run `npm run build`');
  assert.ok(read('dist/pantheon-report.css') === report, 'dist/pantheon-report.css is stale: run `npm run build`');
  assert.ok(!/base64,/.test(fresh), 'helix-design.css must not embed base64 fonts');
  assert.match(fresh, /url\(['"]?fonts\/dm-sans-latin-wght-normal\.woff2['"]?\)/);
  assert.match(report, /url\(data:font\/woff2;base64,[A-Za-z0-9+/=]{1000,}\)/);
  assert.match(report, /generated from helix-design; do not edit by hand/);
  const { ORDER } = require('./build');
  for (const f of ['src/tokens.css', 'src/base.css', ...listCss('src/components')]) {
    assert.ok(ORDER.includes(f), `${f} is not part of the build order`);
  }
});

check('5. TOKENS.md documents every token and only existing ones', () => {
  const { tokens, report } = tokenSources();
  const md = read('TOKENS.md');
  const all = new Set([...tokens, ...report]);
  const undocumented = [...all].filter((t) => !new RegExp(`${t}(?![A-Za-z0-9_-])`).test(md));
  assert.deepEqual(undocumented, [], 'tokens missing from TOKENS.md');
  // Names in the "Dropped" section are documented precisely because they do not exist.
  const kept = md.replace(/^##[^\n]*Dropped[\s\S]*?(?=^## |(?![\s\S]))/im, '');
  assert.notEqual(kept, md, 'TOKENS.md needs a "Dropped / stays in project" section');
  const named = new Set([...kept.matchAll(/--[a-z][a-z0-9-]*[a-z0-9]/g)].map((m) => m[0]));
  const unknown = [...named].filter((t) => !all.has(t) && !LOCAL_PROPERTIES[t]);
  assert.deepEqual(unknown, [], 'TOKENS.md names tokens that do not exist');
});

check('6. switcher logic', () => {
  // default
  let s = loadSwitcher();
  assert.equal(s.api.getButtonStyle(), 'e');
  assert.equal(s.document.documentElement.dataset.btn, undefined, 'no attribute is written without a stored choice');
  // set + persist + aria-pressed
  assert.equal(s.api.setButtonStyle('b'), true);
  assert.equal(s.document.documentElement.dataset.btn, 'b');
  assert.equal(s.storage.get('helix-design.btn'), 'b');
  assert.equal(s.api.getButtonStyle(), 'b');
  assert.deepEqual(s.buttons.map((b) => b.attrs['aria-pressed']), ['false', 'true', 'false', 'false']);
  // invalid values are ignored
  for (const bad of ['d', 'x', '', null, undefined, 'A', 'ab', 3]) {
    assert.equal(s.api.setButtonStyle(bad), false, `accepted ${String(bad)}`);
  }
  assert.equal(s.api.getButtonStyle(), 'b');
  assert.equal(s.storage.get('helix-design.btn'), 'b');
  // invalid attribute reads as default e
  s.document.documentElement.dataset.btn = 'd';
  assert.equal(s.api.getButtonStyle(), 'e');
  // restore on load
  s = loadSwitcher({ stored: 'c' });
  assert.equal(s.document.documentElement.dataset.btn, 'c');
  assert.equal(s.api.getButtonStyle(), 'c');
  assert.equal(s.buttons[2].attrs['aria-pressed'], 'true');
  // invalid stored value is not applied
  s = loadSwitcher({ stored: 'd' });
  assert.equal(s.document.documentElement.dataset.btn, undefined);
  assert.equal(s.api.getButtonStyle(), 'e');
  assert.equal(s.buttons[3].attrs['aria-pressed'], 'true');
  // storage errors are ignored
  s = loadSwitcher({ throwOnStorage: true });
  assert.equal(s.api.setButtonStyle('a'), true);
  assert.equal(s.document.documentElement.dataset.btn, 'a');
  assert.equal(s.api.getButtonStyle(), 'a');
  // [data-btn-switch] click wiring (delegated)
  s = loadSwitcher({ readyState: 'loading' });
  assert.ok(s.listeners.click?.length, 'no click listener');
  assert.ok(s.listeners.DOMContentLoaded?.length, 'aria-pressed not synced when DOM is still loading');
  s.listeners.DOMContentLoaded.forEach((fn) => fn());
  assert.equal(s.buttons[3].attrs['aria-pressed'], 'true');
  s.listeners.click.forEach((fn) => fn({ target: s.buttons[0] }));
  assert.equal(s.document.documentElement.dataset.btn, 'a');
  assert.equal(s.storage.get('helix-design.btn'), 'a');
  assert.deepEqual(s.buttons.map((b) => b.attrs['aria-pressed']), ['true', 'false', 'false', 'false']);
  s.listeners.click.forEach((fn) => fn({ target: { closest: () => null } }));
  assert.equal(s.api.getButtonStyle(), 'a');
  // CommonJS / bundler entry exposes the same API
  const mod = { exports: {} };
  vm.runInNewContext(read('src/switcher.js'), { module: mod, exports: mod.exports });
  assert.equal(typeof mod.exports.setButtonStyle, 'function');
  assert.equal(typeof mod.exports.getButtonStyle, 'function');
  assert.equal(mod.exports.getButtonStyle(), 'e', 'must not throw without a DOM');
});

check('7. demo has a section per component and works from file://', () => {
  const demo = read('demo/index.html');
  const ids = new Set([...demo.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const want = ['switcher', 'tokens', ...listCss('src/components').map((f) => path.basename(f, '.css'))];
  assert.ok(want.length > 10, 'component files missing');
  assert.deepEqual(want.filter((id) => !ids.has(id)), [], 'demo sections missing');
  assert.match(demo, /<link[^>]+href="\.\.\/dist\/helix-design\.css"/);
  assert.match(demo, /<script[^>]+src="\.\.\/src\/switcher\.js"/);
  assert.ok(!/type="module"/.test(demo), 'module scripts do not load from file://');
  for (const m of demo.matchAll(/(?:href|src)="(\.\.\/[^"#?]+)"/g)) {
    assert.ok(fs.existsSync(path.resolve(ROOT, 'demo', m[1])), `demo references missing ${m[1]}`);
  }
});

check('8. report theme parity with the old pantheon-report.css', () => {
  if (!fs.existsSync(OLD_REPORT)) {
    console.log(`   notice: ${OLD_REPORT} not found, parity check skipped`);
    return;
  }
  const oldCss = fs.readFileSync(OLD_REPORT, 'utf8');
  const newCss = read('dist/pantheon-report.css');
  const readme = read('README.md');
  const missing = [];
  const newClasses = classSelectors(newCss);
  for (const c of classSelectors(oldCss)) if (!newClasses.has(c)) missing.push(c);
  const newProps = declaredProps(newCss);
  for (const p of declaredProps(oldCss)) if (!newProps.has(p)) missing.push(p);
  const newKeyframes = new Set([...newCss.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  for (const m of oldCss.matchAll(/@keyframes\s+([\w-]+)/g)) {
    if (!newKeyframes.has(m[1])) missing.push(`@keyframes ${m[1]}`);
  }
  const undocumented = missing.filter((x) => !readme.includes(`\`${x}\``));
  assert.deepEqual(undocumented, [], 'report selectors/properties dropped without a README note');
  assert.match(readme, /intentional differences/i);
});

let failed = 0;
for (const { name, fn } of checks) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL ${name}`);
    console.log(`     ${String(err && err.message ? err.message : err).split('\n').join('\n     ')}`);
    if (err && err.actual !== undefined && Array.isArray(err.actual)) {
      for (const line of err.actual.slice(0, 40)) console.log(`       - ${line}`);
    }
  }
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exitCode = failed ? 1 : 0;
