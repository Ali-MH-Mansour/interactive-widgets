# of-naive-bayes — naive Bayes classifier

**Concept:** Bayes' rule for classification with the naive independence assumption: P(c | x) ∝ P(c) · p(x1 | c) · p(x2 | c), Gaussian likelihoods per feature.
**Topic:** machine-learning · **Domains:** ml, math · **Difficulty:** 2/5 · **Prerequisites:** none (of-probability-basics when it exists).

## What the learner should notice
- The model is only four numbers per class and feature (mean, variance) plus the prior — training is counting and averaging.
- The dashed ellipses are the per-class ±σ: the decision regions follow their shape and are not straight lines.
- Class 1 has the larger prior (60 % of the points): far from both clouds it wins by prior alone.
- The product of likelihoods is tiny; what matters is the ratio, which the posterior normalises.

## Common misconceptions
- "Naive Bayes outputs calibrated probabilities" — the independence assumption usually makes them over-confident.
- "The prior does not matter when we have features" — move the point far away and watch it decide.

## Config keys
| Key | Default | Meaning |
| --- | --- | --- |
| `x1`, `x2` | `0.5`, `-0.5` | the test point |
| `n`, `seed` | `30`, `5` | points (40 % class 0, 60 % class 1) and seed |
| `showRegions` | `true` | draw the decision regions |
| `showCalc` | `false` | unfold the arithmetic behind the table: priors, μ/σ, the Gaussian formula with numbers substituted, products, normalisation |

Embed: `<script src="widgets/of-naive-bayes/component.js"></script> <of-naive-bayes lang="en"></of-naive-bayes>`

## Changelog
- 0.1.1 (2026-10-21) — "Show the calculation" panel (`showCalc`): every table cell derived step by step with the live numbers; `explain.js` added.
- 0.1.0 (2026-10-21) — first version.
