#!/usr/bin/env node
// Automated contract check for helix-design. Plain node >= 18, no dependencies.
// Run with `npm test`. Exits non-zero when any check fails.
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
// Reference for check 8; HELIX_DESIGN_REFERENCE overrides the path (e.g. in CI or for mutation tests).
const OLD_REPORT = process.env.HELIX_DESIGN_REFERENCE || '/opt/data/reports/theme/pantheon-report.css';
const VARIANTS = ['a', 'b', 'c', 'e'];
const DEFAULT_E = ':root:not([data-btn="a"]):not([data-btn="b"]):not([data-btn="c"])';
// The default-E arm sits in :where() so it adds no specificity over [data-btn="e"] (check 14).
const E_PREFIX = `:is([data-btn="e"],:where(${DEFAULT_E}))`;
const LAYER_ORDER = '@layer helix.tokens, helix.base, helix.components;';
const LAYERS = ['helix.tokens', 'helix.base', 'helix.components'];
const PREFIX = 'hx-';
const BUTTON_MODIFIERS = ['--primary', '--secondary', '--ghost', '--danger'];

// Component-local custom properties: allowed outside tokens.css, but only when the
// listed file declares them itself. Anything not listed here must live in tokens.css.
const LOCAL_PROPERTIES = {
  '--value': ['src/components/progress.css'],
  '--ring-size': ['src/components/progress.css'],
  '--ring-width': ['src/components/progress.css'],
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
  for (const m of stripComments(css).matchAll(/(?:^|[{;\s])(--[A-Za-z0-9_-]+)\s*:/g)) set.add(m[1]);
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

// Split a selector list on top-level commas (commas inside :is()/:not() stay).
function splitSelectorList(selector) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) { parts.push(selector.slice(start, i)); start = i + 1; }
  }
  parts.push(selector.slice(start));
  return parts.map((p) => p.trim());
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

// Minimal CSS tree: comments removed, strings and parentheses (url(), :is()) respected.
// Every `{...}` becomes { prelude, children }, every `...;` statement { prelude, children: null }.
function parseCss(css) {
  const src = stripComments(css);
  let i = 0;
  function block() {
    const nodes = [];
    let buf = '';
    let paren = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < src.length && src[j] !== ch) j += src[j] === '\\' ? 2 : 1;
        buf += src.slice(i, j + 1);
        i = j + 1;
        continue;
      }
      i++;
      if (ch === '(') paren++;
      else if (ch === ')') paren--;
      if (paren > 0 || (ch !== '{' && ch !== '}' && ch !== ';')) { buf += ch; continue; }
      if (ch === '{') {
        const prelude = buf.trim();
        buf = '';
        nodes.push({ prelude, children: block() });
        continue;
      }
      if (buf.trim()) nodes.push({ prelude: buf.trim(), children: null });
      buf = '';
      if (ch === '}') return nodes;
    }
    if (buf.trim()) nodes.push({ prelude: buf.trim(), children: null });
    return nodes;
  }
  return block();
}

// Style rules with their declarations and enclosing at-rule preludes.
// @font-face and @keyframes bodies are not style rules and are skipped.
function styleRules(nodes, at = []) {
  const out = [];
  for (const n of nodes) {
    if (!n.children) continue;
    if (n.prelude.startsWith('@')) {
      if (/^@(font-face|keyframes)\b/.test(n.prelude)) continue;
      out.push(...styleRules(n.children, [...at, n.prelude]));
      continue;
    }
    const decls = {};
    for (const d of n.children) {
      if (d.children) continue;
      const k = d.prelude.indexOf(':');
      if (k > 0) decls[d.prelude.slice(0, k).trim()] = d.prelude.slice(k + 1).trim();
    }
    out.push({ selector: n.prelude.replace(/\s+/g, ' '), decls, at });
  }
  return out;
}

const norm = (v) => v.replace(/\s+/g, ' ').replace(/\s*([(),])\s*/g, '$1').trim();

