# of-quantization — symmetric vs asymmetric quantization

**Concept:** quantization — mapping real values to a b-bit integer grid defined by a scale s and a zero-point z, reading them back with a rounding error; the symmetric grid (centred on 0, z = 0) against the asymmetric/affine grid (fitted to [min, max], unsigned, z = round(−min/s)).
**Topic:** machine-learning · **Domains:** ml, math · **Difficulty:** 2/5 · **Prerequisites:** none.

## What the learner should notice
- The rounding error is bounded by s / 2 inside the grid; every extra bit halves s and quarters the MSE.
- On skewed data (default [−1, 3]; or [0, 3] like ReLU outputs) the symmetric grid wastes the levels on the empty side (hollow ticks) — asymmetric places them all inside the data and gets about half the MSE at the same bit width.
- On data centred on 0 (bell-shaped weights) the two grids nearly coincide; symmetric is then the cheaper choice.
- A single large value stretches the range and coarsens the grid for everyone; a probe value outside the grid is clipped (saturation).
- The zero-point is the integer that represents the real 0 exactly — the asymmetric range is widened to include 0 for that reason.

## Common misconceptions
- "Quantization rounds to fewer decimals" — it rounds to a grid whose spacing comes from the range and the bit width.
- "Only more bits reduce the error" — fitting the grid to the data (asymmetric, tighter calibration) reduces s at the same bits.
- "The zero-point is the minimum" — z is the integer standing for the real 0, not the smallest value.

## Config keys
| Key | Default | Meaning |
| --- | --- | --- |
| `mode` | `"symmetric"` | `"symmetric"` (signed, z = 0) or `"asymmetric"` (unsigned, affine) |
| `bits` | `3` | bit width b (2–8) |
| `lo`, `hi` | `-1`, `3` | min and max of the data (hi − lo ≥ 0.5) |
| `shape` | `"uniform"` | how values spread inside [lo, hi]: `"uniform"`, `"bell"`, `"skewed"` (half-normal, piled at lo) |
| `x` | `1.25` | the probe value worked out in the calculation panel |
| `n`, `seed` | `16`, `3` | number of values and the random seed |
| `showErrors`, `showCalc` | `true`, `true` | draw the x → x̂ error bars / show the step-by-step calculation |

Embed: `<script src="widgets/of-quantization/component.js"></script> <of-quantization lang="ru" config='{"mode": "asymmetric", "bits": 4, "lo": 0, "hi": 3, "shape": "skewed"}'></of-quantization>`

## Changelog
- 0.1.0 (2026-10-21) — first version.
