/* Linden Cove economic model. Line for line port of model/reference_model.py.
   One tick is one month. Money is in coins. All numbers are invented. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TownModel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const KEYS = ['infra', 'edu', 'just', 'transit', 'health'];
  const SHARE0 = { infra: 0.25, edu: 0.25, just: 0.15, transit: 0.15, health: 0.20 };
  const DELTA = { infra: 0.02, edu: 0.01, just: 0.05, transit: 0.06, health: 0.04 };
  const EPS = { infra: 0.24, edu: 0.40, health: 0.16 };
  const N0 = 1000, OWN = 0.25, E0 = 700, W0 = 100, LS = 0.90;
  const Y0 = W0 / LS;
  const MPCW = 0.90, MPCO = 0.50, GLOC = 0.80, DIVSH = 0.5;
  const OVH = 500, F0 = 8;
  const T0 = 0.20, R0 = 30, HS0 = 1050;
  const MIG = 0.004, AQ = 0.35, AS = 0.50, AC = 1.0, AU = 0.4;
  const XP = 1.0, FIRE = 0.06, WFLOOR = 0.0, STAB = 1.0, STABU = 0.10, TDRAG = 1.0, CROWDW = 60.0;

  const NW0 = N0 * (1 - OWN), CAP0 = E0 * Y0, WB0 = E0 * W0, RENT0 = R0 * NW0;
  const PROFIT0 = CAP0 - WB0 - F0 * OVH, DIV0 = DIVSH * PROFIT0, INCO0 = RENT0 + DIV0;
  const B0 = T0 * (WB0 + INCO0);
  const CW0 = MPCW * (WB0 * (1 - T0) - RENT0), CO0 = MPCO * INCO0 * (1 - T0);
  const X0 = CAP0 - CW0 - CO0 - GLOC * B0;
  const INC_PC0 = (WB0 * (1 - T0) - RENT0) / NW0, BPC0 = B0 / N0, USTAR = 1 - E0 / NW0;
  const LOCAL0 = CW0 + CO0 + GLOC * B0;

  function createTown() {
    const G = {}; KEYS.forEach(k => G[k] = 1.0);
    return { N: N0, E: E0, w: W0, Hs: HS0, W: 1.0, xs: 1.0, G, div: DIV0, D: CAP0, t: 0, Asm: 0.0, nfirms: F0 };
  }

  function applyEvent(s, ev) {
    if (ev === 'drought') s.W = 0.7;
    else if (ev === 'bumper') s.W = 1.15;
    else if (ev === 'storm') s.G.infra *= 0.85;
    else if (ev === 'cargo') s.xs = 0.8;
  }

  function step(s, rent, tax, share) {
    const N = s.N, G = s.G;
    const nown = OWN * N, nw = N - nown;
    const svcProd = Math.pow(G.infra, EPS.infra) * Math.pow(G.edu, EPS.edu) * Math.pow(G.health, EPS.health);
    const prod = Y0 * Math.pow(s.W, 0.4) * svcProd * (1 - TDRAG * Math.max(0, tax - 0.25));
    const ovh = OVH / Math.pow(G.just, 0.15);
    let E = s.E;
    const Etarget = s.D / (Y0 * svcProd);
    const U = Math.max(0, nw - E);
    const mu = 0.5 * Math.pow(G.transit, 0.3);
    let dE = (Etarget > E ? 0.25 : FIRE) * (Etarget - E);
    if (dE > 0) dE = Math.min(dE, mu * U);
    E = Math.max(0, E + dE);
    const cap = E * prod;
    const u = clamp((nw - E) / nw, 0, 1);
    s.w += 0.10 * (Math.max(WFLOOR * W0 * Math.pow(G.edu, 0.5), LS * prod * (1 + 1.0 * (USTAR - u))) - s.w);
    const wb = E * s.w;
    const renters = Math.max(0, Math.min(nw, s.Hs - nown));
    const rentTotal = rent * renters;
    const incO = rentTotal + s.div;
    const taxTotal = tax * (wb + incO);
    const cw = Math.max(0, MPCW * (wb * (1 - tax) - rentTotal));
    const co = MPCO * incO * (1 - tax);
    const X = X0 * s.xs * Math.pow(s.W, 0.5) * Math.pow(G.transit, 0.1) * Math.pow(svcProd, XP);
    const stab = STAB * Math.max(0, u - STABU) * taxTotal;
    const D = cw + co + GLOC * taxTotal + stab + X;
    s.D += 0.5 * (D - s.D);
    const sales = Math.min(D, cap);
    const profit = sales - wb - s.nfirms * ovh;
    s.div = DIVSH * Math.max(0, profit);
    const B = taxTotal;
    for (const k of KEYS) {
      const x = (B / N * share[k]) / (BPC0 * SHARE0[k]);
      G[k] += DELTA[k] * (x - G[k]);
    }
    if (rent > R0) s.Hs *= 1 + 0.003 * Math.min(2.0, (rent - R0) / R0 * 3);
    else s.Hs *= 1 - 0.001 * Math.min(2.0, (R0 - rent) / R0 * 3);
    s.Hs = Math.max(s.Hs, 0.7 * N);
    const incPc = (wb * (1 - tax) - rentTotal) / Math.max(1, nw);
    const Q = incPc / INC_PC0;
    let svc = 0; for (const k of KEYS) svc += G[k] * SHARE0[k];
    const crowd = Math.max(0, (N - s.Hs) / N);
    const A = AQ * (Q - 1) + AS * (svc - 1) - AC * crowd - AU * (u - USTAR);
    s.Asm += 0.15 * (A - s.Asm);
    s.N = Math.max(200, N * (1 + MIG * Math.tanh(3 * s.Asm)));
    s.W = 1 + 0.92 * (s.W - 1); s.xs = 1 + 0.95 * (s.xs - 1);
    s.E = E; s.t += 1;
    const mood = 50 * (0.4 * clamp(Q, 0, 2) + 0.3 * clamp(1 - (u - USTAR) * 4, 0, 1.3) + 0.3 * clamp(svc, 0, 2)) - CROWDW * crowd;
    return {
      t: s.t, N, E, u, w: s.w, B, Q, svc, Hs: s.Hs, sales, cap, profit, mood,
      G: Object.assign({}, G), own_over_work: (incO / Math.max(1, nown)) / (wb / Math.max(1, nw)),
      // extras for the interface (not part of the golden comparison)
      x: { nw, nown, renters, rentTotal, incO, wb, cw, co, cg: GLOC * taxTotal, stab, X, D, W: s.W, xs: s.xs,
           burden: rent / (s.w * (1 - tax)), crowd, vacancy: Math.max(0, (s.Hs - N) / s.Hs), occupied: Math.min(N, s.Hs) / s.Hs,
           local: cw + co + GLOC * taxTotal, jobs: E / nw, tax, rent }
    };
  }

  /* Pool mechanics: move share `key` to `value` (whole points, 0 to 100); others rescale so the total is exactly 100.
     `shares` holds whole points. `locked` is an optional set of keys that keep their value. */
  function poolMove(shares, key, value, locked) {
    locked = locked || new Set();
    const out = Object.assign({}, shares);
    const free = KEYS.filter(k => k !== key && !locked.has(k));
    const lockedSum = KEYS.filter(k => k !== key && locked.has(k)).reduce((a, k) => a + out[k], 0);
    value = clamp(Math.round(value), 0, 100 - lockedSum);
    out[key] = value;
    const target = 100 - value - lockedSum;
    const freeSum = free.reduce((a, k) => a + shares[k], 0);
    if (free.length === 0) { out[key] = 100 - lockedSum; return out; }
    const raw = free.map(k => freeSum > 0 ? shares[k] * target / freeSum : target / free.length);
    const fl = raw.map(Math.floor);
    let rest = target - fl.reduce((a, b) => a + b, 0);
    const order = raw.map((r, i) => [r - fl[i], i]).sort((a, b) => b[0] - a[0]);
    for (let j = 0; j < rest; j++) fl[order[j % order.length][1]] += 1;
    free.forEach((k, i) => out[k] = fl[i]);
    return out;
  }
  const toFractions = pts => { const o = {}; KEYS.forEach(k => o[k] = pts[k] / 100); return o; };

  // seeded generator, matches the plan (mulberry32)
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function run(opts) {
    opts = opts || {};
    const rent = opts.rent == null ? R0 : opts.rent, tax = opts.tax == null ? T0 : opts.tax;
    const share = opts.share || SHARE0, months = opts.months || 120, events = opts.events || {};
    const s = createTown(), hist = [];
    for (let t = 0; t < months; t++) { if (events[t]) applyEvent(s, events[t]); hist.push(step(s, rent, tax, share)); }
    return hist;
  }

  return { KEYS, SHARE0, DELTA, EPS, N0, E0, W0, B0, X0, BPC0, INC_PC0, USTAR, LOCAL0, R0, T0, HS0, F0,
           createTown, applyEvent, step, run, poolMove, toFractions, mulberry32, clamp };
});
