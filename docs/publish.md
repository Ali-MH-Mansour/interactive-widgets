# Staging and publishing

Principle (from the product spec): **nothing is written to the production library `widgets/`
without an explicit approval step.** In Phases 0–2 the step is manual; Phase 5 may automate it, but
the sequence stays the same.

## Flow

1. **Draft in `staging/of-<id>/`** — same folder shape as `widgets/of-<id>/` (`component.js`,
   `index.html`, `preview.png`, `README.md`). Add the registry entry with `"status": "planned"` and
   `"version": "0.0.0"` so prerequisite edges already resolve.
2. **Preview and iterate** — open the staging demo from `file://`, run through the acceptance
   checklist in `docs/widget-authoring.md`, note the result in the publish request below.
3. **Approve** — the library owner ticks the checklist. Nothing moves before this.
4. **Publish** — one commit that does all of:
   - move `staging/of-<id>/` → `widgets/of-<id>/`;
   - set `"status": "published"`, bump `"version"` (first publish `0.1.0`; later: patch for a fix,
     minor for new config keys or strings, major for a changed contract or removed keys), set
     `"preview"` to the new path;
   - add the changelog line in the widget's README;
   - run `node tools/validate-registry.js` — must print `ok`;
   - commit message `publish(of-<id>): 0.1.0 — <one line>`.
5. **Never edit a published widget in place for a content change** — copy it back to `staging/`,
   iterate, re-publish with a version bump. Typos and comment fixes may go straight in as a patch bump.

## Publish request (paste into the commit body or a PR)

```
Widget: of-<id>  version: x.y.z
Checklist: [list of ticked items from docs/widget-authoring.md]
Reviewed by: <name>  date: YYYY-MM-DD
```

## Dry run performed on 2026-10-21 (Phase 0, step 0.7)

`of-template` was drafted as `staging/of-template/` at `0.0.0`, validated, moved to
`widgets/of-template/` and published at `0.1.0` in the first commit of this repository. The
`staging/` folder is empty afterwards (its `README.md` keeps the folder in git).
