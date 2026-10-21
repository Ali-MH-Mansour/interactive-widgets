# of-linear-fit — fit a line by hand (residuals and MSE)

**Concept:** linear regression — a model ŷ = w·x + b, the residuals y − ŷ, and the mean squared error as the quantity a learner is trying to minimise.
**Topic:** machine-learning · **Domains:** ml, math · **Difficulty:** 1/5 · **Prerequisites:** none.

## What the learner should notice
- The red bars are the residuals; MSE is the mean of their squares, so one far point costs much more than several near ones.
- There is exactly one (w, b) with the smallest MSE — tick "least-squares line" to see it; no hand position beats it.
- More noise raises the best possible MSE: the error is not zero even for the perfect line.

## Common misconceptions
- "A line through the most points is the best line" — the best line minimises squared distance, it need not touch any point.
- "MSE = 0 means a perfect model" — on noisy data MSE = 0 means overfitting, not truth.

## Config keys
| Key | Default | Meaning |
| --- | --- | --- |
| `w`, `b` | `0.5`, `1` | the learner's line |
| `noise` | `1.5` | standard deviation of the noise added to y = 2x + 1 |
| `n`, `seed` | `20`, `7` | number of points and the random seed |
| `showResiduals`, `showBest` | `true`, `false` | draw residual bars / the least-squares line |

Embed: `<script src="widgets/of-linear-fit/component.js"></script> <of-linear-fit lang="ru" config='{"w": 2, "b": 1}'></of-linear-fit>`

## Changelog
- 0.1.0 (2026-10-21) — first version.
