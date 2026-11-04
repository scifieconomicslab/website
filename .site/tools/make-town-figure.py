#!/usr/bin/env python3
"""Derives .site/assets/figures/town.html from the v2 colorfigures town (prototypes-v2/figures/solarpunk-town-figure.html).
v2 ran its own toy power/water/food model. v3 makes the figure a pure view: the page sends economic state by postMessage,
and the colours come from the active palette (passed in the URL hash as JSON).
Usage: python3 make-town-figure.py <source.html> <out.html>"""
import sys, re
src = open(sys.argv[1], encoding='utf-8').read()

def sub(old, new, count=1):
    global src
    assert src.count(old) >= 1, 'pattern not found: ' + old[:70]
    src = src.replace(old, new, count) if count else src.replace(old, new)

# 1 palette hook (hash JSON), before everything else
sub("/* ---------- palettes ---------- */",
"""/* v3: palette comes from the page, passed as JSON in the URL hash */
const FP = (() => { try { return JSON.parse(decodeURIComponent((location.hash || '').slice(1)) || '{}'); } catch (e) { return {}; } })();
const fp = (k, d) => FP[k] != null ? FP[k] : d;
if (FP.paper) document.documentElement.style.setProperty('--paper', FP.paper);
if (FP.ink) document.documentElement.style.setProperty('--ink', FP.ink);
/* ---------- palettes ---------- */""")
sub("const INK = '#231e16';", "const INK = fp('ink', '#231e16');")
sub("const SHADOW = '#41538f';", "const SHADOW = fp('shadow', '#41538f');")

# 2 scene colours
sub("const WALL = ['#efe3c8', '#e9c9a0', '#d9e2c4', '#f1d8c0'].map(matOf);",
    "const WALL = [fp('wall0','#efe3c8'), fp('wall1','#e9c9a0'), fp('wall2','#d9e2c4'), fp('wall3','#f1d8c0')].map(matOf);")
sub("const SOLAR = matOf('#27427a'), GRASS = matOf('#79ad55'), LEAF = [matOf('#4f8a3f'), matOf('#6aa54c')], SOIL = matOf('#7a553a');",
    "const SOLAR = matOf(fp('solar','#27427a')), GRASS = matOf(fp('grass','#79ad55')), LEAF = [matOf(fp('leaf0','#4f8a3f')), matOf(fp('leaf1','#6aa54c'))], SOIL = matOf(fp('soil','#7a553a'));")
sub("WATER = matOf('#3f9fe0')", "WATER = matOf(fp('water','#3f9fe0'))")
sub("STREET = matOf('#d9d2c1')", "STREET = matOf(fp('street','#d9d2c1'))")
sub("const SUNM = matOf('#ffd64a');", "const SUNM = matOf(fp('sun','#ffd64a'));")
sub("const CROP = matOf('#7bb84a');", "const CROP = matOf(fp('crop','#7bb84a'));")
sub("matOf('#cfe3b0'));\n  s += castShadow", "matOf(fp('ground','#cfe3b0')));\n  s += castShadow")

# 3 replace the toy model with an animation-only step
a = src.index("/* ---- the toy model (invented numbers")
b = src.index("const cov = st =>")
src = src[:a] + """/* ---- v3: no model in the figure. The page sends economic state; this only animates. ---- */
const cl = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
function derive(st){            // map model numbers to what the town shows
  const w = st.w, tw = st.tw;
  st.sun = cl(.65 + (w - 1) * 1.8, .15, 1);
  st.Wt = cl((w - .6) / .6, .03, 1) * 100;
  st.Fd = cl(100 * (w - .55) / .65, 5, 100);
  st.B = cl(tw.infra, 0, 1.6) / 1.6 * 100;
  st.gen = 100; st.dem = 1; st.wIn = 10; st.wOut = 1; st.food = 1;
}
function step(st, dt){
  st.day += dt; st.t += dt;
  for (const k of ['p','w','f']) st.ph[k] = (st.ph[k] + dt*.45) % 1;
  st.spin = (st.spin + dt*(1.2 + 3*st.sun)) % 6.283;
  st.bus = (st.bus + dt*.07) % 1;
  if (st.evt && st.evt.type){ st.evt.age += dt; if (st.evt.age > 9) st.evt = null; }
}
""" + src[b:]

# 4 scene edits: lit windows per building, grass drought colour, labels
sub("const lit = st.B > 2 || st.gen > st.dem;", "const lit = (i + .5) / SPOTS.length <= st.tw.lit;")
sub("  // canal strip", "  // ring road on the front-right edge, where buses run\n  s += box(115, 0, 3, 120, 112, 3.6, STREET, toneI, .6);\n  // canal strip")
sub("  let s = board(0, 0, W, D, 3, 6,", "  const dry = cl((.95 - st.w) / .25, 0, 1), GR = dry > .02 ? matOf(mix(fp('grass','#79ad55'), '#c9b36a', dry)) : GRASS;\n  let s = board(0, 0, W, D, 3, 6,")
# use the drying grass on the green roofs
sub("box(x-1, y-1, z, x+w+1, y+d+1, z+3, GRASS, toneI, .8)", "box(x-1, y-1, z, x+w+1, y+d+1, z+3, GR, toneI, .8)")

