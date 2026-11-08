# Sci-Fi Economics Lab — Website (Prototype v3)

The public website for the [Science Fiction Economics Lab](https://scifieconomicslab.github.io/website/), built as a static site with **Eleventy (11ty)** from a folder of Markdown notes. No database, no server code — just Markdown → HTML.

> **Live site:** https://scifieconomicslab.github.io/website/

---


## Quick start

```bash
# Install dependencies (once)
npm install

# Live preview with hot reload
npm run serve        # → http://localhost:8080

# Production build (writes to _site/)
npm run build

# Run the reference economic model tests
npm test
```

> **Requirements:** Node.js 18+ (for Eleventy 3.x)

---

## Content structure

Everything the visitor sees comes from **Markdown notes** in these folders:

| Folder | Purpose | Example frontmatter |
|--------|---------|---------------------|
| `work/` | Projects, residencies, games, publications | `title`, `period`, `kind`, `stage`, `summary`, `motif` (SVG) |
| `people/` | Team members & collaborators | `title`, `role`, `headline`, `photo` |
| `heritage/` | Intellectual lineage — economists, thinkers, concepts | `title`, `type` (idea/person/work), `discipline`, `stage` |
| `method/` | The 9-step generative ethnography process | `step`, `state_label`, `next[]`, `edge_label[]`, `tone`, `caption_title`, `caption_body` |
| `models/` | Economic models (Linden Cove, etc.) | `title`, `calibrated`, `repo` |
| `copy/` | Reusable text snippets (hero, process name, etc.) | `title`, `summary` |
| `offers/` | Ways to work with the Lab | `title`, `summary` |
| `sources/` | Bibliography / references | `title`, `url`, `accessed` |

**Frontmatter fields** are documented in [`templates/`](templates/) and [`docs/editing.md`](docs/editing.md).

---

## How the site works

### Build pipeline
```
Markdown notes (content/)
       ↓
Eleventy + Nunjucks (.site/layouts/, .site/_data/)
       ↓
Static HTML (_site/) → GitHub Pages
```

### Key technologies
- **Eleventy 3.x** — static site generator
- **Nunjucks** — templates (`.njk`)
- **markdown-it** — Markdown parsing (with footnotes, wikilinks `[[...]]`)
- **Vanilla ES5 JavaScript** — interactive modules (no build step):
  - `model.js` — Linden Cove economic model (port of `model/reference_model.py`)
  - `sim-ui.js` — town simulation UI (sliders, charts, events)
  - `method-panel.js` — scroll-driven method flowchart (SVG, isometric)
  - `heritage.js` — interactive heritage tree
  - `ticker.js` — "Linden Cove Courier" news feed
  - `palette.js` — theme switcher (persists to localStorage)

### Styling
- **CSS custom properties** (tokens) generated from `.site/_data/palettes.json` → `.site/pages/tokens.css.njk`
- Single palette at a time (e.g., `Civic Blue`, `Ledger`, `Solarpunk`)
- No Tailwind, no framework — hand-written CSS in `.site/assets/css/site.css`

### Data files (`.site/_data/`)
| File | Purpose |
|------|---------|
| `site.json` | Site metadata (title, tagline, contact, repo URL) |
| `palettes.json` | Color palettes for theme switcher |
| `method.js` | Loads method notes → ordered steps for flowchart |
| `heritage.js` | Loads heritage notes → tree data |
| `tickerData.js` | News templates for the Courier |
| `vault.js` | Obsidian vault index (backlinks, wikilinks) |
| `eleventyComputed.js` | Computed data (featured work, people, offers) |

---

## The economic model (Linden Cove)

A **toy town model** with 12 causal links — rent, tax, shared budget vs. weather & markets. Written in Python (`model/reference_model.py`) and ported line-for-line to JavaScript (`model.js`).

```bash
# Run the Python reference model
python3 model/reference_model.py

# Write golden master for regression tests
python3 model/reference_model.py --golden
```

The JS version powers the interactive "Run the town" section on the landing page.

---

## Key pages

| Route | Template | Description |
|-------|----------|-------------|
| `/` | `landing.njk` | Hero, town sim, "Why we exist", method teaser, work cards, heritage teaser, team |
| `/method/` | — | Scroll-driven flowchart (9 steps) with dynamic captions |
| `/heritage/` | `heritage.njk` | Full interactive heritage tree |
| `/work/` | `work.njk` | Filterable grid of all work entries |
| `/people/` | `people.njk` | Team directory |
| `/models/linden-cove/` | `note.njk` | Model documentation + "Write to us" CTA |

---

## Editing content

1. **Add a work entry** → create `work/YYYY-MM-slug.md` (see `templates/work.md`)
2. **Add a person** → create `people/name.md` + photo in `.site/assets/people/`
3. **Add a heritage node** → create `heritage/slug.md` (see `templates/heritage-node.md`)
4. **Edit method steps** → edit `method/*.md` (captions in `caption_title`/`caption_body`, edge labels in `edge_label`)
5. **Change copy** → edit `copy/*.md`

> See [`docs/editing.md`](docs/editing.md) for full guide.

---

## Deploying

The site is published to **GitHub Pages** from the `_site/` folder on the `main` branch.

```bash
npm run build
# Push _site/ to gh-pages branch, or configure GitHub Pages to serve from / (root) on main
```

---

## Project conventions

- **File-first** — content lives in Markdown, not a CMS
- **Wikilinks** — `[[Other Note]]` creates cross-references (resolved at build)
- **No minification** — HTML/CSS/JS served as-written for readability
- **ES5 JS** — works in any browser, no transpilation needed
- **Relative URLs** — site works via `file://` (Eleventy `relUrl` filter)

---

## Documentation

| Guide | Purpose |
|-------|---------|
| [`docs/building.md`](docs/building.md) | Install, compile, preview, test, publish |
| [`docs/editing.md`](docs/editing.md) | Add/change content (work, people, heritage, method, sources, copy) |
| [`docs/maintaining.md`](docs/maintaining.md) | Palettes, logos, settings, regenerate images, troubleshooting |
| [`docs/preview.md`](docs/preview.md) | Preview deployment options |

---

## Repository layout

```
.
├── _site/                 # Build output (gitignored)
├── .site/                 # Eleventy config, layouts, data, assets, plugins
│   ├── _data/            # Site data (palettes, method, heritage, ticker…)
│   ├── assets/           # CSS, JS, fonts, images, SVGs
│   ├── layouts/          # Nunjucks templates
│   ├── pages/            # Generated CSS (tokens.css.njk)
│   └── plugins/          # Eleventy plugins (vault, wikilinks, heritage)
├── copy/                 # Reusable text snippets
├── heritage/             # Heritage nodes (Markdown)
├── method/               # 9 method steps (Markdown)
├── models/               # Model documentation
├── offers/               # Ways to work with us
├── people/               # Team members
├── sources/              # Bibliography
├── work/                 # Work entries (projects, games, publications)
├── templates/            # Frontmatter templates for new content
├── model/                # Economic model (Python reference + JS port + tests)
├── docs/                 # Internal documentation (not published)
└── package.json
```

---

## License

Content © Sci-Fi Economics Lab. Code MIT-licensed unless otherwise noted.

---
