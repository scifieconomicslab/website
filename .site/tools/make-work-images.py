#!/usr/bin/env python3
"""Generates one featured image per work note from its `motif:` front-matter field.
Output: .site/assets/work/<slug>.svg (inlined into pages, so colours follow the active palette).
Usage: python3 .site/tools/make-work-images.py   (run from the repo root)
Add a new motif by writing one function and registering it in MOTIFS."""
import os, re, glob, hashlib, random, math

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, '.site', 'assets', 'work')
os.makedirs(OUT, exist_ok=True)

# colour tokens with Harbour fallbacks, so a stray SVG still renders
C = dict(paper='#f3efe3', card='#fbf8ee', ink='#1d261c', line='#d9d3bf', green='#2f6b45', leaf='#7bb84a', sun='#f0b429', sky='#3f9fe0', rust='#c54932',
         c1='#b88818', c2='#3b95d3', c3='#8c5a9e', c4='#3d8a4f', c5='#c94a33')
def v(k): return 'var(--%s,%s)' % (k, C[k])
INK = v('ink')
ACC = ['sun', 'sky', 'leaf', 'rust', 'c3']

def r(x, y, w, h, fill, rx=6, sw=2.5, extra=''):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{v(fill) if fill in C else fill}" stroke="{INK}" stroke-width="{sw}" {extra}/>'
def c(x, y, rad, fill, sw=2.5):
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rad:.1f}" fill="{v(fill) if fill in C else fill}" stroke="{INK}" stroke-width="{sw}"/>'
def ln(x1, y1, x2, y2, sw=2.5, col=None, dash=''):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{col or INK}" stroke-width="{sw}" stroke-linecap="round" {dash}/>'
def path(d, fill='none', sw=2.5, col=None, extra=''):
    return f'<path d="{d}" fill="{v(fill) if fill in C else fill}" stroke="{col or INK}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'
def poly(pts, fill, sw=2.5):
    return path('M' + 'L'.join('%.1f,%.1f' % p for p in pts) + 'Z', fill, sw)
def text(x, y, s, size=18, anchor='middle', fill=None):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="var(--mono,monospace)" font-size="{size}" font-weight="600" fill="{fill or INK}">{s}</text>'
def iso_block(x, y, w, h, d, top, left, right):
    """isometric box, (x,y) is the front-bottom corner"""
    return (poly([(x, y), (x - w, y - w / 2), (x - w, y - w / 2 - h), (x, y - h)], left) +
            poly([(x, y), (x + d, y - d / 2), (x + d, y - d / 2 - h), (x, y - h)], right) +
            poly([(x, y - h), (x - w, y - w / 2 - h), (x - w + d, y - w / 2 - d / 2 - h), (x + d, y - d / 2 - h)], top))

# every motif draws on a 640 x 360 canvas, rnd is seeded from the slug
def bridge(rnd):
    s = r(70, 150, 150, 120, 'sky') + r(420, 150, 150, 120, 'leaf')
    s += path('M220,200 Q320,110 420,200', 'none', 6) + ln(220, 200, 420, 200, 6)
    for x in (260, 300, 340, 380): s += ln(x, 200, x, 160 + abs(x - 320) * .18, 2)
    s += c(145, 210, 24, 'sun') + c(495, 210, 24, 'rust')
    return s
def orbit4(rnd):
    s = c(320, 180, 34, 'sun')
    for i, (rad, col) in enumerate([(70, 'sky'), (105, 'leaf'), (140, 'rust'), (170, 'c3')]):
        s += f'<ellipse cx="320" cy="180" rx="{rad * 1.5}" ry="{rad * .5}" fill="none" stroke="{INK}" stroke-width="2" stroke-dasharray="5 6"/>'
        a = rnd.random() * 6.28
        s += c(320 + math.cos(a) * rad * 1.5, 180 + math.sin(a) * rad * .5, 13, col)
    return s
def graph(rnd):
    pts = [(120, 120), (230, 70), (340, 130), (450, 70), (520, 160), (150, 250), (270, 230), (400, 270), (500, 280)]
    edges = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 5), (5, 6), (6, 2), (6, 7), (7, 4), (7, 8), (4, 8), (1, 6)]
    s = ''.join(ln(*pts[a], *pts[b], 2.5) for a, b in edges)
    for i, (x, y) in enumerate(pts): s += r(x - 20, y - 14, 40, 28, ACC[i % 5], 5)
    return s
