// Explanation data for <of-logistic-regression>. Pure data; strict JSON between the markers (read by tools).
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-logistic-regression"] = /* JSON-START */ {
  "id": "of-logistic-regression",
  "concept": "logistic-regression",
  "version": "0.1.0",
  "en": {
    "summary": "Logistic regression keeps the linear score of regression, z = w1·x1 + w2·x2 + b, but squashes it through the sigmoid into a probability of one class. The line z = 0 is the decision boundary. Gradient descent on the log-loss rotates and slides that line until the two classes are separated as confidently as the data allow.",
    "concept": [
      "**From score to probability.** z is any real number. The sigmoid σ(z) = 1/(1 + e^(−z)) maps it to (0, 1): z = 0 gives 0.5, large positive z gives almost 1, large negative z almost 0. The widget colours the plane by P(class ● | x) = σ(z).",
      "**The boundary.** Where σ(z) = 0.5, z = 0, so w1·x1 + w2·x2 + b = 0: a straight line. (w1, w2) is perpendicular to it and sets its direction; b slides it; the size of (w1, w2) sets how fast the probability changes across it (steep = confident).",
      "**The loss.** Squared error is a poor fit for probabilities; the log-loss (cross-entropy) is used instead: −[y·ln p + (1 − y)·ln(1 − p)] per point. It punishes a confident wrong answer very hard (ln of something near 0) and a confident right answer almost not at all.",
      "**Learning.** The gradient of the log-loss with respect to the weights has the same shape as in linear regression, with (p − y) playing the role of the residual: ∂L/∂w1 = (1/n) Σ (p_i − y_i)·x1_i. The update w ← w − η·∂L/∂w is identical. So the only real difference from regression is the sigmoid and the loss."
    ],
    "formulas": [
      { "label": "score", "expr": "z = w1·x1 + w2·x2 + b" },
      { "label": "sigmoid", "expr": "p = σ(z) = 1 / (1 + e^(−z))" },
      { "label": "boundary", "expr": "w1·x1 + w2·x2 + b = 0" },
      { "label": "log-loss", "expr": "L = −(1/n) Σ [ y_i ln p_i + (1 − y_i) ln(1 − p_i) ]" },
      { "label": "gradient", "expr": "∂L/∂w_j = (1/n) Σ (p_i − y_i)·x_j,i      ∂L/∂b = (1/n) Σ (p_i − y_i)" }
    ],
    "computation": [
      "The data are 40 points in two clouds, separated by the **sep** distance. Starting weights are deliberately wrong (w1 = −1, w2 = 1.5, b = 1) so the line begins misplaced.",
      "For every point the widget computes z, then p = σ(z). A point is predicted ● if p > 0.5; a wrong prediction is ringed. Accuracy is the share of correct predictions; log-loss is the formula above averaged over the 40 points.",
      "The background is the same computation on a grid: each cell coloured towards one class with intensity |p − 0.5|; the line is drawn where z = 0.",
      "On **Step** the three gradients are computed from the (p − y) residuals and the weights are updated with η. **Play** repeats until the loss stops improving."
    ],
    "how_to_use": [
      { "control": "Weight w1 / w2", "text": "move them by hand first: the line rotates (direction of (w1, w2)); scaling both up makes the colour transition sharper without moving the line." },
      { "control": "Bias b", "text": "slides the line parallel to itself." },
      { "control": "Step / Play", "text": "from the wrong start, let gradient descent fix it; watch the rings disappear and the log-loss fall. Keep playing after accuracy reaches 100 %: the loss still falls as the model grows more confident." },
      { "control": "Show probability surface", "text": "switch it off to see only the boundary; switch it on to see how confident each region is." },
      { "control": "Learning rate η", "text": "as in gradient descent on a line: too large oscillates, too small crawls." }
    ],
    "notice": [
      "The boundary is linear in the inputs no matter how the sigmoid bends the probability.",
      "Accuracy is a step function; log-loss is smooth, which is why training uses the loss.",
      "On perfectly separable data the weights keep growing: there is no finite optimum."
    ],
    "misconceptions": [
      { "myth": "Logistic regression is a regression method.", "truth": "it is a classifier that outputs a class probability; the name is historical." },
      { "myth": "The sigmoid makes the boundary curved.", "truth": "the boundary is where z = 0, a straight line; the sigmoid only shapes the probability on either side." }
    ],
    "links": [
      { "id": "of-gd-linear-regression", "text": "the same update rule on the MSE of a line." },
      { "id": "of-naive-bayes", "text": "a classifier that models each class instead of learning the boundary; its border is curved." }
    ]
  },
  "ru": {
    "summary": "Логистическая регрессия сохраняет линейный счёт регрессии z = w1·x1 + w2·x2 + b, но пропускает его через сигмоиду и получает вероятность одного из классов. Линия z = 0 — граница решения. Градиентный спуск по log-loss поворачивает и сдвигает эту линию, пока классы не будут разделены настолько уверенно, насколько позволяют данные.",
    "concept": [
      "**От счёта к вероятности.** z — любое вещественное число. Сигмоида σ(z) = 1/(1 + e^(−z)) отображает его в (0, 1): z = 0 даёт 0,5, большое положительное z — почти 1, большое отрицательное — почти 0. Виджет красит плоскость по P(класс ● | x) = σ(z).",
      "**Граница.** Где σ(z) = 0,5, там z = 0, то есть w1·x1 + w2·x2 + b = 0 — прямая. Вектор (w1, w2) перпендикулярен ей и задаёт направление; b сдвигает её; длина (w1, w2) задаёт, как быстро вероятность меняется поперёк (круто = уверенно).",
      "**Функция потерь.** Квадратичная ошибка плохо подходит для вероятностей; вместо неё используется log-loss (кросс-энтропия): −[y·ln p + (1 − y)·ln(1 − p)] на точку. Она очень сильно наказывает уверенный неверный ответ (ln числа около 0) и почти не наказывает уверенный верный.",
      "**Обучение.** Градиент log-loss по весам имеет ту же форму, что в линейной регрессии, где роль остатка играет (p − y): ∂L/∂w1 = (1/n) Σ (p_i − y_i)·x1_i. Обновление w ← w − η·∂L/∂w то же самое. Единственное реальное отличие от регрессии — сигмоида и функция потерь."
    ],
    "formulas": [
      { "label": "счёт", "expr": "z = w1·x1 + w2·x2 + b" },
      { "label": "сигмоида", "expr": "p = σ(z) = 1 / (1 + e^(−z))" },
      { "label": "граница", "expr": "w1·x1 + w2·x2 + b = 0" },
      { "label": "log-loss", "expr": "L = −(1/n) Σ [ y_i ln p_i + (1 − y_i) ln(1 − p_i) ]" },
      { "label": "градиент", "expr": "∂L/∂w_j = (1/n) Σ (p_i − y_i)·x_j,i      ∂L/∂b = (1/n) Σ (p_i − y_i)" }
    ],
    "computation": [
      "Данные — 40 точек в двух облаках на расстоянии **sep**. Стартовые веса намеренно неверны (w1 = −1, w2 = 1,5, b = 1), поэтому линия начинает не на месте.",
      "Для каждой точки виджет вычисляет z, затем p = σ(z). Точка предсказывается как ●, если p > 0,5; неверное предсказание обводится. Точность — доля верных предсказаний; log-loss — формула выше, усреднённая по 40 точкам.",
      "Фон — то же вычисление на сетке: каждая ячейка окрашена в сторону одного класса с интенсивностью |p − 0,5|; линия рисуется там, где z = 0.",
      "По нажатию **Шаг** три градиента вычисляются из остатков (p − y), и веса обновляются с η. **Пуск** повторяет, пока потери не перестанут улучшаться."
    ],
    "how_to_use": [
      { "control": "Вес w1 / w2", "text": "сначала двигайте вручную: линия поворачивается (направление (w1, w2)); увеличение обоих делает переход цвета резче, не двигая линию." },
      { "control": "Смещение b", "text": "сдвигает линию параллельно самой себе." },
      { "control": "Шаг / Пуск", "text": "с неверного старта дайте градиентному спуску всё исправить; смотрите, как исчезают обводки и падает log-loss. Продолжайте после 100 % точности: потери всё ещё падают, модель становится увереннее." },
      { "control": "Показать поверхность вероятности", "text": "выключите, чтобы видеть только границу; включите, чтобы видеть уверенность в каждой области." },
      { "control": "Скорость обучения η", "text": "как в градиентном спуске для прямой: слишком большая колеблется, слишком маленькая ползёт." }
    ],
    "notice": [
      "Граница линейна по входам, как бы сигмоида ни изгибала вероятность.",
      "Точность — ступенчатая функция; log-loss — гладкая, поэтому обучение идёт по потерям.",
      "На идеально разделимых данных веса растут бесконечно: конечного оптимума нет."
    ],
    "misconceptions": [
      { "myth": "Логистическая регрессия — метод регрессии.", "truth": "это классификатор, выдающий вероятность класса; название историческое." },
      { "myth": "Сигмоида делает границу кривой.", "truth": "граница — там, где z = 0, то есть прямая; сигмоида лишь формирует вероятность по обе стороны." }
    ],
    "links": [
      { "id": "of-gd-linear-regression", "text": "то же правило обновления на MSE прямой." },
      { "id": "of-naive-bayes", "text": "классификатор, моделирующий каждый класс вместо обучения границы; его граница изогнута." }
    ]
  }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-logistic-regression" }));
