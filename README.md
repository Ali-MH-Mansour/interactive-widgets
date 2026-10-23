# Interactive Widgets

A library of small, self-contained **interactive teaching widgets** — each one a Web Component
(`<of-xxx lang="en" config='{...}'>`) that a learner controls and that reacts immediately. Widgets are
classified by **topic → concept** with **domain tags** (`ml`, `math`, `programming`, `ai`), never by
course, so one widget can be embedded unchanged in a maths lecture and in a machine-learning lecture.

Built as plain HTML/CSS/JavaScript with **no build step, no framework, no CDN, no fonts from the
network**. Every widget works from `file://` and from an intranet path.

## Run it

**Easiest:** double-click `start-server.bat`. It starts a local server on port 8090 and opens the
library page; close its console window to stop the server.

**Or by hand:**

```bash
cd Q:/Projects/interactive-widgets
python -m http.server 8090
# then open http://localhost:8090
```

The **library page** (`index.html`) needs the server because it reads `widgets/registry.json` with
`fetch`, which browsers block on `file://`. The **widgets themselves** and any rendered lesson page
do not need a server — open `widgets/of-template/index.html` directly to see one standalone.

## What's inside

| Path | What it is |
| --- | --- |
| `index.html` · `app.js` · `styles.css` | The library page: cards from the registry, EN/RU toggle, live preview, copy-embed snippet |
| `i18n.json` | UI strings per language (`en`, `ru`; `ar` reserved) |
| `widgets/registry.json` | The catalog — one entry per widget (hand-maintained; see `docs/registry-schema.md`) |
| `widgets/of-<id>/` | One folder per published widget: `component.js`, `explain.js` (the learner-facing explanation, `docs/explain-schema.md`), `preview.png`, `README.md`, `index.html` (standalone demo) |
| `lib/of-source.js` | **The content provider** — every consumer asks `OF.source` for the registry, kits, explanations, lessons, datasets; `local` today (static files), `remote` when published (site API + licence gate), switched by one `<meta name="of-source">` the site build writes. `docs/widget-authoring.md` → "Shell vs content" |
| `lib/of-explain.js` | `<of-explain for="of-<id>">` — renders a widget's explanation anywhere (library page, lecture page, demo page) |
| `docs/site-config.md` · `site.config.example.json` | What the (not yet built) platform build reads: domain, API base, mode, languages, licence, analytics, ad slots |
| `graph.json` · `tools/build-graph.py` | The derived topic → concept → widget graph with prerequisite and related edges; regenerate, never edit |
| `widgets/of-template/` | The reference widget every new one is copied from (a slider-driven line plot) |
| `staging/` | Drafts awaiting approval, same folder shape as `widgets/` — see `docs/publish.md` |
| `lessons/` | Lessons as JSON blocks (`<id>.json`, see `docs/lesson-schema.md`) plus their generated pages (`<id>.html`) |
| `tools/render-lesson.js` | `node tools/render-lesson.js lessons/<id>.json [--inline] [--out f] [--lang l] [--check]` — renders a lesson to one standalone HTML page |
| `tools/validate-registry.js` | `node tools/validate-registry.js` — schema and prerequisite check for the registry |
| `docs/` | `widget-authoring.md` (the contract and template walkthrough), `registry-schema.md`, `explain-schema.md`, `publish.md` |

## Add a widget

1. Copy `widgets/of-template/` to `staging/of-<your-id>/` and follow `docs/widget-authoring.md`.
2. Add a draft entry to `widgets/registry.json` with `"status": "planned"` until it is published.
3. Run `node tools/validate-registry.js`; fix anything it reports.
4. Publish per `docs/publish.md` (move to `widgets/`, set `status` to `published`, bump `version`).

## Embed a widget in any HTML page

```html
<script src="widgets/of-template/component.js"></script>
<of-template lang="en" config='{"a": 1.5, "b": -0.5}'></of-template>
```

With its explanation (concept, how it computes, how to use; EN/RU follows the `lang` attribute):

```html
<script src="lib/of-explain.js"></script>
<script src="widgets/of-template/explain.js"></script>
<of-explain for="of-template" lang="en"></of-explain>
```

The library page's **Embed code** box produces both blocks for the selected widget in its current state.

## Project registration

This repository is independent of BrainCore / ASI OS. The planning record (catalog, work plan,
decision log) lives in the ASI OS activity `ACT-00069`; see `PROJECT.md`.

## Lecture pages

A lecture is written as JSON blocks in `lessons/<id>.json` and rendered by `node tools/render-lesson.js` to one standalone page (`docs/lesson-schema.md`). `lessons/ml-models-lecture.html` is the generated first lecture — six widgets in teaching order (line + MSE → gradient descent → logistic regression → naive Bayes → decision tree → k-means), each with an equation, its explanation underneath (the **Explanations** button hides them for projection) and a quick-check quiz; opens from `file://`, EN/RU switch without reload. `--inline --out <path>` produces a single self-contained file for a teaching folder. Previews: `python tools/make-previews.py` (headless Edge/Chrome); demo pages: `python tools/gen-widget-pages.py`.
