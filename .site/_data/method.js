const { load } = require('../plugins/vault');
module.exports = () => load().notes.filter(n => n.folder === 'method' && n.data.step)
  .map(n => ({ step: n.data.step, label: n.data.state_label || n.title, next: [].concat(n.data.next || []), edge: [].concat(n.data.edge_label || []), icon: n.data.icon || '',
    tone: n.data.tone || '', summary: n.data.summary || '', url: n.url, title: n.title }))
  .sort((a, b) => a.step - b.step);
