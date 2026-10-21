# Widget authoring — the contract and the template walkthrough

A widget is one Web Component in one file. Copy `widgets/of-template/` and change four things;
everything else is the contract and should stay as it is.

## The contract (every widget must satisfy)

1. **One custom element, one file.** `widgets/of-<id>/component.js` is a plain script **wrapped in an
   IIFE** (`(() => { ... })();`) with **no imports and no exports**, defining exactly one element
   `of-<id>`. It therefore loads both as a classic `<script src>` (works from `file://` — Chrome and
   Edge block ES-module imports there, which is why the first demo rendered an empty page) and via the
   library page's dynamic `import()`. No globals, no document-level ids; all DOM lives in a shadow root.
2. **Two attributes.** `lang` (`en` default, `ru`; `ar` reserved — the host selector `:host([lang="ar"])`
   already flips direction) and `config` (a JSON string). A missing or invalid `config` falls back to
   the module's `DEFAULT_CONFIG` and logs nothing above `console.warn`.
3. **All strings in `I18N`.** Every visible string, per language, in the module's `I18N` object; no
   hard-coded UI text in markup.
4. **Lifecycle.** Render in `connectedCallback`, re-render in `attributeChangedCallback` for `lang` and
   `config`, clean up in `disconnectedCallback` (listeners, animation frames, ResizeObserver).
5. **Resize-safe.** Fills its container width, keeps aspect ratio, redraws on ResizeObserver; usable
   from 320 px wide (the template uses a container query to stack controls).
6. **Native controls.** `<input type="range">`, buttons, selects — keyboard-usable, visible focus ring,
   each with a label and a live value readout (`<output>`).
7. **Round-trip.** `getConfig()` returns the current state (only the keys that differ from the
   defaults), and the element dispatches a `change` CustomEvent (`detail` = that config, `bubbles`,
   `composed`) on every learner input. The library page builds the embed snippet from this.
8. **Pure JS.** Computation in plain JS; drawing with Canvas 2D or SVG; no d3, no TF.js, no network
   fonts, no CDN. Data is synthetic and seeded inside the widget (only CNN widgets bundle a tiny
   8×8 digits JSON in their own folder).
9. **Ships with** `preview.png` (640×400, default state), `README.md` (pedagogical note: concept, what
   to notice, misconceptions, config keys with defaults, prerequisites, changelog) and an
   `index.html` standalone demo.
10. **Has a registry entry** that passes `node tools/validate-registry.js`.

## Walkthrough: from the template to a new widget in under 30 minutes

1. **Copy** `widgets/of-template/` → `staging/of-<id>/`. Pick the id from the catalog (kebab-case,
   no version suffix).
2. **Rename** — in `component.js` change `TAG` and the class name; in `index.html` change the tag
   names and keep `<script src="./component.js">`.
3. **Model** — replace `DEFAULT_CONFIG` with your parameters (keep types primitive so the JSON config
   round-trips), and `_draw()` with your computation + drawing. Keep `_parseConfig`, `getConfig`,
   `_onInput`, `_scheduleDraw` as they are; they are the contract.
4. **Controls** — edit the `<label>` blocks in `_render()`: one per learner input, `name` equal to the
   config key, `min/max/step` sensible for the concept. Non-numeric inputs (a select, a click on the
   canvas) call the same path: set `this._cfg[key]`, redraw, dispatch `change`.
5. **Strings** — fill `I18N.en` and `I18N.ru` for every string you added. Leave `ar` out until the
   Arabic pass; nothing else needs to change for RTL.
6. **Demo + preview** — open `staging/of-<id>/index.html` from `file://`, check both languages and a
   custom config; capture the default state as `preview.png` at 640×400.
7. **README** — concept, what the learner should notice, misconceptions, config table, changelog.
8. **Registry** — add an entry (`status: "planned"` while in staging), run the validator.
9. **Publish** per `docs/publish.md`.

## Acceptance checklist (copy into the publish request)

- [ ] Renders standalone (`index.html`) and embedded (library preview).
- [ ] `lang="en"` and `lang="ru"` both render every visible string; switching re-renders without reload.
- [ ] Config round-trip: the embed snippet from `getConfig()` reproduces the state on a fresh page; missing config falls back to defaults.
- [ ] The learner can change at least two inputs and sees the effect immediately (no submit button).
- [ ] Registry entry passes the validator: concept, topic, ≥1 domain, prerequisites, difficulty, version.
- [ ] `preview.png` present, 640×400, default state.
- [ ] `README.md` has the pedagogical note.
- [ ] No console errors or warnings in Chrome and Edge; every control works from the keyboard.
- [ ] Works offline from `file://` and an intranet path with zero network requests.
- [ ] Reviewed in staging and published with a version bump in the README changelog.