def blocks(rnd):
    s = ''
    cols = ['sun', 'sky', 'leaf', 'rust', 'c3', 'c2']
    for i in range(6): s += r(100 + (i % 3) * 140, 90 + (i // 3) * 110 + rnd.randint(-6, 6), 118, 90, cols[i], 8)
    s += r(530, 120, 70, 130, 'card', 8, 2.5, 'stroke-dasharray="6 5"') + text(565, 195, '+1', 30)
    return s
def retrofit(rnd):
    s = r(60, 270, 520, 14, 'leaf', 3)
    xs = [90, 190, 290, 390, 490]
    for i, x in enumerate(xs):
        h = 90 + rnd.randint(0, 60)
        s += r(x, 270 - h, 78, h, ['card', 'line', 'card', 'line', 'card'][i], 3)
        s += poly([(x - 4, 270 - h), (x + 82, 270 - h), (x + 60, 270 - h - 26), (x + 18, 270 - h - 26)], 'sky')
        s += c(x + 39, 270 - h / 2, 9, 'sun') + ''.join(ln(x + 39 + math.cos(k * .785) * 12, 270 - h / 2 + math.sin(k * .785) * 12, x + 39 + math.cos(k * .785) * 17, 270 - h / 2 + math.sin(k * .785) * 17, 2) for k in range(8))
    s += path('M70,70 q120,-40 240,0 t240,0', 'none', 3, v('green'), 'stroke-dasharray="2 9"')
    return s
def window(rnd):
    s = r(90, 60, 460, 250, 'card', 12) + r(90, 60, 460, 38, 'line', 12)
    for i, col in enumerate(['rust', 'sun', 'leaf']): s += c(116 + i * 24, 79, 7, col, 2)
    s += r(120, 120, 180, 20, 'sun', 4) + r(120, 156, 400, 12, 'line', 4, 1.5) + r(120, 180, 360, 12, 'line', 4, 1.5)
    for i in range(3): s += r(120 + i * 135, 220, 120, 70, ACC[i], 6)
    return s
def podium(rnd):
    s = r(40, 280, 560, 14, 'leaf', 3) + poly([(240, 280), (260, 180), (380, 180), (400, 280)], 'sun')
    s += c(320, 110, 28, 'card') + r(296, 140, 48, 40, 'sky', 8)
    for i in range(3):
        s += path(f'M{440 + i * 22},{110 - i * 10} q18,{18} 0,{36}', 'none', 3)
    s += r(80, 150, 90, 66, 'card', 6) + ln(95, 172, 155, 172, 2) + ln(95, 190, 140, 190, 2)
    return s
def city(rnd):
    s = ''
    for gx in range(5):
        for gy in range(4):
            x = 120 + gx * 80 + gy * 36; y = 120 + gy * 42 - gx * 8 + 60
            h = 24 + rnd.randint(0, 56)
            s += iso_block(x, y, 30, h, 30, ACC[(gx + gy) % 5], 'card', 'line')
    s += path('M70,300 Q200,210 330,250 T600,150', 'none', 5, v('rust'), 'stroke-dasharray="14 8"')
    return s
def table(rnd):
    s = f'<ellipse cx="320" cy="200" rx="200" ry="80" fill="{v("card")}" stroke="{INK}" stroke-width="2.5"/>' + f'<ellipse cx="320" cy="200" rx="110" ry="40" fill="{v("leaf")}" stroke="{INK}" stroke-width="2.5"/>'
    for i in range(10):
        a = i / 10 * 6.28
        x, y = 320 + math.cos(a) * 235, 200 + math.sin(a) * 100
        s += c(x, y - 14, 12, ACC[i % 5]) + path(f'M{x - 16},{y + 14} q16,-26 32,0', ACC[i % 5], 2.5)
    s += text(320, 206, 'scenario', 15)
    return s
def planets(rnd):
    s = ''
    for i, (x, y, rad, col) in enumerate([(130, 220, 48, 'sky'), (270, 120, 30, 'sun'), (410, 230, 40, 'rust'), (530, 120, 22, 'c3')]):
        s += c(x, y, rad, col) + f'<ellipse cx="{x}" cy="{y + 4}" rx="{rad * 1.7}" ry="{rad * .3}" fill="none" stroke="{INK}" stroke-width="2" transform="rotate(-18 {x} {y})"/>'
    s += path('M130,220 L270,120 L410,230 L530,120', 'none', 2, INK, 'stroke-dasharray="3 8"')
    for i in range(14): s += c(rnd.randint(30, 610), rnd.randint(20, 340), 2.5, 'ink', 1)
    return s
def town(rnd):
    s = r(40, 250, 560, 70, 'sky') + path('M40,262 q40,-12 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0', 'none', 2.5)
    for i in range(6):
        x = 70 + i * 84; h = 50 + rnd.randint(0, 70)
        s += r(x, 250 - h, 60, h, ['card', 'sun', 'card', 'line', 'sun', 'card'][i], 4) + poly([(x - 6, 250 - h), (x + 30, 250 - h - 28), (x + 66, 250 - h)], 'rust')
        s += r(x + 22, 250 - 30, 16, 30, 'ink', 2, 1)
    s += c(540, 90, 30, 'sun')
    return s
def sprout(rnd):
    s = r(60, 270, 520, 20, 'c1', 4) + ln(320, 270, 320, 120, 6)
    s += path('M320,200 q-90,-10 -100,-80 q80,0 100,80', 'leaf') + path('M320,160 q90,-10 100,-80 q-80,0 -100,80', 'green')
    for i, (x, y) in enumerate([(150, 100), (480, 130), (130, 210), (510, 220)]): s += r(x, y, 40, 28, ACC[i], 14, 2)
    s += c(320, 100, 20, 'sun')
    return s
def paper(rnd):
    s = r(200, 50, 240, 270, 'card', 8) + r(220, 70, 200, 20, 'sun', 3)
    for i in range(8): s += ln(222, 120 + i * 22, 418 - (i % 3) * 30, 120 + i * 22, 3, v('line'))
    s += r(90, 120, 90, 120, 'sky', 8, 2.5, 'transform="rotate(-8 135 180)"') + r(460, 130, 90, 120, 'leaf', 8, 2.5, 'transform="rotate(7 505 190)"')
    s += text(320, 310, 'CC BY', 18)
    return s
def radar(rnd):
    s = ''
    for rad in (150, 110, 70, 30): s += c(320, 190, rad, 'card' if rad % 40 else 'line', 2)
    s += ln(320, 190, 440, 100, 4, v('rust')) + path('M320,190 L440,100 A150,150 0 0 1 465,190Z', v('rust') + '', 0, 'none', 'opacity=".25"')
    for i in range(7):
        a = rnd.random() * 6.28; d = 30 + rnd.random() * 110
        x, y = 320 + math.cos(a) * d, 190 + math.sin(a) * d * .9
        s += path(f'M{x},{y + 12} q-12,-18 0,-30 q12,12 0,30', 'rust', 2) + c(x, y - 14, 3, 'card', 1)
    return s
def megacity(rnd):
    s = r(30, 250, 580, 80, 'sky')
    s += path('M30,262 q40,-12 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0', 'none', 2.5)
    k = 0
    for row, ys in enumerate([(150, 6), (205, 6)]):
        for i in range(6):
            x = 100 + i * 84 + (42 if row else 0); y = ys[0]
            hexa = [(x + math.cos(a * 1.047 + .52) * 38, y + math.sin(a * 1.047 + .52) * 22) for a in range(6)]
            s += poly(hexa, ACC[k % 5]); k += 1
    s += iso_block(330, 135, 24, 60, 24, 'card', 'line', 'sun')
    return s
def cards(rnd):
    s = ''
    for i, col in enumerate(['rust', 'sun', 'leaf', 'sky', 'c3']):
        a = -28 + i * 14
        s += f'<g transform="rotate({a} 320 330)">' + r(250, 70, 140, 210, 'card', 10) + r(262, 82, 116, 90, col, 6) + ln(270, 195, 370, 195, 3) + ln(270, 215, 345, 215, 3) + '</g>'
    return s
def dialogue(rnd):
    s = r(70, 80, 270, 110, 'sky', 22) + poly([(120, 190), (110, 235), (160, 190)], 'sky') + r(300, 170, 270, 110, 'sun', 22) + poly([(500, 280), (520, 322), (470, 280)], 'sun')
    for i in range(3): s += ln(100, 110 + i * 24, 300 - i * 40, 110 + i * 24, 3) + ln(330, 200 + i * 24, 540 - i * 30, 200 + i * 24, 3)
    return s
def banners(rnd):
    s = ln(40, 80, 600, 80, 4)
    for i in range(7):
        x = 70 + i * 78
        s += poly([(x, 80), (x + 56, 80), (x + 56, 210 + rnd.randint(0, 40)), (x + 28, 190 + rnd.randint(0, 30)), (x, 210 + rnd.randint(0, 40))], ACC[i % 5])
    s += c(320, 300, 14, 'sun') + c(240, 300, 10, 'sky') + c(400, 300, 10, 'leaf')
    return s
def district(rnd):
    s = ''
    for i in range(12):
        gx, gy = i % 4, i // 4
        s += r(80 + gx * 120, 60 + gy * 90, 100, 72, ACC[(gx + gy) % 5] if i in (1, 5, 6, 10) else 'card', 8)
    pts = [(130, 96), (250, 96), (250, 186), (370, 186), (490, 276), (370, 276)]
    s += path('M' + 'L'.join('%d,%d' % p for p in pts), 'none', 4, v('rust'), 'stroke-dasharray="10 7"')
    for p in pts: s += c(p[0], p[1], 8, 'sun', 2)
    return s
def cycle(rnd):
    s = ln(70, 300, 70, 50, 3) + ln(70, 300, 590, 300, 3)
    s += path('M70,230 C150,60 220,60 290,200 S430,300 500,140', 'none', 5, v('sky'))
    s += path('M70,120 C150,270 220,270 290,150 S430,50 500,200', 'none', 5, v('rust'))
    s += c(500, 140, 8, 'sky') + c(500, 200, 8, 'rust') + text(540, 100, '0%', 22)
    return s
def agents(rnd):
    s = ''
    pts = [(rnd.randint(70, 570), rnd.randint(60, 300)) for _ in range(26)]
    for i, p in enumerate(pts):
        near = sorted(pts, key=lambda q: (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2)[1:3]
        for q in near: s += ln(*p, *q, 1.5, v('line'))
    for i, p in enumerate(pts): s += c(*p, 11, ACC[i % 5], 2)
    return s
def spotlight(rnd):
    s = poly([(320, 20), (120, 330), (520, 330)], 'sun', 0).replace('stroke-width="0"', 'stroke-width="0" opacity=".45"')
    s += r(40, 290, 560, 24, 'ink', 3) + c(320, 205, 26, 'card') + r(294, 232, 52, 60, 'sky', 10)
    for i in range(9): s += c(50 + i * 68, 318 + 0, 0.1, 'ink', 0) + c(60 + i * 65, 330, 16, ACC[i % 5], 2)
    return s
def pyramid(rnd):
    s = poly([(140, 290), (260, 90), (380, 290)], 'sun') + ln(200, 190, 320, 190, 2)
    for i in range(5): s += c(450 + (i % 3) * 38, 120 + (i // 3) * 70, 17, ACC[i], 2.5)
    s += ln(450, 137, 450, 190, 2) + ln(488, 137, 488, 190, 2) + ln(526, 137, 526, 190, 2) + c(450, 207, 17, ACC[3]) + c(526, 207, 17, ACC[4])
    s += text(260, 325, 'vs', 22)
    return s
def camp(rnd):
    s = r(30, 285, 580, 25, 'leaf', 3)
    for i, x in enumerate([130, 290, 450]):
        s += poly([(x - 70, 285), (x, 150), (x + 70, 285)], ACC[i]) + poly([(x - 18, 285), (x, 230), (x + 18, 285)], 'ink')
    s += c(320, 80, 26, 'sun') + path('M200,110 q40,-50 90,-30', 'none', 3) + ln(520, 200, 520, 285, 3) + poly([(520, 200), (580, 220), (520, 240)], 'rust')
    return s
def network(rnd):
    return graph(rnd)
def school(rnd):
    s = poly([(320, 60), (520, 150), (120, 150)], 'sun') + r(150, 150, 340, 120, 'card', 4)
    for i in range(4): s += r(172 + i * 78, 180, 48, 52, 'sky', 4)
    s += r(290, 218, 60, 52, 'rust', 4) + r(100, 270, 440, 18, 'leaf', 3) + ln(320, 60, 320, 28, 3) + poly([(320, 28), (360, 40), (320, 52)], 'rust')
    return s
def people(rnd):
    s = ''
    for i in range(5): s += c(110 + i * 105, 150, 30, ACC[i]) + path(f'M{70 + i * 105},260 q40,-70 80,0Z', ACC[i])
    return s
def orbit(rnd): return orbit4(rnd)

MOTIFS = {k: f for k, f in globals().items() if callable(f) and k in (
    'bridge orbit4 graph blocks retrofit window podium city table planets town sprout paper radar megacity cards dialogue banners district cycle agents spotlight pyramid camp network school people').split()}

def wrap(slug, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'
            f'<rect width="640" height="360" fill="{v("paper")}"/>'
            f'<g opacity=".5">' + ''.join(f'<circle cx="{x}" cy="{y}" r="1.6" fill="{v("line")}"/>' for x in range(20, 640, 40) for y in range(20, 360, 40)) + '</g>'
            + body + '</svg>')

n = 0
for f in sorted(glob.glob(os.path.join(ROOT, 'work', '*.md'))):
    raw = open(f, encoding='utf8').read()
    m = re.search(r'^motif:\s*(\S+)', raw, re.M)
    if not m: continue
    slug = os.path.basename(f)[:-3]
    fn = MOTIFS.get(m.group(1))
    if not fn:
        print('unknown motif', m.group(1), 'in', slug); continue
    rnd = random.Random(int(hashlib.md5(slug.encode()).hexdigest()[:8], 16))
    open(os.path.join(OUT, slug + '.svg'), 'w').write(wrap(slug, fn(rnd)))
    n += 1
print(n, 'images written to', OUT)
