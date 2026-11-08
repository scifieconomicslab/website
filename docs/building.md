# Building and running

## Requirements

- Node.js 18 or newer, with npm.
- Python 3 only if you want to run the optional image tools or the reference model (see [Maintaining the site](maintaining.md)).

## First-time setup

From the project root:

```bash
npm install
```

This installs Eleventy, markdown-it, its footnote plugin and gray-matter into `node_modules/`.

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Compiles the whole site into `_site/` |
| `npm run serve` | Builds, serves at `http://localhost:8080` and rebuilds when a file changes |
| `npm test` | Checks that the town model in the browser matches the reference Python model (`model/golden.json`) |

The build takes under a second. It prints each page it writes. Watch for lines starting with `[warn]`:

- `unresolved wikilinks` lists `[[links]]` that point at no note, as `file: [[target]]`.
- Heritage errors name the thinker or sub-branch that does not match. They stop the build.

Fix warnings before you publish. They do not stop the build.

## What the build produces

`_site/` is a complete, self-contained copy of the site:

- One folder per note, each holding an `index.html` (for example `_site/work/2023-11-space-economy-camp/index.html`).
- `_site/assets/` with the compiled stylesheets, scripts, fonts, people photos and logos.
- The site makes no requests to other domains. Fonts are served from the site itself.

Every internal link is relative and points at a real `index.html`, so the output works in three ways:

1. Served by any static host.
2. Served locally with `python3 -m http.server` run inside `_site/`.
3. Opened straight from a folder, by double-clicking `_site/index.html`.

`_site/` is generated. Do not edit it by hand, and do not commit it to source control. It is listed in `.gitignore`.

## Publishing

The site is static files, so any host that serves a folder will do (GitHub Pages, Netlify, Cloudflare Pages, S3, nginx).

1. Run `npm run build`.
2. Upload the contents of `_site/` to the host's web root.

No deploy workflow is included yet. If you use GitHub Pages, add a workflow that runs `npm ci` and `npm run build` and publishes `_site/`.

If the site will live in a sub-path (for example `example.org/lab/`), no change is needed. The relative links handle it.

## What the build skips

These folders and files are never published as pages:

`docs/`, `brief/`, `model/`, `templates/`, `ticker/`, `node_modules/`, `_site/`, `PLAN.md`, `README.md` and any `AUDIT-*.md`.

Their content can still feed the site. The `ticker/` files, for example, are read as data.

## Project layout

```text
index.md                  landing page content (hero text and bullet points)
work/                     one note per piece of work, plus index.md for the list page
people/                   one note per person, plus index.md for the People page
heritage/                 the family tree of ideas, one note per node
method/                   the How we work steps and process pages
sources/                  one note per cited source
models/                   write-ups of the town model
offers/                   the Work with us cards
copy/                     text blocks pulled into the landing page
essays/                   opinion notes, published as ordinary pages
brief/                    planning notes, not published
ticker/                   voice of the Linden Cove Courier (cast, rules, templates)
model/                    reference economic model in Python and its test data
templates/                starter notes for each content type
docs/                     this documentation
.site/                    templates, styles, scripts, data and tools (see below)
```

Inside `.site/`:

```text
eleventy.config.js        build configuration and template filters
layouts/                  page templates (base, landing, note, work, people, heritage)
plugins/                  vault reader, wikilink support, heritage data builder
_data/                    site settings, palettes, funders, and data built from the notes
assets/                   css, js, fonts, images, people photos, funder logos, work illustrations
tools/                    optional Python scripts that generate illustrations
```