# extras: buses, cracks, lamps, tents, emblems, boat. Inserted before the depth sort.
extras = """
  // ---- v3 extras driven by the economy ----
  { const tw = st.tw;
    // buses on the horizontal street
    const nb = tw.transit < .4 ? 0 : tw.transit < .9 ? 1 : tw.transit < 1.3 ? 2 : 3;
    for (let i = 0; i < nb; i++){ const by = ((st.bus + i / nb) % 1) * 96 + 4;
      put(bbox(116, by, 3, 120, by + 10, 9), box(116.3, by, 3.6, 119.7, by + 10, 8.2, matOf(fp('sun','#f0b429')), tone, 1) + box(116.1, by + 1.5, 6, 119.9, by + 8.5, 7.4, CLEAR, toneI, .6)); }
    // cracked road when infrastructure is poor
    const nc = tw.infra < .8 ? Math.ceil((.8 - tw.infra) / .1) : 0;
    const CR = [[39,39,43,43],[80,39,84,43],[39,80,43,84],[80,80,84,84],[116,30,119,36],[116,70,119,78]];
    for (let i = 0; i < Math.min(nc, CR.length); i++){ const c = CR[i]; put(bbox(c[0], c[1], 3, c[2], c[3], 4), rod([c[0], c[1], 3.8], [c[2], c[3], 3.8], .5, DARK, toneI, .4)); }
    // extra street lamps when infrastructure is strong
    if (tw.infra > 1.15) for (const [lx, ly] of [[37,37],[45,37],[78,78],[86,78]]) put(bbox(lx - 1, ly - 1, 3, lx + 1, ly + 1, 14), rod([lx, ly, 3], [lx, ly, 12], .6, METAL, toneI, .5) + cyl(lx, ly, 12, 14, 1.6, SUNM, toneI, .6, 6));
    // tents when there are more households than homes
    if (tw.crowd > .015){ const nt = Math.min(5, 1 + Math.floor(tw.crowd * 25));
      for (let i = 0; i < nt; i++){ const tx_ = 84 + (i % 3) * 9, ty_ = 100 + Math.floor(i / 3) * 7; put(bbox(tx_, ty_, 3, tx_ + 6, ty_ + 5, 8), box(tx_, ty_, 3, tx_ + 6, ty_ + 5, 6.5, matOf(i % 2 ? '#e2483d' : '#f4b829'), tone, .9)); } }
    // school flag (home at 8,49): pole height follows education
    { const fh = 18 + 10 * cl(tw.edu, .2, 1.5); put(bbox(18, 59, 19, 22, 63, 3 + fh + 3), rod([20, 61, 19], [20, 61, fh + 3], .6, METAL, toneI, .5) + box(20, 60.5, fh - 2, 26, 61.5, fh + 3, matOf(tw.edu > .7 ? fp('leaf1','#6aa54c') : '#9a948a'), toneI, .6)); }
    // clinic cross (clinic at 90,8): glows when health is good, dim when poor
    { const hc = tw.health > 1.1 ? matOf(fp('sun','#f0b429')) : tw.health < .7 ? matOf('#9a948a') : matOf('#e2483d');
      put(bbox(98, 14, 23, 106, 18, 31), box(100, 14, 23, 104, 18, 31, hc, tone, .8) + box(98, 14, 25.5, 106, 18, 28.5, hc, tone, .8)); }
    // court lamp (home at 90,49): lamp is lit when justice works
    { const jm = tw.just > .6 ? matOf(fp('sun','#f0b429')) : matOf('#55504a');
      put(bbox(100, 56, 19, 106, 62, 26), rod([103, 59, 19], [103, 59, 23], .7, METAL, toneI, .5) + cyl(103, 59, 23, 26, 2.2, jm, toneI, .7, 8)); }
    // shuttered workshop when justice collapses
    if (tw.just < .6) put(bbox(52, 113, 5, 74, 114, 15), box(52, 113.4, 5, 74, 114.4, 14, DARK, tone, .6));
    // boat leaving the harbour (cargo diverted)
    if (st.evt && st.evt.type === 'cargo'){ const bx = 10 + (st.evt.age / 9) * 100; put(bbox(bx, 113, 3, bx + 12, 118, 9), box(bx, 113.5, 3.5, bx + 12, 117.5, 6, matOf('#8a6a45'), tone, .9) + rod([bx + 6, 115.5, 6], [bx + 6, 115.5, 14], .6, METAL, toneI, .5) + box(bx + 6, 115.2, 8, bx + 11, 115.8, 14, matOf('#fbfaf3'), toneI, .5)); }
    // crates on the quay after a bumper harvest
    if (st.evt && st.evt.type === 'bumper') for (let i = 0; i < 4; i++) put(bbox(60 + i * 7, 108, 3, 66 + i * 7, 112, 9), box(60 + i * 7, 108, 3, 66 + i * 7, 112, 6 + (i % 2) * 3, matOf('#d9a86c'), tone, .9));
  }
"""
sub("  s += byDepth(it);", extras + "  s += byDepth(it);")
# labels
sub("{ at: [BATT[0]+14, BATT[1]+6, 17], text: 'BATTERY', on: st.B > 5 },", "{ at: [BATT[0]+14, BATT[1]+6, 17], text: 'ROADS AND GRID', on: true },")
sub("{ at: [60, 12, 20], text: 'SOLAR ROOF', on: st.gen > st.dem },", "{ at: [60, 12, 20], text: 'SOLAR ROOF', on: false },\n    { at: [20, 61, 30], text: 'SCHOOL', on: false }, { at: [102, 16, 31], text: 'CLINIC', on: false }, { at: [103, 59, 26], text: 'COURT', on: false }, { at: [60, 41, 8], text: 'BUS', on: false },")

