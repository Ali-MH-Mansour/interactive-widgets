// Explanation data for <of-kmeans-steps>. Pure data; strict JSON between the markers (read by tools).
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-kmeans-steps"] = /* JSON-START */ {
  "id": "of-kmeans-steps",
  "concept": "clustering",
  "version": "0.1.0",
  "en": {
    "summary": "k-means groups unlabelled points into k clusters with two alternating steps: give every point to its nearest centroid, then move every centroid to the mean of its points. Each step can only lower the total squared distance (inertia), so the process must stop; where it stops depends on where the centroids started.",
    "concept": [
      "**No labels.** Unlike the classifiers, k-means is told nothing about classes. It only sees positions and a number k. The 'clusters' are its own invention; they may or may not match the true groups.",
      "**Assign.** For each point compute the distance to every centroid and take the nearest. This partitions the plane into k cells (Voronoi regions) bounded by straight lines halfway between centroids.",
      "**Update.** For each cluster compute the mean of its points and move the centroid there. The mean is the point that minimises the summed squared distance to the cluster's members, which is why it is the right place.",
      "**Why it converges.** Inertia = Σ ‖x − μ(x)‖² over all points. Assign cannot raise it (each point picks a nearer centroid or stays), Update cannot raise it (the mean minimises it). A quantity that never increases and has finitely many partitions must stop changing. It stops at a local minimum, not necessarily the best one."
    ],
    "formulas": [
      { "label": "assign", "expr": "c(x) = argmin_j ‖x − μ_j‖²" },
      { "label": "update", "expr": "μ_j = (1/|C_j|) Σ_{x ∈ C_j} x" },
      { "label": "inertia", "expr": "J = Σ_x ‖x − μ_c(x)‖²" }
    ],
    "computation": [
      "The data are 60 points drawn from **blobs** (3 by default) Gaussian clouds. The widget keeps the true blob only to generate the points; the algorithm never sees it.",
      "**Restart** places k centroids at k random data points (the usual initialisation). The points are 'not assigned yet' and inertia is undefined.",
      "**Assign** computes, for every point, the squared distance to each centroid, keeps the smallest and colours the point by that centroid. The lines (if shown) join each point to its centroid; inertia is the sum of the squared lengths of those lines.",
      "**Update** replaces each centroid by the mean of the points of its colour (a centroid with no points stays put). Inertia is recomputed with the new positions and can only drop.",
      "**Step** does Assign then Update; **Play** repeats Step until no point changes colour, which is reported as converged."
    ],
    "how_to_use": [
      { "control": "Assign / Update", "text": "do the two half-steps by hand the first time and read the inertia after each: it falls or stays, never rises." },
      { "control": "Step / Play", "text": "run to convergence and count the iterations; usually under ten." },
      { "control": "Restart", "text": "run again several times: the final clustering (and inertia) sometimes differs; the lower inertia is the better local optimum." },
      { "control": "Number of clusters k", "text": "set k = 2 on three blobs (two blobs merged) and k = 6 (blobs split): the algorithm is equally happy, inertia alone does not pick k." },
      { "control": "Lines to centroids", "text": "keep them on to see what inertia is measuring." }
    ],
    "notice": [
      "Inertia never increases from one half-step to the next.",
      "Different starts can converge to different answers; k-means++ initialisation and multiple restarts exist for this reason.",
      "Converged means the assignments stopped changing, not that the clusters are correct.",
      "k is an input, not an output."
    ],
    "misconceptions": [
      { "myth": "k-means finds the number of clusters.", "truth": "k must be given; choosing it needs an extra criterion (elbow, silhouette) or domain knowledge." },
      { "myth": "Centroids are data points.", "truth": "after the first Update they are means and usually coincide with no point." }
    ],
    "links": [
      { "id": "of-naive-bayes", "text": "also summarises groups by their means, but with labels and per-feature spread." },
      { "id": "of-tree-split", "text": "a supervised method that partitions the plane with axis-aligned cuts rather than nearest-centroid cells." }
    ]
  },
  "ru": {
    "summary": "k-средних группирует неразмеченные точки в k кластеров двумя чередующимися шагами: отдать каждую точку ближайшему центроиду, затем сдвинуть каждый центроид в среднее его точек. Каждый шаг может только уменьшить суммарный квадрат расстояний (инерцию), поэтому процесс обязан остановиться; где именно — зависит от того, откуда стартовали центроиды.",
    "concept": [
      "**Без меток.** В отличие от классификаторов, k-средних ничего не знает о классах. Он видит только координаты и число k. «Кластеры» — его собственное изобретение; они могут совпадать с истинными группами, а могут и нет.",
      "**Назначить.** Для каждой точки вычислить расстояние до каждого центроида и взять ближайший. Это делит плоскость на k ячеек (области Вороного), ограниченных прямыми посередине между центроидами.",
      "**Обновить.** Для каждого кластера вычислить среднее его точек и перенести туда центроид. Среднее — точка, минимизирующая сумму квадратов расстояний до членов кластера, поэтому это правильное место.",
      "**Почему сходится.** Инерция = Σ ‖x − μ(x)‖² по всем точкам. «Назначить» не может её увеличить (каждая точка выбирает более близкий центроид или остаётся), «Обновить» не может её увеличить (среднее её минимизирует). Величина, которая никогда не растёт при конечном числе разбиений, обязана перестать меняться. Остановка — в локальном минимуме, не обязательно лучшем."
    ],
    "formulas": [
      { "label": "назначение", "expr": "c(x) = argmin_j ‖x − μ_j‖²" },
      { "label": "обновление", "expr": "μ_j = (1/|C_j|) Σ_{x ∈ C_j} x" },
      { "label": "инерция", "expr": "J = Σ_x ‖x − μ_c(x)‖²" }
    ],
    "computation": [
      "Данные — 60 точек из **blobs** (по умолчанию 3) гауссовых облаков. Истинное облако виджет использует только для генерации точек; алгоритм его не видит.",
      "**Заново** ставит k центроидов в k случайных точек данных (обычная инициализация). Точки «ещё не назначены», инерция не определена.",
      "**Назначить** вычисляет для каждой точки квадрат расстояния до каждого центроида, берёт наименьший и красит точку в цвет этого центроида. Линии (если показаны) соединяют каждую точку с её центроидом; инерция — сумма квадратов длин этих линий.",
      "**Обновить** заменяет каждый центроид средним точек его цвета (центроид без точек остаётся на месте). Инерция пересчитывается с новыми позициями и может только упасть.",
      "**Шаг** делает «Назначить», затем «Обновить»; **Пуск** повторяет Шаг, пока ни одна точка не меняет цвет, о чём сообщается как о сходимости."
    ],
    "how_to_use": [
      { "control": "Назначить / Обновить", "text": "в первый раз сделайте два полушага вручную и читайте инерцию после каждого: она падает или стоит, но не растёт." },
      { "control": "Шаг / Пуск", "text": "доведите до сходимости и посчитайте итерации; обычно меньше десяти." },
      { "control": "Заново", "text": "запустите ещё несколько раз: итоговая кластеризация (и инерция) иногда различается; меньшая инерция — лучший локальный оптимум." },
      { "control": "Число кластеров k", "text": "поставьте k = 2 на трёх облаках (два облака слиты) и k = 6 (облака разрезаны): алгоритму всё равно, одна инерция k не выбирает." },
      { "control": "Линии к центроидам", "text": "держите включёнными, чтобы видеть, что именно измеряет инерция." }
    ],
    "notice": [
      "Инерция никогда не растёт от одного полушага к следующему.",
      "Разные старты могут сойтись к разным ответам; для этого существуют инициализация k-means++ и многократные перезапуски.",
      "«Сошлось» значит, что назначения перестали меняться, а не что кластеры верны.",
      "k — вход, а не выход."
    ],
    "misconceptions": [
      { "myth": "k-средних находит число кластеров.", "truth": "k нужно задать; его выбор требует дополнительного критерия (локоть, силуэт) или знания предметной области." },
      { "myth": "Центроиды — это точки данных.", "truth": "после первого обновления они — средние и обычно не совпадают ни с одной точкой." }
    ],
    "links": [
      { "id": "of-naive-bayes", "text": "тоже описывает группы их средними, но с метками и разбросом по признакам." },
      { "id": "of-tree-split", "text": "метод с учителем, делящий плоскость разрезами вдоль осей, а не ячейками ближайшего центроида." }
    ]
  }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-kmeans-steps" }));
