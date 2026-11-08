/* The method flowchart, drawn in full. Content comes from method/*.md. */
(function () {
  'use strict';
  var host = document.getElementById('msvg'); if (!host) return;
  var DATA = JSON.parse(document.getElementById('site-data').textContent);
  var steps = DATA.method; if (!steps.length) return;
  var NS = 'http://www.w3.org/2000/svg';
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Node pictures are drawn from parts the site already uses: sliders, model charts, the budget bar, iso blocks, the Courier strip.
  var bg=t=>'color-mix(in srgb,var(--'+t+') 22%,var(--card))';
  // isometric block in the town figure's three-band shading
  var mixc=(a,b,t)=>{const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v*(1-t)+B[i]*t).toString(16).padStart(2,'0')).join('')};
  var IX=13,IY=7.5,IZ=13;
  var P=(x,y,z,ox,oy)=>[ox+(x-y)*IX,oy+(x+y)*IY-z*IZ];
  var pt=(a)=>a.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  function box(ox,oy,x,y,w,d,z,col,roof,rcol){const q=(a,b,c)=>P(a,b,c,ox,oy);
   const l=col,r=mixc(col,'#14243a',.3),t=mixc(col,'#ffffff',.5);
   let s=`<polygon points="${pt([q(x,y+d,0),q(x+w,y+d,0),q(x+w,y+d,z),q(x,y+d,z)])}" fill="${l}" class=ms />`;
   s+=`<polygon points="${pt([q(x+w,y,0),q(x+w,y+d,0),q(x+w,y+d,z),q(x+w,y,z)])}" fill="${r}" class=ms />`;
   s+=`<polygon points="${pt([q(x,y,z),q(x+w,y,z),q(x+w,y+d,z),q(x,y+d,z)])}" fill="${roof?rcol:t}" class=ms />`;
   if(roof==='solar'){for(let i=1;i<3;i++){const a=x+w*i/3;s+=`<line x1=${q(a,y,z)[0]} y1=${q(a,y,z)[1]} x2=${q(a,y+d,z)[0]} y2=${q(a,y+d,z)[1]} stroke=#8fb4e8 stroke-width=.8 />`}}
   if(roof==='green'){[[.3,.3],[.65,.5],[.4,.7]].forEach(k=>{const c=q(x+w*k[0],y+d*k[1],z);s+=`<circle cx=${c[0]} cy=${c[1]-2} r=3 fill=#3f8a6a class=ms />`})}
   return s}
  var chart=(lines,opt={})=>{let s='';[-42,-30,-18,-6].forEach(y=>s+=`<path d="M-60 ${y} H62" stroke=var(--line) stroke-width=.8 />`);
   s+=`<path d="M-60 -24 H62" stroke=var(--ink) stroke-width=1 stroke-dasharray="3 3" opacity=.6 />`;
   lines.forEach(l=>s+=`<path d="${l.d}" fill=none stroke=var(--${l.c}) stroke-width=${l.w||2} ${l.dash?'stroke-dasharray="'+l.dash+'"':''} stroke-linecap=round stroke-linejoin=round />`);return s};
  var slider=(y,c,v)=>`<g transform="translate(0 ${y})"><circle cx=-56 cy=0 r=3 fill=var(--${c}) class=ms /><rect x=-48 y=-3 width=100 height=6 rx=3 fill=var(--line) class=ms /><rect x=-48 y=-3 width=${100*v} height=6 rx=3 fill=var(--${c}) class=ms /><circle cx=${-48+100*v} cy=0 r=6 fill=var(--card) class=ms style="stroke-width:1.8" /></g>`;
  var ill={
  problem:()=>box(-24,-8,0,0,1.6,1.4,1.5,'#e6ebf0','','')+box(-24,-8,1.8,-.6,1.2,1.2,2.2,'#dfe9e2','','')+box(-24,-8,0,1.8,1.4,1.2,1.1,'#ece5d8','','')
   +`<rect x=18 y=-46 width=46 height=34 rx=6 fill=var(--card) class=ms /><text x=41 y=-37 text-anchor=middle class=mtk style="font-size:6.2px">RENT SHARE</text><text x=34 y=-18 text-anchor=middle style="font:600 17px var(--serif);fill:var(--ink)">41%</text><path d="M52 -26 l4 8 h-8z" fill=var(--rust) />`
   +`<rect x=-66 y=-48 width=28 height=9 rx=4.5 fill=var(--ink) /><rect x=-66 y=-48 width=14 height=9 rx=4.5 fill=var(--sun) /><path d="M-47 -43.5 h6" stroke=var(--card) stroke-width=1.6 stroke-linecap=round />`,
  options:()=>slider(-34,'c1',.3)+slider(-14,'c2',.7)+slider(6,'c3',.5)+`<path d="M-56 22 H62" stroke=var(--line) />`,
  model:()=>`<g transform="translate(0 -44)">${[[0,.25,'c1'],[.25,.5,'c2'],[.5,.65,'c3'],[.65,.8,'c4'],[.8,1,'c5']].map(a=>`<rect x=${-60+a[0]*120} y=0 width=${(a[1]-a[0])*120} height=9 fill=var(--${a[2]}) class=ms />`).join('')}</g>`
   +chart([{d:'M-60 -4 C-40 -8 -20 -14 0 -18 S40 -20 62 -22',c:'c2',w:2.2},{d:'M-60 -2 C-40 -6 -20 -11 0 -15 S40 -17 62 -18',c:'c4',dash:'5 3',w:2.2}]).replace('-42','-30'),
  fail:()=>chart([{d:'M-60 -24 H-18 C-4 -24 6 -12 16 0 S32 12 40 16',c:'c5',w:2.8},{d:'M-60 -31 C-30 -33 20 -30 62 -32',c:'c1'},{d:'M-60 -27 C-30 -25 20 -28 62 -26',c:'c2'},{d:'M-60 -22 C-30 -24 20 -20 62 -22',c:'c3',dash:'6 3'},{d:'M-60 -18 C-30 -17 20 -19 62 -16',c:'c4',dash:'2 3'}])+`<path d="M-10 -46 V20" stroke=var(--mute) stroke-dasharray="1 3" /><text x=-10 y=-48 text-anchor=middle class=mtk>D</text><g stroke=var(--rust) stroke-width=2.6 stroke-linecap=round><path d="M46 8 l10 10 M56 8 l-10 10"/></g>`,
  commit:()=>`<g transform="translate(0 -40)">${[[0,.25,'c1'],[.25,.5,'c2'],[.5,.65,'c3'],[.65,.8,'c4'],[.8,1,'c5']].map(a=>`<rect x=${-60+a[0]*120} y=0 width=${(a[1]-a[0])*120} height=11 fill=var(--${a[2]}) class=ms />`).join('')}</g>`
   +[0,1,2,3,4].map(i=>`<g transform="translate(${-48+i*24} -14)"><rect x=-9 y=-3 width=18 height=18 rx=4 fill=var(--card) class=ms /><rect x=-4 y=3 width=8 height=7 rx=1 fill=var(--ink) /><path d="M-2.5 3 v-2.5 a2.5 2.5 0 0 1 5 0 v2.5" fill=none stroke=var(--ink) stroke-width=1.4 /></g>`).join('')
   +`<circle cx=0 cy=17 r=9 fill=var(--green) class=ms /><path d="M-5 17 l4 4 l7 -8" fill=none stroke=var(--card) stroke-width=2.4 stroke-linecap=round stroke-linejoin=round />`,
  living:()=>chart([{d:'M-60 -10 C-40 -14 -20 -18 0 -22 S20 -28 24 -30',c:'c2',w:2.2},{d:'M24 -30 C34 -31 46 -29 62 -30',c:'c2',dash:'2 3',w:2.2},{d:'M-60 -8 C-40 -12 -20 -16 0 -19 S20 -24 24 -26',c:'c4',dash:'5 3',w:2.2},{d:'M24 -26 C34 -27 46 -25 62 -26',c:'c4',dash:'2 3',w:2.2}]).replace('M-60 -24 H62','M-60 -24 H62')+`<path d="M24 -46 V6" stroke=var(--ink) stroke-width=1.4 /><rect x=-8 y=-52 width=64 height=11 rx=5.5 fill=var(--ink) /><text x=24 y=-44.5 text-anchor=middle style="font:500 6.2px var(--mono);fill:var(--card)">YEAR 4 · M10</text><g class=mtk><text x=-60 y=22>0y</text><text x=-24 y=22>2y</text><text x=12 y=22>4y</text><text x=48 y=22>6y</text></g><path d="M44 -10 h18 m-5 -4 l5 4 l-5 4" fill=none class=ms />`
  ,
  pathA:()=>chart([{d:'M-60 -31 C-30 -33 0 -30 62 -31',c:'c1'},{d:'M-60 -27 C-30 -25 0 -26 62 -24',c:'c2'},{d:'M-60 -22 C-30 -23 0 -21 62 -19',c:'c5',w:2.4},{d:'M-60 -18 C-30 -19 20 -17 62 -15',c:'c3',dash:'6 3'},{d:'M-60 -14 C-30 -12 20 -13 62 -12',c:'c4',dash:'2 3'}])+`<circle cx=46 cy=10 r=10 fill=var(--ink) /><text x=46 y=14.5 text-anchor=middle style="font:600 12px var(--serif);fill:var(--card)">A</text>`,
  pathB:()=>chart([{d:'M-60 -31 C-30 -33 0 -38 62 -42',c:'c1'},{d:'M-60 -27 C-30 -26 0 -32 62 -38',c:'c2'},{d:'M-60 -22 C-30 -22 0 -26 62 -32',c:'c5',w:2.4},{d:'M-60 -18 C-30 -14 20 -6 62 2',c:'c3',dash:'6 3'},{d:'M-60 -14 C-30 -8 20 2 62 10',c:'c4',dash:'2 3'}])+`<circle cx=46 cy=10 r=10 fill=var(--ink) /><text x=46 y=14.5 text-anchor=middle style="font:600 12px var(--serif);fill:var(--card)">B</text>`,
  table:()=>`<ellipse cx=0 cy=-12 rx=44 ry=22 fill=#f4efe3 class=ms /><rect x=-18 y=-20 width=36 height=18 rx=2 fill=var(--card) class=ms /><path d="M-13 -8 C-7 -14 -2 -10 3 -15 S10 -12 13 -16" fill=none stroke=var(--c2) stroke-width=1.6 /><path d="M-13 -6 C-7 -6 -2 -9 3 -8 S10 -10 13 -9" fill=none stroke=var(--c4) stroke-width=1.4 stroke-dasharray="3 2" />`+[[-50,-14,'c1'],[-34,-38,'c2'],[0,-46,'c3'],[34,-38,'c4'],[50,-14,'c5'],[0,22,'sun']].map(a=>`<circle cx=${a[0]} cy=${a[1]} r=6 fill=var(--${a[2]}) class=ms />`).join('')+`<circle cx=-34 cy=14 r=6 fill=var(--rust) class=ms /><circle cx=34 cy=14 r=6 fill=var(--leaf) class=ms />`,
  fict:(L)=>box(-14,-30,0,0,1.5,1.3,1.4,'#e6ebf0','green','#62a57f')+box(-14,-30,1.8,-.4,1.2,1.2,2.2,'#dfe9e2','solar','#1f3b6e')+`<g><rect x=-62 y=-6 width=124 height=30 rx=5 fill=var(--ink) class=ms /><rect x=-62 y=-6 width=26 height=30 rx=5 fill=var(--sun) class=ms /><text x=-49 y=14 text-anchor=middle style="font:700 15px var(--serif);fill:#1d261c">${L}</text><rect x=-30 y=0 width=22 height=7 rx=2 fill=#2f7fc1 /><path d="M-2 3.5 h50" stroke=var(--paper) stroke-width=2 stroke-linecap=round /><path d="M-30 15 h74" stroke=#8ea0b3 stroke-width=1.4 stroke-linecap=round /></g>`
  };
  
  
  var W = 126, H = 124;
  var NODES = [
    { id: '1', step: 1, pos: [68, 330], tone: 'rust', art: 'problem', badge: '1' },
    { id: '2', step: 2, pos: [218, 330], tone: 'sky', art: 'options', badge: '2' },
    { id: '3', step: 3, pos: [368, 330], tone: 'leaf', art: 'model', badge: '3' },
    { id: '4', step: 4, pos: [368, 120], tone: 'rust', art: 'fail', badge: '4' },
    { id: '5a', step: 5, pos: [590, 200], tone: 'green', art: 'pathA', badge: '5A', label: 'Path A, as the model shows it' },
    { id: '5b', step: 5, pos: [590, 460], tone: 'sky', art: 'pathB', badge: '5B', label: 'Path B, as the model shows it' },
    { id: '6', step: 6, pos: [770, 330], tone: 'sun', art: 'table', badge: '6' },
    { id: '7a', step: 7, pos: [950, 200], tone: 'leaf', art: 'fictA', badge: '7A', label: 'Path A, told as fiction' },
    { id: '7b', step: 7, pos: [950, 460], tone: 'sun', art: 'fictB', badge: '7B', label: 'Path B, told as fiction' },
    { id: '8', step: 8, pos: [1130, 330], tone: 'green', art: 'commit', badge: '8' },
    { id: '9', step: 9, pos: [1130, 120], tone: 'leaf', art: 'living', badge: '9' }
  ];
  var POS = {}; NODES.forEach(function (n) { POS[n.id] = n.pos; });
  // lab: [x, y, anchor, text]. need: the step that has to be on screen first.
  // stepFrom/stepTo map to steps data; labPos holds position for label if dynamic
  var EDGES = [
    { id: 'e12', d: 'M131 330 L155 330', need: 2, stepFrom: 1, stepTo: 2 },
    { id: 'e23', d: 'M281 330 L305 330', need: 3, stepFrom: 2, stepTo: 3 },
    { id: 'e34', d: 'M368 268 L368 184', need: 4, stepFrom: 3, stepTo: 4, labPos: [380, 212, 'start'] },
    { id: 'e42', d: 'M305 120 C250 120 218 190 218 266', need: 4, late: true, stepFrom: 4, stepTo: 2, labPos: [208, 150, 'end'] },
    { id: 'e3a', d: 'M431 318 C470 318 450 200 497 200', need: 5, stepFrom: 3, stepTo: 5, labPos: [462, 172, 'middle'] },
    { id: 'e3b', d: 'M431 342 C470 342 450 460 497 460', need: 5, stepFrom: 3, stepTo: 5, labPos: [462, 500, 'middle'] },
    { id: 'e5a6', d: 'M653 200 C710 200 690 318 707 318', need: 6, stepFrom: 5, stepTo: 6 },
    { id: 'e5b6', d: 'M653 460 C710 460 690 342 707 342', need: 6, stepFrom: 5, stepTo: 6 },
    { id: 'e67a', d: 'M833 318 C890 318 870 200 887 200', need: 7, stepFrom: 6, stepTo: 7 },
    { id: 'e67b', d: 'M833 342 C890 342 870 460 887 460', need: 7, stepFrom: 6, stepTo: 7, labPos: [770, 414, 'middle'] },
    { id: 'e78a', d: 'M1013 200 C1060 200 1040 318 1067 318', need: 8, stepFrom: 7, stepTo: 8 },
    { id: 'e78b', d: 'M1013 460 C1060 460 1040 342 1067 342', need: 8, stepFrom: 7, stepTo: 8, labPos: [1130, 412, 'middle'] },
    { id: 'e89', d: 'M1130 268 L1130 184', need: 9, stepFrom: 8, stepTo: 9, labPos: [1118, 232, 'end'] },
    { id: 'eloop', d: 'M1067 120 C850 14 250 14 68 266', need: 9, late: true, dash: true, labPos: [570, 34, 'middle'] }
  ];

  function el(n, a, p, t) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; if (p) p.appendChild(e); return e; }
  host.innerHTML = '';
  var defs = el('defs', {}, host);
  var f = el('filter', { id: 'wobble', x: '-5%', y: '-5%', width: '110%', height: '110%' }, defs);
  el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.035', numOctaves: '2', seed: '3', result: 'n' }, f);
  el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '2.2' }, f);
  var mk = el('marker', { id: 'arr', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M1 1L9 5L1 9', fill: 'none', stroke: 'context-stroke', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mk);
  var g = el('g', { filter: 'url(#wobble)' }, host);
  var byStep = {}; steps.forEach(function (s) { byStep[s.step] = s; });
  // Populate edge labels from steps data (edge_label frontmatter)
  EDGES.forEach(function (e) {
    var fromStep = byStep[e.stepFrom];
    var toStep = byStep[e.stepTo];
    if (fromStep && fromStep.edge) {
      var idx = (fromStep.next || []).indexOf(e.stepTo);
      if (idx >= 0 && fromStep.edge[idx] && e.labPos) {
        e.lab = [e.labPos[0], e.labPos[1], e.labPos[2], fromStep.edge[idx]];
      }
    }
  });
  // Special case for eloop label (not in notes)
  var eloop = EDGES.find(function (e) { return e.id === 'eloop'; });
  if (eloop && eloop.labPos) eloop.lab = [eloop.labPos[0], eloop.labPos[1], eloop.labPos[2], 'a new problem surfaces'];
  function wrapAt(t, max) {
    var lines = [], cur = '';
    t.split(' ').forEach(function (w) { if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    lines.push(cur); return lines;
  }
  var edgeEls = {}, labEls = {};
  EDGES.forEach(function (e) {
    var a = { d: e.d, class: 'edge', 'marker-end': 'url(#arr)' }; if (e.dash) a['stroke-dasharray'] = '6 5';
    edgeEls[e.id] = el('path', a, g);
    if (e.lab) {
      var t = el('text', { x: e.lab[0], y: e.lab[1], class: 'elab', style: 'text-anchor:' + e.lab[2] }, g);
      wrapAt(e.lab[3], 15).forEach(function (ln, i) { el('tspan', { x: e.lab[0], dy: i ? '13' : '0' }, t, ln); });
      labEls[e.id] = t;
    }
  });
  function wrapLabel(t) {
    var words = t.split(' '), lines = [], cur = '';
    words.forEach(function (w) { if (cur && (cur + ' ' + w).length > 15) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    lines.push(cur); return lines;
  }
  var nodeEls = {};
  NODES.forEach(function (n) {
    var s = byStep[n.step]; if (!s) return;
    var label = n.label || s.label, x = n.pos[0], y = n.pos[1];
    var gg = el('g', { class: 'node', tabindex: 0, role: 'button', 'aria-label': 'Step ' + n.badge + ': ' + label, transform: 'translate(' + x + ' ' + y + ')' }, g);
    el('rect', { x: -W / 2, y: -H / 2, width: W, height: H, rx: 16, class: 'nc' }, gg);
    var pic = el('g', { transform: 'translate(0 -17)' }, gg);
    el('rect', { x: -54, y: -35, width: 108, height: 62, rx: 9, class: 'pbg', style: 'fill:color-mix(in srgb,var(--' + n.tone + ') 22%,var(--card))' }, pic);
    var inner = el('svg', { x: -54, y: -35, width: 108, height: 62, viewBox: '-72 -54 144 82', overflow: 'hidden' }, pic);
    inner.innerHTML = n.art === 'fictA' ? ill.fict('A') : n.art === 'fictB' ? ill.fict('B') : ill[n.art]();
    var lines = wrapLabel(label);
    lines.forEach(function (l, i) { el('text', { x: 0, y: (lines.length === 1 ? 44 : 36 + i * 15) }, gg, l); });
    el('circle', { cx: -52, cy: -52, r: 11, class: 'nb' }, gg);
    el('text', { x: -52, y: -48, class: 'nbt' }, gg, n.badge);
    nodeEls[n.id] = gg;
    function open() { showCard(s); }
    gg.addEventListener('click', open); gg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  var card = document.getElementById('mcard');
  function showCard(s) {
    var root = document.querySelector('script[data-root]').getAttribute('data-root');
    card.innerHTML = '<b>' + esc(s.step) + '. ' + esc(s.label) + '</b><br>' + esc(s.summary) + '<br><a href="' + root + s.url.replace(/^\//, '').replace(/\/$/, '/index.html') + '">Open the note</a>';
    card.classList.add('on');
  }
  document.addEventListener('click', function (e) { if (!e.target.closest('.node') && !e.target.closest('.mcard')) card.classList.remove('on'); });

  // everything is visible at once
  Object.keys(nodeEls).forEach(function (k) { nodeEls[k].classList.add('on'); });
  Object.keys(edgeEls).forEach(function (k) { edgeEls[k].classList.add('on'); });
  Object.keys(labEls).forEach(function (k) { labEls[k].classList.add('on'); });
})();
