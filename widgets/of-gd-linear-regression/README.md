# of-gd-linear-regression — gradient descent learns a line

**Concept:** gradient descent and the weight update w ← w − η·∂L/∂w on the MSE of a line; learning rate, convergence, divergence.
**Topic:** machine-learning · **Domains:** ml, math · **Difficulty:** 2/5 · **Prerequisites:** of-linear-fit.

## What the learner should notice
- The gradient says which way the loss rises; the update moves *against* it, scaled by η.
- Steps are big when the gradient is big (far from the optimum) and shrink as the line settles.
- With η above ≈ 0.3 the line overshoots more each step and the loss explodes — "diverged".
- b converges more slowly than w here: the gradient in b is smaller because the x values are centred.

## Common misconceptions
- "A larger learning rate always learns faster" — only up to the stability limit.
- "Gradient descent finds the line in one step" — it is iterative; the closed-form solution is a different method.

## Config keys
| Key | Default | Meaning |
| --- | --- | --- |
| `lr` | `0.05` | learning rate η |
| `w0`, `b0` | `-1`, `3` | starting weights |
| `noise`, `n`, `seed` | `1.2`, `20`, `7` | data generation (true line y = 2x + 1) |

Embed: `<script src="widgets/of-gd-linear-regression/component.js"></script> <of-gd-linear-regression lang="en" config='{"lr": 0.3}'></of-gd-linear-regression>`

## Changelog
- 0.1.0 (2026-10-21) — first version.
