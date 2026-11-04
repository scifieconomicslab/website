// Builds the heritage tree from heritage/*.md plus one-line entries in _inbox/heritage-inbox.md.
// Inbox line: Name | kind | year | parent | branch | why | url      (prefix ! = confirmed, # = ignore)
const fs = require('fs');
const path = require('path');
const { load, slugify, ROOT } = require('./vault');

const KINDS = new Set(['person', 'work', 'idea', 'game', 'software', 'root', 'other']);

function parseInbox() {
  const f = path.join(ROOT, '_inbox', 'heritage-inbox.md');
  if (!fs.existsSync(f)) return [];
  const out = [];
  let inFence = false;
  for (let line of fs.readFileSync(f, 'utf8').split('\n')) {
    if (line.trim().startsWith('```')) { inFence = !inFence; continue; }
    if (inFence || !line.includes('|') || line.includes('`')) continue;
    line = line.trim();
    if (line.startsWith('#') || line.startsWith('>') || line.startsWith('-') && !line.includes('|')) continue;
    let confirmed = false;
    if (line.startsWith('!')) { confirmed = true; line = line.slice(1).trim(); }
    const [title, kind, year, parent, branch, why, url] = line.split('|').map(s => (s || '').trim());
    if (!title || title.toLowerCase() === 'name') continue;
    out.push({ title, kind: KINDS.has((kind || '').toLowerCase()) ? kind.toLowerCase() : 'idea', year: year || '', parent: parent || '', branch: branch || '',
               why: why || '', url: url || '', status: confirmed ? 'confirmed' : 'candidate', source: 'inbox' });
  }
  return out;
}

const stripLink = s => String(s || '').replace(/^\[\[|\]\]$/g, '').split('|')[0].trim();

function buildTree() {
  const v = load();
  const warnings = [];
  const nodes = new Map();
  for (const n of v.notes.filter(n => n.folder === 'heritage' && n.base !== 'index' && n.data.type === 'heritage')) {
    const d = n.data;
    nodes.set(String(n.title).toLowerCase(), { id: n.slug, title: n.title, kind: d.kind || 'idea', year: d.year || '', parent: stripLink(d.parent), branch: d.branch || '',
      status: d.status || 'candidate', why: d.why || d.summary || '', url: d.url || '', also: (d.also || []).map(stripLink), stage: d.stage || 'seedling', note: n.url, source: 'file' });
  }
  for (const i of parseInbox()) {
    const key = i.title.toLowerCase();
    if (nodes.has(key)) continue; // the file wins
    nodes.set(key, { id: slugify(i.title), title: i.title, kind: i.kind, year: i.year, parent: i.parent, branch: i.branch, status: i.status, why: i.why, url: i.url, also: [], stage: 'seedling', note: null, source: 'inbox' });
  }
  const root = [...nodes.values()].find(n => n.kind === 'root') || null;
  const byTitle = t => nodes.get(String(t).toLowerCase());
  for (const n of nodes.values()) {
    n.children = [];
  }
  const unplaced = { id: 'unplaced', title: 'Unplaced', kind: 'other', year: '', parent: '', branch: 'other', status: 'candidate', why: 'Nodes whose parent is missing or unknown.', url: '', also: [], stage: 'seedling', note: null, children: [], source: 'virtual' };
  for (const n of nodes.values()) {
    if (n === root) continue;
    let p = n.parent ? byTitle(n.parent) : null;
    if (!p || p === n) { if (n.parent) warnings.push(`heritage: "${n.title}" has unknown parent "${n.parent}"`); else warnings.push(`heritage: "${n.title}" has no parent`); p = unplaced; }
    p.children.push(n);
  }
  if (unplaced.children.length && root) root.children.push(unplaced);
  // inherit branch down the tree
  const seen = new Set();
  const walk = (n, trail, branch) => {
    if (seen.has(n)) throw new Error('heritage: cycle through ' + trail.concat(n.title).join(' > '));
    seen.add(n);
    n.branch = n.branch || branch || 'other';
    for (const c of n.children) walk(c, trail.concat(n.title), n.branch === 'none' ? '' : n.branch);
    seen.delete(n);
  };
  if (root) walk(root, [], '');
  const countDesc = n => (n.descendants = n.children.reduce((a, c) => a + 1 + countDesc(c), 0));
  if (root) countDesc(root);
  const links = [];
  for (const n of nodes.values()) for (const a of n.also) { const o = byTitle(a); if (o) links.push({ from: n.id, to: o.id }); else warnings.push(`heritage: "${n.title}" lists unknown also "${a}"`); }
  const strip = n => ({ id: n.id, title: n.title, kind: n.kind, year: n.year, branch: n.branch, status: n.status, why: n.why, url: n.url, stage: n.stage, note: n.note, source: n.source, descendants: n.descendants || 0, children: n.children.map(strip) });
  return { tree: root ? strip(root) : null, links, warnings, count: nodes.size };
}
module.exports = { buildTree, parseInbox };
