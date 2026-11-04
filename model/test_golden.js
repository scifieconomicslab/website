// Compares model.js with golden.json produced by reference_model.py --golden
const M = require('../.site/assets/js/model.js');
const gold = require('./golden.json');
const reshare = (k, v) => { const d = Object.assign({}, M.SHARE0); d[k] = v; const tot = Object.values(d).reduce((a, b) => a + b, 0); const o = {}; for (const j in d) o[j] = d[j] / tot; return o; };
const RUNS = {
  default: {}, hard_decade: { events: { 14: 'drought', 31: 'storm', 52: 'cargo', 80: 'bumper' } },
  tax25: { tax: 0.25 }, rent20: { rent: 20 }, transit_heavy: { share: reshare('transit', 0.40) }
};
let worst = 0, n = 0;
for (const [name, opts] of Object.entries(RUNS)) {
  const h = M.run(opts), g = gold[name];
  if (h.length !== g.length) throw new Error('length mismatch ' + name);
  h.forEach((r, i) => {
    for (const f of ['t', 'N', 'E', 'u', 'w', 'B', 'Q', 'svc', 'Hs', 'sales', 'cap', 'profit', 'mood', 'own_over_work']) {
      const a = r[f], b = g[i][f], e = Math.abs(a - b) / Math.max(1, Math.abs(b)); worst = Math.max(worst, e); n++;
      if (e > 1e-9) throw new Error(`${name} t=${i + 1} ${f}: js ${a} py ${b}`);
    }
    for (const k of M.KEYS) { const e = Math.abs(r.G[k] - g[i].G[k]); worst = Math.max(worst, e); if (e > 1e-9) throw new Error(`${name} G.${k} t=${i + 1}`); }
  });
}
console.log('golden ok:', n, 'comparisons, worst relative error', worst.toExponential(2));
// pool mechanics
let p = { infra: 25, edu: 25, just: 15, transit: 15, health: 20 };
for (const [k, v] of [['edu', 60], ['infra', 0], ['health', 100], ['health', 30], ['transit', 5]]) {
  p = M.poolMove(p, k, v); const sum = Object.values(p).reduce((a, b) => a + b, 0);
  if (sum !== 100) throw new Error('pool sum ' + sum + ' ' + JSON.stringify(p));
}
const lk = M.poolMove({ infra: 25, edu: 25, just: 15, transit: 15, health: 20 }, 'edu', 40, new Set(['just']));
if (lk.just !== 15 || Object.values(lk).reduce((a, b) => a + b, 0) !== 100) throw new Error('locked pool ' + JSON.stringify(lk));
console.log('pool ok', JSON.stringify(p), JSON.stringify(lk));
