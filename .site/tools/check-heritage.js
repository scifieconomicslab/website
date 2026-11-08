// Run with `npm test`. Fails when heritage notes disagree with each other.
const { build } = require('../plugins/heritage');
const { errors, branches, clusters, thinkers } = build();
if (errors.length) { console.error('heritage: ' + errors.length + ' problem(s)\n  ' + errors.join('\n  ')); process.exit(1); }
console.log(`heritage ok: ${branches.length} branches, ${clusters.length} sub-branches, ${thinkers.length} thinkers`);
