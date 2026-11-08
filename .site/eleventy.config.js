const path = require('path');
const MarkdownIt = require('markdown-it');
const { load, reset, slugify } = require('./plugins/vault');

// relative URL from one page to another, so the built site also works when opened from a folder (file://)
const relUrl = (from, to) => {
  const depth = (from || '/').split('/').filter(Boolean).length;
  const t = String(to).replace(/^\//, '');
  // directory URLs get index.html so the built site also opens straight from a folder (file://)
  return (depth ? '../'.repeat(depth) : './') + (/\/$/.test(String(to)) ? t + 'index.html' : t);
};

module.exports = function (eleventyConfig) {
  const md = MarkdownIt({ html: true, linkify: true, typographer: false }).use(require('markdown-it-footnote'));
  md.use(require('./plugins/wikilinks'), { relUrl });
  const defaultRender = md.render.bind(md);
  eleventyConfig.setLibrary('md', { render: (src, env) => defaultRender(src, Object.assign({ pageUrl: (env && env.page && env.page.url) || '/' }, env || {})) });
  eleventyConfig.addFilter('root', url => relUrl(url, ''));
  eleventyConfig.addFilter('rel', (to, from) => relUrl(from, to));
  eleventyConfig.addFilter('slug', slugify);
  eleventyConfig.addFilter('json', v => JSON.stringify(v).replace(/</g, '\\u003c'));
  eleventyConfig.addFilter('backlinks', page => load().backlinks(page.inputPath.replace(/^\.\//, '')));
  eleventyConfig.addFilter('noteBody', (rel, pageUrl) => { const n = load().notes.find(n => n.rel === rel); return n ? md.render(n.body, { pageUrl }) : ''; });
  eleventyConfig.addFilter('workImage', rel => { const f = require('path').join(__dirname, 'assets', 'work', require('path').basename(rel, '.md') + '.svg'); try { return require('fs').readFileSync(f, 'utf8'); } catch (e) { return ''; } });
  eleventyConfig.addFilter('funderLogo', id => { const fs = require('fs'), path = require('path'), d = path.join(__dirname, 'assets', 'funders'); try { return fs.readdirSync(d).find(f => f.replace(/\.[^.]+$/, '') === id && /\.(png|jpe?g|svg|webp)$/i.test(f)) || ''; } catch (e) { return ''; } });
  eleventyConfig.addFilter('year', s => String(s || '').slice(0, 4));
  eleventyConfig.addFilter('abs', (to, from) => relUrl(from, to));

  eleventyConfig.addPassthroughCopy({ '.site/assets/js': 'assets/js', '.site/assets/figures': 'assets/figures', '.site/assets/fonts': 'assets/fonts', '.site/assets/funders': 'assets/funders', '.site/assets/img': 'assets/img', '.site/assets/people': 'assets/people', '.site/assets/css/site.css': 'assets/css/site.css' });
  ['node_modules/**', '_site/**', 'model/**', 'docs/**', 'brief/**', 'templates/**', 'ticker/**', 'PLAN.md', 'README.md', 'AUDIT-*.md', '.site/layouts/**', '.site/tools/**', '.site/_data/**', '.site/plugins/**'].forEach(g => eleventyConfig.ignores.add(g));
  eleventyConfig.setServerOptions({ watch: ['.site/assets/**', '.site/_data/**', '.site/plugins/**'] });
  eleventyConfig.on('eleventy.before', () => { reset(); const v = load(); if (v.missing.length) console.warn('[warn] unresolved wikilinks:\n  ' + v.missing.join('\n  ')); });

  return {
    dir: { input: '.', output: '_site', includes: '.site/layouts', data: '.site/_data' },
    markdownTemplateEngine: 'njk', htmlTemplateEngine: 'njk', templateFormats: ['md', 'njk']
  };
};
