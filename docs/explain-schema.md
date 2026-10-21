# Explanation layer — `widgets/<id>/explain.js` and `<of-explain>`

Every published widget ships an **explanation** beside its component: what the concept is, how the
widget computes what it shows (a worked example with the default numbers), how to use each control,
what to notice, the usual misconceptions, and which widgets relate to it. The explanation is **data**,
not a page: one file per widget, rendered anywhere by the shared element `<of-explain>`.

## Why a data file, and why not a hand-written graph index

- **It must open from `file://`.** A lecture page is double-clicked from a folder; `fetch()` of a
  `.json` is blocked there. So the data is a classic script that registers itself on
  `window.OF_EXPLAIN[id]` and can be loaded with `<script src>`, exactly like `component.js`.
- **It must still be machine-readable.** The object sits between `/* JSON-START */` and
  `/* JSON-END */` and is **strict JSON** (double quotes, no comments, no trailing commas).
  `tools/validate-registry.js` and `tools/build-graph.py` slice that span and parse it.
- **The graph is derived, never hand-maintained** (decision D8). The concept a widget explains is its
  registry `concept`; the edges are `prerequisites[]` in the registry and `links[]` in the explanation.
  `python tools/build-graph.py` writes `graph.json` (topics → concepts → widgets, prerequisite and
  related edges) from those two sources. A separate hand-edited "graph index" would be a third copy
  that drifts.

## File shape

```js
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-<id>"] = /* JSON-START */ {
  "id": "of-<id>",
  "concept": "<registry concept slug>",
  "version": "0.1.0",
  "en": { ...sections... },
  "ru": { ...sections... }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-<id>" }));
```

### Sections (per language)

| Key | Type | What goes there |
| --- | --- | --- |
| `summary` | string | 2–3 sentences: the idea in plain words. Always visible. |
| `concept` | string[] | Paragraphs explaining the concept itself, independent of the widget. |
| `formulas` | `{label, expr}[]` | Plain-text formulas (Unicode, no LaTeX, no MathJax). |
| `computation` | string[] | Numbered steps: how the widget computes what it shows, with the **default-state numbers** substituted, so a learner can check the table against the text. |
| `how_to_use` | `{control?, text}[]` | Numbered steps; `control` is the visible label of the control (as printed in the widget's `I18N`), rendered as a key cap. |
| `notice` | string[] | What the learner should notice (bullets). |
| `misconceptions` | `{myth, truth}[]` | Common misconception and the correction. |
| `links` | `{id, text}[]` | Related widget ids (must exist in the registry) and why. |

Inline mark-up allowed in strings: `` `code` `` and `**bold**`. Nothing else: underscores are
subscripts in formulas and must not be interpreted.

Languages: every language in `registry.vocabulary.languages` (`en`, `ru`) must be present with at
least `summary`, `concept` and `how_to_use`. `ar` is reserved; when it arrives `<of-explain>` already
flips to RTL via `:host([lang="ar"])`.

## Rendering

```html
<script src="lib/of-explain.js"></script>
<script src="widgets/of-naive-bayes/component.js"></script>
<script src="widgets/of-naive-bayes/explain.js"></script>

<of-naive-bayes lang="en"></of-naive-bayes>
<of-explain for="of-naive-bayes" lang="en" open="concept,how"></of-explain>
```

- `for` — the widget id. `lang` — `en` | `ru`, re-renders on change (the lecture page's EN/RU switch
  sets `lang` on every `of-*` element, so the explanation follows the widget). `open` — comma list of
  sections expanded by default (`concept,formulas,computation,how,notice,misconceptions,links`);
  default `concept,how`.
- Load order does not matter: the element re-renders when its `explain.js` registers.
- The library page shows the explanation under the preview and includes the three lines above in the
  embed snippet; the lecture page shows it under each widget.

## Validation

`node tools/validate-registry.js` warns when a published widget has no `explain.js`, and errors when
one exists but the JSON span does not parse, lacks a language, lacks a required section, or links to
an id that is not in the registry. `python tools/build-graph.py` fails on the same conditions.

## Versioning

`version` in the explanation is independent of the component's version: a text-only change bumps
the explanation's patch, not the widget's. A changed control label must be mirrored in `how_to_use`
in the same commit (the validator does not check labels; the author does).
