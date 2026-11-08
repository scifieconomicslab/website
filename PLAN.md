---
title: "Prototype v3: build plan"
author: Claude, for Yudhanjaya Wijeratne
date: 2026-11-02
type: build-plan
status: draft
supersedes: prototypes-v2
---

# Prototype v3: build plan

This document is written so that any capable LLM (or person) can build prototype v3 from it without further conversation. Read section 0 first, then build in the order of section 12. Where a number appears, it is the number to use. Where a choice was open, section 14 records what was chosen and why.

## 0. What this is, in brief

Prototype v3 is a static site, edited entirely as Markdown in Obsidian, with three things the v2 prototypes did not have:

1. A landing page whose centrepiece is the town from v2 prototype 1, now driven by a small real economic model. The visitor sets rent, income tax and a shared government budget. Sunshine, rain, storms and market shocks happen to the town and are outside the visitor's control. A fake news ticker reports what the model does, as headlines, company moves and opinions from residents.
2. A second panel directly under it: a scroll-pinned flowchart of how the Lab works with a place, drawn in the same hand-inked style as the town. It replaces the Art Nouveau panels of v2 prototype 4 in look, and keeps their job (a pinned picture that builds up as you scroll).
3. A heritage page: a tree showing where the Lab's ideas come from, driven by one small Markdown file per node so metadata can be added in seconds.

All of the design brief, and every source we link to, becomes a Markdown page inside the same vault.

### Interpretation to confirm

The request says "the flowcharts of noveau panels should be the second panel". This plan reads that as: take the pinned, scroll-built panel from `p4-nouveau.html` (the arched window that draws a picture in stages) and the method statechart from `prototypes/statechart/choice/chart.mmd`, and combine them into one pinned flowchart panel restyled to match the town. If the intent was the graph panel from `p4b-nouveau-garden.html` (notes as buds on a vine), swap section 5 for that panel. The rest of the plan does not change.

## 1. Feedback this plan answers

| Feedback | Where it is handled |
|---|---|
| Everybody loves the town visualization in prototype 1 | Section 4.3 keeps it and extends it |
| The model must be economic; natural elements become outside events | Sections 6, 7 and 8 |
| Sliders: average rent, income tax, a shared budget across infrastructure, education, justice, public transport and more | Section 6.2 |
| A miniature economic sim with a fake news ticker | Sections 6 to 9 |
| Nouveau flowcharts as the second panel, matched to the town | Section 5 |
| Opening messaging is perfect | Section 4.2 (used verbatim) |
| Heritage page as a tree, quick to add metadata | Section 10 |
| All linked material as Markdown pages, easily editable in Obsidian | Sections 3 and 11 |

## 2. Goals, non-goals, tests

Goals carry over from the design brief (60 second comprehension, interactive demo above the fold, Markdown-only publishing, Obsidian-native, garden behaviour, free hosting). Added for v3:

| Goal | Test |
|---|---|
| The town is an economy, not a weather toy | A visitor who only touches rent, tax and the budget pool can make unemployment, population and the mood index move in both directions within 60 simulated months |
| The model is explainable in one breath | The "How this works" drawer fits on one screen at 1280 by 800 and lists no more than 12 causal links |
| The model is reproducible | The JavaScript port reproduces `model/golden.json` (generated from `reference_model.py`) to within 1e-9 on every field, for every tick of the default run and of the three scenario runs |
| The tree page is fast to feed | Adding a node takes one new file with 5 frontmatter lines, or one line in the inbox file (section 10.4) |
| Everything is a page | No fact on the landing page, method panel or heritage page exists only in HTML. Each links to a Markdown note that holds it |

Non-goals for v3: accounts, comments, forms that send data, server-side simulation, a calibrated model of any real place, multiplayer, saving a game. The "bring us a town and a problem" form from v2 stays a mailto link with a prefilled subject.

## 3. Architecture

### 3.1 Repository layout

The repository root is the Obsidian vault. Site code lives in `.site/`, a dot folder, which Obsidian ignores.

```
prototype-v3/
  PLAN.md                        this file
  README.md                      two paragraphs: what this is, how to edit
  .obsidian/                     committed minimal settings (section 11.5)
  .github/workflows/pages.yml    build and deploy
  .site/
    eleventy.config.js
    package.json
    layouts/                     base.njk, note.njk, landing.njk, heritage.njk
    assets/
      css/tokens.css             design tokens (section 4.1)
      fonts/                     self-hosted Fraunces, Figtree, IBM Plex Mono (woff2)
      js/model.js                the economic model (port of reference_model.py)
      js/ticker.js               headline engine
      js/sim-ui.js               sliders, pool, charts, clock
      js/method-panel.js         pinned flowchart
      js/heritage.js             tree interactions
      figures/town.html          extended v2 town figure (section 4.3)
    plugins/
      wikilinks.js               [[links]] and ![[embeds]]
      backlinks.js               backlink collection
      heritage-tree.js           builds tree JSON from heritage notes
      inbox-expand.js            expands the heritage inbox file
  model/
    reference_model.py           the reference implementation (shipped with this plan)
    golden.json                  generated: python reference_model.py --golden
    tests.md                     the acceptance tests in section 6.9
  index.md                       landing page copy and featured links (frontmatter driven)
  method/                        notes
  models/                        notes
  concepts/                      notes
  places/                        notes
  work/                          history and showcase, one note per entry
  people/                        the four principals
  essays/                        opinion pieces, labelled
  heritage/                      one note per node of the tree
  sources/                       archived stubs for every external link
  brief/                         the design brief, split into notes (section 11.2)
  templates/                     note templates for Obsidian
  _inbox/                        quick-capture files, never published as pages
```

### 3.2 Build tool

Use Eleventy 3 with GitHub Actions. Contributors only commit `.md` files. No tooling is needed on their machines.

Reasons, so a later reader can overturn the choice: wikilinks, backlinks and a heritage tree all need custom code whichever generator is used, and Eleventy lets that code be a few dozen lines of JavaScript in the same language as the simulation. Jekyll on GitHub Pages cannot run custom plugins without a Pages workflow, so it gains nothing here. Quartz is Obsidian-native but would constrain the hand-built landing page. Fonts are self-hosted so the site makes no third-party requests.

### 3.3 Page types and frontmatter

Every note carries these fields. The first four are required.

```yaml
---
title: Plain title
type: note | person | work | model | place | concept | essay | source | heritage | method
stage: seedling | sapling | evergreen        # growth stage
status: speculative | working | settled      # epistemic status
tags: []
summary: One sentence, used on cards and in link previews.
featured: false                              # true puts it on the landing page
thread: https://...                          # optional Edgeryders thread
date: 2026-11-02                             # optional
---
```

Type-specific fields:

| Type | Extra fields |
|---|---|
| person | `role`, `site`, `links` |
| work | `period` (text), `start` (YYYY-MM), `end`, `partners`, `why_it_matters` |
| model | `repo`, `demo`, `data`, `calibrated: true/false` |
| place | `country`, `decision`, `what_the_model_said` |
| essay | `author`, `opinion: true` (renders the "Opinion essay" label, required for Applegate pieces) |
| source | `url`, `accessed`, `archived: true/false`, `author`, `published` |
| heritage | see section 10.2 |
| method | `step` (1 to 8, matches the flowchart node) |

### 3.4 Wikilinks, backlinks, embeds