// Custom properties of `:root` rules (last wins), each var() resolved within the same map.
function resolvedRootProps(css) {
  const raw = {};
  for (const r of styleRules(parseCss(css))) {
    if (r.at.length || !splitSelectorList(r.selector).includes(':root')) continue;
    for (const [k, v] of Object.entries(r.decls)) if (k.startsWith('--')) raw[k] = v;
  }
  const resolve = (v, seen = new Set()) =>
    norm(v.replace(/var\(\s*(--[\w-]+)\s*\)/g, (m, name) =>
      name in raw && !seen.has(name) ? resolve(raw[name], new Set([...seen, name])) : m));
  const out = {};
  for (const k of Object.keys(raw)) out[k] = resolve(raw[k], new Set([k]));
  return out;
}

// Selector specificity [ids, classes/attributes/pseudo-classes, types/pseudo-elements].
// Handles :is/:not/:has (max of the argument list) and :where (zero).
function specificity(selector) {
  const max = (list) => splitSelectorList(list).map(specificity)
    .reduce((m, s) => (cmpSpec(s, m) > 0 ? s : m), [0, 0, 0]);
  const spec = [0, 0, 0];
  const add = (s) => { for (let k = 0; k < 3; k++) spec[k] += s[k]; };
  let i = 0;
  const ident = () => { const m = /^-?[A-Za-z_][\w-]*/.exec(selector.slice(i)); i += m ? m[0].length : 0; return m ? m[0] : ''; };
  while (i < selector.length) {
    const ch = selector[i];
    if (ch === '#') { i++; ident(); spec[0]++; }
    else if (ch === '.') { i++; ident(); spec[1]++; }
    else if (ch === '[') { i = selector.indexOf(']', i) + 1; spec[1]++; }
    else if (ch === ':' && selector[i + 1] === ':') { i += 2; ident(); spec[2]++; }
    else if (ch === ':') {
      i++;
      const name = ident();
      if (selector[i] === '(') {
        let depth = 0;
        const start = i + 1;
        for (; i < selector.length; i++) {
          if (selector[i] === '(') depth++;
          else if (selector[i] === ')' && --depth === 0) break;
        }
        const arg = selector.slice(start, i++);
        if (name === 'where') continue;
        if (['is', 'not', 'has'].includes(name)) add(max(arg));
        else spec[1]++;
      } else spec[1]++;
    }
    else if (/[A-Za-z_]/.test(ch)) { ident(); spec[2]++; }
    else i++;
  }
  return spec;
}
const cmpSpec = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];

// Class names in a selector, ignoring attribute values ([data-x="a.b"]).
const selectorClasses = (sel) => [...sel.replace(/\[[^\]]*\]/g, '[]').matchAll(/\.(-?[A-Za-z_][\w-]*)/g)].map((m) => m[1]);

// Font names that would render serif; custom property names (--font-serif) are not values.
function serifFamilies(css) {
  const values = stripComments(css).replace(/--[\w-]+/g, '--x');
  return values.match(/(?<![\w-])serif(?![\w-])|Cinzel|Georgia|Times|Garamond|Playfair/gi) || [];
}

