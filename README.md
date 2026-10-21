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
| `widgets/of-<id>/` | One folder per published widget: `component.js`, `preview.png`, `README.md`, `index.html` (standalone demo) |
| `widgets/of-template/` | The reference widget every new one is copied from (a slider-driven line plot) |
| `staging/` | Drafts awaiting approval, same folder shape as `widgets/` — see `docs/publish.md` |
| `lessons/` | Lessons as JSON blocks (Phase 3) |
| `tools/validate-registry.js` | `node tools/validate-registry.js` — schema and prerequisite check for the registry |
| `docs/` | `widget-authoring.md` (the contract and template walkthrough), `registry-schema.md`, `publish.md` |

## Add a widget

1. Copy `widgets/of-template/` to `staging/of-<your-id>/` and follow `docs/widget-authoring.md`.
2. Add a draft entry to `widgets/registry.json` with `"status": "planned"` until it is published.
3. Run `node tools/validate-registry.js`; fix anything it reports.
4. Publish per `docs/publish.md` (move to `widgets/`, set `status` to `published`, bump `version`).

## Embed a widget in any HTML page

```html
<script type="module" src="widgets/of-template/component.js"></script>
<of-template lang="en" config='{"a": 1.5, "b": -0.5}'></of-template>
```

## Project registration

This repository is independent of BrainCore / ASI OS. The planning record (catalog, work plan,
decision log) lives in the ASI OS activity `ACT-00069`; see `PROJECT.md`.
