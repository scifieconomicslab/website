#!/usr/bin/env python3
"""One-off: splits the design brief into vault notes. Run once, then edit the notes in Obsidian.
Usage: python3 split-brief.py <brief.md> <vault-root>"""
import sys, re, os
brief = open(sys.argv[1], encoding='utf-8').read(); root = sys.argv[2]
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
def write(rel, fm, body):
    p = os.path.join(root, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if os.path.exists(p): return
    lines = ['---'] + [f'{k}: {v}' for k, v in fm.items()] + ['---', '', body.strip(), '']
    open(p, 'w', encoding='utf-8').write('\n'.join(lines))
def q(s): return '"' + str(s).replace('"', "'") + '"'
def table(block):
    rows = [l.strip().strip('|').split('|') for l in block.split('\n') if l.strip().startswith('|')]
    rows = [[c.strip() for c in r] for r in rows]
    return rows[2:] if len(rows) > 2 else []
def sect(title, level='##'):
    m = re.search(r'^' + level + r' ' + re.escape(title) + r'\s*$(.*?)(?=^#{1,%d} |\Z)' % len(level), brief, re.S | re.M)
    return m.group(1) if m else ''
MONTHS = {'jan':1,'feb':2,'mar':3,'apr':4,'may':5,'jun':6,'jul':7,'aug':8,'sep':9,'oct':10,'nov':11,'dec':12}
def start_of(d):
    ys = re.findall(r'(20\d\d)', d); y = ys[0] if ys else '2020'
    ms = re.findall(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)', d)
    m = MONTHS[ms[0].lower()] if ms and d.index(ms[0]) < d.index(y) else (MONTHS[ms[0].lower()] if ms else 1)
    if d.startswith('Nov 2021 to 2024'): return '2021-11'
    return f'{y}-{m:02d}'
def clean(s):
    return (s.replace(' — ', ', ').replace('—', ',').replace('–', ' to '))

# ---- work notes from the two history tables
hist = table(sect('History', '####')); trains = table(sect('Trains of thought, things that are relevant', '####'))
FEATURED = {'Nov 2026 to Jan 2027','Jul 2025','Jun 2025','Sep 2024','May 2024','Jun 2022','Nov to Dec 2020'}
seen = {}
def work_title(txt):
    t = re.split(r'[:.,]| with | co-convened', txt)[0].strip()
    return t[:70]
for d, w, why in [(r[0], r[1], r[2]) for r in hist]:
    title = work_title(clean(w)); start = start_of(d)
    if d == 'Nov 2026 to Jan 2027': title = 'One Planet, One Humanity webinars'
    if d == 'Jul 2025': title = 'Sci-fi economics wiki and the scifigraph extractor'
    if d == 'Jun 2025': title = 'Six plus one concepts for writers'
    if d == 'Mar 2025': title = 'The Great Retrofit world'
    if d == 'Feb 2025': title = 'Sci-Fi Economics Lab staging site'
    if d == 'Sep 2024': title = 'Sci-Fi Economics at ASU'
    if d == 'May 2024': title = 'Science Fiction Economics Residency in Messina'
    if d == 'Nov 2023': title = 'Space Economy Camp'
    if d == 'Oct 2022': title = 'Green Economies That Don\'t Exist, But Could'
    if d == 'Jun 2022': title = 'Witness at the Futures Conference'
    if d.startswith('Aug to Nov 2021'): title = 'Witness the card game'
    if d == 'Apr 2021': title = 'Worldbuilding Festival'
    if d == 'Nov to Dec 2020': title = 'Messina papers and the Worldbuilding Academy'
    if d == 'Jan 2020': title = '2020 warmup: the wiki and a zero-growth Goodwin model'
    if d == '2019': title = 'The Lab is prototyped and launched'
    fn = f'work/{start}-{slug(title)[:48]}.md'
    feat = 'true' if d in FEATURED and 'Witness the card game' not in title else 'false'
    write(fn, dict(title=q(title), type='work', stage='sapling', status='working', summary=q(clean(w)[:230]), period=q(d), start=start, why_it_matters=q(clean(why)), featured=feat, tags='[history]'),
          f'{clean(w)}\n\nWhy it matters to the site: {clean(why)}\n\nThis note is a stub from the design brief. Add what was built, who took part, what the model said and links to the sources.')
for d, who, w, why in [(r[0], r[1], r[2], r[3]) for r in trains]:
    title = work_title(clean(w)); start = start_of(d)
    if 'Colombo' in w: title = 'The Colombo That Might Have Been'
    if w.startswith('Transition design'): title = 'Transition design, a TEDxBolognaSalon talk'
    if w.startswith('Watchdog'): title = 'Watchdog relaunches as an open-source collective'
    if w.startswith('Dialogue with Shata'): title = 'Dialogue on the right to the future'
    if w.startswith('Instructor'): title = 'Winter School for Agent-Based Modeling'
    if w.startswith('"Beyond'): title = 'Beyond the Pyramid'
    if w.startswith('Network papers'): title = 'Network papers on online communities'
    if w.startswith('Agent-based models published'): title = 'Agent-based models released on CoMSES'
    if w.startswith('A first-person'): title = 'GlocalCamp 2017 report'
    fn = f'work/{start}-{slug(title)[:48]}.md'
    write(fn, dict(title=q(title), type='work', stage='seedling', status='working', summary=q(clean(w)[:230]), period=q(d), start=start, partners=q(who), why_it_matters=q(clean(why)), featured='false', tags='[thread]'),
          f'{clean(w)}\n\nBy {who}. Why it matters to the site: {clean(why)}\n\nStub from the design brief.')
# the Colombo note is a showcase; mark featured by hand later if wanted
# ---- showcase items that are not in the history table
write('work/2021-11-witness.md', dict(title=q('Witness'), type='work', stage='sapling', status='working', summary=q('An open-source seasteading megacity with twelve Distrikts, a card game about governing imaginary societies through crises, and the 2024 Witnesspedia.'), period=q('Nov 2021 to 2024'), start='2021-11', why_it_matters=q('The Lab\'s proof that fiction and economics can be played, with the open-source stance already in place.'), featured='true', tags='[showcase]'),
      'Witness is the existing proof that fiction and economics can be played. See also [[2022-06-witness-at-the-futures-conference]] and [[2021-08-witness-the-card-game]].')

# ---- people
people = {
 'Alberto Cottica': ('Economist; reads online communities as networks. Edgeryders leadership group; UNDP Accelerator Labs.', 'Participatory research community, network methods, coalition building, inroads into the UN structure.'),
 'J M (Joffa) Applegate': ('Complexity and evolutionary economist at ASU; builds agent-based models such as the General Housing Model.', 'Generative agent-based models, economic theory, inroads into adjacent communities from game development to maths.'),
 'Azzurra Spirito': ('Designer and trainer in transformative innovation: system design, futures and foresight.', 'Cooperation processes that connect public institutions with communities and private partners; project structuring from urban regeneration to healthcare.'),
 'Yudhanjaya Wijeratne': ('Sri Lankan author, programmer and data scientist; co-founded Watchdog; builds playable simulations.', 'Science fiction, data science, game design, playable simulations, inroads into Sri Lankan policymaking.'),
}
for name, (summ, strengths) in people.items():
    fn = 'people/' + slug(name.replace('(Joffa) ', '')) + '.md'
    m = re.search(r'\*\*' + re.escape(name.split(' (')[0]) + r'.*?\*\*(.*?)(?=\n\n|\Z)', brief, re.S)
    para = clean(m.group(0).replace('**', '')) if m else summ
    write(fn, dict(title=q(name.replace(' (Joffa)', '')), type='person', stage='sapling', status='working', summary=q(summ), role=q('Principal'), tags='[principal]'),
          f'{para}\n\n## What they bring\n\n{strengths}\n')
# ---- brief pages
def brief_note(rel, title, body, summ):
    write(rel, dict(title=q(title), type='note', stage='sapling', status='working', summary=q(summ), tags='[brief]'), clean(body))
brief_note('brief/background.md', 'Background', sect('Background').split('### Current lab work')[0], 'Where the Lab came from and who leads it.')
brief_note('brief/goals.md', 'Design goals and non-goals', sect('Design goals and non-goals'), 'What the site must achieve and what it will not do.')
brief_note('brief/audiences.md', 'Audiences', sect('Audiences'), 'Who the site is for and what each audience should believe after a visit.')
brief_note('brief/messaging.md', 'Messaging', sect('Messaging'), 'The four layers of the Lab\'s message and the proof the site must show.')
brief_note('brief/style.md', 'Style and tone', sect('Style and tone'), 'Plain words: what to say and what to avoid.')
brief_note('brief/journey.md', 'User journey', sect('User journey'), 'How a visitor moves from the landing page to Work with us.')
brief_note('brief/inspiration.md', 'Design inspiration', sect('Design inspiration'), 'Sites and tools that shaped the look and the garden idea.')
brief_note('essays/policy-on-opinion-essays.md', 'Policy on opinion essays', sect('Addons'), 'Opinion pieces are published under the author\'s name and labelled.')
brief_note('brief/prototypes.md', 'Prototype rounds', sect('Landing page prototypes'), 'What rounds one and two tested, and what round three changes.')
print('ok')
