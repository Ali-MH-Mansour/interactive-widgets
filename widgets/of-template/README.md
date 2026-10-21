# of-template — line plot (y = a·x + b)

**Concept:** linear function — slope and intercept.
**Topic:** math-foundations · **Domains:** math, programming · **Difficulty:** 1/5 · **Prerequisites:** none.

This is the reference widget: it exists to show the contract (shadow root, `lang` + `config`
attributes, `I18N` table, `getConfig()`, `change` event, ResizeObserver, Canvas 2D). Copy its folder
to start any new widget — see `docs/widget-authoring.md`.

## What the learner should notice

- The slope `a` tilts the line; a negative slope makes it fall from left to right.
- The intercept `b` slides the line up and down; the marked point is always where the line crosses `x = 0`.
- Changing `a` alone pivots the line around the intercept point, not around the origin.

## Common misconceptions

- "A bigger `b` makes the line steeper" — it does not; only `a` changes steepness.
- "The line always passes through the origin" — only when `b = 0`.

## Config keys

| Key | Default | Meaning |
| --- | --- | --- |
| `a` | `1` | slope, slider range −5..5 |
| `b` | `0` | intercept, slider range −10..10 |
| `xmin`, `xmax` | `-5`, `5` | horizontal axis range |
| `ymin`, `ymax` | `-10`, `10` | vertical axis range |
| `showGrid` | `true` | draw the unit grid |

Embed:

```html
<script src="widgets/of-template/component.js"></script>
<of-template lang="ru" config='{"a": -2, "b": 3}'></of-template>
```

## Changelog

- 0.1.1 (2026-10-21) — wrapped in an IIFE, no `export`: Chrome/Edge block ES-module imports from `file://`, so the demo page rendered nothing; the demo and the embed snippet now use a classic `<script src>`.

- 0.1.0 (2026-10-21) — first version: slope and intercept sliders, EN/RU strings, config round-trip.
