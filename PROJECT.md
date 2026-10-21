# Project registration — ASI OS

This repository is a **standalone project**, independent of BrainCore (ASI OS). It holds only the
library code. The planning record lives in the private `user/` layer of the BrainCore vault
(`Q:\ASIOS\BRAINCORE`), not here:

| Record | Where (in the live vault) |
| --- | --- |
| Activity `ACT-00069` — "البدء بالتخطيط للمشروع لبناء ودجت للتعلم الالي" | `user/database/activity-db/ACT-00069-activity/` |
| Widget catalog (topic → concept → widget, domain tags, prerequisite graph) | `user/data/activity/2026-10/ACT-00069-disk/documents/ACT-00069-widget-catalog.md` |
| Project work plan (decisions D1–D10, Phases 0–5, acceptance checklist) | `user/data/activity/2026-10/ACT-00069-disk/documents/ACT-00069-project-work-plan.md` |

## Decisions in force (from the work plan, approved 2026-10-21)

| # | Decision |
| --- | --- |
| D1 | Repo `Q:\Projects\interactive-widgets`, own git, private GitHub remote under the author's account |
| D2 | One Web Component per widget, prefix `of-`, attributes `lang` and `config` |
| D3 | No build step, no framework, no CDN, no network fonts; works from `file://` |
| D4 | Hand-maintained `widgets/registry.json` with `topic`, `concept`, `domains[]` on top of the spec fields |
| D5 | English first; `en` and `ru` from day one; `ar` reserved (RTL-ready CSS, strings later) |
| D6 | Canvas 2D / SVG only in the first sprint |
| D7 | Lecture = JSON blocks rendered to one standalone HTML page (Phase 3) |
| D8 | Prerequisite graph derived from `prerequisites[]`, never hand-drawn |
| D9 | The autoencoder figures from the activity are style reference only |
| D10 | `staging/` and an approve step from the start |

Data policy: synthetic, seeded data generated inside each widget; only CNN widgets bundle a tiny
8×8 digits JSON inside their own folder.

## Phases

0 Foundation (this scaffold) → 1 Six P1 widgets → 2 Library UI → 3 Lecture embedding →
4 Prerequisite graph + P2 widgets → 5 Later (staging automation, teaching memory, sharing).
