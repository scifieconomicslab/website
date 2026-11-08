# Editing content

All content is Markdown with a block of settings at the top, called front matter. You can edit the files in any text editor. The folder also opens as an [Obsidian](https://obsidian.md) vault.

After any edit, run `npm run build` (or leave `npm run serve` running) and check the result in the browser.

## How a note works

```markdown
---
title: "Space Economy Camp"
type: work
summary: "One sentence used on cards and link previews."
---

## What it is

Body text in Markdown.
```

- The file name becomes the page address. `work/2023-11-space-economy-camp.md` is published at `/work/2023-11-space-economy-camp/`.
- Start each new note from the matching file in `templates/`. Copy it, rename it and fill it in.
- Put quotation marks around any value that contains a colon.

### Fields every note can have

| Field | Meaning |
|---|---|
| `title` | Page title |
| `type` | `note`, `person`, `work`, `model`, `place`, `concept`, `essay`, `source`, `heritage`, `method` or `offer` |
| `stage` | Growth stage: `seedling`, `sapling` or `evergreen`. Shown as a badge |
| `status` | How settled the claim is: `speculative`, `working` or `settled`. Shown as a badge |
| `summary` | One sentence for cards, previews and the page's lead |
| `tags` | A list such as `[showcase]` |
| `featured` | `true` shows the note as a card in the landing page's Our work section |
| `thread` | Optional Edgeryders discussion link, shown at the foot of the page |
| `confirm` | A list of open questions. Rendered as a dashed "To confirm" box on the page |

The facts box under a page's lead shows these when present: `period`, `who`, `kind`, `role`, `partners`, `country`, `decision`, `why_it_matters`, `url`, `accessed` and `repo`.

### Links between notes

Link to another note by its title or file name, without the folder or extension:

| Write | Result |
|---|---|
| `[[Alberto Cottica]]` | Link using the note's title |
| `[[alberto-cottica\|Alberto]]` | Link with your own wording |
| `[[overview#Step 1]]` | Link to a heading |

Linked notes list each other automatically in a "Linked from" block. A link that matches no note is printed in the build warnings.

## Work entries

Folder: `work/`. One note per piece of work. The Our work page sorts them newest first by `start`.

```yaml
---
title: "Space Economy Camp"
type: work
stage: sapling
status: working
period: "Nov 2023"          # text shown to readers
start: 2023-11              # YYYY-MM, used for sorting
kind: workshop              # see the groups below
who: "J M Applegate, Alberto Cottica"
motif: planets              # picks the illustration
featured: false
source_url: "https://example.org/the-original"
source_label: "Edgeryders, Designer economies"
summary: "One or two sentences."
why_it_matters: "Why a partner should care."
tags: [showcase]
confirm:
  - "Attendance is not in the source."
---
```

Body sections, in this order: `## What it is`, `## What we did`, `## How it turned out`, `## Sources`. Say only what a cited source supports.

Things to know:

- **Missing link.** Leave `source_url` empty and add the tag `needs-url`. The card shows "link to add" and the page shows "Original link to be added".
- **Open questions.** Put anything unverified in `confirm`. Delete the list when it is resolved.
- **Filter groups.** The Our work page groups kinds into Models and software, Games and worlds, Events, Teaching, Papers and reports, and Partnerships. A kind that is not listed in `.site/layouts/work.njk` still appears under All, but under no group. Add new kinds to the `groupOf` table there.
- **Illustration.** Each entry shows an SVG named after the file. See [Maintaining the site](maintaining.md#work-illustrations) to generate one for a new entry.

## People

Folder: `people/`. The People page is built from these notes. Add a person by copying `templates/person.md`.

```yaml
---
title: "Alberto Cottica"
type: person
role: "Principal"
group: Principals           # Principals, Contributors, Advisers or Alumni
order: 1                    # lower numbers first inside a group
headline: "Economist and network scientist, UNDP"
photo: assets/people/alberto-cottica.jpg
summary: "Used on the card."
---
```

- **Groups** appear in this order: Principals, Contributors, Advisers, Alumni. A person with no `group` goes under Contributors. A group with nobody in it is hidden.
- **Photo.** Save the image in `.site/assets/people/` and set `photo` to `assets/people/<file>`. Use a portrait crop at about 417 by 480 pixels, with the face in the upper half. Without a photo the card shows the first letter of the name.
- **Landing page.** Every person also appears in the short strip under The people on the landing page.
- **Page intro.** The sentence under the People heading is the `lead` in `people/index.md`.

## Heritage tree

Folder: `heritage/`. The tree has three levels, each a small note with `type: heritage`:

- **Branch** (`heritage/branches/`): `heritage_type: "branch"` and a `branch` name.
- **Sub-branch** (`heritage/clusters/`): `heritage_type: "cluster"`, a `sub_branch` name and the `branch` it sits under.
- **Thinker** (`heritage/`): `heritage_type: "person"`, as below.

```yaml
---
title: "Albert O. Hirschman"
type: heritage
heritage_type: "person"
branches:
  - branch: "The Broken Tower"
    sub_branch: "Agency and development"
  # a second entry puts the thinker under another sub-branch too
profession: "Economist"
short_hook: "One line for the info panel"
nominated_by: ["alberto"]
status: "agreed"
---
```

- **Membership lives in one place.** A thinker's `branches` list decides where they appear. Sub-branch and branch notes never list their people. The first entry is the thinker's home (filled dot in the tree); further entries show as hollow dots.
- **Names must match exactly.** `branch` and `sub_branch` have to spell a real branch and sub-branch. `npm test` and the build both fail if one does not, and say which note is wrong.
- **To add a thinker**, copy `templates/heritage-node.md` into `heritage/` and fill it in.

## How we work

Folder: `method/`. The scroll-driven flowchart and the list of steps both read the notes that have a `step` number.

```yaml
---
title: "Model running, sliders in hand"
type: method
step: 3
state_label: "Model running, sliders in hand"
next: [4, 5]                          # steps this one leads to
edge_label: ["the option fails on paper", "the option holds"]
tone: leaf                            # colour of the node
---
```

- `next` and `edge_label` must have the same number of items. Each label sits on the line to the matching next step.
- Steps are ordered by `step`. Changing a step number or its links changes the chart, so check the animation after any edit.
- The body of each note is the text shown under "Open the note". The summary is what appears on the chart.

## Sources

Folder: `sources/`. One note per source you cite.

```yaml
---
title: "Edgeryders"
type: source
url: "https://edgeryders.eu"
accessed: 2026-11-02
author: ""
published: ""
archived: false
---
```

Tag a source `needs-url` if you have not found its link yet.

## Landing page text

| What | Where |
|---|---|
| Headline, intro line and four bullet points | Front matter of `index.md` (`hero_title`, `hero_lede`, `hero_points`) |
| Opening provocation under the town | Body of `copy/opening-provocation.md` |
| Description of the process | Body of `copy/process-name.md` |
| The four Work with us cards | `offers/*.md`. The `summary` is the card text |
| How the town model works drawer | Body of `models/linden-cove.md` |
| Funder and partner logos | `.site/_data/funders.json` (see [Maintaining the site](maintaining.md#funders-and-partners)) |
| Contact address | `.site/_data/site.json` |

## The Linden Cove Courier

The news ticker in the town figure speaks in a voice you can edit as Markdown, in `ticker/`:

- `cast.md` lists the firms and residents the ticker can mention, as tables.
- `rules.md` sets the channel, cooldown (in months) and priority (1 to 10) for each event. Priority 8 and above is announced to screen readers.
- `templates.md` holds the sentences, as bullet lists under a heading for each event.

What triggers each event is defined in `.site/assets/js/ticker.js`, not in the Markdown.

## Writing style

- Say only what a source supports. Mark anything else with `confirm`.
- Plain sentences. No em dashes. Avoid stock phrases and "not X, but Y" constructions.
- Short labels in sentence case, with no trailing full stop.
