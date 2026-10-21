# of-logistic-regression — learning to separate two classes

**Concept:** logistic regression — a linear score z = w1·x1 + w2·x2 + b turned into a probability by the sigmoid, the decision boundary at P = 0.5, the log-loss, and gradient descent learning the weights.
**Topic:** machine-learning · **Domains:** ml, math · **Difficulty:** 2/5 · **Prerequisites:** of-linear-fit.

## What the learner should notice
- The boundary is a straight line; the weights set its direction, the bias shifts it.
- The probability surface is steep where |w| is large and soft where it is small — the same line can be confident or hesitant.
- Press Play from a bad starting point: the line rotates and slides into place as the log-loss falls, and the rings (misclassified points) disappear.
- Accuracy can stay the same while log-loss keeps improving: the model gets more confident, not more correct.

## Common misconceptions
- "Logistic regression is regression" — it predicts a probability of a class; the name is historical.
- "The sigmoid makes the boundary curved" — the boundary stays linear in the inputs.

## Config keys
| Key | Default | Meaning |
| --- | --- | --- |
| `w1`, `w2`, `b` | `-1`, `1.5`, `1` | starting weights (deliberately wrong) |
| `lr` | `0.5` | learning rate of the Step/Play descent |
| `n`, `sep`, `seed` | `40`, `2.6`, `3` | points, class separation, seed |
| `showProb` | `true` | draw the probability surface |

Embed: `<script src="widgets/of-logistic-regression/component.js"></script> <of-logistic-regression lang="ru"></of-logistic-regression>`

## Changelog
- 0.1.0 (2026-10-21) — first version.
