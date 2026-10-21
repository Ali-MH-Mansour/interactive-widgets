# of-tree-split — decision tree: split and gain

**Concept:** a decision tree as a sequence of threshold questions; impurity (Gini, entropy), information gain, greedy growth, depth.
**Topic:** machine-learning · **Domains:** ml, math · **Difficulty:** 2/5 · **Prerequisites:** none (of-impurity-calculator when it exists).

## What the learner should notice
- A split is a single question on a single feature: the boundary is always axis-aligned.
- The gain is the parent's impurity minus the size-weighted impurity of the children — it rewards *pure* children, not *balanced* ones.
- "Best root split" picks the largest gain; your own split usually loses to it, but sometimes a worse first split lets depth 2 finish faster.
- Depth 3 is enough for this rectangle; depth 5 only chases single points (overfitting).

## Common misconceptions
- "Entropy and Gini give different trees" — they almost always agree on the split; they differ in scale.
- "Deeper is better" — training accuracy rises, generalisation does not.

## Config keys
| Key | Default | Meaning |
| --- | --- | --- |
| `feature`, `threshold` | `0`, `0` | the root split (0 = x1, 1 = x2) |
| `depth` | `1` | levels grown greedily below the root |
| `criterion` | `"gini"` | `"gini"` or `"entropy"` |
| `n`, `seed` | `60`, `11` | points (class 1 inside a rectangle) and seed |

Embed: `<script src="widgets/of-tree-split/component.js"></script> <of-tree-split lang="en" config='{"depth": 3}'></of-tree-split>`

## Changelog
- 0.1.0 (2026-10-21) — first version.
