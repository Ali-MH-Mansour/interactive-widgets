# lessons/

Lessons as JSON blocks (Phase 3 of the work plan, decision D7): `<id>.json` holds `id`,
`title_i18n`, `languages`, `langDefault` and `blocks[]` of `heading` / `paragraph` / `equation` /
`widget {widgetId, config}` / `explain {widgetId, open}` / `quiz`. Contract: `docs/lesson-schema.md`.

`node tools/render-lesson.js lessons/<id>.json` renders one standalone HTML page next to the JSON
(`<id>.html`, generated — edit the JSON, not the page); `--inline --out <path>` writes a single
self-contained file that works from any folder.

| Lesson | Widgets | Page |
| --- | --- | --- |
| `ml-models-lecture.json` — regression → classification → trees → clustering (EN/RU, 6 sections, 6 quizzes) | of-linear-fit · of-gd-linear-regression · of-logistic-regression · of-naive-bayes · of-tree-split · of-kmeans-steps | `ml-models-lecture.html` |
