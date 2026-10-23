# site.config — what the platform build reads (seam S4)

The published site (Phase 6.1 of the work plan, `tools/build-site.js`, **not built yet**) is generated
from this repo plus **one file**, `site.config.json` (git-ignored; the committed example is
`site.config.example.json`). Fixing its shape now means 6.1 is a script, not a design round, and nothing
in the widgets changes between "local library" and "published platform" except the generated pages.

| Key | Type | Meaning |
| --- | --- | --- |
| `name` | string | the platform's display name (platform name — to be decided, RE02 of the activity) |
| `domain` | string | canonical host, e.g. `example.org`; used for `<link rel=canonical>`, the sitemap and the licence `host` check |
| `mode` | `local` \| `remote` | what the build writes into `<meta name="of-source">`: `remote` = content served from `apiBase` through `lib/of-source.js`; `local` = a static copy (preview builds) |
| `apiBase` | string | the Worker's API root, e.g. `https://example.org/api`; the provider calls `/registry`, `/concepts`, `/explain/<id>`, `/lesson/<id>`, `/data/<id>`, `/licence` under it |
| `languages` | string[] | languages the site offers, in menu order; must be ⊆ `registry.vocabulary.languages` + reserved (`en`, `ru`, `ar`) |
| `langDefault` | string | language a first visit opens in |
| `licence.content` | string | licence of the content (decided 2026-10-23: `CC BY-NC-ND 4.0`) |
| `licence.code` | string | licence of the shells (decided 2026-10-23: proprietary, "for use on this site only") |
| `licence.heartbeatMinutes` | number | how often a remote page re-checks `/licence` (0 = once per page load) |
| `analytics` | object \| null | `{ "provider": "plausible" \| "ga4" \| "yandex", "id": "…" }`; `null` = none |
| `ads` | object \| null | `{ "network": "adsense", "client": "ca-pub-…", "slots": { "sidebar": "…", "belowWidget": "…" } }`; `null` until the site is accepted (decided 2026-10-23: apply after ~25 indexed pages) |
| `consent` | object | `{ "banner": true, "privacyUrl": "/privacy", "termsUrl": "/terms" }` — the pages 6.1 generates for the ads prerequisites |
| `video` | object \| null | per-widget YouTube ids are **not here** — they are content (`widgets/<id>/video.md` → registry `video` key, see `docs/video-script-standard.md`); this object holds only `{ "embedHost": "www.youtube-nocookie.com", "facade": true }` |
| `build.outDir` | string | where the static part is written, default `dist/` |
| `build.minify` | boolean | bundle + minify the shells into one `assets/widgets.min.js` without source maps |

## Rules

- The repo never contains a real `site.config.json`: it is created on the machine that builds, from the
  example. The example carries placeholders only.
- Every page the build emits gets `<meta name="of-source" content="<mode>; api=<apiBase>">` **except**
  `--inline` lesson copies, which the build never produces (seam S5).
- Changing `mode` or `apiBase` never touches a widget: `lib/of-source.js` reads the tag at run time.
