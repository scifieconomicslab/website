// Reads the vault once: front matter, slugs, titles, wikilink index, backlinks.
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..', '..');
// folders that are never part of the published vault: tooling, internal docs and the brief
const SKIP = new Set(['node_modules', '_site', 'model', 'templates', '.site', '.obsidian', '.github', '.git', 'ticker', 'docs', 'brief']);
const SKIP_FILES = new Set(['PLAN.md', 'README.md']);

const slugify = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md') && !SKIP_FILES.has(e.name) && !e.name.startsWith('AUDIT-')) out.push(p);
  }
  return out;
}

let cache = null;
// the dev server rebuilds in one process, so drop the cache before each build
function reset() { cache = null; }
function load() {
  if (cache) return cache;
  const notes = [];
  for (const file of walk(ROOT, [])) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const raw = fs.readFileSync(file, 'utf8');
    const fm = matter(raw);
    const base = path.basename(rel, '.md');
    const folder = path.dirname(rel) === '.' ? '' : path.dirname(rel);
    const isIndex = base === 'index';
    const url = rel === 'index.md' ? '/' : '/' + (folder ? folder + '/' : '') + (isIndex ? '' : slugify(base) + '/');
    notes.push({ rel, file, base, folder, slug: slugify(base), url, data: fm.data, body: fm.content, title: fm.data.title || base });
  }
  const index = new Map();
  const put = (k, n) => { k = String(k).toLowerCase().trim(); if (k && !index.has(k)) index.set(k, n); };
  for (const n of notes) { put(n.base, n); put(n.title, n); put(n.slug, n); put((n.folder ? n.folder + '/' : '') + n.base, n); put((n.folder ? n.folder + '/' : '') + n.slug, n); }
  const resolve = target => {
    let t = String(target).split('#')[0].split('|')[0].trim().replace(/\.md$/, '');
    return index.get(t.toLowerCase()) || index.get(slugify(t)) || null;
  };
  const back = new Map();
  const RE = /(!?)\[\[([^\]]+)\]\]/g;
  const addEdge = (from, text) => {
    let m; RE.lastIndex = 0;
    while ((m = RE.exec(text))) {
      if (m[1]) continue;
      const dest = resolve(m[2]);
      if (dest && dest !== from) { if (!back.has(dest.rel)) back.set(dest.rel, new Map()); back.get(dest.rel).set(from.rel, from); }
    }
  };
  for (const n of notes) { addEdge(n, n.body); addEdge(n, JSON.stringify(n.data)); }
  const missing = [];
  for (const n of notes) { let m; RE.lastIndex = 0; while ((m = RE.exec(n.body))) { if (!m[1] && !resolve(m[2])) missing.push(`${n.rel}: [[${m[2]}]]`); } }
  cache = { notes, index, resolve, backlinks: rel => back.has(rel) ? [...back.get(rel).values()] : [], missing, ROOT, slugify };
  return cache;
}
module.exports = { load, reset, slugify, ROOT };
