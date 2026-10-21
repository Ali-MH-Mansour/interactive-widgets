// Explanation data for <of-linear-fit>. Pure data; strict JSON between the markers (read by tools).
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-linear-fit"] = /* JSON-START */ {
  "id": "of-linear-fit",
  "concept": "linear-regression",
  "version": "0.1.0",
  "en": {
    "summary": "A model is a rule that turns an input into a prediction; the simplest one is a line. The error of a line is measured by how far its predictions are from the real values, squared and averaged: the mean squared error (MSE). Learning means finding the line with the smallest MSE.",
    "concept": [
      "**The model.** ŷ = w·x + b. The weight w is the slope (how much ŷ changes per unit of x), the bias b is the intercept (ŷ at x = 0). Two numbers describe every possible line; choosing a line is choosing (w, b).",
      "**The residual.** For each data point (x, y) the model predicts ŷ; the residual y − ŷ is what the model gets wrong on that point. In the plot it is the vertical bar from the point to the line.",
      "**The loss.** MSE = (1/n) Σ (y − ŷ)². Squaring removes the sign (above or below the line both count), makes big misses much more expensive than small ones, and gives a smooth function of (w, b) that calculus can minimise.",
      "**The best line.** There is exactly one (w, b) with the smallest MSE; it is called the least-squares line and can be written in closed form. Gradient descent (next widget) finds the same line by walking downhill on the MSE instead of solving the formula."
    ],
    "formulas": [
      { "label": "model", "expr": "ŷ = w·x + b" },
      { "label": "residual", "expr": "r_i = y_i − ŷ_i" },
      { "label": "mean squared error", "expr": "MSE = (1/n) Σ (y_i − ŷ_i)²" },
      { "label": "least squares", "expr": "w* = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²      b* = ȳ − w*·x̄" }
    ],
    "computation": [
      "The data are 20 points from the hidden line y = 2x + 1 plus Gaussian noise with standard deviation **Noise** (1.5 by default). The true line is never shown; the learner's job is to recover it.",
      "On every slider move the widget computes ŷ = w·x + b for each point, the residual y − ŷ, squares it, sums the 20 squares and divides by 20. That number is the MSE readout; the bars are the residuals before squaring.",
      "**Show least-squares line** computes w* and b* with the closed-form formulas above (means of x and y, covariance over variance) and draws that line; its MSE is the 'best possible' value shown next to yours. No hand position can go below it."
    ],
    "how_to_use": [
      { "control": "Weight w (slope)", "text": "rotate the line. Watch which bars shrink and which grow: changing w helps the points on one side and hurts the other." },
      { "control": "Bias b (intercept)", "text": "shift the line up or down without rotating it." },
      { "control": "Show residuals", "text": "keep it on while fitting; the goal is to make the bars short overall, not to touch any one point." },
      { "control": "Show least-squares line", "text": "after your best attempt, reveal the optimum and compare the two MSE values." },
      { "control": "Noise", "text": "raise it and refit: the best possible MSE rises with it, because noise cannot be modelled by a line." },
      { "control": "New data", "text": "a fresh sample from the same hidden line: the least-squares line moves a little, which is the sampling variability of an estimate." }
    ],
    "notice": [
      "One far point costs more than several near ones: the square is what makes MSE sensitive to outliers.",
      "The best line need not pass through any point.",
      "Even the perfect line has MSE ≈ noise², never 0, on noisy data."
    ],
    "misconceptions": [
      { "myth": "The best line goes through the most points.", "truth": "it minimises the sum of squared vertical distances; touching points is irrelevant." },
      { "myth": "MSE = 0 means the model is right.", "truth": "on noisy data MSE = 0 means the model memorised the noise (overfitting)." }
    ],
    "links": [
      { "id": "of-gd-linear-regression", "text": "the same line found automatically by gradient descent on this MSE." },
      { "id": "of-logistic-regression", "text": "the same linear score used for classification with a different loss." }
    ]
  },
  "ru": {
    "summary": "Модель — правило, превращающее вход в предсказание; простейшая — прямая. Ошибка прямой измеряется тем, насколько её предсказания далеки от настоящих значений, в квадрате и в среднем: среднеквадратичная ошибка (MSE). Обучение — поиск прямой с наименьшей MSE.",
    "concept": [
      "**Модель.** ŷ = w·x + b. Вес w — наклон (насколько меняется ŷ на единицу x), смещение b — значение ŷ при x = 0. Два числа описывают любую прямую; выбрать прямую — значит выбрать (w, b).",
      "**Остаток.** Для каждой точки (x, y) модель предсказывает ŷ; остаток y − ŷ — то, в чём модель ошиблась на этой точке. На графике это вертикальный столбик от точки до прямой.",
      "**Функция потерь.** MSE = (1/n) Σ (y − ŷ)². Квадрат убирает знак (выше и ниже прямой считается одинаково), делает большие промахи гораздо дороже маленьких и даёт гладкую функцию от (w, b), которую можно минимизировать средствами анализа.",
      "**Лучшая прямая.** Существует ровно одна пара (w, b) с наименьшей MSE — прямая метода наименьших квадратов (МНК); у неё есть явная формула. Градиентный спуск (следующий виджет) находит ту же прямую, спускаясь по MSE вместо решения формулы."
    ],
    "formulas": [
      { "label": "модель", "expr": "ŷ = w·x + b" },
      { "label": "остаток", "expr": "r_i = y_i − ŷ_i" },
      { "label": "среднеквадратичная ошибка", "expr": "MSE = (1/n) Σ (y_i − ŷ_i)²" },
      { "label": "МНК", "expr": "w* = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²      b* = ȳ − w*·x̄" }
    ],
    "computation": [
      "Данные — 20 точек скрытой прямой y = 2x + 1 плюс гауссов шум со стандартным отклонением **Шум** (по умолчанию 1,5). Истинная прямая не показывается; задача ученика — её восстановить.",
      "При каждом движении ползунка виджет вычисляет ŷ = w·x + b для каждой точки, остаток y − ŷ, возводит его в квадрат, суммирует 20 квадратов и делит на 20. Это число — индикатор MSE; столбики — остатки до возведения в квадрат.",
      "**Показать МНК-прямую** вычисляет w* и b* по явным формулам выше (средние x и y, ковариация, делённая на дисперсию) и рисует эту прямую; её MSE — «наименьшее возможное» значение рядом с вашим. Никакое ручное положение не опустится ниже."
    ],
    "how_to_use": [
      { "control": "Вес w (наклон)", "text": "поворачивайте прямую. Смотрите, какие столбики укорачиваются, а какие растут: изменение w помогает точкам с одной стороны и вредит с другой." },
      { "control": "Смещение b", "text": "сдвигайте прямую вверх или вниз без поворота." },
      { "control": "Показать остатки", "text": "держите включённым при подборе; цель — сделать столбики короткими в целом, а не коснуться какой-то одной точки." },
      { "control": "Показать МНК-прямую", "text": "после своей лучшей попытки откройте оптимум и сравните два значения MSE." },
      { "control": "Шум", "text": "увеличьте и подберите заново: наименьшая возможная MSE растёт вместе с ним, потому что шум прямой не моделируется." },
      { "control": "Новые данные", "text": "новая выборка той же скрытой прямой: МНК-прямая чуть сдвигается — это выборочная изменчивость оценки." }
    ],
    "notice": [
      "Одна далёкая точка стоит дороже нескольких близких: именно квадрат делает MSE чувствительной к выбросам.",
      "Лучшая прямая не обязана проходить ни через одну точку.",
      "Даже идеальная прямая на зашумлённых данных имеет MSE ≈ шум², а не 0."
    ],
    "misconceptions": [
      { "myth": "Лучшая прямая проходит через наибольшее число точек.", "truth": "она минимизирует сумму квадратов вертикальных расстояний; касание точек не имеет значения." },
      { "myth": "MSE = 0 означает, что модель верна.", "truth": "на зашумлённых данных MSE = 0 значит, что модель запомнила шум (переобучение)." }
    ],
    "links": [
      { "id": "of-gd-linear-regression", "text": "та же прямая, найденная автоматически градиентным спуском по этой MSE." },
      { "id": "of-logistic-regression", "text": "тот же линейный счёт, использованный для классификации с другой функцией потерь." }
    ]
  }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-linear-fit" }));