Support `[[note]]`, `[[note|label]]`, `[[note#heading]]`, `![[image.png]]` and `> [!note]` callouts. Resolve by filename without folders (Obsidian's default "shortest path" behaviour). A link that does not resolve renders as plain text with a `data-missing` attribute, and the build prints a warning list. Each note page ends with a Backlinks block, the stage and status badges, and the Edgeryders thread link when present.

## 4. Page one: the landing page

### 4.1 Design tokens

Reuse the v2 prototype 1 tokens exactly. Everything on the page, including the flowchart panel and the heritage tree, draws from them.

```css
:root{
  --paper:#f3efe3; --ink:#1d261c; --green:#2f6b45; --leaf:#7bb84a;
  --sun:#f0b429;   --sky:#3f9fe0; --rust:#cf5038; --mute:#6d7467;
  --line:#d9d3bf;  --card:#fbf8ee;
  --serif:'Fraunces',Georgia,serif;
  --sans:'Figtree',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,monospace;
}
```

Rules: serif for headings, sans for body, mono for labels, numbers and the ticker. Panels are `--card` with a 1px `--line` border and 14px radius. Hand-inked line work uses `--ink` at 2px with round caps. Colour carries meaning in the sim: sky for water and weather, sun for energy and sunshine, leaf for growth, rust for stress and warnings, green for public money.

### 4.2 Section order

1. **Header bar.** Logo, then Run the town, How we work, Heritage, Work with us, People.
2. **Hero.** Left column, the opening message, verbatim. Right column, the town figure.
3. **The town deck.** Controls, readouts, ticker, charts (section 4.4).
4. **Panel two.** The method flowchart (section 5).
5. **Our work.** Featured notes from `work/`, `places/` and `models/`, as cards. Ends with a link into the garden index.
6. **Heritage teaser.** A small static render of the tree with the line "Where our ideas come from", linking to `/heritage/`.
7. **Work with us.** The four offers from the brief and one contact address.
8. **People.** The four principals, from `people/`.
9. **Footer.** Edgeryders link, licence.

Hero copy, verbatim from the feedback:

> **An economy is a set of rules a society chose.**
> We help a place see its options, test them and tell the story of living in them before it commits.
>
> - Models you can run, with sliders, built on complexity economics.
> - Science fiction that makes the choices visible.
> - Software, community ideas and engagements that carry the message.
> - Work on a policymaker's actual problem.

The text lives in `index.md` frontmatter (`hero_title`, `hero_lede`, `hero_points`) so it can be edited without touching HTML. Under it, two buttons: "Run the town" (anchors to the deck) and "Bring us a town" (mailto).

On a 1280 by 800 screen the hero text, the town and the top row of sliders must all be visible without scrolling.

### 4.3 The town figure

Keep the hand-inked isometric solarpunk town from `prototypes-v2/figures/solarpunk-town-figure.html`, loaded in an iframe as in `p1-town.html`. The parent page talks to it with `postMessage`. v2 sent `{sun, rain, H}` and `{storm:true}` and `{reset:true}`. v3 sends one object per tick:

```js
{ w: 1.00,        // weather index W, 0.7 to 1.15; drives sun glow, grass colour, cloud cover
  homes: 12,      // dwellings drawn: round(Hs / 1050 * 12), clamped 6 to 20
  lit: 0.95,      // share of homes with lit windows: min(1, N / Hs)
  shops: 8,       // open shopfronts (equals firm count, 8 in v1)
  jobs: 0.93,     // E / (workers) used to set how many people are walking to work
  infra: 1.00, transit: 1.00, edu: 1.00, just: 1.00, health: 1.00,   // service stocks
  event: null }   // 'drought' | 'storm' | 'bumper' | 'cargo' | null, one-shot
```

Visual mappings the implementer must add to the figure (read the figure source first; its internal structure was not inspected when this plan was written):

| Model value | What the town shows |
|---|---|
| W below 0.9 | Grass fades from leaf green to straw, cistern level drops, sun rays shorten |
| W above 1.05 | Greener grass, taller crops in the garden beds |
| infra below 0.8 | Cracks drawn on roads, one lamp flickering |
| infra above 1.3 | Extra street lamps, a second wind turbine |
| transit | Number of bus dots on the road: 0 below 0.4, 1 below 0.9, 2 below 1.3, 3 above |
| edu | School building window light, 0 to 3 windows lit; a small book icon above 1.3 |
| just | A courthouse lamp; below 0.6 the lamp is out and a shutter is down on one shop |
| health | A clinic cross, glowing above 1.1, dim below 0.7 |
| lit | Windows lit in proportion; below 0.9 some homes dark; crowding (N above Hs) draws tents beside the glasshouse |
| shops | Open shop awnings; a closed shop shows a rust X |
| event storm | Existing storm animation, then one roof tile and one lamp damaged |
| event drought | Rain stops, cistern drains, dust particles |
| event cargo | A ship sails past the harbour without stopping |
| event bumper | Crates stack on the quay |

The old sunshine, rain and household sliders are removed from the page. Power, water and food gauges are removed; their place is taken by the economic readouts below.

### 4.4 The town deck

Layout at desktop width: three columns above one wide strip.

```
+---------------------+--------------------------+-------------------------+
| YOU DECIDE          | THE TOWN NOW             | OUTSIDE YOUR CONTROL    |
| Rent        [----o] | Mood            50 /100  | Weather   [meter] clear |
| Income tax  [--o--] | People          1,000    | Market    [meter] normal|
| Budget pool         | Jobs            93.3 %   | [Drought][Storm]        |
|  infrastructure  25%| Average wage    100      | [Bumper harvest][Ship   |
|  education       25%| Rent as share   30 %     |  leaves] [Random: off]  |
|  justice         15%|  of wage                 |                         |
|  public transport15%| Budget / month  18,878   +-------------------------+
|  health & care   20%| Homes occupied  95 %     | Clock  Year 1 Month 1   |
|                     | Owner/worker    1.05     | [Play][Pause][1x 2x 4x] |
|                     |  income ratio            | [Restart] [Scenario v ] |
+---------------------+--------------------------+-------------------------+
| TICKER:  Hollow Bay Courier  |  VOICE  "..."  |  BIZ ...  |  SKY ...      |
+------------------------------------------------------------------------+
| Chart: people and jobs     | Chart: five service stocks | Pool as stack |
+------------------------------------------------------------------------+
| How this works (collapsible drawer, 12 links)                          |
+------------------------------------------------------------------------+
```

Mobile: single column in this order: town, clock row, You decide, ticker, The town now, Outside your control, charts, drawer.

Town name: **Linden Cove** (placeholder, set in `index.md` as `town_name`).

## 5. Panel two: the method flowchart

### 5.1 What it shows

The Lab's method as a checked state machine, from `prototypes/statechart/choice/chart.mmd`. Eight states and nine arrows:

| Step | State | Edge to next | Linked note |
|---|---|---|---|
| 1 | A problem is felt | we name the problem together | [[method/problem]] |
| 2 | Options on the table | we build a model you can run | [[method/options]] |
| 3 | Model running, sliders in hand | branches: the option fails on paper, or the option holds | [[method/model]] |
| 4 | Model fails | try another option (loops back to step 2) | [[method/failure]] |
| 5 | Model holds | we tell the story of living in it | [[method/holds]] |
| 6 | The story is told | the town decides | [[method/story]] |
| 7 | The town commits | life goes on | [[method/commit]] |
| 8 | Living with the choice | end | [[method/living]] |

Two rules were model-checked in TLA+ (`TestBeforeCommit`, `StoryBeforeCommit`), plus `NoDeadlock`. The `rushed` variant adds a shortcut from "Options on the table" straight to "The town commits" and breaks both rules in two steps. The panel shows this as its last beat.

### 5.2 Look

Match the town, not Art Nouveau. Paper background, `--ink` hand-drawn rounded rectangles with a slightly uneven stroke (apply an SVG `feTurbulence` plus `feDisplacementMap` filter at scale 1.5 so lines wobble like the town), state fill from the palette: problem in `--rust` tint, options in `--sky` tint, model in `--leaf` tint, fail in `--rust` tint, hold in `--green` tint, story in `--sun` tint, commit in `--green`, living in `--leaf`. Labels in Fraunces 600, edge captions in IBM Plex Mono 12px. Each node carries a tiny town icon drawn in the same line style (a lone house with a question mark, a table with cards, the town with a slider, a cracked wall, a house with a check, a book, a signed document, the town at dusk with lit windows).

### 5.3 Behaviour

A pinned section 420vh tall (use `position: sticky`). Scroll progress p from 0 to 1 drives stages:

| p range | What appears |
|---|---|
| 0.00 to 0.10 | Caption "Every place starts here." Step 1 draws in |
| 0.10 to 0.25 | Steps 2 and 3 draw, with the edges animated as dashes travelling along the path |
| 0.25 to 0.40 | The fork at step 3. Step 4 draws, and the loop back to step 2 draws as a curved arrow. Caption: "Most options fail on paper. That is the cheapest place to fail." |
| 0.40 to 0.60 | Step 5, 6 and 7 draw. Caption: "The story comes before the decision." |
| 0.60 to 0.70 | Step 8, then a pulse runs the whole happy path once |
| 0.70 to 1.00 | The rushed variant: a rust arrow draws from step 2 to step 7. Two chips pop up, "Skipped the test" and "Skipped the story", with the line "We checked this. A shortcut breaks both rules in two steps." Then the arrow fades |

Clicking or focusing a node (outside the pinned range, or after p passes 1) opens a side card with the linked note's `summary` and an "Open note" link. Keyboard: Tab moves between nodes. With `prefers-reduced-motion`, show the finished chart statically with the captions as a numbered list below it.

### 5.4 Data source

Build the chart from the `method/` notes. Each note has `step`, `next` (list of step numbers), `edge_label` (list), `state_label`, `icon` (a name from `.site/assets/icons.svg`). The layout is fixed in `method-panel.js` as coordinates for eight nodes on a 1000 by 560 viewBox, so adding a note updates text but not geometry. Node coordinates (centre x, y): 1 (90,280), 2 (260,280), 3 (440,280), 4 (440,110), 5 (620,380), 6 (780,380), 7 (900,280), 8 (900,110). Node size 140 by 64.

## 6. The economic model

### 6.1 Structure: the smallest thing that is still an economy

Cast: **workers** who rent, **owners** who live off rent and dividends, **firms** that employ and sell, and a **council** that taxes and spends. One town, monthly ticks.

State, 12 numbers in total:

| Symbol | Meaning | Start |
|---|---|---|
| N | Households | 1,000 |
| E | Employed workers | 700 |
| w | Monthly wage | 100 coins |
| Hs | Dwellings | 1,050 |
| G_infra, G_edu, G_just, G_transit, G_health | Public service stocks, 1.0 means the default level | 1.0 each |
| W | Weather index | 1.0 |
| xs | Export shock multiplier | 1.0 |
| Dexp | Expected demand (smoothed) | 77,778 |

Plus `div` (last month's dividends) and `Asm` (smoothed attractiveness), two bookkeeping values. There are no other hidden variables.

The loop the visitor can feel: wages become spending, spending becomes sales, sales justify jobs. Rent is a leak to owners, who spend less of it locally. Taxes come back as services; services make workers more productive and the town more attractive; attractive towns grow, which dilutes services per household and strains housing.

### 6.2 What the visitor controls

| Control | Range | Step | Default | Unit |
|---|---|---|---|---|
| Average rent | 15 to 60 | 1 | 30 | coins per month per renting household. Display also as a share of the average wage |
| Income tax | 0 to 50 | 1 | 20 | percent, applied to wages, rent income and dividends alike |
| Budget pool | five shares summing to 100 | 1 point | 25, 25, 15, 15, 20 | infrastructure, education, justice, public transport, health and care |

**Pool mechanics (shared budget).** The pool is the month's tax take B. Each slider is a share s_k with sum 100. When the visitor moves slider i from s_i to s_i', every other share is rescaled:

`s_j' = s_j * (100 - s_i') / (100 - s_i)` for every j other than i, if s_i is below 100.

If s_i equals 100, the others are 0, and when the visitor moves i down from 100 to s_i' the freed amount is split equally. Round to whole points and push the rounding residual onto the largest other share so the total is exactly 100. Show beside each slider the coins it receives that month, `B * s_k / 100`, and draw a single stacked bar of the pool. Optional lock icon per slider: a locked share keeps its value and the others scale to fill what is left; if all others are locked, the move is refused with a shake.

Default coins per month at B = 18,878: infrastructure 4,719; education 4,719; justice 2,832; public transport 2,832; health and care 3,776.

The budget is balanced every month. There is no borrowing and no reserve (see section 14).

### 6.3 What the visitor does not control (natural and market events)

These are exogenous. They show up as buttons for demonstration and as a seeded random deck when "Random events" is on.

| Event | Immediate effect | Decay |
|---|---|---|
| Drought | W set to 0.70 | W returns toward 1 at 8 percent of the gap per month (half-life 8.3 months) |
| Bumper harvest | W set to 1.15 | same decay |
| Storm | G_infra multiplied by 0.85 | recovers only through spending (stock rule 6.4.9) |
| Ship leaves (cargo diverted) | xs set to 0.80 | returns toward 1 at 5 percent of the gap per month (half-life 13.5 months) |

Random deck, per-month probability when on: drought 0.6 percent, storm 0.8 percent, bumper harvest 0.6 percent, ship leaves 0.5 percent, at most one event per month, minimum 6 months between events. Use the seeded generator in section 8.5. Scenario presets set the seed and optionally a script:

| Scenario | Script |
|---|---|
| Calm | No events |
| A hard decade | Drought month 14, storm month 31, ship leaves month 52, bumper harvest month 80 |
| Random (default) | Seeded deck, seed shown on screen and in the URL as `?seed=` |

### 6.4 Equations, in the order the code evaluates them each tick

All symbols are defined in 6.1 and 6.5. A subscript 0 means the steady-state value from 6.6.

1. **Households.** Owners `n_own = 0.25 N`. Workers `n_w = N - n_own`.
2. **Productivity.** `svc = G_infra^0.24 * G_edu^0.40 * G_health^0.16`. Output per worker `y = Y0 * W^0.4 * svc`, with `Y0 = 111.111`. Firm overhead per firm `ovh = 500 / G_just^0.15`.
3. **Hiring.** Workers needed at normal weather `E* = Dexp / (Y0 * svc)`. Unemployed pool `U = max(0, n_w - E)`. Matching rate `mu = 0.5 * G_transit^0.3`. Desired change `dE = 0.25 * (E* - E)`. If `dE > 0` then `dE = min(dE, mu * U)`. New `E = max(0, E + dE)`. Capacity `cap = E * y`. Unemployment `u = clamp((n_w - E) / n_w, 0, 1)`.
4. **Wage.** Target `w* = 0.90 * y * (1 + (u_star - u))`, with `u_star = 0.0667`. Then `w = w + 0.10 * (w* - w)`. Wage bill `WB = E * w`.
5. **Housing and rent.** Renters `R = max(0, min(n_w, Hs - n_own))`. Rent paid `RP = rent * R`. Owner income `IO = RP + div`.
6. **Tax.** `T = tax * (WB + IO)`. This is the pool: `B = T`.
7. **Demand.** Worker consumption `CW = max(0, 0.90 * (WB * (1 - tax) - RP))`. Owner consumption `CO = 0.50 * IO * (1 - tax)`. Council local spending `CG = 0.80 * T`. Exports `X = X0 * xs * W^0.5 * G_transit^0.1 * svc^1.0`. Total demand `D = CW + CO + CG + X`. Then `Dexp = Dexp + 0.5 * (D - Dexp)`.
8. **Sales and profit.** `sales = min(D, cap)`. `profit = sales - WB - 8 * ovh`. `div = 0.5 * max(0, profit)` (paid next tick).
9. **Public stocks.** For each service k, the spending index `x_k = (B / N * s_k) / (BPC0 * s0_k)` where `s0_k` are the default shares and `BPC0 = 18.878`. Then `G_k = G_k + delta_k * (x_k - G_k)`, with delta infra 0.02, education 0.01, justice 0.05, transport 0.06, health 0.04. These are half-lives of 34, 69, 14, 11 and 17 months. Read "G_k" as the smoothed per-household spending on k relative to the default.
10. **Housing supply.** If `rent > 30`: `Hs = Hs * (1 + 0.003 * min(2, 3 * (rent - 30) / 30))`. Else: `Hs = Hs * (1 - 0.001 * min(2, 3 * (30 - rent) / 30))`. Floor `Hs >= 0.7 N`.
11. **Migration.** Post-tax post-rent income per worker `inc = (WB * (1 - tax) - RP) / n_w`. Living standard `Q = inc / 44.667`. Service level `S = sum(s0_k * G_k)`. Crowding `c = max(0, (N - Hs) / N)`. Attractiveness `A = 0.35 (Q - 1) + 0.50 (S - 1) - 1.0 c - 0.4 (u - u_star)`. Smoothed `Asm = Asm + 0.15 (A - Asm)`. New `N = max(200, N * (1 + 0.004 * tanh(3 * Asm)))`. So the town can change by at most 0.4 percent per month.
12. **Exogenous decay.** `W = 1 + 0.92 (W - 1)`; `xs = 1 + 0.95 (xs - 1)`.
13. **Mood index** (0 to 100, default 50): `mood = 50 * (0.4 * clamp(Q,0,2) + 0.3 * clamp(1 - 4 (u - u_star), 0, 1.3) + 0.3 * clamp(S, 0, 2))`.

### 6.5 Constants table

| Name | Value | Role |
|---|---|---|
| N0 | 1,000 | Starting households |
| OWN | 0.25 | Owner share of households |
| E0 | 700 | Starting employment |
| W0 | 100 | Starting wage |
| LS | 0.90 | Labour share of output |
| Y0 | W0 / LS = 111.111 | Base output per worker |
| MPCW | 0.90 | Workers' local spending propensity |
| MPCO | 0.50 | Owners' local spending propensity |
| GLOC | 0.80 | Share of the budget spent locally |
| DIVSH | 0.50 | Share of profit paid out |
| OVH, F | 500, 8 | Overhead per firm, number of firms |
| T0, R0, HS0 | 0.20, 30, 1,050 | Default tax, rent, dwellings |
| EPS | infra 0.24, edu 0.40, health 0.16 | Productivity elasticities |
| Justice elasticity | 0.15 on overhead | Cheaper disputes, fewer losses |
| Transit | 0.30 on matching, 0.10 on exports | Wider labour market |
| MIG | 0.004 | Maximum monthly population change |
| AQ, AS, AC, AU | 0.35, 0.50, 1.0, 0.4 | Migration weights |
| XP | 1.0 | Export demand rises with local productivity |

### 6.6 Calibration (derived, so the default is a true steady state)

Start from the intended picture: 1,000 households, 750 of them workers, 700 employed, wage 100, rent 30, tax 20 percent, eight firms.

| Quantity | Formula | Value |
|---|---|---|
| Capacity | 700 * 111.111 | 77,777.8 |
| Wage bill | 700 * 100 | 70,000 |
| Rent paid | 750 * 30 | 22,500 |
| Profit | 77,777.8 - 70,000 - 8 * 500 | 3,777.8 |
| Dividends | 0.5 * profit | 1,888.9 |
| Owner income | 22,500 + 1,888.9 | 24,388.9 |
| Tax take B0 | 0.2 * (70,000 + 24,388.9) | 18,877.8 |
| Worker consumption | 0.9 * (70,000 * 0.8 - 22,500) | 30,150 |
| Owner consumption | 0.5 * 24,388.9 * 0.8 | 9,755.6 |
| Council local spend | 0.8 * 18,877.8 | 15,102.2 |
| Exports X0 | 77,777.8 - 30,150 - 9,755.6 - 15,102.2 | 22,770 |
| Income per working renter | (70,000 * 0.8 - 22,500) / 750 | 44.667 |
| Budget per household BPC0 | 18,877.8 / 1,000 | 18.878 |
| Rent burden | 30 / (100 * 0.8) | 37.5 percent of take-home pay |
| Vacancy | (1,050 - 1,000) / 1,050 | 4.8 percent |

The exports figure is the only free number the circular flow needs. It says the town earns 29 percent of its sales from outside, which is realistic for a small port. With these values the default run stays exactly at its starting point for all 120 ticks (acceptance test T1).

### 6.7 What each lever does, in plain words

Use this text in the "How this works" drawer.

1. Higher rent moves money from workers to owners, who spend less of it in town, so shops sell less.
2. Higher rent also lowers what workers keep, so fewer people move in and some leave.
3. Rent above 30 draws builders in; rent below 30 slowly starves the housing stock, so cheap rent first fills the town and then crowds it.
4. Higher income tax lowers take-home pay immediately and funds services slowly.
5. Education works slowest (half-life about 69 months) and lifts wages the most.
6. Infrastructure keeps output per worker up and is what storms damage.
7. Health and care keeps output per worker up at a smaller effect.
8. Justice cuts business overhead and makes the town safer to run a shop in.
9. Public transport lets the unemployed find jobs faster and helps exports.
10. Rain, sun and storms change how much the town can produce and sell.
11. A ship that leaves takes a slice of export demand with it for about a year.
12. More people dilute the budget per household, so growth is not free.

### 6.8 Measured behaviour of the reference implementation

Month-120 results from `model/reference_model.py` in calm weather. Mood is 0 to 100. This table is the baseline the implementer must reproduce, then improve per 6.10.

| Run | Mood y5 | Mood y10 | People y10 | Jobs y10 | Unemployment y10 |
|---|---|---|---|---|---|
| Default | 50.0 | 50.0 | 1,000 | 700 | 6.7 % |
| Tax 10 | 48.0 | 43.5 | 849 | 728 | 0.0 % |
| Tax 15 | 53.6 | 51.7 | 968 | 753 | 0.0 % |
| Tax 25 | 45.4 | 36.2 | 984 | 580 | 21.5 % |
| Tax 30 | 44.8 | 31.1 | 1,042 | 546 | 30.1 % |
| Tax 40 | 46.5 | 37.6 | 1,189 | 554 | 37.9 % |
| Rent 20 | 63.6 | 64.1 | 1,137 | 852 | 0.0 % |
| Rent 25 | 62.3 | 64.1 | 1,152 | 863 | 0.1 % |
| Rent 35 | 16.6 | 12.0 | 720 | 379 | 29.8 % |
| Rent 40 | 12.5 | 16.7 | 686 | 389 | 24.3 % |
| Education 45 % of pool | 41.6 | 39.7 | 865 | 566 | 12.8 % |
| Infrastructure 45 % | 40.0 | 28.2 | 845 | 502 | 20.8 % |
| Justice 40 % | 55.3 | 51.3 | 1,058 | 777 | 2.0 % |
| Public transport 40 % | 56.6 | 54.4 | 1,088 | 816 | 0.0 % |
| Health and care 40 % | 35.5 | 15.8 | 811 | 424 | 30.3 % |

Other measured facts: a drought in month 12 lifts unemployment to a peak of 28 percent; setting public transport to 0 percent pushes unemployment above 50 percent; a rent of 20 pulls population to 1,087 by month 60; a rent of 40 pushes it down to 859.

**Reading this honestly.** The model passes eight direction tests, and it is too fragile. Moving rent from 30 to 35, or moving 15 points of the pool into health, throws the town into a slump that a visitor would read as a bug. Also, low rent is rewarded too much (mood 64), and the default budget split is not near a good split (public transport and justice beat it). The cause is a demand-led jobs rule with no price adjustment: when demand dips, firms shed workers, wages fall, demand dips again. This is a real property of Keynesian models and is useful for the story, but the outer edges of every slider should hurt, and the middle 60 percent of each slider should feel like a trade-off, not a cliff.

### 6.9 Acceptance tests for the model (also written to `model/tests.md`)

Direction tests (all pass today):

- T1 The default run is stationary: N, E, w and B stay at 1,000, 700, 100 and 18,877.8 for 120 ticks (tolerance 1e-9).
- T2 Tax 10 gives service level S below 0.7 at month 120; tax 35 gives S above 1.2.
- T3 Tax 5 and tax 35 both give mood below the default's 50 at month 120.
- T4 Rent 20 gives N above 1,050 at month 60.
- T5 Rent 40 gives N below 900 at month 60.
- T6 Public transport at 0 percent of the pool gives unemployment above 30 percent at month 120.
- T7 A drought at month 12 drives unemployment above 15 percent at some point in months 12 to 36.
- T8 A storm at month 12 cuts G_infra below 0.9 at month 12.

Robustness tests (do not pass today; they are the work of phase 1):

- R1 In calm weather, for rent in 22 to 38 and tax in 12 to 28 and any single pool share in 10 to 35 percent, mood at month 60 stays between 30 and 70.
- R2 Mood at month 60 as a function of tax is single-peaked with its peak between 14 and 24 percent, falls to between 20 and 40 at tax 0 and at tax 50, and never changes by more than 12 points between adjacent whole-percent tax values.
- R3 Rent 20 gives a higher month-60 population than rent 30, but a lower month-120 mood than month-60 mood (cheap rent buys a boom, then crowding bites). Rent 45 gives mood below 35 at month 60.
- R4 No single drought, storm, ship or harvest takes mood below 25 at any month in the 36 months after it, from the default settings.
- R5 A grid of 7 by 7 by 5 runs (rent, tax, one share) finishes in under 2 seconds in the browser, so the page can precompute a mood heatmap if wanted.
- R6 Unemployment never exceeds 45 percent and population never falls below 400 in any grid run.

### 6.10 Tuning guide for phase 1

Change one knob at a time and rerun the sweep in 6.8 plus R1 to R6. In order of expected benefit:

1. Make firing slower than hiring: replace `dE = 0.25 * (E* - E)` for negative `dE` with `0.12 * (E* - E)`. This damps the downward spiral.
2. Put a floor under wages: `w* = max(0.75 * 100, ...)` and let the floor rise with `G_edu`. Prevents wage collapse from feeding demand collapse.
3. Add an automatic stabiliser: when `u` exceeds 0.10, increase `CG` by `0.5 * (u - 0.10) * T`, representing unemployment support paid from the existing pool. Document it in the drawer if used.
4. Lower the migration weight AQ from 0.35 to 0.25 if rent 35 still tips the town into a slump; the weights are meant to make rent matter within the middle range, not only at the edges.
5. Raise XP to 1.25 only if high tax is still punished more than its service benefit justifies; XP above 1.5 produced runaway booms in testing (mood near 89), so do not exceed it.
6. Rebalance the default shares if the sweep shows a share that is dominated: public transport and justice currently outperform their defaults, which suggests lowering EPS for infrastructure and health or raising the default share of transport to 0.20 and lowering infrastructure to 0.20. If this is done, recompute the default-share-dependent constants in 6.6 (only `s0_k` and the displayed coins change).
7. Keep every change inside `model.js` and `reference_model.py` in lockstep, regenerate `golden.json`, and record the change and reason in `model/CHANGELOG.md`.

## 7. The ticker

### 7.1 Principle

The ticker is the model's voice. It never invents state; it only reports numbers the model computed, in the town's own language (Sylvester's "player model": the visitor reads the story, not the equations). Three channels share one strip: **News** (the Linden Cove Courier, neutral), **Biz** (company moves), **Voice** (residents).

### 7.2 Cast (presentation layer only)

Cast members read model state and never write to it, so they add story without adding hidden variables.

Firms (8, matching F = 8), with the exposure that decides when each one gets a headline:

| Firm | Sector | Reacts to |
|---|---|---|
| Tidewater Freight | Export | X relative to X0 |
| Quay & Co. Chandlery | Export | X relative to X0 |
| Greenhouse Co-op | Farm | W |
| Kettle & Crumb Cafe | Local demand | CW + CO relative to default |
| Linden Dental | Local services | G_health, local demand |
| Hollow Print Works | Local demand | Local demand, G_just |
| Sunroof Solar | Infrastructure | G_infra, G_edu |
| Harbour Bakery | Local demand | Local demand |

Residents (6), each with a personal trigger metric:

| Resident | Role | Cares about |
|---|---|---|
| Mina Perera | Renter, shop assistant | Rent as share of take-home pay |
| Joss Okafor | Landlord, owns four flats | Rent level, tax |
| Dr Ines Moreau | Clinic doctor | G_health |
| Tomas Reyes | Bus driver | G_transit, G_infra |
| Aya Tanaka | Teacher | G_edu |
| Old Bram | Retired fisher, on the council | Budget size, G_just |

Names are placeholders and can be swapped in a `ticker/cast.md` note that the build reads (section 7.6).

### 7.3 Firm health

For each firm i compute, every tick, `h_i = a_i * (X / X0) + b_i * (local / local0) + c_i * W + d_i * (svc / 1)` where `local = CW + CO + CG`, `local0 = 55,007.8`, and the weights per firm are in `ticker/cast.md` (each row sums to 1). `h_i = 1` at the default. States: **thriving** above 1.10, **steady** from 0.90 to 1.10, **struggling** from 0.75 to 0.90, **cutting** below 0.75. A firm in cutting for 6 ticks in a row gets a closure headline and shows the rust X in the figure; the model's firm count stays 8 (the closed shop reopens when its `h_i` is above 0.95 for 6 ticks, with a "reopens" headline). This is cosmetic by design (section 14).

### 7.4 Rules

Evaluate in order each tick. Each rule has a cooldown in ticks (so it cannot repeat sooner) and a priority. At most 2 new items are queued per tick, highest priority first; the strip shows one item at a time for 5 seconds at 1x speed, scaled down with speed (1x 5 s, 2x 3 s, 4x 1.5 s), and keeps the last 6 items visible as history. Choose among a template's variants with the seeded generator so the same seed gives the same ticker.

| Rule id | Trigger | Channel | Cooldown | Priority |
|---|---|---|---|---|
| ev_drought, ev_storm, ev_bumper, ev_cargo | the event fired this tick | News | none | 10 |
| u_high | u above 0.12 and up 0.02 over 6 ticks | News | 12 | 8 |
| u_low | u below 0.03 | Biz | 18 | 5 |
| rent_squeeze | rent burden above 0.45 | Voice (Mina) | 12 | 7 |
| rent_easy | rent burden below 0.30 | Voice (Mina) | 18 | 4 |
| landlord_happy | owner/worker income ratio above 1.4 | Voice (Joss) | 18 | 5 |
| landlord_sour | ratio below 0.7 | Voice (Joss) | 18 | 5 |
| tax_bite | tax above 0.30 | Voice (Joss or Bram) | 12 | 6 |
| tax_low_services | tax below 0.12 and S below 0.8 | News | 12 | 6 |
| svc_low_k | G_k below 0.7 for one service | Voice (matching resident) | 12 each | 7 |
| svc_high_k | G_k above 1.3 for one service | Voice (matching resident) | 18 each | 4 |
| budget_swing | B up or down by more than 15 percent versus 6 ticks ago | News | 12 | 6 |
| pop_growth | N up more than 3 percent over 12 ticks | News | 18 | 5 |
| pop_loss | N down more than 3 percent over 12 ticks | News | 18 | 6 |
| crowding | N above Hs | News | 12 | 7 |
| empty_flats | (Hs - N) / Hs above 0.25 | News | 18 | 5 |
| firm_cut / firm_close / firm_reopen / firm_boom | per section 7.3 | Biz | 12 per firm | 6 |
| mood_high / mood_low | mood above 65 or below 30 | News | 24 | 6 |
| filler | nothing else queued for 4 ticks | News | 6 | 1 |

### 7.5 Templates

Variants are chosen at random from the list. `{x}` slots take the live number, rounded. Keep headlines under 100 characters. Tone: dry, plain, local.

| Rule | Variants |
|---|---|
| ev_drought | "Cistern at {pct}% as dry spell enters its first month" / "Farmers eye the sky; the sky declines to comment" |
| ev_storm | "Storm takes tiles off the harbour road; repairs due" / "Linden Cove counts the lamps lost overnight" |
| ev_bumper | "Bumper harvest fills the quay with crates" / "Greenhouse Co-op sells out of tomatoes by noon" |
| ev_cargo | "Freight line drops Linden Cove from its route" / "Ship leaves port half empty; exporters worried" |
| u_high | "{u}% out of work, the highest in {n} months" / "Job centre queue now reaches the bakery" |
| u_low | "Every shop is hiring and few can be found" / "Wages rise as workers become scarce" |
| rent_squeeze | Mina Perera: "Rent takes {pct}% of what I bring home. Something has to give, and it is my lunch." |
| rent_easy | Mina Perera: "First month I could put something aside. Rent is only {pct}% of my pay." |
| landlord_happy | Joss Okafor: "Four flats, four full. I am not complaining, which makes me nearly unique." |
| landlord_sour | Joss Okafor: "Tenants fewer and rents lower. I may take up fishing." |
| tax_bite | Old Bram: "{tax}% of every wage. The council had better have a plan for it." |
| tax_low_services | "Council cuts ribbon on nothing; budget covers little" |
| svc_low_infra | Tomas Reyes: "Potholes on the harbour road have names now." |
| svc_low_edu | Aya Tanaka: "Thirty-one in a class and one working projector." |
| svc_low_just | Old Bram: "Contracts get broken and nobody answers the phone at the court." |
| svc_low_transit | Tomas Reyes: "Buses run when they feel like it. Half my riders gave up." |
| svc_low_health | Dr Ines Moreau: "Waiting list for the clinic is six weeks. People are making do." |
| svc_high_infra | Tomas Reyes: "Roads so smooth the bus drivers have started whistling." |
| svc_high_edu | Aya Tanaka: "The students are asking harder questions than I can answer." |
| svc_high_just | Old Bram: "A shopkeeper settled a dispute in a week. A week." |
| svc_high_transit | Tomas Reyes: "Full buses, on time. I check the clock twice." |
| svc_high_health | Dr Ines Moreau: "Same-day appointments. I have forgotten what a backlog felt like." |
| budget_swing up | "Council has {delta}% more to spend this month" |
| budget_swing down | "Council budget shrinks {delta}%; the chair studies the ceiling" |
| pop_growth | "{n} new households this year; the bakery opens early" |
| pop_loss | "{n} households left Linden Cove this year" |
| crowding | "Tents appear beside the glasshouse; housing short by {n} homes" |
| empty_flats | "{n} flats stand empty; landlords advertise in the next town" |
| firm_cut | Biz: "{firm} cuts shifts as {reason}" |
| firm_close | Biz: "{firm} closes its doors" |
| firm_reopen | Biz: "{firm} reopens under new management" |
| firm_boom | Biz: "{firm} hires {n} as orders pile up" |
| mood_high | "Linden Cove ranks first for contentment in the county's only survey" |
| mood_low | "Mood at a low; the town newsletter runs out of good news" |
| filler | "Town council meeting runs 40 minutes over" / "Lost cat found; cat declined comment" |

`{reason}` for firms is chosen from the firm's largest weighted deficit: "export orders dry up", "customers stay home", "the dry spell bites", "the roads slow deliveries".

### 7.6 Data and editing

All text above lives in Markdown, not code, so it can be edited in Obsidian: `ticker/cast.md` (firms, residents, weights), `ticker/rules.md` (rule table, one row per rule), `ticker/templates.md` (one heading per rule id, one bullet per variant). The build converts them to JSON for `ticker.js`. If a template references a missing slot, drop the item and log it to the console.

## 8. Implementation notes for the sim

### 8.1 Module boundaries

`model.js` exports `createTown(seed)`, `step(town, controls)` returning a plain record, and constants. It has no DOM access. `ticker.js` takes the record history and returns headline items. `sim-ui.js` owns the clock, controls and charts. The town figure is a pure view: no model logic inside it.

### 8.2 Clock

One tick is one month. At 1x the clock advances 1 tick every 600 ms, so a 10-year term (120 ticks) takes 72 seconds. Speeds 1x, 2x and 4x. Slider changes apply at the next tick. The term ends at month 120 with a summary card: mood, people, jobs, wage, unemployment, rent burden, final service levels, and the three biggest events. Offer "Run another ten years" (continues) and "Restart".

### 8.3 Charts

Use inline SVG, no library. Chart A: people and jobs, two lines, 120 months. Chart B: five service stocks as thin lines in the five channel colours, with a dashed line at 1.0. Chart C: the pool as a stacked bar. Annotate events with small vertical ticks and a letter. Redraw per tick; keep history in a typed array.

### 8.4 Readouts and formats

| Readout | Formula | Format |
|---|---|---|
| Mood | section 6.4 step 13 | integer, with a one-word label: 0 to 25 Grim, 26 to 40 Strained, 41 to 60 Getting by, 61 to 75 Content, 76 to 100 Thriving |
| People | N | integer |
| Jobs | E / n_w | percent, one decimal |
| Average wage | w | one decimal |
| Rent share | rent / (w * (1 - tax)) | percent |
| Budget per month | B | integer with thousands separator |
| Homes occupied | min(N, Hs) / Hs | percent |
| Owner/worker income ratio | (IO / n_own) / (WB / n_w) | two decimals |

Show a small arrow next to each readout comparing with 6 ticks earlier.

### 8.5 Seeded random generator

Use mulberry32 so the JavaScript and Python versions match:

```js
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
```

The model itself is deterministic. Randomness only enters through the event deck and the ticker's variant choice. Default seed is 2026; the URL parameter `?seed=` overrides it.

### 8.6 Accessibility and performance

All controls are native `input[type=range]` with labels and `aria-valuetext` (for example "Rent, 30 coins, 30 percent of the average wage"). The ticker region is `aria-live="polite"` and announces only Priority 8 and above, so it does not flood a screen reader. Reduced motion stops the figure animations and runs the clock only when the visitor presses Play. A tick must take under 1 ms; the page must stay at 60 frames per second on a mid-range phone. Total JavaScript under 120 kB before compression, excluding the figure.

## 9. Tradeoffs we are making (and what each costs)

| Choice | Why | Cost |
|---|---|---|
| One town, 12 state variables, aggregate firms | Sylvester's minimum representation: model only what the stories need; every extra variable raises the cost of understanding | It cannot show firm-level heterogeneity, which is the strongest argument for agent-based models. The cosmetic firm layer in 7.3 hints at it without modelling it |
| Firms are aggregated, with 8 named skins that do not feed back | Keeps the loop explainable and the model deterministic | Firm closures in the ticker do not change employment; a sharp reader may notice. Flag as "illustrative" in the drawer |
| Balanced budget, no debt or reserve | Keeps "one shared pool" literal and simple | Real councils borrow and save. A reserve slider is the first extension (phase 2) |
| Demand-led jobs with fixed prices | Gives the circular flow and the multiplier, the feel of complexity economics, with one equation | No inflation, so a productivity gain shows up as fewer jobs unless exports respond (XP). This is the reason XP exists |
| Same tax rate on wages, rent and dividends | One slider for "income tax" | Hides the politics of taxing capital differently from labour; a second slider is an extension |
| Rent as a level, not a cap or a policy | A visitor understands "average rent 30" | Rent control and landlords' reactions are blurred together; the housing supply rule stands in for them |
| Services as smoothed spending indices with power-law effects | Each service has one lever and one visible effect; half-lives make education feel slow | Real services have thresholds and failure modes; power laws are smooth. Elasticities are invented, not calibrated |
| Migration capped at 0.4 percent per month | Prevents wild jumps; makes growth a 5 to 10 year story | A shock cannot empty the town in a year |
| Mood index of three terms | One number for the visitor | Weights (0.4, 0.3, 0.3) are a value judgement. Show them in the drawer and let the visitor see the three components |
| Weather appears as exogenous shocks only | Matches the feedback: natural elements are outside control | Water, sun and energy no longer have their own gauges; the figure still draws them |
| Invented units and numbers | Honest: the model is a teaching device | Must be labelled "toy model" on the page, and the Lab's real models linked next to it |
| Monthly ticks over a 10-year term | Long enough for education to matter, short enough to watch in 72 seconds | Seasonality is ignored |

Nothing in this model is calibrated to a real economy. The page must say so in plain words under the deck, and link to a model note that explains how a real place would be calibrated (data needed, how long it takes).

## 10. The heritage page

> Superseded. The page is now a three-level tree (branch, sub-branch, thinker) built from notes in `heritage/`; see `docs/editing.md`. The inbox file and the single-parent node schema below no longer exist.

### 10.1 Purpose and look

A page at `/heritage/` showing where the Lab's ideas come from, as a tree. Root at the left, labelled "The Lab". Branches spread right. Style matches the town and the flowchart: paper background, hand-inked wobble filter on lines, nodes as small cards.

Node shapes by kind: person (rounded rectangle with a small portrait-less monogram circle), work (a book spine rectangle), idea (an oval), game or software (a hexagon). Colour by branch (economics sky, cities leaf, games sun, fiction rust, unknown mute). Border style by `status`: solid for `confirmed`, dashed for `candidate`. A faint ring on the card marks growth stage as for the garden (seedling, sapling, evergreen).

Interactions: click a node to open a side card with `summary`, the quote if any, source links and the "Open note" link; hover highlights the path to the root; a filter bar for kind and status; a search box over titles. On mobile the tree collapses to nested `details` lists with the same data. A toggle shows only `confirmed` nodes.

### 10.2 Node schema (one Markdown file in `heritage/`)

```yaml
---
title: Albert O. Hirschman
type: heritage
kind: person            # person | work | idea | game | software
parent: "[[Lab]]"       # primary parent: where the tree attaches. One wikilink.
branch: economics       # economics | cities | games | fiction | other (colours the node)
year: 1970              # year of the work or idea; birth year for persons is optional
status: candidate       # confirmed | candidate
also: []                # extra influence links, drawn as dotted lines: ["[[Jane Jacobs]]"]
why: One line on how this shapes the Lab.
url: ""                 # optional primary link; a sources/ stub is created if given
stage: seedling
---
Free Markdown below the frontmatter. Quote, notes, links to Lab pages that use the idea.
```

Only `title`, `kind`, `parent` and `status` are required; everything else can be added later and the node still renders. A node with a missing or unknown `parent` attaches to a visible "Unplaced" branch and the build warns, so nothing is ever lost.

### 10.3 Seed content

The tree starts with these nodes. Nodes named by Yudhanjaya are `confirmed` as heritage sources. Ideas and works under them are `candidate` until a principal confirms them; the "why" lines are drafts to correct. Dates are from general knowledge and must be checked before publishing.

| Node | Kind | Parent | Branch | Year | Status |
|---|---|---|---|---|---|
| The Lab | root | none | none | 2019 | confirmed |
| David Graeber | person | The Lab | economics | | confirmed |
| Debt: The First 5,000 Years | work | David Graeber | economics | 2011 | confirmed |
| Albert O. Hirschman | person | The Lab | economics | | confirmed |
| Exit, Voice, and Loyalty | work | Albert O. Hirschman | economics | 1970 | confirmed |
| Jane Jacobs | person | The Lab | cities | | confirmed |
| The Death and Life of Great American Cities | work | Jane Jacobs | cities | 1961 | confirmed |
| The Economy of Cities | work | Jane Jacobs | cities | 1969 | candidate |
| Tynan Sylvester | person | The Lab | games | | confirmed |
| The Simulation Dream | work | Tynan Sylvester | games | 2013 | confirmed |
| Player model principle | idea | The Simulation Dream | games | 2013 | candidate |
| Minimum representation | idea | The Simulation Dream | games | 2013 | candidate |
| Apophenia | idea | The Simulation Dream | games | 2013 | candidate |
| Complexity economics | idea | The Lab | economics | | candidate (from the brief) |
| Antifragility (Taleb) | idea | The Lab | economics | | candidate (from the brief) |
| Goodwin growth cycle | idea | Complexity economics | economics | | candidate (the 2020 seminar covered a zero-growth Goodwin model) |
| Science fiction branch | other | The Lab | fiction | | placeholder: writers to be added |

The Simulation Dream facts above are from the article itself (Tynan Sylvester, Game Developer, 2 June 2013): the player model principle, apophenia, hair complexity, minimum representation. Add a `sources/` stub for it. The model in section 6 follows its advice, and the sim page should say so in a sentence linking to the node.

The fiction branch is deliberately empty. Provide a visible "Add a writer" affordance (a link to the template on GitHub) rather than guessing at lineage.

### 10.4 Fast metadata entry

Three ways, from quickest to richest. All produce the same node data.

1. **Inbox line.** In `_inbox/heritage-inbox.md`, add one line per node:
   `Name | kind | year | parent | branch | why | url`
   Example: `Hirschman, Strategy of Economic Development | work | 1958 | Albert O. Hirschman | economics | Unbalanced growth as method | `
   Empty fields are allowed. At build time every line becomes an in-memory node with `status: candidate`. A line starting with `!` means `confirmed`. A line starting with `#` is ignored. Unknown parent names produce a warning list in the build log.
2. **Template.** `templates/heritage-node.md`, usable with the Templater plugin, prompts for the five required fields.
3. **Full note.** Copy any existing node and edit.

When an inbox line later gets its own file in `heritage/`, the file wins and the inbox line is ignored (matching on title).

### 10.5 Build

`heritage-tree.js` reads all `heritage/*.md` plus the inbox, resolves parents by title, detects cycles (fail the build with the cycle path), computes depth and descendant counts, and emits `/heritage/tree.json`. `heritage.js` renders it as SVG with a tidy-tree layout: x by depth (160 px per level), y by leaf order (46 px per leaf), links as cubic curves, `also` links as dotted curves. Keep the layout algorithm in plain code; no library is needed for under 200 nodes.

## 11. Content and Obsidian

### 11.1 Everything becomes a page

The design brief and every linked or drawn-on source become Markdown notes. External links are not left as bare URLs: each gets a `sources/` stub with `url`, `accessed`, `author`, a two sentence summary and, where the licence allows, a local archived copy (`archived: true`). The brief calls for work to be "pulled and archived and on-site in a specific template"; the `work` and `source` templates in `templates/` are that template.

### 11.2 Brief to notes map

| Brief section | Becomes | Notes |
|---|---|---|
| Summary, messaging | `method/overview.md`, `brief/messaging.md` | Messaging table kept as is |
| Background | `brief/background.md` | |
| The four principals | `people/alberto-cottica.md`, `people/jm-applegate.md`, `people/azzurra-spirito.md`, `people/yudhanjaya-wijeratne.md` | One note each; the strengths table splits across them |
| Current lab work: history table | one note per row in `work/` (15 rows) | Filename `YYYY-MM-title.md`; `start` drives sort order |
| Trains of thought table | one note per row in `work/` with `type: work` and tag `thread` (9 rows) | |
| Work to showcase | `featured: true` on the matching `work/` notes (8) | Do not duplicate; the table is a view over `featured` |
| Design goals and non-goals | `brief/goals.md` | |
| Audiences | `brief/audiences.md`, one heading per row | |
| Style and tone | `brief/style.md` (the say/instead-of table) | The build should reuse the table to lint note summaries for banned phrases (section 11.4) |
| Addons | `essays/_policy.md` | Opinion essays carry the label |
| User journey | `brief/journey.md` | |
| Design inspiration | five `sources/` stubs, plus `brief/inspiration.md` | Fieldnotes, machine-skill, commonplace, HyperCard, Obsidian graph |
| Prototypes | `brief/prototypes.md`, with a link to this plan | |
| Witness, Great Retrofit, Messina residency, Colombo, General Housing Model | `models/` and `places/` stubs, status seedling | Named in the brief as proof points |

Named external works in the brief (Edgeryders topics, the Turku paper, CoMSES models, the Colombo Hacker News post and the rest) each get a `sources/` stub. Where the brief gives no URL, leave `url:` empty and add the tag `needs-url`. The build prints a count of such stubs.

### 11.3 Content hygiene before anything publishes

The brief is a working draft with lines that must not be copied onto public pages: an aside in "Current lab work" that complains about how scattered the work is, and a parenthetical joke after the Forbes 30 under 30 line. Rewrite the first as "Current lab work is spread across several sites and threads; this site gathers it" and drop the second. Also verify before publication every figure taken from the brief: the OCCRP amount, the 130,000 posts from 3,500 authors, the Reuters and Ministry of Health claims, the 1.2 million users, and the years on every history row. Applegate's essays go in `essays/` with `opinion: true` and stay off the landing page, Method and Work with us pages, as the brief says.

### 11.4 Style lint

At build time, scan note `summary` fields and the landing page frontmatter for the left column of the brief's Style and tone table ("simulation platform", "stakeholders", "end users", "disruptive solutions", "thought leadership", "economic laws", "natural laws"). Print warnings, do not fail.

### 11.5 Obsidian settings committed in `.obsidian/`

`app.json`: `useMarkdownLinks: false`, `newLinkFormat: shortest`, `attachmentFolderPath: assets`, `newFileLocation: current`. `templates.json` (or Templater): folder `templates`. `core-plugins`: backlinks, graph, outline, tags, properties, templates, file recovery on. Community plugins suggested, none required: Templater, Dataview, Obsidian Git. Graph view groups coloured by `type`.

### 11.6 Templates to ship in `templates/`

`note.md`, `person.md`, `work.md`, `model.md`, `place.md`, `concept.md`, `essay.md`, `source.md`, `heritage-node.md`, `method-step.md`. Each is the frontmatter from section 3.3 with prompts, plus a one-line comment on what the page is for.

## 12. Build order

Do these in order. Each phase ends with its acceptance check.

**Phase 0: scaffolding (half a day).** Create the repository layout in 3.1, `package.json`, Eleventy config, `pages.yml`, `tokens.css`, base layout. Copy `reference_model.py` into `model/`. Check: `npm run build` produces a site from three sample notes; the workflow deploys a blank page.

**Phase 1: the model (two days).** Port `reference_model.py` to `model.js`. Generate `golden.json`. Run the sweep in 6.8 in Python. Work through 6.10 until R1 to R6 pass. Update constants in section 6.5 and the table in 6.8 in this file, with a `CHANGELOG`. Check: T1 to T8 and R1 to R6 pass in both languages and the golden test passes.

**Phase 2: the deck (two days).** Build controls, the pool mechanics from 6.2, clock, readouts, charts and the How this works drawer, with the town figure stubbed as a static image. Check: a keyboard-only user can run a full term; moving any pool slider keeps the total at 100.

**Phase 3: the town figure (one to two days).** Extend the v2 figure as in 4.3, wire `postMessage`, remove the old sliders. Check: each mapping row in 4.3 can be seen by driving the model to that state.

**Phase 4: the ticker (one day).** Implement 7.2 to 7.6 with the Markdown sources. Check: the same seed gives the same ticker; no item fires faster than its cooldown; reading the ticker of a "Calm, default" run produces only filler and, at most, one or two mood items.

**Phase 5: the method panel (one to two days).** Section 5. Check: scroll through at 60 fps on a laptop; reduced-motion mode shows the static chart.

**Phase 6: the vault (two days).** Wikilinks, backlinks, templates, the brief split per 11.2 and the sources stubs. Check: open the repository in Obsidian; links resolve; the graph view shows people, work, models and places connected; the build lists missing URLs and unresolved links.

**Phase 7: heritage (one to two days).** Section 10. Check: adding one line to the inbox and rebuilding adds a node under the right parent; a bad parent warns; a cycle fails the build.

**Phase 8: assembly and review (one day).** Landing page order per 4.2, Work with us, People, mobile pass, accessibility pass with a screen reader and Lighthouse (target 95 or above in accessibility and best practices), content hygiene per 11.3, final read of every sentence against the style table.

Total about two working weeks for one builder.

## 13. Final checklist

- Hero text matches the approved copy exactly, bullets included.
- The visitor controls rent, income tax and one shared pool of five shares; nothing else.
- Weather and market shocks cannot be set by sliders, only by event buttons or the seeded deck.
- The default run is flat for 120 ticks and the JavaScript matches the Python reference.
- The ticker never states a number the model did not compute.
- The method panel, town and heritage tree share the same tokens and the same hand-inked line style.
- The "toy model" notice is visible under the deck.
- Every external link has a `sources/` stub.
- No hosted service is in the path; fonts are self-hosted.
- No opinion essay appears on the landing page, Method page or Work with us page.
- The brief's draft asides were removed (11.3).

## 14. Decisions taken and open questions

Decisions made where the request left room, each overturnable:

1. Static generator: Eleventy, not Jekyll or Quartz (3.2).
2. Visitor controls: rent, one income tax rate and a five-way budget pool. Public transport, justice, education, infrastructure and health and care are the five services; the request said "etc", and health and care was added because it completes the set at a count a visitor can hold in mind.
3. The budget is balanced; no deficit lever.
4. Firms are aggregate in the model and eight named skins in the ticker.
5. Town name Linden Cove and all cast names are placeholders.
6. The flowchart panel reuses the checked method statechart, restyled to the town (see "Interpretation to confirm").
7. The heritage tree uses a single primary parent per node plus optional dotted cross-links, so the page reads as a tree and still admits the influences that cross branches.

Questions for the principals, none blocking:

- Should the rent slider represent a market average or a policy ceiling? The plan treats it as the market average with builders responding.
- Is the Lab comfortable showing the mood index as a single number, or should the page show the three components only?
- Should the Witness world (twelve Distrikts) appear later as a second town in the deck, as the brief suggests?
- Which science-fiction writers belong on the heritage tree? The branch is empty until a principal names them.
- Which of the brief's figures can be published as written (11.3)?

## 15. Hand-off prompt

Give this to any LLM together with the repository and this file:

> You are building prototype v3 of the Sci-Fi Economics Lab site from PLAN.md. Work through section 12 in order, one phase per session. Start each phase by reading the sections it names. Do not change any number in sections 4 to 7 without recording the change and reason in model/CHANGELOG.md. In phase 1, run reference_model.py, compare with the table in 6.8, then work on R1 to R6 using 6.10 until they pass; report the final sweep table. Write no em-dashes, no triplet lists and no rhythmically uniform sentences in any user-facing copy. Keep all copy in Markdown notes, not in HTML or JavaScript. Stop at the end of each phase and report which acceptance checks passed.

---

## Addendum: as built (supersedes the numbers above where they differ)

The first prototype pass changed the tuned constants. Where this addendum and sections 6.4 to 6.10 disagree, this addendum wins. `model/reference_model.py` is the source of truth and `model/golden.json` is generated from it.

- Town name is Linden Cove (placeholder). Contact address and repo URL are placeholders in `.site/_data/site.json`.
- Tuned constants: hire speed 0.25, fire speed 0.06, unemployment stabiliser 1.0 above 10% unemployment, tax drag on output 1.0 above 25% tax, crowding penalty on mood 60, export productivity elasticity 1.0, migration cap 0.004 per month. Service half-lives: infrastructure 0.02, education 0.01, justice 0.05, transit 0.06, health 0.04.
- Robustness tests R1 to R6 pass: rent 35 or health at 40% no longer collapses the town, and there is no cliff at 25% tax. Self-test T5 now uses rent 45 (population under 950 at month 60, under 850 at month 120).
- `model/test_golden.js` checks the browser model against `golden.json` at 1e-9 (last run: 8,400 comparisons, worst relative error 9e-15). Regenerate with `cd model && python3 reference_model.py --golden`.
- Palettes: four, in `.site/_data/palettes.json` (Civic Blue is the default, then Harbour Paper, Story Margin and Night Ledger; Terracotta Market was dropped). One JSON file generates the CSS tokens and the town figure colours. Switch with the header button or `?palette=name`.
- Repo layout: Eleventy code lives in `.site/`, content (`models/`, `method/`, `offers/`, `people/`, `work/`, `brief/`, `essays/`, `heritage/`, `sources/`, `ticker/`, `_inbox/`) in the vault root so Obsidian opens it directly.
- Known rough edges: two edge labels in the method flowchart sit behind nearby boxes at some steps; heritage dates and "why" lines are unconfirmed; the interpretation of "flowcharts of noveau panels" as the method statechart panel is unconfirmed.

### Addendum: Our work section

- `work/*.md` holds 28 entries. Each has the sections What it is, What we did, How it turned out and Sources, plus front matter fields `kind`, `who`, `motif`, `source_url`, `source_label` and an optional `confirm` list that renders as a "To confirm" box.
- Featured images are generated, not drawn by hand: `python3 .site/tools/make-work-images.py` reads each note's `motif` and writes `.site/assets/work/<slug>.svg`. The SVGs are inlined, so they follow the active palette.
- Entries came from the design brief and from scifieconomicslab.net. Overlaps were merged: One Planet One Humanity, Witness, the wiki and the Residencies and workshops page each exist once. New from the site: the 2027 alliance, the school of future places and A Town by the Sea.
- Entries tagged `needs-url` have no original link yet (the TEDxBologna talk, the Shata Diallo dialogue, GlocalCamp 2017).
