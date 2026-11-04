const { slugify } = require('../plugins/vault');
module.exports = {
  layout: d => d.layout || (d.page.inputPath.endsWith('.md') ? 'note.njk' : undefined),
  permalink: d => {
    if (d.permalink !== undefined) return d.permalink;
    const p = d.page.inputPath.replace(/^\.\//, '');
    if (!p.endsWith('.md')) return undefined;
    if (p === 'index.md') return '/index.html';
    const parts = p.replace(/\.md$/, '').split('/');
    const base = parts.pop();
    return '/' + parts.join('/') + (parts.length ? '/' : '') + (base === 'index' ? '' : slugify(base) + '/') + 'index.html';
  },
  eleventyExcludeFromCollections: d => false
};
