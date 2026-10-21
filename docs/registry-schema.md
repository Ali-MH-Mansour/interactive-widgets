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
| `concept_order` | integer ≥ 1 | no | Position of the widget inside its concept kit (`widgets/concepts.json`); must equal its index in the kit's `parts`. |
| `concept_role` | string | no | What the widget contributes to the concept: one of `vocabulary.roles` — `foundation` (a quantity the concept rests on), `mechanism` (one step of the method), `algorithm` (the whole method running), `application` (using the result), `pitfall` (what goes wrong), `extension` (a variant). |

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

## Concept kits — `widgets/concepts.json`

A **concept kit** is the set of widgets that together teach one concept, in teaching order — the answer to
"can a concept be split into several small widgets that are still one unit?" (decision-tree kit, 2026-10-21).
The link between the parts is **metadata only**: no widget knows about another at run time; the registry,
this file and the derived graph carry the structure.

```json
{
  "schema_version": "1.0.0",
  "concepts": [
    {
      "id": "decision-tree",
      "topic": "machine-learning",
      "title_i18n": { "en": "Decision trees", "ru": "Деревья решений" },
      "summary_i18n": { "en": "…", "ru": "…" },
      "parts": ["of-impurity-calculator", "of-split-gain", "of-tree-split", "of-tree-predict", "of-tree-depth-overfit", "of-regression-tree"],
      "related": ["of-naive-bayes", "of-logistic-regression"]
    }
  ]
}
```

| Field | Rule |
| --- | --- |
| `id` | The `concept` slug the parts carry in the registry. One record per concept at most. |
| `topic` | One of `vocabulary.topics`. |
| `title_i18n`, `summary_i18n` | Every language in `vocabulary.languages`. |
| `parts` | **Ordered** widget ids, all with `concept` = this id; every registry widget with this concept must be listed (the validator refuses a stray one). A part may be `status: planned` — the kit is designed before it is built and the graph draws the planned parts hollow. |
| `related` | Widget ids of neighbouring concepts (drawn as `related` edges from the concept node). |

What the kit gives for free: the library page can show a **concept page** (summary, the parts in order with
their role, progress through them), `graph.json` carries `part-of` edges with `order` and `role`, the lesson
renderer can generate a default lesson for a concept (one `widget` + `explain` block per part, in order),
and a lecture that embeds part *k* can warn when parts *1..k-1* appear in no earlier lecture. The
`prerequisites[]` of the parts should still chain them (part *k* lists part *k-1*), so the learning-path
view and the kit agree.
