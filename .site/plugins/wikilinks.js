// markdown-it plugin: [[note]], [[note|label]], [[note#heading]], ![[image.png]], and > [!callout] blocks.
const { load } = require('./vault');

module.exports = function wikilinks(md, opts) {
  const relUrl = opts.relUrl;
  md.inline.ruler.before('link', 'wikilink', (state, silent) => {
    const src = state.src, pos = state.pos;
    const embed = src.charCodeAt(pos) === 0x21;
    const start = embed ? pos + 1 : pos;
    if (src.slice(start, start + 2) !== '[[') return false;
    const end = src.indexOf(']]', start + 2);
    if (end < 0) return false;
    if (!silent) {
      const inner = src.slice(start + 2, end);
      const [targetPart, label] = inner.split('|');
      const [target, heading] = targetPart.split('#');
      if (embed) {
        const t = state.push('image', 'img', 0);
        t.attrs = [['src', 'assets/' + target.trim()], ['alt', label || target.trim()]];
        t.children = []; t.content = label || target.trim();
      } else {
        const v = load(); const dest = v.resolve(target.trim());
        const t = state.push('wikilink', '', 0);
        t.meta = { dest, label: (label || (dest ? dest.title : target.trim())).trim(), heading, raw: target.trim() };
      }
    }
    state.pos = end + 2;
    return true;
  });
  md.renderer.rules.wikilink = (tokens, idx, o, env) => {
    const { dest, label, heading, raw } = tokens[idx].meta;
    const esc = md.utils.escapeHtml;
    if (!dest) return `<span class="wikilink missing" data-missing="${esc(raw)}" title="No note called ${esc(raw)} yet">${esc(label)}</span>`;
    const href = relUrl((env && env.pageUrl) || '/', dest.url) + (heading ? '#' + require('./vault').slugify(heading) : '');
    return `<a class="wikilink" href="${href}">${esc(label)}</a>`;
  };
  // callouts: > [!note] Title
  md.core.ruler.after('block', 'callouts', state => {
    const t = state.tokens;
    for (let i = 0; i < t.length; i++) {
      if (t[i].type !== 'blockquote_open') continue;
      const inl = t[i + 2];
      if (!inl || inl.type !== 'inline') continue;
      const m = /^\[!(\w+)\][+-]?\s*(.*)/.exec(inl.content.split('\n')[0]);
      if (!m) continue;
      t[i].attrJoin('class', 'callout callout-' + m[1].toLowerCase());
      inl.content = inl.content.split('\n').slice(1).join('\n');
      inl.children = []; md.inline.parse(inl.content, md, state.env, inl.children);
      const title = new state.Token('html_block', '', 0);
      title.content = `<p class="callout-title">${md.utils.escapeHtml(m[2] || m[1])}</p>\n`;
      t.splice(i + 1, 0, title);
    }
  });
};
