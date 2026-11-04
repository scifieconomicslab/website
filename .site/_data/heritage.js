const { buildTree } = require('../plugins/inbox');
module.exports = () => { const r = buildTree(); r.warnings.forEach(w => console.warn('[warn] ' + w)); return r; };
