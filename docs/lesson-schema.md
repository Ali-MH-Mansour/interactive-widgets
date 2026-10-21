# Lessons — `lessons/<id>.json` and `tools/render-lesson.js`

A lecture is written once as **JSON blocks** and rendered to **one standalone HTML page** (decision D7).
You never hand-write `<script>` tags or copy embed snippets: the renderer reads the registry, knows
which widgets the lesson uses, and emits the right script tags (or inlines the files) itself.

```
node tools/render-lesson.js lessons/ml-models-lecture.json            # → lessons/ml-models-lecture.html
node tools/render-lesson.js lessons/ml-models-lecture.json --check    # validate only
node tools/render-lesson.js lessons/ml-models-lecture.json --inline --out "Q:/A/Teaching/2026/ML/lectures/03/ml-models.html"
node tools/render-lesson.js lessons/ml-models-lecture.json --lang ru  # page opens in Russian
```

| Flag | Effect |
| --- | --- |
| *(none)* | Writes `lessons/<id>.html` next to the JSON. Scripts and the stylesheet are **linked** (`../lib/…`, `../widgets/…`), so the page must stay inside the repo. |
| `--inline` | Embeds `styles.css`, `lib/of-explain.js` and every used widget's `component.js` + `explain.js` into the page: one file, copy it anywhere (teaching folder, USB stick, LMS upload). ~200 KB for six widgets. |
| `--out <file>` | Output path (with `--inline` it may be outside the repo). |
| `--lang <l>` | The language the page opens in. The EN/RU switch is always present; the choice is remembered per browser when storage is available. |
| `--check` | Validate and print the block / widget / quiz counts, write nothing. Exit 1 on any error. |

The rendered page opens from `file://` (classic scripts, no fetch, no modules, no network) and
carries **all languages** of the lesson — switching does not reload. The `Explanations` button hides
every `<of-explain>` for projection; the quizzes check themselves in the page.

## File shape

```json
{
  "id": "ml-models-lecture",                       // must equal the file name
  "title_i18n": { "en": "…", "ru": "…" },
  "languages": ["en", "ru"],                       // optional; default: registry.vocabulary.languages
  "langDefault": "en",                             // optional; default: first language
  "author": "…", "created": "YYYY-MM-DD",          // free metadata, not rendered
  "blocks": [ … ]
}
```

Every text field ending in `_i18n` is an object with **one entry per lesson language**; a missing
language is an error, not a fallback — a half-translated lecture is caught before class, not during
it. Inline mark-up inside texts is the same subset `explain.js` allows: `` `code` `` and `**bold**`.

## Block types

| `type` | Fields | Renders as |
| --- | --- | --- |
| `heading` | `text_i18n`, `level` (2, default, or 3), `id` (optional; slug of the English text when absent) | `<h2 id>` / `<h3>`. Every level-2 heading opens a new `<section>` and a link in the page's table of contents. |
| `paragraph` | `text_i18n` | `<p>` |
| `equation` | `expr` (plain Unicode, same in every language) **or** `expr_i18n`; optional `label_i18n` | A labelled formula card. Unicode only — no LaTeX, no MathJax (offline constraint). |
| `widget` | `widgetId` (a **published** id in `widgets/registry.json`), optional `config` (object, the widget's `config` attribute) | `<of-xxx lang config>` — the live widget. |
| `explain` | `widgetId`, optional `open` (comma list of sections to open: `concept,formulas,computation,how,notice,misconceptions,links`) | `<of-explain for lang open>` — the widget's explanation from `widgets/<id>/explain.js`. |
| `quiz` | `question_i18n`, `options_i18n` (`{en: [...], ru: [...]}`, equal lengths), `answer` (0-based index), optional `feedback_i18n` | A radio-button quick check with a **Check** button; the verdict and the feedback appear in the page. |

Validation (always, and alone with `--check`): unknown block type; a missing language in any
`_i18n`; a `widgetId` not in the registry, not `published`, or whose `component.js` / `explain.js`
is absent; a `config` that is not an object; duplicate heading ids; quiz options of unequal length
across languages or an `answer` out of range; `id` ≠ file name; `langDefault` not in `languages`.

## Conventions

- **One lesson, one JSON.** `lessons/<id>.json` is the source; `lessons/<id>.html` is **generated**
  (first line says so) and is committed so the page can be opened straight from GitHub or a clone
  without Node. Re-render after editing the JSON or any widget the lesson uses.
- **Pattern per concept:** `heading` → `paragraph` (what to look at and why) → `equation` →
  `widget` → `explain` → `quiz`. Nothing enforces it; the first lecture follows it.
- **Teaching-folder handoff (work plan 3.4):** render with `--inline --out <teaching path>`; the
  copy in the teaching folder is a build artefact, the JSON in this repo stays the source.
- **Adding a block type** means: the validator case, the renderer case, a row in this table.
