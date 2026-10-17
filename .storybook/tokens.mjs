// Token parser for the Foundations/Tokens page. Plain JS without dependencies, so that
// scripts/check.js (check 16) can unit-test it in Node against src/tokens.css.

// Section comments in tokens.css look like `/* ---------- colour: surfaces ---------- */`.
const SECTION = /^\/\*\s*-{3,}\s*([\s\S]*?)\s*-{3,}/;

// Every custom property declaration as { name, value, section }, in source order.
// Strings and parentheses are respected, so `url("data:...;base64,...")` stays one value.
export function parseTokens(css) {
  const tokens = [];
  let section = '';
  let buf = '';
  let depth = 0;
  const flush = () => {
    const m = /^(--[\w-]+)\s*:\s*([\s\S]*)$/.exec(buf.trim());
    if (m) tokens.push({ name: m[1], value: m[2].replace(/\s+/g, ' ').trim(), section });
    buf = '';
  };
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const comment = css.slice(i, end < 0 ? css.length : end + 2);
      const m = SECTION.exec(comment);
      if (m) section = m[1];
      i += comment.length - 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== ch) j += css[j] === '\\' ? 2 : 1;
      buf += css.slice(i, j + 1);
      i = j;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth > 0) { buf += ch; continue; }
    if (ch === '{') { buf = ''; continue; }
    if (ch === ';' || ch === '}') { flush(); continue; }
    buf += ch;
  }
  flush();
  return tokens;
}

// Groups of the tokens page, matched against the section comment. Anything else lands in Other.
export const TOKEN_GROUPS = [
  { title: 'Colors', section: /^colou?r\b/i },
  { title: 'Spacing', section: /^spacing\b/i },
  { title: 'Typography', section: /^typography\b/i },
  { title: 'Radius', section: /^shape\b/i },
  { title: 'Shadow', section: /^shadow\b/i },
];

export function groupTokens(tokens) {
  const groups = [...TOKEN_GROUPS.map((g) => ({ title: g.title, tokens: [] })), { title: 'Other', tokens: [] }];
  for (const token of tokens) {
    const index = TOKEN_GROUPS.findIndex((g) => g.section.test(token.section));
    groups[index < 0 ? groups.length - 1 : index].tokens.push(token);
  }
  return groups;
}
