# lessons/

Lessons as JSON blocks (Phase 3 of the work plan, decision D7): `<id>.json` holds `id`,
`title_i18n`, `languages`, `langDefault` and `blocks[]` of `heading` / `paragraph` / `equation` /
`widget {widgetId, config}` / `explain {widgetId, open}` / `quiz`. Contract: `docs/lesson-schema.md`.

`node tools/render-lesson.js lessons/<id>.json` renders one standalone HTML page next to the JSON
(`<id>.html`, generated — edit the JSON, not the page); `--inline --out <path>` writes a single
self-contained file that works from any folder.

**Lecture copies stay local by contract (seam S5, 2026-10-23).** An `--inline` page embeds every
script, carries no `<meta name="of-source">` and calls no gate: it works offline from any folder
forever, whatever the published site does later. `--mode remote` (the platform's own lesson pages,
content pulled through `lib/of-source.js`) is reserved for the Phase 6.1 build and refused today.
Linked pages (the default, `<id>.html` beside the JSON) load `lib/of-source.js` in `local` mode.

| Lesson | Widgets | Page |
| --- | --- | --- |
| `ml-models-lecture.json` — regression → classification → trees → clustering (EN/RU, 6 sections, 6 quizzes) | of-linear-fit · of-gd-linear-regression · of-logistic-regression · of-naive-bayes · of-tree-split · of-kmeans-steps | `ml-models-lecture.html` |
| `quantization.json` — why quantize · symmetric vs asymmetric · bits, range and outliers (EN/RU, 3 sections, 2 quizzes); a short standalone lesson for any ML or AI course | of-quantization | `quantization.html` |
