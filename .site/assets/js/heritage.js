/* Heritage tree: a tidy tree drawn from heritage/*.md plus the inbox file. */
(function () {
  'use strict';
  var script = document.currentScript || document.querySelector('script[src*="heritage.js"]');
  var mode = script && script.getAttribute('data-mode') || 'page';
  var DATA = JSON.parse(document.getElementById('site-data').textContent).heritage;
  var host = document.getElementById(mode === 'teaser' ? 'treeTeaser' : 'tree');
  if (!host || !DATA.tree) return;
  var root = document.querySelector('script[data-root]').getAttribute('data-root');
  var NS = 'http://www.w3.org/2000/svg';
  var BR = { economics: 'sky', cities: 'leaf', games: 'sun', fiction: 'rust', other: 'mute', none: 'green' };
  var state = { kinds: new Set(), confirmedOnly: false, q: '', sel: null };
  var maxDepth = mode === 'teaser' ? 2 : 99;

  function layout(n, d, acc) {
    n.depth = d; var kids = d >= maxDepth ? [] : n.children.filter(function (c) { return mode !== 'teaser' || c.id !== 'unplaced'; });
    n._kids = kids;
    if (!kids.length) { n.y = acc.i++ * 54; } else { kids.forEach(function (c) { layout(c, d + 1, acc); }); n.y = (kids[0].y + kids[kids.length - 1].y) / 2; }
    return n;
  }
  function flat(n, out) { out.push(n); n._kids.forEach(function (c) { flat(c, out); }); return out; }
  var tree = JSON.parse(JSON.stringify(DATA.tree));
  layout(tree, 0, { i: 0 });
  var nodes = flat(tree, []), byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
  var DX = 250, PADX = 24, PADY = 30, NW = 206, NH = 38;
  var maxD = Math.max.apply(null, nodes.map(function (n) { return n.depth; })), maxY = Math.max.apply(null, nodes.map(function (n) { return n.y; }));
  var Wd = PADX * 2 + maxD * DX + NW, Ht = PADY * 2 + maxY + NH;

  function e(n, a, p, t) { var x = document.createElementNS(NS, n); for (var k in a) x.setAttribute(k, a[k]); if (t != null) x.textContent = t; if (p) p.appendChild(x); return x; }
  var svg = e('svg', { viewBox: '0 0 ' + Wd + ' ' + Ht, width: Wd, role: 'group', 'aria-label': 'Family tree of ideas' });
  var gl = e('g', {}, svg), ga = e('g', {}, svg), gn = e('g', {}, svg);
  var X = function (n) { return PADX + n.depth * DX; }, Y = function (n) { return PADY + n.y; };
  var linkEls = [];
  nodes.forEach(function (n) { n._kids.forEach(function (c) {
    var x1 = X(n) + NW, y1 = Y(n) + NH / 2, x2 = X(c), y2 = Y(c) + NH / 2, mx = (x1 + x2) / 2;
    linkEls.push({ el: e('path', { d: 'M' + x1 + ' ' + y1 + 'C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2, class: 'tlink' }, gl), a: n.id, b: c.id });
  }); });
  DATA.links.forEach(function (l) { var a = byId[l.from], b = byId[l.to]; if (!a || !b) return;
    var x1 = X(a) + NW / 2, y1 = Y(a) + NH, x2 = X(b) + NW / 2, y2 = Y(b); e('path', { d: 'M' + x1 + ' ' + y1 + 'C' + x1 + ' ' + (y1 + 60) + ' ' + x2 + ' ' + (y2 - 60) + ' ' + x2 + ' ' + y2, class: 'talso' }, ga); });
  var nodeEls = {};
  nodes.forEach(function (n) {
    var g = e('g', { class: 'tnode' + (n.status === 'confirmed' ? '' : ' cand'), tabindex: 0, role: 'button', 'aria-label': n.title + ', ' + n.kind + ', ' + n.status }, gn);
    var x = X(n), y = Y(n), col = 'var(--' + (BR[n.branch] || 'mute') + ')', fill = 'color-mix(in srgb,' + col + ' ' + (n.kind === 'person' ? 38 : n.kind === 'idea' ? 22 : 30) + '%,var(--card))';
    var shape;
    if (n.kind === 'idea') shape = e('ellipse', { cx: x + NW / 2, cy: y + NH / 2, rx: NW / 2, ry: NH / 2, style: 'fill:' + fill }, g);
    else if (n.kind === 'game' || n.kind === 'software') shape = e('polygon', { points: [x + 14, y, x + NW - 14, y, x + NW, y + NH / 2, x + NW - 14, y + NH, x + 14, y + NH, x, y + NH / 2].join(' '), style: 'fill:' + fill }, g);
    else shape = e('rect', { x: x, y: y, width: NW, height: NH, rx: n.kind === 'person' ? 19 : 5, style: 'fill:' + fill }, g);
    var t = n.title.length > 27 ? n.title.slice(0, 26) + '…' : n.title;
    e('text', { x: x + NW / 2, y: y + (n.year ? 16 : 24), 'text-anchor': 'middle' }, g, t);
    if (n.year) e('text', { x: x + NW / 2, y: y + 30, 'text-anchor': 'middle', class: 'yr' }, g, n.year);
    nodeEls[n.id] = g;
    g.addEventListener('click', function () { select(n); });
    g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(n); } });
    g.addEventListener('mouseenter', function () { path(n, true); }); g.addEventListener('mouseleave', function () { path(n, false); });
  });
  host.appendChild(svg);

  function path(n, on) {
    var ids = {}; var cur = n; ids[cur.id] = 1;
    var parent = {}; nodes.forEach(function (p) { p._kids.forEach(function (c) { parent[c.id] = p; }); });
    while (parent[cur.id]) { cur = parent[cur.id]; ids[cur.id] = 1; }
    linkEls.forEach(function (l) { l.el.classList.toggle('hl', on && ids[l.a] && ids[l.b]); l.el.classList.toggle('dim', on && !(ids[l.a] && ids[l.b])); });
  }
  function info(n) {
    var box = document.getElementById('treeInfo'); if (!box) { if (n.note) location.href = root + n.note.replace(/^\//, '').replace(/\/$/, '/index.html'); return; }
    box.innerHTML = '<div class="panel"><h3>' + n.kind + ' · ' + n.status + (n.year ? ' · ' + n.year : '') + '</h3><h2 style="font-size:26px">' + n.title + '</h2>' +
      (n.why ? '<p>' + esc(n.why) + '</p>' : '<p class="hint">No note yet. Add one line to the inbox or a file in heritage/.</p>') +
      '<p>' + (n.note ? '<a class="btn sm" href="' + root + n.note.replace(/^\//, '').replace(/\/$/, '/index.html') + '">Open the note</a> ' : '') + (n.url ? '<a class="btn sm alt" href="' + n.url + '">Source</a>' : '') + '</p></div>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function select(n) { state.sel = n.id; Object.keys(nodeEls).forEach(function (k) { nodeEls[k].classList.toggle('sel', k === n.id); }); info(n); }
  function filter() {
    var q = state.q.toLowerCase();
    nodes.forEach(function (n) {
      var ok = (!state.kinds.size || state.kinds.has(n.kind) || n.kind === 'root') && (!state.confirmedOnly || n.status === 'confirmed' || n.kind === 'root') && (!q || n.title.toLowerCase().indexOf(q) >= 0 || (n.why || '').toLowerCase().indexOf(q) >= 0);
      nodeEls[n.id].classList.toggle('dim', !ok);
    });
  }
  var tools = document.getElementById('treeTools');
  if (tools && mode === 'page') {
    var kinds = ['person', 'work', 'idea', 'game', 'software'];
    tools.innerHTML = '<input type="search" id="tq" placeholder="Search the tree" aria-label="Search the tree">' +
      kinds.map(function (k) { return '<button class="chip" type="button" data-k="' + k + '" aria-pressed="false">' + k + '</button>'; }).join('') +
      '<button class="chip" type="button" id="tconf" aria-pressed="false">confirmed only</button>';
    tools.querySelector('#tq').oninput = function (ev) { state.q = ev.target.value; filter(); };
    Array.prototype.forEach.call(tools.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { var k = b.dataset.k; if (state.kinds.has(k)) state.kinds.delete(k); else state.kinds.add(k); b.setAttribute('aria-pressed', state.kinds.has(k)); filter(); }; });
    tools.querySelector('#tconf').onclick = function (ev) { state.confirmedOnly = !state.confirmedOnly; ev.target.setAttribute('aria-pressed', state.confirmedOnly); filter(); };
  }
  // nested list for small screens
  var fall = document.getElementById('treeFall');
  if (fall) {
    var li = function (n) { return '<li>' + (n.children.length ? '<details class="nest"><summary>' + esc(n.title) + (n.year ? ' (' + n.year + ')' : '') + '</summary><ul>' + n.children.map(li).join('') + '</ul></details>' : esc(n.title) + (n.year ? ' (' + n.year + ')' : '') + (n.note ? ' <a href="' + root + n.note.replace(/^\//, '').replace(/\/$/, '/index.html') + '">note</a>' : '')) + '</li>'; };
    fall.innerHTML = '<ul style="list-style:none;padding:0">' + li(DATA.tree) + '</ul>';
  }
})();
