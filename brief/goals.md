---
title: "Design goals and non-goals"
type: note
stage: sapling
status: working
summary: "What the site must achieve and what it will not do."
tags: [brief]
---

The prototype succeeds if a stranger understands the Lab in one minute and a principal can publish a new page in five. Each goal below carries a test that someone can run.

| Goal | Test |
|---|---|
| Communicate the claim | A first-time visitor can say what the Lab does and who it is for after 60 seconds on the landing page |
| Show, then explain | One interactive demo is visible on the landing page without scrolling past a wall of text |
| Edit in Markdown only | A principal publishes a new page by committing one .md file, with no build tooling on their machine |
| Stay Obsidian-native | Opening the repository as an Obsidian vault shows working wikilinks, tags and properties, and the site renders the same links |
| Behave like a garden | Every note shows its epistemic status, growth stage and backlinks |
| Cost nothing to host | The site deploys to GitHub Pages with no paid service in the path |

### Non-goals

The non-goals protect the schedule.

- **No accounts, comments or forms in v1.** Edgeryders stays the place where discussion happens, and each note links back to its forum thread.
- **No CMS and no server.** Everything is static files built in CI.
- **No hosted simulation backend.** Demos ship as static web exports or embedded recordings. A model that needs a server is shown as a video until a later phase.
- **No sales machinery.** The "Work with us" page describes the offers in the team's SF-ECON revenue hypothesis (research participation, workshops, leadership retreats, a complexity-economics school) and gives one contact address. It takes no payments.
- **No replacement for the Edgeryders corpus.** The garden links into it and does not copy it.
