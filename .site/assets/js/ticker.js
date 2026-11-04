/* The ticker: reports what the model computed, in the town's voice. Rules and text come from ticker/*.md via site data. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TownTicker = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const NAMES = { infra: 'infra', edu: 'edu', just: 'just', transit: 'transit', health: 'health' };
  const SPEAKER = { infra: 'Tomas Reyes', edu: 'Aya Tanaka', just: 'Old Bram', transit: 'Tomas Reyes', health: 'Dr Ines Moreau' };

  function create(data, rng) {
    const last = {};        // cooldown key -> tick
    const lastTpl = {};
    const fstate = {};      // per firm counters
    data.firms.forEach(f => fstate[f.name] = { low: 0, hi: 0, ok: 0, closed: false });
    const fmt = (tpl, slots) => tpl.replace(/\{(\w+)\}/g, (m, k) => slots[k] != null ? slots[k] : m);
    const pick = arr => arr[Math.floor(rng() * arr.length)];

    function make(id, slots, t, key) {
      const rule = data.rules[id] || { channel: 'news', cooldown: 12, priority: 3 };
      const tpls = data.templates[id]; if (!tpls || !tpls.length) return null;
      const k = key || id;
      if (last[k] != null && t - last[k] < rule.cooldown) return null;
      let tp = pick(tpls); if (tpls.length > 1 && tp === lastTpl[id]) tp = tpls[(tpls.indexOf(tp) + 1) % tpls.length]; lastTpl[id] = tp;
      let text = fmt(tp, slots || {});
      if (/\{\w+\}/.test(text)) return null;       // a missing slot drops the item
      let speaker = '';
      if (rule.channel === 'voice') { const i = text.indexOf(': '); if (i > 0 && i < 24) { speaker = text.slice(0, i); text = text.slice(i + 2); } }
      last[k] = t;
      return { id, channel: rule.channel, priority: rule.priority, text, speaker, t };
    }

    function tick(ctx) {
      const { t, rec, hist, ev, M } = ctx;
      const x = rec.x, G = rec.G, out = [];
      const add = it => { if (it) out.push(it); };
      const ago = n => hist[Math.max(0, hist.length - 1 - n)];
      const pct = v => Math.round(v * 100);

      if (ev) add(make('ev_' + ev, { pct: Math.round(M.clamp((x.W - 0.6) / 0.6, 0.03, 1) * 100) }, t));

      const u6 = ago(6).u;
      if (rec.u > 0.12 && rec.u - u6 > 0.02) {
        let n = 0; for (let i = hist.length - 2; i >= 0 && hist[i].u < rec.u; i--) n++;
        add(make('u_high', { u: (rec.u * 100).toFixed(1), n: Math.max(2, n) }, t));
      }
      if (rec.u < 0.03) add(make('u_low', {}, t));
      if (x.burden > 0.45) add(make('rent_squeeze', { pct: pct(x.burden) }, t));
      if (x.burden < 0.30) add(make('rent_easy', { pct: pct(x.burden) }, t));
      if (rec.own_over_work > 1.4) add(make('landlord_happy', {}, t));
      if (rec.own_over_work < 0.7) add(make('landlord_sour', {}, t));
      if (x.tax > 0.30) add(make('tax_bite', { tax: pct(x.tax) }, t));
      if (x.tax < 0.12 && rec.svc < 0.8) add(make('tax_low_services', {}, t));
      for (const k of M.KEYS) {
        if (G[k] < 0.7) add(make('svc_low_' + k, {}, t, 'svc_low_' + k));
        if (G[k] > 1.3) add(make('svc_high_' + k, {}, t, 'svc_high_' + k));
      }
      const B6 = ago(6).B, dB = (rec.B - B6) / B6;
      if (hist.length > 6 && Math.abs(dB) > 0.15) add(make(dB > 0 ? 'budget_swing_up' : 'budget_swing_down', { delta: Math.round(Math.abs(dB) * 100) }, t, 'budget_swing'));
      const N12 = ago(12).N, dN = (rec.N - N12) / N12;
      if (hist.length > 12 && dN > 0.03) add(make('pop_growth', { n: Math.round(rec.N - N12) }, t));
      if (hist.length > 12 && dN < -0.03) add(make('pop_loss', { n: Math.round(N12 - rec.N) }, t));
      if (x.crowd > 0.0) add(make('crowding', { n: Math.round(rec.N - rec.Hs) }, t));
      if (x.vacancy > 0.25) add(make('empty_flats', { n: Math.round(rec.Hs - rec.N) }, t));
      if (rec.mood > 65) add(make('mood_high', {}, t));
      if (rec.mood < 30) add(make('mood_low', {}, t));

      // firms
      const local = x.local / M.LOCAL0;
      for (const f of data.firms) {
        const st = fstate[f.name];
        const sv = f.key && f.key !== 'none' ? G[f.key] : 1;
        const h = f.wx * (x.X / M.X0) + f.wl * local + f.ww * x.W + f.ws * sv;
        st.h = h;
        if (!st.closed) {
          st.low = h < 0.75 ? st.low + 1 : 0;
          st.hi = h > 1.10 ? st.hi + 1 : 0;
          if (st.low >= 6) { st.closed = true; st.ok = 0; add(make('firm_close', { firm: f.name }, t, 'fc:' + f.name)); }
          else if (h < 0.85) { const reason = h < 0.85 && f.wx > 0.4 && x.X / M.X0 < 0.9 ? 'export orders dry up' : f.ww > 0.3 && x.W < 0.9 ? 'the dry spell bites' : local < 0.92 ? 'customers stay home' : 'the roads slow deliveries'; add(make('firm_cut', { firm: f.name, reason }, t, 'fcut:' + f.name)); }
          else if (st.hi >= 3) add(make('firm_boom', { firm: f.name, n: 2 + Math.floor(rng() * 4) }, t, 'fb:' + f.name));
        } else {
          st.ok = h > 0.95 ? st.ok + 1 : 0;
          if (st.ok >= 6) { st.closed = false; st.low = 0; add(make('firm_reopen', { firm: f.name }, t, 'fr:' + f.name)); }
        }
      }
      // filler when nothing is queued for a while
      if (!out.length) { ctx.quiet = (ctx.quiet || 0); }
      out.sort((a, b) => b.priority - a.priority);
      return out.slice(0, 2);
    }
    function filler(t) { return make('filler', {}, t); }
    return { tick, filler, firmStates: () => fstate };
  }
  return { create };
});
