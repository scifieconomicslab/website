# Site documentation

The Sci-Fi Economics Lab site is a folder of Markdown notes that Eleventy compiles into plain static HTML. There is no database and no server code. This folder explains how to run it, edit it and keep it healthy.

| Guide | Read it when you want to |
|---|---|
| [Building and running](building.md) | Install, compile, preview, test or publish the site |
| [Editing content](editing.md) | Add or change people, work entries, heritage nodes, method steps, sources and copy |
| [Maintaining the site](maintaining.md) | Change palettes, logos and settings, regenerate images, and fix common problems |

## The short version

```bash
npm install          # once
npm run serve        # live preview at http://localhost:8080
npm run build        # writes the finished site to _site/
```

Everything the visitor sees comes from three places:

- Markdown notes in the content folders (`work/`, `people/`, `heritage/`, `method/` and so on).
- Settings and data in `.site/_data/`.
- Page templates, styles and scripts in `.site/`.

This `docs/` folder is not published. The build skips it.
