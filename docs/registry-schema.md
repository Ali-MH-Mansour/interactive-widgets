# Registry schema — `widgets/registry.json`

The registry is the catalog: one entry per widget, hand-maintained in Phases 0–1. The library page,
the prerequisite graph (Phase 4) and the lesson renderer (Phase 3) all read it; nothing else is a
source of truth for what the library contains. `node tools/validate-registry.js` checks every rule
below and exits non-zero on the first error list.

## File shape

```json
{
  "schema_version": "1.0.0",
  "vocabulary": { "topics": [...], "domains": [...], "languages": ["en", "ru"], "statuses": ["published", "planned"] },
  "widgets": [ { ...entry... } ]
}
```

`vocabulary` is the closed list the validator checks against. Adding a topic or a domain is a
deliberate edit here, never an ad-hoc value on an entry.

## Entry fields

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `id` | string | yes | Custom-element tag and folder name: `of-` + kebab-case, **no version suffix** (`of-decision-boundary`, not `decision-boundary-v1`). Unique. |
| `status` | `published` \| `planned` | no (default `published`) | `planned` = entry exists so prerequisite edges resolve, no `component.js` yet; drawn hollow in the UI. |
| `title_i18n` | `{lang: string}` | yes | Non-empty for every language in `vocabulary.languages`. Reserved languages (`ar`) may be absent. |
| `description_i18n` | `{lang: string}` | yes | Same rule. One or two sentences. |
| `topic` | string | yes | One of `vocabulary.topics` — the catalog's top level. |
| `concept` | string | yes | Kebab-case concept slug under the topic (`linear-regression`, `gradient-descent`, …) — the catalog's second level. |
| `domains` | string[] | yes, ≥1 | Subset of `vocabulary.domains` (`ml`, `math`, `programming`, `ai`). A widget reusable across lectures carries two or more. |
| `tags` | string[] | yes | Free kebab-case English tags for search. |
| `prerequisites` | string[] | yes (may be empty) | **Widget ids**, each present in this registry; no self-reference, no cycles. Soft (recommended order), not gates. |
| `difficulty` | integer 1–5 | yes | Hand-set per widget; never inferred from graph depth. |
| `version` | semver | yes | Bumped on every publish (`docs/publish.md`). |
| `author` | string | yes | Display name. |
| `created` | `YYYY-MM-DD` | yes | First publish date (draft date while `planned`). |
| `preview` | path | yes when published | Relative to the repo root; a 640×400 PNG of the default state. Must exist. |
| `used_in` | string[] | no | Lesson ids that embed the widget (filled by the renderer in Phase 3). |

Also required on disk for a `published` entry: `widgets/<id>/component.js` (error if missing),
`widgets/<id>/README.md` (warning if missing) and `widgets/<id>/explain.js` (warning if missing; error if
present but invalid — `docs/explain-schema.md`). The derived graph (`python tools/build-graph.py` →
`graph.json`) is built from this registry plus the explanations; it is never edited by hand.

## Example

```json
{
  "id": "of-sigmoid",
  "status": "planned",
  "title_i18n": { "en": "Sigmoid function", "ru": "Сигмоида" },
  "description_i18n": { "en": "Slide x and see σ(x) and its slope.", "ru": "Двигайте x и смотрите σ(x) и её наклон." },
  "topic": "machine-learning",
  "concept": "logistic-regression",
  "domains": ["ml", "math"],
  "tags": ["sigmoid", "activation", "logistic"],
  "prerequisites": ["of-template"],
  "difficulty": 2,
  "version": "0.0.0",
  "author": "Ali Mansour",
  "created": "2026-10-21",
  "preview": "widgets/of-sigmoid/preview.png"
}
```

## Optional keys (added 2026-10-21)

| Key | Type | Meaning |
| --- | --- | --- |
| `demo_config` | object | the custom config shown as the second (RU) instance on the widget's generated `index.html` (`tools/gen-widget-pages.py`) |
