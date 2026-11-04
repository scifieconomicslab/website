/* Town deck: controls, pool, clock, readouts, charts, ticker, and the link to the town figure. */
(function () {
  'use strict';
  var M = window.TownModel, T = window.TownTicker;
  var DATA = JSON.parse(document.getElementById('site-data').textContent);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt0 = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SVC = [
    { k: 'infra', name: 'Infrastructure', c: 'c1', dash: '' },
    { k: 'edu', name: 'Education', c: 'c2', dash: '' },
    { k: 'just', name: 'Justice', c: 'c3', dash: '6 3' },
    { k: 'transit', name: 'Public transport', c: 'c4', dash: '2 3' },
    { k: 'health', name: 'Health and care', c: 'c5', dash: '9 3 2 3' }
  ];
  var EV_LETTER = { drought: 'D', storm: 'S', bumper: 'H', cargo: 'C' };
  var HARD = { 14: 'drought', 31: 'storm', 52: 'cargo', 80: 'bumper' };
  var PROB = [['drought', 0.006], ['storm', 0.008], ['bumper', 0.006], ['cargo', 0.005]];
  var TERM = 120;

  var params = new URLSearchParams(location.search);
  var S = {
    controls: { rent: M.R0, tax: M.T0 * 100, pts: { infra: 25, edu: 25, just: 15, transit: 15, health: 20 }, locked: {} },
    town: null, hist: [], events: [], pending: [], running: !reduceMotion, speed: 1, timer: null,
    seed: parseInt(params.get('seed') || '2026', 10) || 2026, scenario: params.get('scenario') || 'random',
    lastEv: -99, queue: [], shown: [], quiet: 0, tickerTimer: null, ticker: null, rng: null, tickRng: null, figReady: false, ended: false, change: null
  };

  /* ---------- setup ---------- */
  function reset() {
    S.change = null; S.town = M.createTown(); S.hist = []; S.events = []; S.pending = []; S.queue = []; S.shown = []; S.ended = false; S.lastEv = -99; S.quiet = 0;
    S.rng = M.mulberry32(S.seed); S.tickRng = M.mulberry32(S.seed + 7919);
    S.ticker = T.create(DATA.ticker, S.tickRng);
    $('#summary').classList.remove('show');
    $('#tickNow').textContent = 'Opening the paper'; $('#tickHist').innerHTML = '';
    render();
    figLast = ""; sendFigure();
  }

  /* ---------- controls ---------- */
  function buildPool() {
    var host = $('#pool'); host.innerHTML = '';
    SVC.forEach(function (s) {
      var row = document.createElement('div'); row.className = 'pool-row';
      row.innerHTML = '<label for="p_' + s.k + '"><i style="background:var(--' + s.c + ')"></i>' + s.name + ' <b id="pv_' + s.k + '" style="font:600 13px var(--mono)"></b></label><span class="amt" id="pa_' + s.k + '"></span>' +
        '<input type="range" id="p_' + s.k + '" min="0" max="100" step="1" style="--fillc:var(--' + s.c + ')" aria-describedby="poolHint">' +
        '<button type="button" class="lock" id="pl_' + s.k + '" aria-pressed="false" aria-label="Lock ' + s.name + '" title="Lock this share">&#128274;</button>';
      host.appendChild(row);
      $('#p_' + s.k).addEventListener('input', function (e) { movePool(s.k, +e.target.value); });
      $('#pl_' + s.k).addEventListener('click', function () { toggleLock(s.k); });
    });
    var st = $('#stack'); st.innerHTML = SVC.map(function (s) { return '<span id="st_' + s.k + '" style="background:var(--' + s.c + ')"></span>'; }).join('');
    paintPool();
  }
  function lockedSet() { var s = new Set(); SVC.forEach(function (x) { if (S.controls.locked[x.k]) s.add(x.k); }); return s; }
  function movePool(k, v) {
    var before = S.controls.pts;
    S.controls.pts = M.poolMove(before, k, v, lockedSet());
    noteChange('pool:' + k, 'moved ' + SVC.filter(function (x) { return x.k === k; })[0].name.toLowerCase(), before[k], S.controls.pts[k], '%', k);
    if (S.controls.pts[k] !== Math.round(v)) { var el = $('#p_' + k); el.animate && el.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 160 }); }
    paintPool();
  }
  function toggleLock(k) {
    var n = SVC.filter(function (x) { return S.controls.locked[x.k]; }).length;
    if (!S.controls.locked[k] && n >= SVC.length - 1) return;   // always leave one free share
    S.controls.locked[k] = !S.controls.locked[k]; paintPool();
  }
  function paintPool() {
    var B = S.hist.length ? S.hist[S.hist.length - 1].B : M.B0;
    SVC.forEach(function (s) {
      var v = S.controls.pts[s.k], el = $('#p_' + s.k);
      el.value = v; el.style.setProperty('--p', v + '%'); el.disabled = false;
      el.setAttribute('aria-valuetext', s.name + ', ' + v + ' percent of the budget, about ' + fmt0(B * v / 100) + ' coins a month');
      $('#pv_' + s.k).textContent = v + '%';
      $('#pa_' + s.k).innerHTML = '<b>' + fmt0(B * v / 100) + '</b> coins';
      $('#st_' + s.k).style.width = v + '%';
      var lk = $('#pl_' + s.k), on = !!S.controls.locked[s.k]; lk.setAttribute('aria-pressed', on);
      el.disabled = on;
    });
  }
  function bindSliders() {
    var rent = $('#rent'), tax = $('#tax');
    function paint() {
      rent.style.setProperty('--p', ((rent.value - rent.min) / (rent.max - rent.min) * 100) + '%');
      tax.style.setProperty('--p', ((tax.value - tax.min) / (tax.max - tax.min) * 100) + '%');
      var w = S.hist.length ? S.hist[S.hist.length - 1].w : M.W0;
      $('#vRent').textContent = rent.value + ' coins';
      $('#rentSub').textContent = 'a month, about ' + Math.round(rent.value / w * 100) + '% of the average wage';
      $('#vTax').textContent = tax.value + '%';
      rent.setAttribute('aria-valuetext', 'Rent ' + rent.value + ' coins a month, ' + Math.round(rent.value / w * 100) + ' percent of the average wage');
      tax.setAttribute('aria-valuetext', 'Income tax ' + tax.value + ' percent');
    }
    rent.addEventListener('input', function () { S.controls.rent = +rent.value; paint(); });
    tax.addEventListener('input', function () { S.controls.tax = +tax.value; paint(); });
    S.paintSliders = paint; paint();
  }

  /* ---------- simulation loop ---------- */
  function drawEvent(t) {
    if (S.pending.length) return S.pending.shift();
    if (S.scenario === 'calm') return null;
    if (S.scenario === 'hard') return HARD[t % TERM] && (t < TERM || true) ? HARD[t % TERM] : null;
    var r = S.rng();            // always consume one draw so a seed gives one fixed deck
    if (t < 12 || t - S.lastEv < 6) return null;   // a quiet first year
    var acc = 0; for (var i = 0; i < PROB.length; i++) { acc += PROB[i][1]; if (r < acc) return PROB[i][0]; }
    return null;
  }
  function tick() {
    var t = S.town.t;
    var ev = drawEvent(t);
    if (ev) { M.applyEvent(S.town, ev); S.lastEv = t; S.events.push({ t: t + 1, ev: ev }); }
    var rec = M.step(S.town, S.controls.rent, S.controls.tax / 100, M.toFractions(S.controls.pts));
    S.hist.push(rec);
    var items = S.ticker.tick({ t: rec.t, rec: rec, hist: S.hist, ev: ev, M: M });
    if (!items.length) { S.quiet++; if (S.quiet >= 4) { var f = S.ticker.filler(rec.t); if (f) { items = [f]; } } } else S.quiet = 0;
    items.forEach(function (it) { S.queue.push(it); S.quiet = 0; });
    render(); sendFigure(ev);
    if (rec.t % TERM === 0) endTerm();
  }
  function schedule() {
    clearInterval(S.timer); clearInterval(S.tickerTimer);
    if (!S.running) return;
    S.timer = setInterval(tick, 600 / S.speed);
    S.tickerTimer = setInterval(showNext, 5000 / S.speed);
  }
  function endTerm() {
    S.running = false; schedule(); paintPlay();
    var r = S.hist[S.hist.length - 1], first = S.hist[0], el = $('#summary');
    var evs = S.events.map(function (e) { return e.ev.replace('cargo', 'a ship leaving').replace('bumper', 'a bumper harvest') + ' in year ' + Math.ceil(e.t / 12); });
    el.innerHTML = '<h3>Ten years in ' + DATA.town + '</h3><div class="stats">' +
      [['Mood', Math.round(r.mood) + ' / 100'], ['People', fmt0(r.N) + ' (from 1,000)'], ['Jobs', (r.x.jobs * 100).toFixed(1) + '% of workers'], ['Average wage', r.w.toFixed(1)],
       ['Rent share', Math.round(r.x.burden * 100) + '% of take-home'], ['Budget a month', fmt0(r.B)]].map(function (a) { return '<div><dt>' + a[0] + '</dt><dd>' + a[1] + '</dd></div>'; }).join('') +
      '</div><p style="margin-top:14px">' + (evs.length ? 'The town lived through ' + evs.join(', ') + '. ' : 'The weather and the market stayed quiet. ') +
      'Services ended at ' + SVC.map(function (s) { return s.name.toLowerCase() + ' ' + r.G[s.k].toFixed(2); }).join(', ') + '.</p>' +
      '<div class="btns"><button class="btn" id="again">Run another ten years</button><button class="btn alt" id="again2">Start again</button></div>';
    el.classList.add('show');
    $('#again').onclick = function () { el.classList.remove('show'); S.running = true; schedule(); paintPlay(); };
    $('#again2').onclick = function () { reset(); S.running = true; schedule(); paintPlay(); };
  }

  /* ---------- ticker display ---------- */
  var CH = { news: 'News', biz: 'Business', voice: 'Voice', sky: 'Sky' };
  function showNext() {
    if (!S.queue.length) return;
    S.queue.sort(function (a, b) { return b.priority - a.priority || a.t - b.t; });
    var it = S.queue.shift();
    if (S.queue.length > 6) S.queue.length = 6;
    var ch = (it.id.indexOf('ev_') === 0 && it.id !== 'ev_cargo') ? 'sky' : it.channel;
    var html = '<span class="tag ' + ch + '">' + CH[ch] + '</span>' + (it.speaker ? '<b>' + it.speaker + ':</b> ' : '') + esc(it.speaker ? '“' + it.text + '”' : it.text);
    var now = $('#tickNow');
    if (now.dataset.last) S.shown.unshift(now.dataset.last);
    now.innerHTML = html; now.dataset.last = (it.speaker ? it.speaker + ': ' : '') + it.text;
    now.style.animation = 'none'; void now.offsetWidth; now.style.animation = '';
    S.shown = S.shown.slice(0, 5);
    $('#tickHist').innerHTML = S.shown.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
    if (it.priority >= 8) now.setAttribute('aria-live', 'polite'); else now.setAttribute('aria-live', 'off');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- readouts ---------- */
  var MOODW = [[25, 'Grim'], [40, 'Strained'], [60, 'Getting by'], [75, 'Content'], [101, 'Thriving']];
  function arrow(cur, prev, goodUp, digits) {
    if (prev == null) return '';
    var d = cur - prev, th = Math.pow(10, -(digits || 0)) * 0.5; if (Math.abs(d) < th) return '';
    var up = d > 0, good = up === goodUp;
    return '<small class="arr ' + (up ? 'up' : 'down') + '" style="color:var(--' + (good ? 'green' : 'rust') + ')" aria-label="' + (up ? 'up' : 'down') + ' on six months ago">' + (up ? '▲' : '▼') + '</small>';
  }
  function render() {
    var h = S.hist, r = h.length ? h[h.length - 1] : null, p = h.length > 6 ? h[h.length - 7] : (h.length ? h[0] : null);
    var t = S.town.t, yr = Math.floor(t / 12) + 1, mo = t % 12 + 1;
    $('#clock').textContent = 'Year ' + yr + ' · Month ' + mo;
    if (!r) {
      r = { mood: 50, N: M.N0, u: M.USTAR, E: M.E0, w: M.W0, B: M.B0, Hs: M.HS0, own_over_work: 1.05, G: { infra: 1, edu: 1, just: 1, transit: 1, health: 1 }, svc: 1, x: { jobs: 0.9333, burden: 0.375, occupied: 0.952, W: 1, xs: 1 } }; p = null;
    }
    var mood = Math.round(r.mood);
    $('#mood').textContent = mood; $('#moodBar').style.width = Math.max(0, Math.min(100, mood)) + '%';
    $('#moodW').textContent = MOODW.filter(function (m) { return mood < m[0]; })[0][1];
    var rows = [
      ['People', fmt0(r.N), arrow(r.N, p && p.N, true, 0)],
      ['Jobs', (r.x.jobs * 100).toFixed(1) + '%', arrow(r.x.jobs, p && p.x.jobs, true, 3)],
      ['Average wage', r.w.toFixed(1), arrow(r.w, p && p.w, true, 1)],
      ['Rent, share of pay', Math.round(r.x.burden * 100) + '%', arrow(r.x.burden, p && p.x.burden, false, 2)],
      ['Budget a month', fmt0(r.B), arrow(r.B, p && p.B, true, 0)],
      ['Homes occupied', Math.round(r.x.occupied * 100) + '%', ''],
      ['Owner to worker income', r.own_over_work.toFixed(2), arrow(r.own_over_work, p && p.own_over_work, false, 2)],
      ['Services (avg)', r.svc.toFixed(2), arrow(r.svc, p && p.svc, true, 2)]
    ];
    $('#stats').innerHTML = rows.map(function (a) { return '<div><dt>' + a[0] + '</dt><dd>' + a[1] + a[2] + '</dd></div>'; }).join('');
    var W = r.x.W, xs = r.x.xs;
    $('#wMeter').style.left = Math.max(2, Math.min(98, (W - 0.7) / 0.6 * 100)) + '%';
    $('#mMeter').style.left = Math.max(2, Math.min(98, (xs - 0.8) / 0.4 * 100)) + '%';
    $('#wLbl').textContent = W < 0.85 ? 'dry' : W < 0.97 ? 'drying' : W > 1.08 ? 'bumper' : W > 1.03 ? 'kind' : 'settled';
    $('#mLbl').textContent = xs < 0.9 ? 'ships gone' : xs < 0.98 ? 'soft' : 'normal';
    S.paintSliders && S.paintSliders(); paintPool();
    flow();
    charts();
  }


  /* ---------- follow the change ---------- */
  var FM = {
    q:    { label: 'Take-home pay',      get: function (r) { return r.Q; },                kind: 'rel', th: 0.004, up: true },
    loc:  { label: 'Local spending',     get: function (r) { return r.x.local; },          kind: 'rel', th: 0.004, up: true },
    B:    { label: 'Budget a month',     get: function (r) { return r.B; },                kind: 'rel', th: 0.004, up: true },
    jobs: { label: 'Jobs',               get: function (r) { return r.x.jobs * 100; },     kind: 'abs', th: 0.15,  up: true, unit: ' pts', dp: 1 },
    gap:  { label: 'Income gap',         get: function (r) { return r.own_over_work; },    kind: 'abs', th: 0.01,  up: false, unit: '', dp: 2 },
    burd: { label: 'Rent, share of pay', get: function (r) { return r.x.burden * 100; },   kind: 'abs', th: 0.4,   up: false, unit: ' pts', dp: 1 },
    svc:  { label: 'Services (avg)',     get: function (r) { return r.svc; },              kind: 'abs', th: 0.01,  up: true, unit: '', dp: 2 },
    N:    { label: 'People',             get: function (r) { return r.N; },                kind: 'rel', th: 0.004, up: true }
  };
  function baseline() {
    return { Q: 1, x: { local: 1, jobs: 0.9333, burden: 0.375, occupied: 0.952 }, B: M.B0, own_over_work: 1.05, svc: 1, N: M.N0, G: { infra: 1, edu: 1, just: 1, transit: 1, health: 1 } };
  }
  function lastRec() { return S.hist.length ? S.hist[S.hist.length - 1] : baseline(); }
  function clockText(t) { return 'year ' + (Math.floor(t / 12) + 1) + ', month ' + (t % 12 + 1); }
  function noteChange(key, verb, from, to, unit, svcKey) {
    if (from === to) return;
    var now = Date.now(), c = S.change;
    if (c && c.key === key && now - c.wall < 4000) {
      c.to = to; c.wall = now;
      if (c.to === c.from) S.change = c.prev || null;
    } else {
      S.change = { key: key, verb: verb, from: from, to: to, unit: unit, svc: svcKey || null, i: S.hist.length, snap: lastRec(), t: S.town.t, wall: now,
                   prev: c ? { key: c.key, verb: c.verb, from: c.from, to: c.to, unit: c.unit, t: c.t } : null };
    }
    flow();
  }
  function measure(m, snap, i) {
    // returns { d, rel, lag } for metric m: d is the change since the snapshot, lag the first month it moved
    var base = m.get(snap), cur = m.get(lastRec()), d = cur - base, lag = null;
    var moved = function (v) { return Math.abs(v - base) / (m.kind === 'rel' ? Math.abs(base) || 1 : 1) > m.th; };
    for (var j = i; j < S.hist.length; j++) { if (moved(m.get(S.hist[j]))) { lag = j - i + 1; break; } }
    var shown = m.kind === 'rel' ? d / (Math.abs(base) || 1) * 100 : d;
    var landed = lag !== null && moved(cur);
    return { d: d, shown: shown, landed: landed, lag: lag };
  }
  function fdelta(m, x) {
    var dp = m.kind === 'rel' ? 1 : m.dp, v = x.shown, sg = v > 0 ? '+' : v < 0 ? '−' : '';
    return sg + Math.abs(v).toFixed(dp) + (m.kind === 'rel' ? '%' : '');
  }
  function flow() {
    var host = $('#flowMap'); if (!host) return;
    var c = S.change, r = lastRec(), snap = c ? c.snap : r, i = c ? c.i : S.hist.length, svcM = null;
    // the service stock that moved most since the change (or the one the visitor moved)
    var best = c && c.svc ? c.svc : 'infra', bv = -1;
    if (c) SVC.forEach(function (s) { var v = Math.abs(r.G[s.k] / snap.G[s.k] - 1); if (v > bv + 1e-9) { bv = v; best = s.k; } });
    var sname = SVC.filter(function (s) { return s.k === best; })[0].name;
    svcM = { label: sname, get: function (q) { return q.G[best]; }, kind: 'rel', th: 0.004, up: true };
    var lines = [
      { col: 'var(--c1)', x: 36,  st: [FM.q, FM.loc], term: FM.burd, tv: Math.round(r.x.burden * 100) + '%', tx: 4,   tw: 104 },
      { col: 'var(--c2)', x: 150, st: [FM.B, svcM],   term: FM.svc,  tv: r.svc.toFixed(2),                   tx: 118, tw: 104 },
      { col: 'var(--c4)', x: 264, st: [FM.jobs, FM.gap], term: FM.N,  tv: fmt0(r.N),                          tx: 232, tw: 144 }
    ];
    var ys = [112, 170], out = [], sr = [];
    out.push('<svg viewBox="0 0 384 292" role="img" aria-label="' + (c ? esc('You ' + c.verb + ' ' + c.to + c.unit + '. The map shows what moved afterwards.') : 'Move a slider to see what it sets in motion.') + '">');
    out.push('<g>');
    out.push('<path class="ln" style="stroke:' + lines[0].col + '" d="M36 62 V226"/>');
    out.push('<path class="ln" style="stroke:' + lines[1].col + '" d="M36 76 H150 V226"/>');
    out.push('<path class="ln" style="stroke:' + lines[2].col + '" d="M150 76 H264 V226"/>');
    out.push('</g>');
    out.push('<circle cx="36" cy="46" r="14" class="stn" style="stroke-width:3.5"/><circle cx="36" cy="46" r="5" style="fill:' + (c ? 'var(--accent)' : 'var(--line)') + '"/>');
    if (c) {
      var to = c.to + c.unit, from = c.from + c.unit;
      out.push('<text class="ft" x="60" y="44">You ' + esc(c.verb) + ' ' + esc(String(to)) + '</text><text class="fs" x="60" y="60">' + clockText(c.t) + ', was ' + esc(String(from)) + '</text>');
    } else {
      out.push('<text class="ft" x="60" y="44">Move a slider.</text><text class="fs" x="60" y="60">Then follow what it sets in motion.</text>');
    }
    lines.forEach(function (ln) {
      ln.st.forEach(function (m, k) {
        var y = ys[k], me = c ? measure(m, snap, i) : null, pend = c && !me.landed;
        out.push('<circle class="stn' + (pend ? ' pend' : '') + '" cx="' + ln.x + '" cy="' + y + '" r="7"/>');
        out.push('<text class="fl" x="' + (ln.x + 14) + '" y="' + (y - 3) + '">' + esc(m.label) + '</text>');
        var sub = '', cls = '';
        if (c) {
          if (me.landed) { var good = (me.d > 0) === m.up; sub = 'month +' + me.lag + ', ' + fdelta(m, me); cls = good ? 'up' : 'down'; }
          else sub = 'arriving';
          sr.push(m.label + ': ' + (me.landed ? fdelta(m, me) + ' after ' + me.lag + ' months' : 'not moved yet'));
        }
        out.push('<text class="fs ' + cls + '" x="' + (ln.x + 14) + '" y="' + (y + 11) + '">' + esc(sub) + '</text>');
      });
      var me = c ? measure(ln.term, snap, i) : null, pend = c && !me.landed, cls = '', dl = '';
      if (c && me.landed) { cls = ((me.d > 0) === ln.term.up) ? 'up' : 'down'; dl = fdelta(ln.term, me); }
      else if (c) dl = 'due';
      out.push('<rect class="term' + (pend ? ' pend' : '') + '" x="' + ln.tx + '" y="228" width="' + ln.tw + '" height="46" rx="12"/>');
      out.push('<text class="fl" style="font-size:10.5px" x="' + (ln.tx + 10) + '" y="245">' + esc(ln.term.label) + '</text>');
      out.push('<text class="fv" x="' + (ln.tx + 10) + '" y="266">' + esc(ln.tv) + '<tspan class="fd ' + cls + '" dx="6">' + esc(dl) + '</tspan></text>');
      if (c) sr.push(ln.term.label + ': ' + ln.tv + (me.landed ? ', ' + dl : ', not moved yet'));
    });
    out.push('</svg>');
    host.className = c ? '' : 'idle';
    host.innerHTML = out.join('') + (sr.length ? '<ul class="sr" style="position:absolute;left:-9999px">' + sr.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '');
    var pv = c && c.prev;
    $('#flowPrev').textContent = pv ? 'Before that, you ' + pv.verb + ' ' + pv.to + pv.unit + ' (' + clockText(pv.t) + ').' : (c ? 'Each strand shows a change travelling through the town. Dashed stops have not been reached yet.' : '');
  }

  /* ---------- charts ---------- */
  function cssv(n) { return getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim(); }
  function charts() {
    var h = S.hist, n = Math.max(TERM, h.length), W = 520, H = 230, L = 40, Rm = 12, Tp = 12, Bt = 26, iw = W - L - Rm, ih = H - Tp - Bt;
    var X = function (t) { return L + (t / n) * iw; };
    function frame(ymin, ymax, ticks) {
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img">';
      ticks.forEach(function (v) { var y = Tp + ih - (v - ymin) / (ymax - ymin) * ih; s += '<line x1="' + L + '" x2="' + (W - Rm) + '" y1="' + y + '" y2="' + y + '" stroke="' + cssv('line') + '" stroke-width="1"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + (v >= 100 ? fmt0(v) : +v.toFixed(1)) + '</text>'; });
      for (var m = 0; m <= n; m += 24) s += '<text x="' + X(m) + '" y="' + (H - 6) + '" text-anchor="middle">' + (m / 12 | 0) + 'y</text>';
      S.events.forEach(function (e) { var x = X(e.t); s += '<line x1="' + x + '" x2="' + x + '" y1="' + Tp + '" y2="' + (Tp + ih) + '" stroke="' + cssv('mute') + '" stroke-dasharray="1 3"/><text x="' + x + '" y="' + (Tp + 9) + '" text-anchor="middle" class="lbl">' + EV_LETTER[e.ev] + '</text>'; });
      return s;
    }
    var line = function (vals, ymin, ymax, col, dash, w) {
      if (!vals.length) return '';
      return '<polyline fill="none" stroke="' + col + '" stroke-width="' + (w || 2.4) + '" stroke-linejoin="round" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' points="' +
        vals.map(function (v, i) { return X(i + 1).toFixed(1) + ',' + (Tp + ih - (Math.max(ymin, Math.min(ymax, v)) - ymin) / (ymax - ymin) * ih).toFixed(1); }).join(' ') + '"/>';
    };
    // A: people and jobs
    var Ns = h.map(function (r) { return r.N; }), Es = h.map(function (r) { return r.E; });
    var lo = 400, hi = 1400; var allv = Ns.concat(Es); if (allv.length) { lo = Math.floor(Math.min(500, Math.min.apply(null, allv) - 50) / 100) * 100; hi = Math.ceil(Math.max(1300, Math.max.apply(null, allv) + 50) / 100) * 100; }
    var step = (hi - lo) / 4, tk = [0, 1, 2, 3, 4].map(function (i) { return lo + i * step; });
    var a = frame(lo, hi, tk) + line(Ns, lo, hi, cssv('c2'), '') + line(Es, lo, hi, cssv('c4'), '6 4') + '</svg>';
    $('#chartA').innerHTML = a;
    $('#legA').innerHTML = '<span><i style="border-color:' + cssv('c2') + '"></i>People</span><span><i style="border-color:' + cssv('c4') + ';border-top-style:dashed"></i>Jobs</span><span>D drought · S storm · H harvest · C ship leaves</span>';
    // B: service stocks
    var b = frame(0, 2, [0, 0.5, 1, 1.5, 2]);
    b += '<line x1="' + L + '" x2="' + (W - Rm) + '" y1="' + (Tp + ih / 2) + '" y2="' + (Tp + ih / 2) + '" stroke="' + cssv('ink') + '" stroke-width="1" stroke-dasharray="4 4" opacity=".5"/>';
    SVC.forEach(function (s) { b += line(h.map(function (r) { return r.G[s.k]; }), 0, 2, cssv(s.c), s.dash, 2.2); });
    $('#chartB').innerHTML = b + '</svg>';
    $('#legB').innerHTML = SVC.map(function (s) { return '<span><i style="border-color:' + cssv(s.c) + ';border-top-style:' + (s.dash ? (s.dash.indexOf('2 3') === 0 ? 'dotted' : 'dashed') : 'solid') + '"></i>' + s.name + '</span>'; }).join('');
    var ra = h.length ? h[h.length - 1] : null;
    $('#chartA').setAttribute('role', 'img'); $('#chartA').setAttribute('aria-label', ra ? 'People ' + fmt0(ra.N) + ', jobs ' + fmt0(ra.E) : 'People and jobs over time');
  }

  /* ---------- town figure ---------- */
  function figUrl() {
    var p = window.LabPalette ? window.LabPalette.current() : null, root = document.querySelector('script[data-root]').getAttribute('data-root');
    return root + 'assets/figures/town.html?v=' + Date.now() + '#' + encodeURIComponent(JSON.stringify(p ? p.fig : {}));
  }
  function loadFigure() {
    S.figReady = false; var f = $('#fig'); f.onload = function () { S.figReady = true; figLast = ''; sendFigure(); }; f.src = figUrl();
  }
  /* The town figure rebuilds its whole SVG on every message, so send as little as possible:
     round the values, skip identical frames, cap the rate, and hold updates while the figure is off screen. */
  var figLast = '', figAt = 0, figTimer = null, figVisible = true;
  function sendFigure(ev) {
    if (!S.figReady) return;
    var q = function (v) { return Math.round(v * 50) / 50; };
    var r = S.hist.length ? S.hist[S.hist.length - 1] : null;
    var msg = r ? { w: q(r.x.W), tw: { lit: q(Math.min(1, r.N / r.Hs)), infra: q(r.G.infra), transit: q(r.G.transit), edu: q(r.G.edu), just: q(r.G.just), health: q(r.G.health), crowd: q(r.x.crowd) } }
                : { w: 1, tw: { lit: 0.95, infra: 1, transit: 1, edu: 1, just: 1, health: 1, crowd: 0 } };
    if (ev) msg.event = ev;
    var key = JSON.stringify(msg), now = performance.now();
    if (!ev) {
      if (key === figLast || !figVisible) return;
      if (now - figAt < 450) { clearTimeout(figTimer); figTimer = setTimeout(function () { sendFigure(); }, 450 - (now - figAt)); return; }
    }
    figLast = key; figAt = now;
    try { $('#fig').contentWindow.postMessage({ fig: msg }, '*'); } catch (e) {}
  }
  function watchFigure() {
    if (!('IntersectionObserver' in window)) return;
    var onScreen = true;
    function setRun(v) {
      try { $('#fig').contentWindow.postMessage({ fig: { run: v } }, '*'); } catch (e) {}
      figVisible = v; if (v) { figLast = ''; sendFigure(); }
    }
    new IntersectionObserver(function (es) { if (es[0].isIntersecting !== onScreen) { onScreen = es[0].isIntersecting; if (S.figReady) setRun(onScreen && !document.hidden); } }, { threshold: 0 }).observe($('#figbox'));
    document.addEventListener('visibilitychange', function () { if (S.figReady) setRun(onScreen && !document.hidden); });
  }

  /* ---------- wiring ---------- */
  function paintPlay() {
    $('#play').textContent = S.running ? 'Pause' : (S.town.t === 0 ? 'Play' : 'Play'); $('#play').setAttribute('aria-pressed', S.running);
    $$('[data-speed]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.speed === S.speed); });
  }
  function wire() {
    $('#rent').addEventListener('input', function (e) { noteChange('rent', 'set rent to', S.lastRent, +e.target.value, ''); S.lastRent = +e.target.value; });
    $('#tax').addEventListener('input', function (e) { noteChange('tax', 'set income tax to', S.lastTax, +e.target.value, '%'); S.lastTax = +e.target.value; });
    S.lastRent = S.controls.rent; S.lastTax = S.controls.tax;
    $('#play').onclick = function () { S.running = !S.running; schedule(); paintPlay(); };
    $$('[data-speed]').forEach(function (b) { b.onclick = function () { S.speed = +b.dataset.speed; schedule(); paintPlay(); }; });
    $('#restart').onclick = function () { reset(); S.running = true; schedule(); paintPlay(); };
    $$('#events button').forEach(function (b) { b.onclick = function () { S.pending.push(b.dataset.ev); if (!S.running) { S.running = true; schedule(); paintPlay(); } }; });
    $('#scenario').value = S.scenario;
    $('#scenario').onchange = function (e) { S.scenario = e.target.value; reset(); S.running = true; schedule(); paintPlay(); };
    $('#seedLbl').textContent = 'seed ' + S.seed;
    window.addEventListener('palettechange', function () { loadFigure(); render(); });
    // pause when the deck is off screen so the clock does not run unseen
    if ('IntersectionObserver' in window) {
      var vis = true;
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting || document.querySelector('#figbox').getBoundingClientRect().bottom > 0; }, { threshold: 0 }).observe($('#run'));
    }
  }

  buildPool(); bindSliders(); wire(); watchFigure(); loadFigure(); reset(); paintPlay(); schedule();
  window.__lab = { S: S, tick: tick, M: M };
})();