# 5 state: new fields, no posting, new message API
sub("state:{ sun:.65, rain:.6, H:120, B:55, Wt:60, Fd:60, day:0, t:0, run:true, ph:{ p:0, w:0, f:0 }, spin:0, gen:0, dem:1, wIn:0, wOut:1, food:1, hist:[] },",
    "state:{ sun:.65, rain:.6, H:120, B:55, Wt:60, Fd:60, day:0, t:0, run:true, ph:{ p:0, w:0, f:0 }, spin:0, gen:100, dem:1, wIn:10, wOut:1, food:1, hist:[], bus:0, evt:null, w:1,\n    tw:{ lit:.95, infra:1, transit:1, edu:1, just:1, health:1, crowd:0 } },")
sub("function post(){", "function post(){ return;")
# animation must call derive each step
sub("if (ui.st.run){ step(ui.st, dt*1.2); acc += dt;", "if (ui.st.run){ derive(ui.st); step(ui.st, dt*1.2); acc += dt;")
a = src.index("addEventListener('message', e => { const d = e.data && e.data.fig;")
b = src.index("</script>", a)
src = src[:a] + """addEventListener('message', e => { const d = e.data && e.data.fig; if (!d) return; const st = ui.st;
  if (d.w != null) st.w = d.w;
  if (d.tw) Object.assign(st.tw, d.tw);
  if (d.event){ st.evt = { type: d.event, age: 0 };
    const say = { drought: 'Drought. The cistern drains.', storm: 'Storm. Roads and lamps take the hit.', bumper: 'Bumper harvest. Crates on the quay.', cargo: 'The freight ship leaves without stopping.' }[d.event];
    if (say && ui.flash) ui.flash(say, 2600); }
  derive(st); if (st.run) run(); ui.render(); });
""" + src[b:]
# make sure the animation runs at start
sub("run();\nxrMount(", "derive(ui.st); run();\nxrMount(")

# 7 performance: 30 fps when idle, and the page can pause the figure while it is off screen
sub('  const frame = () => { if (!driving) return; driving = false; clearTimeout(fbT);\n    const now = performance.now(), dt =',
    '  let hot = 0;   // v3: idle animation is drawn at about 30 fps; dragging and zooming keep full rate\n  const frame = () => { if (!driving) return; driving = false; clearTimeout(fbT);\n    if (performance.now() - lastT < 30 && performance.now() - hot > 250) { drive(); return; }\n    const now = performance.now(), dt =')
sub('  ui.invalidate = () => drive();',
    '  ui.invalidate = () => { hot = performance.now(); drive(); };')
sub('if (d.w != null) st.w = d.w;',
    'if (d.run != null){ st.run = !!d.run; if (st.run) run(); }   /* v3: the page pauses the figure while it is off screen */\n  if (d.w != null) st.w = d.w;')

# 8 zoom control joins the Labels row at the top
sub('  wrap.appendChild(chip);\n  let s = 1, tx = 0, ty = 0;',
    "  { const vr = document.querySelector('.vset .vrow'); if (vr) { chip.classList.add('inrow'); vr.insertBefore(chip, vr.firstChild); } else wrap.appendChild(chip); }   /* v3: zoom sits on top, beside Labels */\n  let s = 1, tx = 0, ty = 0;")
sub('.zchip button:hover{background:rgba(35,30,22,.08)}.zchip .zp{min-width:44px}</style>',
    '.zchip button:hover{background:rgba(35,30,22,.08)}.zchip .zp{min-width:44px}.zchip.inrow{position:static;align-self:center}</style>')

# 6 page chrome: transparent, palette variables
sub("</head>", "<style>html,body{background:transparent!important}</style></head>")
open(sys.argv[2], 'w', encoding='utf-8').write(src)
print('wrote', sys.argv[2], len(src), 'bytes')
