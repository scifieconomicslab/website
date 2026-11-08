# GitHub Issues Fixes Implementation Plan

**Goal:** Fix 6 open GitHub issues (#2-7, excluding #1 heritage map) for the Sci-Fi Economics Lab website prototype v3.

**Architecture:** The site is an Eleventy (11ty) static site with Markdown content in an Obsidian vault. JavaScript modules handle the interactive town simulation, method flowchart, and heritage tree. Fixes are primarily template/CSS/JS edits with some content updates.

**Tech Stack:** Eleventy 3.x, Nunjucks templates, vanilla ES5 JavaScript (for broad compatibility), CSS custom properties for theming.

**Spec:** GitHub issues #2-7 from scifieconomicslab/website

---

## Global Constraints
- No new dependencies; use existing Eleventy, markdown-it, gray-matter
- Maintain file:// compatibility (relative URLs via `relUrl` filter)
- CSS uses palette tokens from `tokens.css` (generated from `palettes.json`)
- JavaScript must work in ES5 environments (no arrow functions, const/let, modules)
- Preserve existing isometric SVG rendering approach in method-panel.js

---

## Review Focus
1. **Mobile viewport < 760px:** Method page columns stack, SVG remains readable, no horizontal overflow
2. **Firefox on Ubuntu:** Landing page buttons not obscured by iframe frame
3. **Reduced motion preference:** Method page shows static list, no scroll animations
4. **Content edits propagate:** Changing method note frontmatter updates flowchart labels AND left captions
5. **Edge labels from notes:** `edge_label` frontmatter appears on flowchart edges

---

### Task 1: Fix Issue #2 — "Bring us a town" → "What is this?" linking to Linden Cove model

**Files:**
- Modify: `.site/layouts/landing.njk:10`

**Interfaces:**
- Consumes: `site.contact` from site data (unchanged)
- Produces: Link to `/models/linden-cove/` via `rel` filter

- [ ] **Step 1: Verify current button**
  Open landing.njk line 10, confirm button reads "Bring us a town" with mailto link

- [ ] **Step 2: Edit button text and href**
  ```diff
  - <a class="btn alt" href="mailto:{{ site.contact }}?subject=A%20town%20and%20a%20problem">Bring us a town</a>
  + <a class="btn alt" href="{{ '/models/linden-cove/' | rel(page.url) }}">What is this?</a>
  ```

- [ ] **Step 3: Build and verify**
  Run: `npm run build` → check `_site/index.html` for correct link

- [ ] **Step 4: Commit**
  ```bash
  git add .site/layouts/landing.njk && git commit -m "fix: issue #2 - change 'Bring us a town' to 'What is this?' linking to Linden Cove model"
  ```

---

### Task 2: Fix Issue #4 — Buttons hidden by frame in landing page (Firefox/Ubuntu)

**Files:**
- Modify: `.site/assets/css/site.css:44-58, 52-55`

**Interfaces:**
- Consumes: `.hero .wrap` grid, `.fig` iframe, `.btns` container
- Produces: Non-overlapping layout on all viewports

- [ ] **Step 1: Write failing visual test**
  Create `/tmp/test-hero-overlap.html` with hero section markup, open in browser, verify buttons not covered by iframe at various widths

- [ ] **Step 2: Apply CSS fixes**
  ```diff
  /* .hero .wrap - line 45 */
  - align-items: center;
  + align-items: start;
  
  /* .fig - line 57 */
  - max-height: 62vh;
  + max-height: 60vh;
  
  /* .btns - line 52-55 */
  .btns {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  + position: relative;
  + z-index: 2;
  }
  ```

- [ ] **Step 3: Build and verify**
  Run: `npm run build` → open `_site/index.html` in browser, test at 1366px, 1920px, 375px widths

- [ ] **Step 4: Commit**
  ```bash
  git add .site/assets/css/site.css && git commit -m "fix: issue #4 - prevent iframe from obscuring hero buttons on Firefox/Ubuntu"
  ```

---

### Task 3: Fix Issue #6 — Clarify "Which writers?" in method/story.md

**Files:**
- Modify: `method/story.md:11,14`

**Interfaces:**
- Consumes: Frontmatter `summary` and body text
- Produces: Clear attribution of who "writers" are

- [ ] **Step 1: Edit frontmatter summary**
  ```diff
  - summary: "Writers follow people through each path and say which parts of the model they hold fixed. The room reads the stories back at [[table]], revises them, and feels each choice before it makes one."
  + summary: "Our team's writers (or the place's own storytellers) follow people through each path and say which parts of the model they hold fixed. The room reads the stories back at [[table]], revises them, and feels each choice before it makes one."
  ```

- [ ] **Step 2: Edit body text**
  ```diff
  - Writers follow people through each path and say which parts of the model they hold fixed. The room reads the stories back at [[table]], revises them, and feels each choice before it makes one.
  + Writers — either from our team or from the community itself — follow people through each path and say which parts of the model they hold fixed. The room reads the stories back at [[table]], revises them, and feels each choice before it makes one.
  ```

- [ ] **Step 3: Build and verify**
  Run: `npm run build` → check `_site/method/story/index.html` for updated text

- [ ] **Step 4: Commit**
  ```bash
  git add method/story.md && git commit -m "fix: issue #6 - clarify 'writers' refers to team or community storytellers"
  ```

---

### Task 4: Fix Issue #3 — Make "How we work" page more intuitive and mobile-friendly

**Files:**
- Modify: `.site/assets/css/site.css:180-206`
- Modify: `.site/assets/js/method-panel.js` (add scroll hint)

**Interfaces:**
- Consumes: `.method` section height, `.stick` grid, `#msvg` dimensions
- Produces: Stacked layout on mobile, larger SVG, scroll hint indicator

- [ ] **Step 1: Increase SVG size and make responsive**
  ```diff
  /* .mfig #msvg - line 188 */
  - max-height: calc(100vh - 150px);
  + max-height: calc(100vh - 120px);
  + min-height: 500px;
  ```

- [ ] **Step 2: Stack columns on mobile (< 900px)**
  ```diff
  /* .method .stick - line 182 */
  .method .stick {
    position: sticky;
    top: 60px;
    display: grid;
  - grid-template-columns: minmax(240px,.7fr) minmax(0,1.6fr);
  + grid-template-columns: minmax(280px, 1fr);
    gap: var(--gap);
    align-items: center;
    max-width: var(--max);
    margin: 0 auto;
    padding: 40px var(--pad);
  }
  
  + @media (min-width: 900px) {
  +   .method .stick {
  +     grid-template-columns: minmax(240px,.7fr) minmax(0,1.6fr);
  +   }
  + }
  ```

- [ ] **Step 3: Add scroll hint in method-panel.js**
  After line 182 (after `update()` function), add:
  ```javascript
  // Scroll hint to indicate interactivity
  function addScrollHint() {
    var mfig = document.querySelector('.mfig');
    if (!mfig) return;
    var hint = document.createElement('div');
    hint.id = 'scroll-hint';
    hint.style.cssText = 'position:absolute;left:50%;bottom:24px;transform:translateX(-50%);font:500 13px var(--mono);color:var(--mute);pointer-events:none;opacity:1;transition:opacity .5s;z-index:10;white-space:nowrap';
    hint.textContent = '\u2193 Scroll to explore';
    mfig.appendChild(hint);
    var removed = false;
    window.addEventListener('scroll', function onScroll() {
      if (window.scrollY > 100 && !removed) {
        removed = true;
        hint.style.opacity = '0';
        setTimeout(function() { hint.remove(); }, 500);
        window.removeEventListener('scroll', onScroll);
      }
    }, { passive: true });
  }
  addScrollHint();
  ```

- [ ] **Step 4: Build and verify**
  Run: `npm run build` → open `_site/index.html#method`, test scroll hint appears/fades, test mobile viewport (Chrome DevTools device toolbar)

- [ ] **Step 5: Commit**
  ```bash
  git add .site/assets/css/site.css .site/assets/js/method-panel.js && git commit -m "fix: issue #3 - improve method page UX: larger SVG, mobile stacking, scroll hint"
  ```

---

### Task 5: Fix Issue #5 — Show edge labels from notes in method flowchart

**Files:**
- Modify: `.site/assets/js/method-panel.js:63-78` (EDGES array)
- Modify: `method/*.md` (add `caption_title`, `caption_body` frontmatter for Task 7 prep)

**Interfaces:**
- Consumes: `steps` array from `_data/method.js` (includes `edge` from `edge_label`)
- Produces: Edge labels on flowchart matching note frontmatter

- [ ] **Step 1: Refactor EDGES to use dynamic labels from steps data**
  Replace hardcoded `lab` values with lookup from `steps` data (see plan details for code). Preserve hand-crafted path geometry (`d` attribute).

- [ ] **Step 2: Add caption frontmatter to all 9 method notes**
  For each `method/*.md`, add:
  ```yaml
  caption_title: "..."  # short title for left caption
  caption_body: "..."   # body for left caption
  ```
  Values based on current hardcoded CAPS array.

- [ ] **Step 3: Build and verify**
  Run: `npm run build` → open `_site/index.html#method`, scroll through flowchart, verify edge labels appear (e.g., "we name the problem together" on edge 1→2)

- [ ] **Step 4: Commit**
  ```bash
  git add .site/assets/js/method-panel.js method/*.md && git commit -m "fix: issue #5 - show edge labels from note frontmatter in method flowchart"
  ```

---

### Task 6: Fix Issue #7 — Make left-side captions editable from notes

**Files:**
- Modify: `.site/_data/method.js:3-4` (add caption fields)
- Modify: `.site/assets/js/method-panel.js:140-149` (replace hardcoded CAPS)
- Modify: `method/*.md` (caption frontmatter added in Task 5)

**Interfaces:**
- Consumes: `steps` array with `caption_title`, `caption_body`
- Produces: `CAPS` array built dynamically from notes

- [ ] **Step 1: Update _data/method.js to export caption fields**
  ```diff
  module.exports = () => load().notes.filter(n => n.folder === 'method' && n.data.step)
    .map(n => ({ step: n.data.step, label: n.data.state_label || n.title, next: [].concat(n.data.next || []), edge: [].concat(n.data.edge_label || []), icon: n.data.icon || '',
         tone: n.data.tone || '', summary: n.data.summary || '', url: n.url, title: n.title,
  +     caption_title: n.data.caption_title || n.data.state_label || n.title,
  +     caption_body: n.data.caption_body || n.data.summary || '' }))
    .sort((a, b) => a.step - b.step);
  ```

- [ ] **Step 2: Replace hardcoded CAPS with dynamic construction**
  In method-panel.js, replace lines 140-149:
  ```javascript
  var CAPS = steps.map(function(s, i) {
    var thresholds = [0, 0.08, 0.20, 0.33, 0.43, 0.52, 0.60, 0.78];
    return [thresholds[i] || i * 0.1, s.caption_title, s.caption_body];
  });
  CAPS.push([0.78, 'We checked the core of this formally. A shortcut breaks both of our rules within two steps.', 'In the checked model, skipping the test and the story gets you a commitment nobody examined.']);
  ```

- [ ] **Step 3: Build and verify**
  Run: `npm run build` → open `_site/index.html#method`, scroll, verify left captions change and match note content. Edit a note's `caption_title`, rebuild, verify change appears.

- [ ] **Step 4: Commit**
  ```bash
  git add .site/_data/method.js .site/assets/js/method-panel.js method/*.md && git commit -m "fix: issue #7 - make method page left captions editable from note frontmatter"
  ```

---

### Task 7: Full verification and regression test

**Files:** All modified files

- [ ] **Step 1: Full build**
  Run: `npm run build` — must complete without errors

- [ ] **Step 2: Run existing tests**
  Run: `npm test` — golden model comparison must pass

- [ ] **Step 3: Manual verification checklist**
  - [ ] Landing page: "What is this?" button links to `/models/linden-cove/`
  - [ ] Landing page: Buttons not obscured by iframe at 1366px, 1920px, 375px
  - [ ] Method page: SVG larger, columns stack on mobile, scroll hint appears/fades
  - [ ] Method page: Edge labels show note frontmatter text
  - [ ] Method page: Left captions match note `caption_title`/`caption_body`
  - [ ] Method page: Reduced motion shows static list (mlist visible)
  - [ ] Story note: "writers" text clarified
  - [ ] All 9 method notes have `caption_title`/`caption_body` frontmatter

- [ ] **Step 4: Final commit**
  ```bash
  git add -A && git commit -m "chore: verify all issue fixes (#2-7) working"
  ```