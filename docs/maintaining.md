# Maintaining the site

Routine upkeep: settings, colours, logos, images, the town model, and what to do when something breaks.

## Site settings

`.site/_data/site.json`:

| Key | Use |
|---|---|
| `title` | Site name in the title bar and header |
| `tagline` | Fallback page description |
| `contact` | Address behind Bring us a town, Write to us and the footer |
| `edgeryders` | Link in the footer |
| `town_name` | Name of the toy town (Linden Cove) |


## Palettes

Colours live in `.site/_data/palettes.json`. Each palette has an `id`, a name, a light or dark `scheme`, and a `ui` block of colour tokens (`paper`, `card`, `ink`, `mute`, `line`, `green`, `leaf`, `sun`, `sky`, `rust` and more).

- `default` at the top of the file picks the palette visitors see first.
- Visitors can switch palette from the footer. Their choice is remembered in their browser.
- Do not edit `assets/css/tokens.css`. It is generated from the JSON on every build.
- To add a palette, copy an existing entry, give it a new `id` and change the colours. Check text contrast on both `paper` and `card`.

## Funders and partners

The strip below the town lists funders and partners from `.site/_data/funders.json`.

1. Add an entry with `id`, `name` and `url` to `funders` or `partners`.
2. Save the logo in `.site/assets/funders/` named after the id, for example `blivande.png` (png, jpg, svg or webp).
3. Add `"wordmark": "TEXT"` if the logo has no name in it and you want one beside it.

Until a logo file exists, the site shows the name as text.

## Work illustrations

Each work entry shows an SVG drawn from its `motif` field. Illustrations are generated, not hand-made:

```bash
python3 .site/tools/make-work-images.py
```

Run it from the project root. It writes `.site/assets/work/<note-name>.svg` for every work note, then the next build inlines them so the colours follow the active palette.

- Available motifs: `bridge orbit4 graph blocks retrofit window podium city table planets town sprout paper radar megacity cards dialogue banners district cycle agents spotlight pyramid camp network school people`.
- A note with an unknown or missing motif prints a warning and gets no image.
- To add a motif, write one drawing function in the script and add its name to the `MOTIFS` list.
- To use a real picture instead, drop an SVG with the same name into `.site/assets/work/`. Re-running the tool overwrites it, so keep a copy.

## People photos

See [Editing content](editing.md#people). Files go in `.site/assets/people/`. Only add photos you have permission to publish, and note any required credit on the person's page.

## The town model

The interactive town runs on `.site/assets/js/model.js`. A Python reference version in `model/reference_model.py` is the source of truth for its numbers.

```bash
python3 model/reference_model.py            # prints the calibration, acceptance tests and sweep table
python3 model/reference_model.py --golden   # rewrites model/golden.json
npm test                                    # checks that model.js matches golden.json
```

When you change the model:

1. Change `reference_model.py` and review its printed tests.
2. Regenerate `golden.json` with `--golden`.
3. Change `model.js` until `npm test` passes.
4. Update the "How this works" text in `models/linden-cove.md` so it matches the links in the model.

`golden.json.bak` is ignored by source control.

## Other generated files

| File | Source | Note |
|---|---|---|
| `.site/assets/figures/town.html` | `.site/tools/make-town-figure.py` | Derived from an earlier prototype that is not in this folder. Treat the HTML as the master copy and edit it directly |
| `.site/assets/img/solarpunk-town.svg` | `.site/tools/make-solarpunk-town.py` | Illustration under Why we exist |
| Work illustrations | `.site/tools/make-work-images.py` | See above |
| `.site/tools/split-brief.py` | One-off | Split the original design brief into notes. Do not run it again |

## Housekeeping checklist

Before you publish:

- [ ] `npm run build` finishes with no `[warn]` lines.
- [ ] `npm test` passes.
- [ ] Open the landing page and run the town for a few seconds. The ticker should speak and the charts should move.
- [ ] Scroll through How we work. The chart should build step by step and the last caption should end the section cleanly.
- [ ] Check People, Our work and Heritage in a narrow browser window.
- [ ] Search for open `confirm:` lists and `needs-url` tags and decide whether each can ship.
- [ ] `site.json` has the right contact address and repository.

## Troubleshooting

**A new page does not appear.**
The file must be a `.md` file outside the skipped folders listed in [Building and running](building.md#what-the-build-skips) and must not start with `AUDIT-`. Check that its front matter opens and closes with `---`.

**The build fails with a YAML error.**
Usually an unquoted colon or a wrongly indented list in the front matter. Put the value in quotes.

**A `[[link]]` shows as plain text.**
No note has that title or file name. Check spelling, or write the file name without its folder.

**A person is missing from the People page.**
The note needs `type: person`. Check that `group` is one of Principals, Contributors, Advisers or Alumni.

**A card has no illustration.**
Run `python3 .site/tools/make-work-images.py` and check its output for an unknown motif.

**A logo does not show.**
The file name must match the funder `id` exactly, including case.

**Changes do not show in the browser.**
The browser may be using a cached stylesheet or script. Reload without the cache (Shift plus Reload).

**The How we work chart looks wrong after an edit.**
Check that every `next` list has a matching `edge_label` list, and that each `step` number is unique.

**Links break when the site is opened from a folder.**
They should not. Every internal link ends in `index.html`. If you add a hand-written link to a folder, write it as `../folder/index.html`.

## Where decisions are recorded

`PLAN.md` holds the original design plan: the audience, the model's equations, the page structure and the reasons behind the main choices. Read it before changing the structure of the site. It is not published.