class Skip extends Error {}

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
  assert.equal(pkg.exports['./base.css'], './dist/helix-base.css');
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
  for (const out of ['dist/helix-design.css', 'dist/helix-base.css', 'dist/pantheon-report.css']) {
    if (!exists(out)) { problems.push(`${out} missing`); continue; }
    const css = read(out);
    // helix-base.css is loaded together with helix-design.css and consumes its tokens
    const declared = out === 'dist/helix-base.css' ? tokens : declaredProps(css);
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
      assert.ok(scoped.some((s) => s.includes(`.hx-btn${mod}`)), `[data-btn="${v}"] has no .hx-btn${mod} rule`);
    }
  }
  assert.ok(css.includes(DEFAULT_E), `missing default-to-e selector ${DEFAULT_E}`);
  // every E rule must also apply by default, so E and the default never drift apart
  for (const s of sel.filter((x) => x.includes('[data-btn="e"]'))) {
    for (const part of splitSelectorList(s)) {
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
  const { build, buildBase } = require('./build');
  const { buildReport } = require('./build-report-theme');
  const fresh = build();
  const base = buildBase();
  assert.ok(base.endsWith('\n') && !base.endsWith('\n\n'), 'helix-base.css needs exactly one trailing newline');
  assert.ok(exists('dist/helix-base.css') && read('dist/helix-base.css') === base, 'dist/helix-base.css is stale: run `npm run build`');
  const report = buildReport();
  assert.ok(fresh.endsWith('\n') && !fresh.endsWith('\n\n'), 'helix-design.css needs exactly one trailing newline');
  assert.ok(report.endsWith('\n'), 'pantheon-report.css needs a trailing newline');
  assert.equal(build(), fresh, 'build is not deterministic');
  assert.ok(read('dist/helix-design.css') === fresh, 'dist/helix-design.css is stale: run `npm run build`');
  assert.ok(read('dist/pantheon-report.css') === report, 'dist/pantheon-report.css is stale: run `npm run build`');
  assert.ok(!/data:font\//.test(fresh), 'helix-design.css must not embed fonts as data URIs');
  assert.match(fresh, /url\(['"]?fonts\/dm-sans-latin-wght-normal\.woff2['"]?\)/);
  assert.match(report, /url\(data:font\/woff2;base64,[A-Za-z0-9+/=]{1000,}\)/);
  assert.match(report, /generated from helix-design; do not edit by hand/);
  const { ORDER, BASE_ORDER } = require('./build');
  for (const f of ['src/tokens.css', ...listCss('src/components')]) {
    assert.ok(ORDER.includes(f), `${f} is not part of the build order`);
  }
  assert.deepEqual(BASE_ORDER, ['src/base.css'], 'src/base.css builds dist/helix-base.css');
  assert.ok(!ORDER.includes('src/base.css'), 'the element base is opt-in, not part of helix-design.css');
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
  assert.match(demo, /<link[^>]+href="\.\.\/dist\/helix-base\.css"/);
  assert.match(demo, /<script[^>]+src="\.\.\/src\/switcher\.js"/);
  assert.ok(!/type="module"/.test(demo), 'module scripts do not load from file://');
  for (const m of demo.matchAll(/(?:href|src)="(\.\.\/[^"#?]+)"/g)) {
    assert.ok(fs.existsSync(path.resolve(ROOT, 'demo', m[1])), `demo references missing ${m[1]}`);
  }
});

// Check 8 needs the hand-written reference theme. A missing reference FAILS (exit 1).
// Escape hatch: HELIX_DESIGN_SKIP_REFERENCE=1 prints a visible SKIPPED line instead; the run
// then exits 0 locally, but exits 2 when CI=1 (or CI=true) so a CI job cannot pass silently.
check('8. report theme parity with the old pantheon-report.css (names and token values)', () => {
  if (!fs.existsSync(OLD_REPORT)) {
    if (process.env.HELIX_DESIGN_SKIP_REFERENCE === '1') throw new Skip(`${OLD_REPORT} not found (HELIX_DESIGN_SKIP_REFERENCE=1)`);
    assert.fail(`reference ${OLD_REPORT} not found; set HELIX_DESIGN_REFERENCE=<path> or HELIX_DESIGN_SKIP_REFERENCE=1`);
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
  // token values: every :root custom property of the old theme resolves (var() chains followed)
  // to the same value in the generated theme
  const oldVals = resolvedRootProps(oldCss);
  const newVals = resolvedRootProps(newCss);
  assert.ok(Object.keys(oldVals).length > 10, 'reference defines no :root tokens');
  const changed = [];
  for (const [k, v] of Object.entries(oldVals)) {
    if (k in newVals && newVals[k] !== v) changed.push(`${k}: ${v} -> ${newVals[k]}`);
  }
  assert.deepEqual(changed, [], 'report token values changed');
  // custom properties set outside :root (e.g. .main { --main-gutter }) keep their raw values
  const scoped = (css) => new Set(styleRules(parseCss(css)).flatMap((r) =>
    Object.entries(r.decls).filter(([k]) => k.startsWith('--') && r.selector !== ':root')
      .map(([k, v]) => `${r.at.join(' ')} ${r.selector} ${k}: ${norm(v)}`)));
  const newScoped = scoped(newCss);
  assert.deepEqual([...scoped(oldCss)].filter((x) => !newScoped.has(x)), [], 'scoped custom property values changed');
});

const LIBRARY_CSS = ['dist/helix-design.css', 'dist/helix-base.css'];
const OWN_SRC = () => listCss('src').filter((f) => !f.startsWith('src/report/'));

check('9. cascade layers: helix-design.css and helix-base.css have no unlayered rule', () => {
  const problems = [];
  for (const file of LIBRARY_CSS) {
    if (!exists(file)) { problems.push(`${file} missing`); continue; }
    const tree = parseCss(read(file));
    const statements = tree.filter((n) => !n.children && n.prelude.startsWith('@layer'));
    if (!statements.length || `${statements[0].prelude};` !== LAYER_ORDER) {
      problems.push(`${file}: first layer statement must be exactly "${LAYER_ORDER}"`);
    }
    if (tree[0] && `${tree[0].prelude};` !== LAYER_ORDER) problems.push(`${file}: "${LAYER_ORDER}" must come first`);
    const allowed = file === 'dist/helix-base.css' ? ['helix.base'] : ['helix.tokens', 'helix.components'];
    for (const n of tree) {
      if (!n.children && n.prelude.startsWith('@layer ') && !n.prelude.includes('{')) continue;
      if (n.children && /^@(font-face|keyframes)\b/.test(n.prelude)) continue;
      const m = /^@layer\s+([\w.-]+)$/.exec(n.prelude);
      if (n.children && m && allowed.includes(m[1])) continue;
      problems.push(`${file}: unlayered ${n.prelude.slice(0, 80)}`);
    }
  }
  if (exists('dist/helix-design.css')) {
    const tree = parseCss(read('dist/helix-design.css'));
    const layerOf = (pred) => tree.filter((n) => n.children && n.prelude.startsWith('@layer') &&
      styleRules(n.children).some(pred)).map((n) => n.prelude);
    if (!layerOf((r) => r.selector === ':root').every((l) => l === '@layer helix.tokens')) problems.push(':root tokens outside helix.tokens');
    if (!layerOf((r) => r.selector.startsWith('.hx-btn')).every((l) => l === '@layer helix.components')) problems.push('components outside helix.components');
  }
  assert.deepEqual(problems, []);
});

check('10. every class selector in the library CSS starts with hx-', () => {
  const bad = [];
  for (const file of LIBRARY_CSS) {
    if (!exists(file)) { bad.push(`${file} missing`); continue; }
    for (const r of styleRules(parseCss(read(file)))) {
      for (const c of selectorClasses(r.selector)) if (c !== 'hx' && !c.startsWith(PREFIX)) bad.push(`${file}: .${c}`);
    }
  }
  assert.deepEqual([...new Set(bad)], []);
  // the demo only uses classes the library defines (plus its own demo, demo-* layout classes)
  const defined = new Set(styleRules(parseCss(read('dist/helix-design.css'))).flatMap((r) => selectorClasses(r.selector)));
  const demo = read('demo/index.html');
  const used = new Set([...demo.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean)));
  assert.deepEqual([...used].filter((c) => !/^demo(-|$)/.test(c) && !defined.has(c)), [], 'demo uses undefined classes');
});

check('11. helix-design.css sets no global element style; element rules live in helix-base.css', () => {
  const bad = [];
  for (const r of styleRules(parseCss(read('dist/helix-design.css')))) {
    for (const part of splitSelectorList(r.selector)) {
      // a selector without any class reaches elements globally; only the :root token scope may do that
      if (part === ':root' || selectorClasses(part).length) continue;
      bad.push(`${r.at.join(' ')} ${part}`.trim());
    }
  }
  assert.deepEqual(bad, [], 'global selectors in helix-design.css (move them to src/base.css)');
  assert.ok(exists('dist/helix-base.css'), 'dist/helix-base.css missing');
  const baseSelectors = styleRules(parseCss(read('dist/helix-base.css'))).flatMap((r) => splitSelectorList(r.selector));
  for (const el of ['html', 'body', 'h1', 'a', 'code', 'button', '*', ':focus-visible']) {
    assert.ok(baseSelectors.includes(el), `helix-base.css has no ${el} rule`);
  }
  assert.ok(styleRules(parseCss(read('dist/helix-base.css'))).some((r) => r.selector.startsWith('*') &&
    r.at.some((a) => /prefers-reduced-motion:\s*reduce/.test(a))), 'reduced-motion rule belongs to helix-base.css');
});

check('12. font license: dist/fonts/OFL.txt and README note', () => {
  assert.ok(exists('dist/fonts/OFL.txt'), 'dist/fonts/OFL.txt missing');
  const ofl = read('dist/fonts/OFL.txt');
  assert.ok(ofl.includes('SIL OPEN FONT LICENSE Version 1.1'), 'OFL.txt is not the OFL 1.1 text');
  assert.match(ofl, /^Copyright .*DM Sans/m, 'OFL.txt lacks the DM Sans copyright line');
  for (const term of ['PREAMBLE', 'DEFINITIONS', 'PERMISSION & CONDITIONS', 'TERMINATION', 'DISCLAIMER']) {
    assert.ok(ofl.includes(term), `OFL.txt lacks the ${term} section`);
  }
  const readme = read('README.md');
  assert.ok(readme.includes('Code MIT, fonts OFL-1.1'), 'README must say "Code MIT, fonts OFL-1.1"');
  assert.ok(readme.includes('dist/fonts/OFL.txt'), 'README must point to dist/fonts/OFL.txt');
  assert.match(read('LICENSE'), /MIT License/);
  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.files.includes('dist'), 'files must ship dist/ (font + OFL.txt)');
  assert.equal(pkg.exports['./fonts/*'], './dist/fonts/*', 'fonts/* export (font + OFL.txt) missing');
});

check('13. Pantheon base decisions: focus offset, links, em, DM Sans, heading scale', () => {
  const tokens = resolvedRootProps(read('src/tokens.css'));
  assert.equal(tokens['--focus-ring-offset'], '4px', 'focus ring offset is Pantheon 4px');
  const rawTokens = Object.fromEntries(styleRules(parseCss(read('src/tokens.css'))).flatMap((r) => Object.entries(r.decls)));
  assert.equal(rawTokens['--font-serif'], 'var(--font-sans)', '--font-serif stays an alias of --font-sans');
  // links inherit their colour (Pantheon), also on hover
  const base = styleRules(parseCss(read('src/base.css')));
  const linkRules = base.filter((r) => splitSelectorList(r.selector).some((p) => /^a(:[\w-]+)*$/.test(p)));
  const a = linkRules.find((r) => splitSelectorList(r.selector).includes('a'));
  assert.ok(a, 'base.css has no a rule');
  assert.equal(a.decls.color, 'inherit', 'a { color: inherit }');
  assert.equal(a.decls['text-decoration'], 'none');
  for (const r of linkRules) if (r.decls.color) assert.equal(r.decls.color, 'inherit', `${r.selector} changes the link colour`);
  // no global em styling in the library; .hx-em is the opt-in helper
  for (const file of [...OWN_SRC(), ...LIBRARY_CSS]) {
    for (const r of styleRules(parseCss(read(file)))) {
      if (splitSelectorList(r.selector).some((p) => /(^|[\s>+~])em$/.test(p))) assert.fail(`${file}: ${r.selector} styles em`);
    }
  }
  const em = styleRules(parseCss(read('dist/helix-design.css'))).find((r) => r.selector === '.hx-em');
  assert.ok(em, '.hx-em helper missing');
  assert.equal(em.decls['font-style'], 'normal');
  assert.equal(em.decls.color, 'var(--gold-bright)');
  // DM Sans everywhere: no serif family in any CSS (library and report)
  for (const file of [...listCss('src'), ...LIBRARY_CSS, 'dist/pantheon-report.css']) {
    assert.deepEqual(serifFamilies(read(file)), [], `${file} names a serif font`);
  }
  // mobile-first heading scale below 1100px, Pantheon sizes from 1100px
  assert.equal(tokens['--fs-h1'], '1.875rem');
  assert.equal(tokens['--fs-h2'], '1.375rem');
  assert.equal(tokens['--fs-h3'], '1.125rem');
  assert.equal(tokens['--fs-h1-lg'], 'clamp(2.8rem,4.6vw,4.6rem)');
  assert.equal(tokens['--fs-h2-lg'], '1.85rem');
  assert.equal(tokens['--fs-h3-lg'], '1.5rem');
  const size = (el, media) => base.find((r) => r.selector === el && r.decls['font-size'] &&
    (media ? r.at.includes('@media (min-width: 1100px)') : r.at.length === 0))?.decls['font-size'];
  for (const h of ['h1', 'h2', 'h3']) {
    assert.equal(size(h, false), `var(--fs-${h})`, `${h} below 1100px`);
    assert.equal(size(h, true), `var(--fs-${h}-lg)`, `${h} from 1100px`);
  }
  const headings = base.find((r) => r.selector === 'h1, h2, h3, h4' && r.decls['font-family']);
  assert.equal(headings?.decls['font-family'], 'var(--font-sans)', 'headings use DM Sans');
  const md = read('TOKENS.md');
  assert.match(md, /mobile-first heading scale applies to all consumers below 1100px/);
  assert.match(md, /DM Sans everywhere, including C\/E caps labels/);
});

check('14. default E has the same specificity as the A/B/C variant selectors', () => {
  const css = stripComments(read('src/components/buttons.css'));
  let compared = 0;
  const bad = [];
  for (const { selector } of rules(css)) {
    for (const part of splitSelectorList(selector)) {
      if (!part.includes(DEFAULT_E)) continue;
      if (!part.startsWith(E_PREFIX)) { bad.push(`default E not wrapped in ${E_PREFIX}: ${part}`); continue; }
      const rest = part.slice(E_PREFIX.length);
      for (const v of ['a', 'b', 'c']) {
        const other = specificity(`[data-btn="${v}"]${rest}`);
        const own = specificity(part);
        compared++;
        if (cmpSpec(own, other) !== 0) bad.push(`${part} ${own} != [data-btn="${v}"]${rest} ${other}`);
      }
    }
  }
  assert.deepEqual(bad, []);
  assert.ok(compared > 30, 'no default-E selectors found');
  // the specificity calculator itself
  assert.deepEqual(specificity(':where(:root:not([data-btn="a"])) .x'), [0, 1, 0]);
  assert.deepEqual(specificity(':is([data-btn="e"],:root:not([a]):not([b])) .x:is(:active,.y)::before'), [0, 5, 1]);
});

let failed = 0;
let skipped = 0;
for (const { name, fn } of checks) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (err) {
    if (err instanceof Skip) {
      skipped++;
      console.log(`SKIPPED ${name}\n     ${err.message}`);
      continue;
    }
    failed++;
    console.log(`FAIL ${name}`);
    console.log(`     ${String(err && err.message ? err.message : err).split('\n').join('\n     ')}`);
    if (err && err.actual !== undefined && Array.isArray(err.actual)) {
      for (const line of err.actual.slice(0, 40)) console.log(`       - ${line}`);
    }
  }
}
console.log(`\n${checks.length - failed - skipped}/${checks.length} checks passed${skipped ? `, ${skipped} SKIPPED` : ''}`);
const ci = process.env.CI === '1' || process.env.CI === 'true';
process.exitCode = failed ? 1 : skipped && ci ? 2 : 0;
