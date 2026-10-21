// Explanation data for <of-naive-bayes>. Pure data: the object between the JSON markers is strict JSON
// (tools/validate-registry.js and tools/build-graph.py read it). Rendered by <of-explain for="of-naive-bayes">.
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-naive-bayes"] = /* JSON-START */ {
  "id": "of-naive-bayes",
  "concept": "naive-bayes",
  "version": "0.1.0",
  "en": {
    "summary": "Naive Bayes does not learn a boundary. It learns a tiny description of each class (how many points, and the mean and spread of every feature) and then asks, for any new point, which class description makes that point least surprising, weighted by how common the class is.",
    "concept": [
      "**Bayes' rule.** For a point x and a class c, the probability we want is the posterior P(c | x). Bayes' rule rewrites it from things we can count: P(c | x) = P(c) · p(x | c) / p(x). P(c) is the **prior** (how often the class occurs), p(x | c) is the **likelihood** (how typical x is for that class) and p(x) is the same number for every class, so it only normalises.",
      "**The naive part.** With two features, p(x | c) would need the joint distribution of (x1, x2) inside the class. Naive Bayes assumes the features are independent given the class, so the joint splits into a product: p(x | c) = p(x1 | c) · p(x2 | c). That is wrong in general, and it still works surprisingly well.",
      "**Gaussian naive Bayes.** Each per-feature likelihood is modelled as a normal distribution with its own mean μ and standard deviation σ, estimated from the training points of that class. So a class is just 1 + 2·2 = 5 numbers: the prior, and (μ, σ) per feature. Training is counting and averaging; there is no optimisation loop.",
      "**Decision.** Compute P(c) · p(x1 | c) · p(x2 | c) for every class, divide each by their sum so they add to 1, and predict the class with the larger posterior. The coloured regions in the plot are exactly the set of points where each class wins."
    ],
    "formulas": [
      { "label": "prior", "expr": "P(c) = n_c / N" },
      { "label": "mean, spread per feature", "expr": "μ = (1/n_c) Σ x_j      σ = √( (1/n_c) Σ (x_j − μ)² )" },
      { "label": "Gaussian likelihood", "expr": "p(x_j | c) = 1 / (σ √(2π)) · exp( −(x_j − μ)² / (2σ²) )" },
      { "label": "naive joint", "expr": "P(c) · p(x1 | c) · p(x2 | c)" },
      { "label": "posterior", "expr": "P(c | x) = P(c)·p(x1|c)·p(x2|c) / Σ_c' P(c')·p(x1|c')·p(x2|c')" }
    ],
    "computation": [
      "**Training** (once per data set, or when you press New data). The widget draws 30 points: 12 of class 0 (orange) and 18 of class 1 (blue). For class 0 it counts n0 = 12, so P(0) = 12/30 = 0.40; for class 1, P(1) = 18/30 = 0.60. Then, for each class and each feature, it takes the mean μ and the standard deviation σ of that feature over the class's points. With the default seed: class 0 has μ1 = −1.12, σ1 = 0.76, μ2 = −0.65, σ2 = 0.60; class 1 has μ1 = 1.34, σ1 = 0.64, μ2 = 0.67, σ2 = 1.05. The dashed ellipses are these (μ ± σ) per class.",
      "**Likelihood of x1.** With the default test point x = (0.5, −0.5), for class 0: z = (x1 − μ1)/σ1 = (0.5 − (−1.12))/0.76 = 2.13, so exp(−z²/2) = exp(−2.27) = 0.103, and the normalising factor 1/(σ1·√(2π)) = 1/(0.76·2.507) = 0.525. Multiply: p(x1 | 0) = 0.525 · 0.103 ≈ 0.053. For class 1: z = (0.5 − 1.34)/0.64 = −1.31, exp(−0.86) = 0.423, factor 1/(0.64·2.507) = 0.623, so p(x1 | 1) ≈ 0.263. These are the two numbers in the p(x1|c) column of the table.",
      "**Likelihood of x2.** Same formula with the second feature. Class 0: z = (−0.5 − (−0.65))/0.60 = 0.25, exp(−0.03) = 0.969, factor 0.665, p(x2 | 0) ≈ 0.647. Class 1: z = (−0.5 − 0.67)/1.05 = −1.12, exp(−0.62) = 0.536, factor 0.380, p(x2 | 1) ≈ 0.204.",
      "**Multiply (the naive step).** Class 0: 0.40 · 0.053 · 0.647 = 0.0137. Class 1: 0.60 · 0.263 · 0.204 = 0.0322. That is the product column, shown in scientific notation because with more features it gets tiny very fast (in real code one adds logarithms instead).",
      "**Normalise.** Z = 0.0137 + 0.0322 = 0.0459. P(0 | x) = 0.0137 / 0.0459 = 0.30 and P(1 | x) = 0.0322 / 0.0459 = 0.70. Class 1 wins: the last column and the bars. Note that x1 = 0.5 is closer to class 1 and x2 = −0.5 is closer to class 0; the product and the prior settle the argument.",
      "**Decision regions.** For the background the widget repeats the same five steps on a 56 × 56 grid of points and colours each cell by the winner, darker where the posterior is near 1 and faint where it is near 0.5. Tick **Show the calculation** inside the widget to see every one of these steps with the live numbers for the point you chose."
    ],
    "how_to_use": [
      { "control": "Test point x1 / x2", "text": "drag the white ✕ with the two sliders. Watch the table: only the likelihood columns change; prior, μ and σ are fixed by the data." },
      { "control": "Show the calculation", "text": "tick it to unfold the arithmetic for the current point: priors, means, the Gaussian formula with numbers substituted, products and the normalisation." },
      { "control": "Show decision regions", "text": "turn the background on and off to see how the two ellipses carve the plane; the border is curved because the σ differ per class and feature." },
      { "control": "New data", "text": "resample the points. The priors stay 0.40 / 0.60 by construction, but μ and σ move and the regions move with them." },
      { "text": "To make the prior visible, move the point far from both clouds (for example x1 = 4, x2 = −4). Both likelihoods become tiny; the class with the larger prior wins almost regardless." }
    ],
    "notice": [
      "Training is five numbers per class; nothing is iterated, there is no learning rate.",
      "The decision border is not a straight line: it follows the ratio of two Gaussians with different widths.",
      "The products are tiny; the posterior only cares about their ratio, which is why normalisation matters.",
      "The prior wins far from the data and the likelihoods win near it."
    ],
    "misconceptions": [
      { "myth": "Naive Bayes outputs calibrated probabilities.", "truth": "the independence assumption counts overlapping evidence twice, so posteriors are usually over-confident (too close to 0 or 1)." },
      { "myth": "With features the prior stops mattering.", "truth": "the prior is a factor in every product; move the point far away and it decides on its own." },
      { "myth": "σ is the same for both classes.", "truth": "each class and each feature gets its own μ and σ; that is what bends the border." }
    ],
    "links": [
      { "id": "of-logistic-regression", "text": "learns the boundary directly by gradient descent instead of modelling each class; compare the straight line with these curved regions." },
      { "id": "of-tree-split", "text": "a third way to classify: threshold questions instead of probabilities." }
    ]
  },
  "ru": {
    "summary": "Наивный Байес не учит границу. Он запоминает крошечное описание каждого класса (сколько точек, среднее и разброс каждого признака) и для новой точки спрашивает: при описании какого класса эта точка наименее удивительна, с поправкой на то, насколько класс вообще частый.",
    "concept": [
      "**Формула Байеса.** Для точки x и класса c нужна апостериорная вероятность P(c | x). Формула Байеса выражает её через то, что можно посчитать: P(c | x) = P(c) · p(x | c) / p(x). P(c) — **априорная** вероятность (как часто встречается класс), p(x | c) — **правдоподобие** (насколько x типична для класса), а p(x) одинакова для всех классов и лишь нормирует.",
      "**«Наивность».** При двух признаках p(x | c) потребовало бы совместного распределения (x1, x2) внутри класса. Наивный Байес предполагает, что признаки независимы при известном классе, и совместное распределение распадается в произведение: p(x | c) = p(x1 | c) · p(x2 | c). В общем случае это неверно — и всё же работает на удивление хорошо.",
      "**Гауссов наивный Байес.** Каждое правдоподобие по признаку моделируется нормальным распределением со своими средним μ и стандартным отклонением σ, оценёнными по обучающим точкам класса. Класс — это всего 1 + 2·2 = 5 чисел: априорная вероятность и (μ, σ) по каждому признаку. Обучение — счёт и усреднение; цикла оптимизации нет.",
      "**Решение.** Для каждого класса считаем P(c) · p(x1 | c) · p(x2 | c), делим на сумму, чтобы получить 1 в сумме, и выбираем класс с большей апостериорной вероятностью. Закрашенные области на графике — ровно множество точек, где побеждает каждый класс."
    ],
    "formulas": [
      { "label": "априорная", "expr": "P(c) = n_c / N" },
      { "label": "среднее и разброс по признаку", "expr": "μ = (1/n_c) Σ x_j      σ = √( (1/n_c) Σ (x_j − μ)² )" },
      { "label": "гауссово правдоподобие", "expr": "p(x_j | c) = 1 / (σ √(2π)) · exp( −(x_j − μ)² / (2σ²) )" },
      { "label": "наивное совместное", "expr": "P(c) · p(x1 | c) · p(x2 | c)" },
      { "label": "апостериорная", "expr": "P(c | x) = P(c)·p(x1|c)·p(x2|c) / Σ_c' P(c')·p(x1|c')·p(x2|c')" }
    ],
    "computation": [
      "**Обучение** (один раз на набор данных или после «Новые данные»). Виджет генерирует 30 точек: 12 класса 0 (оранжевые) и 18 класса 1 (синие). Для класса 0 он считает n0 = 12, значит P(0) = 12/30 = 0,40; для класса 1 P(1) = 18/30 = 0,60. Затем для каждого класса и признака берёт среднее μ и стандартное отклонение σ этого признака по точкам класса. При исходном seed: класс 0 — μ1 = −1,12, σ1 = 0,76, μ2 = −0,65, σ2 = 0,60; класс 1 — μ1 = 1,34, σ1 = 0,64, μ2 = 0,67, σ2 = 1,05. Пунктирные эллипсы — это (μ ± σ) каждого класса.",
      "**Правдоподобие x1.** Для тестовой точки по умолчанию x = (0,5, −0,5) и класса 0: z = (x1 − μ1)/σ1 = (0,5 − (−1,12))/0,76 = 2,13, поэтому exp(−z²/2) = exp(−2,27) = 0,103, а нормирующий множитель 1/(σ1·√(2π)) = 1/(0,76·2,507) = 0,525. Перемножаем: p(x1 | 0) = 0,525 · 0,103 ≈ 0,053. Для класса 1: z = (0,5 − 1,34)/0,64 = −1,31, exp(−0,86) = 0,423, множитель 1/(0,64·2,507) = 0,623, значит p(x1 | 1) ≈ 0,263. Это два числа в столбце p(x1|c) таблицы.",
      "**Правдоподобие x2.** Та же формула для второго признака. Класс 0: z = (−0,5 − (−0,65))/0,60 = 0,25, exp(−0,03) = 0,969, множитель 0,665, p(x2 | 0) ≈ 0,647. Класс 1: z = (−0,5 − 0,67)/1,05 = −1,12, exp(−0,62) = 0,536, множитель 0,380, p(x2 | 1) ≈ 0,204.",
      "**Перемножаем (наивный шаг).** Класс 0: 0,40 · 0,053 · 0,647 = 0,0137. Класс 1: 0,60 · 0,263 · 0,204 = 0,0322. Это столбец «произведение»; он показан в экспоненциальной записи, потому что с ростом числа признаков произведение очень быстро становится крошечным (в реальном коде складывают логарифмы).",
      "**Нормируем.** Z = 0,0137 + 0,0322 = 0,0459. P(0 | x) = 0,0137 / 0,0459 = 0,30 и P(1 | x) = 0,0322 / 0,0459 = 0,70. Побеждает класс 1 — последний столбец и полоски. Заметьте: x1 = 0,5 ближе к классу 1, а x2 = −0,5 ближе к классу 0; спор решают произведение и априорная вероятность.",
      "**Области решения.** Для фона виджет повторяет те же пять шагов на сетке 56 × 56 точек и красит каждую ячейку цветом победителя: темнее, где апостериорная вероятность близка к 1, и бледнее, где она около 0,5. Поставьте галочку **Показать вычисление** внутри виджета, чтобы увидеть каждый из этих шагов с живыми числами для выбранной точки."
    ],
    "how_to_use": [
      { "control": "Тестовая точка x1 / x2", "text": "двигайте белый ✕ двумя ползунками. Следите за таблицей: меняются только столбцы правдоподобия; априорная вероятность, μ и σ заданы данными." },
      { "control": "Показать вычисление", "text": "раскрывает арифметику для текущей точки: априорные вероятности, средние, гауссову формулу с подставленными числами, произведения и нормировку." },
      { "control": "Показать области решения", "text": "включайте и выключайте фон, чтобы увидеть, как два эллипса делят плоскость; граница изогнута, потому что σ различны по классам и признакам." },
      { "control": "Новые данные", "text": "пересэмплировать точки. Априорные остаются 0,40 / 0,60 по построению, но μ и σ сдвигаются, и области сдвигаются вместе с ними." },
      { "text": "Чтобы увидеть роль априорной вероятности, уведите точку далеко от обоих облаков (например, x1 = 4, x2 = −4). Оба правдоподобия становятся крошечными; побеждает класс с большей априорной вероятностью почти независимо от остального." }
    ],
    "notice": [
      "Обучение — пять чисел на класс; ничего не итерируется, скорости обучения нет.",
      "Граница решения — не прямая: она следует отношению двух гауссиан разной ширины.",
      "Произведения крошечные; апостериорной вероятности важно лишь их отношение — поэтому нужна нормировка.",
      "Вдали от данных побеждает априорная вероятность, рядом с ними — правдоподобия."
    ],
    "misconceptions": [
      { "myth": "Наивный Байес выдаёт откалиброванные вероятности.", "truth": "предположение независимости учитывает пересекающиеся свидетельства дважды, поэтому апостериорные вероятности обычно слишком уверенные (слишком близки к 0 или 1)." },
      { "myth": "При наличии признаков априорная вероятность не важна.", "truth": "она — множитель в каждом произведении; уведите точку далеко, и решать будет она одна." },
      { "myth": "σ одинакова у обоих классов.", "truth": "у каждого класса и признака свои μ и σ; именно это изгибает границу." }
    ],
    "links": [
      { "id": "of-logistic-regression", "text": "учит границу напрямую градиентным спуском, не моделируя классы; сравните прямую линию с этими изогнутыми областями." },
      { "id": "of-tree-split", "text": "третий способ классифицировать: пороговые вопросы вместо вероятностей." }
    ]
  }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-naive-bayes" }));
