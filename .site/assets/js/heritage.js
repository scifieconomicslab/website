/* Heritage tree: branches → sub-branches → thinkers.
   mode "teaser": compact overview for the landing page (branches → sub-branches, names as a one-line list).
   mode "page":   full tree with every thinker, filters and an info panel.
   Styling lives in site.css under "heritage tree"; this file only builds the SVG and wires interaction. */
(function () {
  'use strict';
  var host = document.getElementById('treeTeaser') || document.getElementById('tree');
  if (!host) return;
  var script = document.currentScript || document.querySelector('script[src*="heritage.js"]');
  var mode = (script && script.getAttribute('data-mode')) || 'page';
  var compact = mode === 'teaser';
  var siteData = JSON.parse(document.getElementById('site-data').textContent);
  var D = siteData.heritage;
  if (!D || !D.branches || !D.clusters || !D.thinkers) return;
  var rootEl = document.querySelector('script[data-root]');
  var root = rootEl ? rootEl.getAttribute('data-root') : '';
  var NS = 'http://www.w3.org/2000/svg';

  var BRANCH_ORDER = ['The Danger Zone', 'The Chemical Wedding', 'The Pluriversity', 'The Broken Tower'];
  var BRANCH_COLORS = { 'The Danger Zone': 'rust', 'The Chemical Wedding': 'sky', 'The Pluriversity': 'sun', 'The Broken Tower': 'leaf' };
  var colorOf = function (branch) { return 'var(--' + (BRANCH_COLORS[branch] || 'mute') + ')'; };

  function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function esc(s) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return map[c]; });
  }
  function el(name, attrs, parent, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function wrap2(s, max) {
    if (s.length <= max) return [s];
    var mid = s.length / 2, best = -1, i;
    for (i = 0; i < s.length; i++) if (s[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return best < 0 ? [s] : [s.slice(0, best), s.slice(best + 1)];
  }
  function lastName(full) {
    var p = full.replace(/\s+\(.*\)$/, '').split(' '), n = p.length;
    return n > 2 && /^(le|la|de|del|della|van|von|mc)$/i.test(p[n - 2]) ? p[n - 2] + ' ' + p[n - 1] : p[n - 1];
  }

  // ---- data indexes ----
  var thinkersById = {}, clustersById = {}, byCluster = {}, clustersByBranch = {};
  D.thinkers.forEach(function (t) {
    thinkersById[t.id] = t;
    (t.branches || []).forEach(function (b, i) {
      var cid = slugify(b.sub_branch);
      (byCluster[cid] = byCluster[cid] || []).push({ t: t, primary: i === 0 });
    });
  });
  D.clusters.forEach(function (c) {
    clustersById[c.id] = c;
    (clustersByBranch[c.branch] = clustersByBranch[c.branch] || []).push(c);
  });

  // ---- layout (all numbers in SVG user units) ----
  var L = compact
    ? { W: 880, bx: 0, bw: 190, cx: 270, cw: 610, rowH: 52, rowGap: 8, groupGap: 22, branchGap: 36, pad: 4 }
    : { W: 920, bx: 0, bw: 190, cx: 250, cw: 250, rowH: 34, rowGap: 2, groupGap: 22, branchGap: 48, pad: 4, tx: 560, tw: 360 };
  var CLUSTER_H = compact ? 44 : 46, BRANCH_H = 48;

  var pos = { branch: {}, cluster: {}, rows: {} };
  var cursor = L.pad;
  BRANCH_ORDER.forEach(function (bn) {
    var cls = clustersByBranch[bn] || [];
    var top = cursor, y = cursor;
    cls.forEach(function (c, i) {
      var n = compact ? 1 : Math.max(1, (byCluster[c.id] || []).length);
      var h = n * L.rowH + (n - 1) * L.rowGap;
      if (compact) h = L.rowH;
      pos.cluster[c.id] = { y: y + h / 2, top: y, h: h };
      y += h + (i < cls.length - 1 ? L.groupGap : 0);
    });
    pos.branch[bn] = (top + y) / 2;
    cursor = y + L.branchGap;
  });
  var H = cursor - L.branchGap + L.pad;

  // ---- svg ----
  host.innerHTML = '';
  host.classList.add('tree-host', compact ? 'is-compact' : 'is-full');
  var svg = el('svg', {
    viewBox: '0 0 ' + L.W + ' ' + H, role: 'group', class: 'htree',
    'aria-label': compact ? 'Heritage overview: branches and sub-branches' : 'Heritage tree: branches, sub-branches, thinkers'
  }, host);
  var gl = el('g', { class: 'links' }, svg);
  var gn = el('g', { class: 'nodes' }, svg);

  var branchNodes = {}, clusterNodes = {}, thinkerNodes = {}, edges = [];

  function curve(x1, y1, x2, y2) {
    var mx = (x1 + x2) / 2;
    return 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
  }
  function nodeLink(parent, href, label) {
    if (!compact) return null;
    return el('a', { href: href, 'aria-label': label, class: 'hlink' }, parent);
  }

  var heritageUrl = root + 'heritage/';

  // branches
  BRANCH_ORDER.forEach(function (bn) {
    if (pos.branch[bn] === undefined) return;
    var c = colorOf(bn), y = pos.branch[bn];
    var g = el('g', { class: 'hnode branch', transform: 'translate(' + L.bx + ' ' + (y - BRANCH_H / 2) + ')', style: '--c:' + c }, gn);
    var inner = compact ? el('a', { href: heritageUrl, 'aria-label': bn }, g) : g;
    if (!compact) { g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', bn + ', branch'); }
    el('rect', { class: 'box', width: L.bw, height: BRANCH_H, rx: 12 }, inner);
    el('text', { class: 'lbl', x: L.bw / 2, y: BRANCH_H / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, inner, bn);
    branchNodes[bn] = g;
    g.addEventListener('click', function () { if (!compact) toggleBranch(bn); });
    g.addEventListener('keydown', function (ev) { if (!compact && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); toggleBranch(bn); } });
  });

  // sub-branches
  D.clusters.forEach(function (cl) {
    var p = pos.cluster[cl.id]; if (!p) return;
    var c = colorOf(cl.branch);
    var g = el('g', { class: 'hnode cluster', transform: 'translate(' + L.cx + ' ' + (p.y - CLUSTER_H / 2) + ')', style: '--c:' + c }, gn);
    var inner = compact ? el('a', { href: heritageUrl + '#' + cl.id, 'aria-label': cl.title }, g) : g;
    if (!compact) { g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', cl.title + ', sub-branch of ' + cl.branch); }
    el('rect', { class: 'box', width: L.cw, height: CLUSTER_H, rx: 10 }, inner);
    var people = (byCluster[cl.id] || []).map(function (r) { return r.t; });
    if (compact) {
      el('text', { class: 'lbl', x: 16, y: 18 }, inner, cl.title);
      var names = '', shown = 0;
      for (var i = 0; i < people.length; i++) {
        var nm = lastName(people[i].title), next = names ? names + ' · ' + nm : nm;
        if (next.length > 74) break;
        names = next; shown++;
      }
      if (shown < people.length) names += '  +' + (people.length - shown);
      el('text', { class: 'sub', x: 16, y: 34 }, inner, names);
      el('text', { class: 'count', x: L.cw - 16, y: 18, 'text-anchor': 'end' }, inner, people.length + ' thinkers');
    } else {
      var lines = wrap2(cl.title, 26);
      lines.forEach(function (ln, i) {
        el('text', { class: 'lbl', x: L.cw / 2, y: CLUSTER_H / 2 + (i - (lines.length - 1) / 2) * 16, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, inner, ln);
      });
    }
    clusterNodes[cl.id] = g;
    g.addEventListener('click', function () { if (!compact) toggleCluster(cl.id); });
    g.addEventListener('keydown', function (ev) { if (!compact && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); toggleCluster(cl.id); } });

    // edge branch → cluster
    var x1 = L.bx + L.bw, y1 = pos.branch[cl.branch], x2 = L.cx, y2 = p.y;
    var path = el('path', { d: curve(x1, y1, x2, y2), class: 'edge e1', style: '--c:' + c }, gl);
    edges.push({ el: path, branch: cl.branch, cluster: cl.id, thinker: null });

    // thinker rows (full mode only)
    if (compact) return;
    (byCluster[cl.id] || []).forEach(function (r, i) {
      var t = r.t, ty = p.top + i * (L.rowH + L.rowGap) + L.rowH / 2;
      var tg = el('g', { class: 'hnode thinker' + (r.primary ? '' : ' secondary'), transform: 'translate(' + L.tx + ' ' + (ty - L.rowH / 2) + ')', style: '--c:' + c, tabindex: 0, role: 'button' }, gn);
      var also = (t.branches || []).filter(function (b) { return slugify(b.sub_branch) !== cl.id; }).map(function (b) { return b.sub_branch; });
      tg.setAttribute('aria-label', t.title + ', ' + t.profession + (also.length ? ' (also in ' + also.join(', ') + ')' : ''));
      el('rect', { class: 'box', width: L.tw, height: L.rowH, rx: 8 }, tg);
      el('circle', { class: 'dot', cx: 16, cy: L.rowH / 2, r: 4.5 }, tg);
      el('text', { class: 'lbl', x: 32, y: L.rowH / 2, 'dominant-baseline': 'central' }, tg, t.title);
      if (t.profession) el('text', { class: 'sub', x: L.tw - 12, y: L.rowH / 2, 'text-anchor': 'end', 'dominant-baseline': 'central' }, tg, t.profession);
      if (also.length) el('title', {}, tg, t.title + ' also appears in ' + also.join(', '));
      (thinkerNodes[t.id] = thinkerNodes[t.id] || []).push(tg);

      var te = el('path', { d: curve(L.cx + L.cw, p.y, L.tx + 2, ty), class: 'edge e2', style: '--c:' + c }, gl);
      edges.push({ el: te, branch: cl.branch, cluster: cl.id, thinker: t.id });

      tg.addEventListener('click', function () { selectThinker(t); });
      tg.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectThinker(t); } });
      tg.addEventListener('mouseenter', function () { highlight(t.id); });
      tg.addEventListener('mouseleave', unhighlight);
      tg.addEventListener('focus', function () { highlight(t.id); });
      tg.addEventListener('blur', unhighlight);
    });
  });

  if (compact) return;

  // ---- interaction (full mode) ----
  var state = { branch: '', cluster: '', discipline: '', q: '', sel: null };

  function highlight(id) {
    svg.classList.add('focusing');
    edges.forEach(function (e) { if (e.thinker === id) e.el.classList.add('hl'); });
    var t = thinkersById[id];
    (t.branches || []).forEach(function (b) {
      var cn = clusterNodes[slugify(b.sub_branch)]; if (cn) cn.classList.add('hl');
      var bn = branchNodes[b.branch]; if (bn) bn.classList.add('hl');
      edges.forEach(function (e) { if (e.thinker === null && e.cluster === slugify(b.sub_branch)) e.el.classList.add('hl'); });
    });
    (thinkerNodes[id] || []).forEach(function (n) { n.classList.add('hl'); });
  }
  function unhighlight() {
    svg.classList.remove('focusing');
    svg.querySelectorAll('.hl').forEach(function (n) { n.classList.remove('hl'); });
  }

  function selectThinker(t) {
    state.sel = t.id;
    Object.keys(thinkerNodes).forEach(function (k) {
      thinkerNodes[k].forEach(function (n) { n.classList.toggle('sel', k === t.id); });
    });
    showInfo(t);
  }

  function showInfo(t) {
    var box = document.getElementById('treeInfo');
    if (!box) { if (t.url) location.href = root + t.url.replace(/^\//, ''); return; }
    var badges = (t.branches || []).map(function (b) {
      return '<span class="hbadge" style="--c:' + colorOf(b.branch) + '">' + esc(b.sub_branch) + '<small>' + esc(b.branch) + '</small></span>';
    }).join('');
    box.innerHTML = '<div class="hinfo">' +
      '<p class="hmeta">' + esc(t.profession) + (t.status ? ' · ' + esc(t.status) : '') + '</p>' +
      '<h2>' + esc(t.title) + '</h2>' +
      (t.short_hook ? '<p class="hhook">' + esc(t.short_hook) + '</p>' : '') +
      '<div class="hbadges">' + badges + '</div>' +
      '<a class="btn sm" href="' + root + t.url.replace(/^\//, '') + '">Open note</a></div>';
  }

  function toggleBranch(bn) { state.branch = state.branch === bn ? '' : bn; state.cluster = ''; apply(); }
  function toggleCluster(cid) { state.cluster = state.cluster === cid ? '' : cid; state.branch = ''; apply(); }

  function apply() {
    var q = state.q.trim().toLowerCase(), fd = state.discipline.toLowerCase();
    var any = !!(state.branch || state.cluster || q || fd);
    D.thinkers.forEach(function (t) {
      (thinkerNodes[t.id] || []).forEach(function (n, i) {
        var inScope = true;
        if (state.branch) inScope = (t.branches || []).some(function (b) { return b.branch === state.branch; });
        if (state.cluster) inScope = (t.branches || []).some(function (b) { return slugify(b.sub_branch) === state.cluster; });
        if (fd) inScope = inScope && t.profession.toLowerCase().indexOf(fd) >= 0;
        if (q) inScope = inScope && (t.title.toLowerCase().indexOf(q) >= 0 || (t.short_hook || '').toLowerCase().indexOf(q) >= 0 || t.profession.toLowerCase().indexOf(q) >= 0);
        n.classList.toggle('dim', !inScope);
      });
    });
    D.clusters.forEach(function (c) {
      var n = clusterNodes[c.id]; if (!n) return;
      var ok = true;
      if (state.branch) ok = c.branch === state.branch;
      if (state.cluster) ok = c.id === state.cluster;
      n.classList.toggle('dim', !ok);
      n.classList.toggle('on', state.cluster === c.id);
    });
    BRANCH_ORDER.forEach(function (b) {
      var n = branchNodes[b]; if (!n) return;
      var ok = true;
      if (state.branch) ok = b === state.branch;
      if (state.cluster) ok = clustersById[state.cluster] && clustersById[state.cluster].branch === b;
      n.classList.toggle('dim', !ok);
      n.classList.toggle('on', state.branch === b);
    });
    edges.forEach(function (e) {
      var ok = true;
      if (state.branch) ok = e.branch === state.branch;
      if (state.cluster) ok = e.cluster === state.cluster;
      e.el.classList.toggle('dim', !ok);
    });
    svg.classList.toggle('filtered', any);
    syncChips();
  }

  // ---- filter panel ----
  function buildFilters() {
    var panel = document.createElement('div');
    panel.id = 'heritage-filters';
    panel.className = 'hfilters';
    panel.hidden = true;
    panel.innerHTML =
      '<div class="hf-head"><b>Filters</b><button type="button" id="filter-close" aria-label="Close filters">×</button></div>' +
      '<label class="hf-label" for="tq">Search</label>' +
      '<input type="search" id="tq" placeholder="Search thinkers…" aria-label="Search thinkers">' +
      '<span class="hf-label">Branch</span><div id="filter-branches" class="hf-chips"></div>' +
      '<span class="hf-label">Discipline</span><div id="filter-disciplines" class="hf-chips"></div>';
    document.body.appendChild(panel);

    var bc = panel.querySelector('#filter-branches');
    BRANCH_ORDER.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'hchip'; btn.dataset.fb = b; btn.textContent = b;
      btn.style.setProperty('--c', colorOf(b));
      btn.onclick = function () { toggleBranch(b); };
      bc.appendChild(btn);
    });
    var disciplines = {};
    D.thinkers.forEach(function (t) { if (t.profession) disciplines[t.profession] = (disciplines[t.profession] || 0) + 1; });
    var dc = panel.querySelector('#filter-disciplines');
    Object.keys(disciplines).sort(function (a, b) { return disciplines[b] - disciplines[a] || a.localeCompare(b); }).forEach(function (d) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'hchip'; btn.dataset.fd = d; btn.textContent = d;
      btn.onclick = function () { state.discipline = state.discipline === d ? '' : d; apply(); };
      dc.appendChild(btn);
    });
    panel.querySelector('#tq').oninput = function (ev) { state.q = ev.target.value; apply(); };

    var toggle = document.createElement('button');
    toggle.id = 'heritage-filter-toggle'; toggle.type = 'button'; toggle.className = 'hf-toggle';
    toggle.textContent = 'Filters'; toggle.setAttribute('aria-expanded', 'false');
    toggle.onclick = function () { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); };
    panel.querySelector('#filter-close').onclick = function () { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
    document.body.appendChild(toggle);
  }
  function syncChips() {
    document.querySelectorAll('#filter-branches .hchip').forEach(function (b) { b.classList.toggle('on', state.branch === b.dataset.fb); });
    document.querySelectorAll('#filter-disciplines .hchip').forEach(function (b) { b.classList.toggle('on', state.discipline === b.dataset.fd); });
  }
  buildFilters();

  // deep link from landing: /heritage/#sub-branch-id
  if (location.hash && clustersById[location.hash.slice(1)]) {
    state.cluster = location.hash.slice(1); apply();
    var cn = clusterNodes[state.cluster];
    if (cn) setTimeout(function () { cn.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 50);
  }

  // small-screen fallback list
  var fall = document.getElementById('treeFall');
  if (fall) {
    fall.innerHTML = BRANCH_ORDER.map(function (bn) {
      return '<details class="nest"><summary>' + esc(bn) + '</summary><ul>' + (clustersByBranch[bn] || []).map(function (cl) {
        return '<li>' + esc(cl.title) + '<ul>' + (byCluster[cl.id] || []).map(function (r) {
          return '<li>' + esc(r.t.title) + ' — ' + esc(r.t.profession) + '</li>';
        }).join('') + '</ul></li>';
      }).join('') + '</ul></details>';
    }).join('');
  }
})();
