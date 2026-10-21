# of-kmeans-steps — k-means step by step

**Concept:** k-means clustering as two alternating steps — assign each point to the nearest centroid, move each centroid to the mean of its points — minimising inertia until the assignments stop changing.
**Topic:** machine-learning · **Domains:** ml · **Difficulty:** 1/5 · **Prerequisites:** none.

## What the learner should notice
- Inertia never increases: each step can only lower it, which is why the algorithm must stop.
- Restart gives different starting centroids and sometimes a different, worse final clustering: k-means finds a local optimum.
- k is not learned: with k = 2 on three blobs two are merged, with k = 6 blobs are split — the algorithm is happy either way.
- "Converged" means assignments stopped changing, not that the clusters are "right".

## Common misconceptions
- "k-means finds the number of clusters" — it needs k as input.
- "Centroids are data points" — after the first update they are means, usually not on any point.

## Config keys
| Key | Default | Meaning |
| --- | --- | --- |
| `k` | `3` | number of centroids (1–6) |
| `blobs`, `n`, `seed` | `3`, `60`, `2` | true blobs in the data, points, seed |
| `showLines` | `true` | draw a line from each point to its centroid |

Embed: `<script src="widgets/of-kmeans-steps/component.js"></script> <of-kmeans-steps lang="ru" config='{"k": 4}'></of-kmeans-steps>`

## Changelog
- 0.1.0 (2026-10-21) — first version.
