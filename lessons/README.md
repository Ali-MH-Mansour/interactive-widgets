# lessons/

Lessons as JSON blocks (Phase 3 of the work plan): `<lesson-id>.json` with `id`, `title_i18n`,
`langDefault` and `blocks[]` of `heading` / `paragraph` / `equation` / `widget {widgetId, config}` /
`quiz`. `tools/render-lesson.js` (Phase 3) renders one lesson to a standalone HTML page. Empty until
Phase 3; this file keeps the folder in git.
