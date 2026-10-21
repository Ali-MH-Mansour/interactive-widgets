// Explanation data for <of-gd-linear-regression>. Pure data; strict JSON between the markers (read by tools).
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-gd-linear-regression"] = /* JSON-START */ {
  "id": "of-gd-linear-regression",
  "concept": "gradient-descent",
  "version": "0.1.0",
  "en": {
    "summary": "Instead of guessing w and b by hand, gradient descent asks the loss which way is downhill and takes a small step that way, again and again. The size of the step is the learning rate η. Too small and it crawls; too large and it overshoots and diverges.",
    "concept": [
      "**The loss as a landscape.** For a fixed data set the MSE is a function of the two parameters (w, b): a bowl-shaped surface. The lowest point of the bowl is the least-squares line. We do not see the whole bowl; we only ever stand at one point of it.",
      "**The gradient.** The partial derivatives ∂L/∂w and ∂L/∂b say how fast the loss rises when w or b is increased. Together they form the gradient: an arrow pointing uphill. Its length says how steep the surface is.",
      "**The update rule.** w ← w − η·∂L/∂w and b ← b − η·∂L/∂b: move against the gradient, scaled by η. Far from the bottom the gradient is large and the steps are long; near the bottom it shrinks and the steps shorten on their own. That is why descent slows down as it converges.",
      "**Stability.** With a learning rate above a limit set by the data (here about 0.3) every step lands farther from the optimum than the last; the loss grows instead of falling and the line flies off the plot: divergence."
    ],
    "formulas": [
      { "label": "loss", "expr": "L(w, b) = (1/n) Σ (y_i − (w·x_i + b))²" },
      { "label": "gradient", "expr": "∂L/∂w = −(2/n) Σ x_i (y_i − ŷ_i)      ∂L/∂b = −(2/n) Σ (y_i − ŷ_i)" },
      { "label": "update", "expr": "w ← w − η·∂L/∂w      b ← b − η·∂L/∂b" }
    ],
    "computation": [
      "The data are the same kind as in the line-fitting widget: 20 points from y = 2x + 1 plus noise. The line starts deliberately wrong at w0 = −1, b0 = 3.",
      "On **Step** the widget computes ŷ for every point, the residuals y − ŷ, then the two sums above: ∂L/∂w is the average of −2·x·residual, ∂L/∂b the average of −2·residual. Both numbers are printed in the gradient row.",
      "It then applies the update with the current η and prints the new w and b with the arithmetic substituted, e.g. w ← −1.00 − 0.05·(−18.4) = −0.08. The loss curve records the MSE after each step.",
      "**Play** repeats Step on every animation frame until the MSE stops changing (converged) or exceeds a huge value (diverged). Nothing else is different between Step and Play."
    ],
    "how_to_use": [
      { "control": "Step", "text": "press it one step at a time at the default η and read the gradient and update rows; the first steps are large, later ones tiny." },
      { "control": "Play", "text": "watch the line settle and the loss curve flatten; count how many steps it needs." },
      { "control": "Learning rate η", "text": "set it low (0.01) and Play: slow crawl. Set it to 0.3 or above and Play: the loss explodes and the widget reports divergence." },
      { "control": "Reset", "text": "back to the starting line with the same data; use it to compare several η on identical data." },
      { "control": "New data", "text": "another noisy sample; the optimum moves slightly but the behaviour of η does not." }
    ],
    "notice": [
      "The update moves against the gradient; the gradient itself points uphill.",
      "Step length is automatic: it is the gradient times η, so descent naturally slows near the minimum.",
      "b converges more slowly than w here because the x values are centred, which makes ∂L/∂b smaller.",
      "There is a stability limit on η that depends on the data, not on your patience."
    ],
    "misconceptions": [
      { "myth": "A larger learning rate always learns faster.", "truth": "only up to the stability limit; beyond it every step makes things worse." },
      { "myth": "Gradient descent reaches the exact optimum.", "truth": "it approaches it; the closed-form least-squares solution is a different method that lands on it directly." }
    ],
    "links": [
      { "id": "of-linear-fit", "text": "the same loss surface explored by hand; see what the algorithm is automating." },
      { "id": "of-logistic-regression", "text": "the same update rule on a different loss (log-loss) for classification." }
    ]
  },
  "ru": {
    "summary": "Вместо того чтобы подбирать w и b вручную, градиентный спуск спрашивает у функции потерь, где «вниз», и делает маленький шаг туда — снова и снова. Размер шага задаёт скорость обучения η. Слишком маленькая — ползёт; слишком большая — перескакивает и расходится.",
    "concept": [
      "**Потери как ландшафт.** При фиксированных данных MSE — функция двух параметров (w, b): поверхность в форме чаши. Самая низкая точка чаши — МНК-прямая. Всю чашу мы не видим; мы всегда стоим в одной её точке.",
      "**Градиент.** Частные производные ∂L/∂w и ∂L/∂b показывают, как быстро растут потери при увеличении w или b. Вместе они образуют градиент — стрелку, направленную вверх по склону. Её длина говорит, насколько крут склон.",
      "**Правило обновления.** w ← w − η·∂L/∂w и b ← b − η·∂L/∂b: двигаться против градиента, умноженного на η. Далеко от дна градиент велик и шаги длинные; у дна он уменьшается, и шаги укорачиваются сами. Поэтому спуск замедляется по мере сходимости.",
      "**Устойчивость.** При скорости обучения выше предела, зависящего от данных (здесь около 0,3), каждый шаг приземляется дальше от оптимума, чем предыдущий; потери растут вместо того, чтобы падать, и прямая улетает с графика — расходимость."
    ],
    "formulas": [
      { "label": "потери", "expr": "L(w, b) = (1/n) Σ (y_i − (w·x_i + b))²" },
      { "label": "градиент", "expr": "∂L/∂w = −(2/n) Σ x_i (y_i − ŷ_i)      ∂L/∂b = −(2/n) Σ (y_i − ŷ_i)" },
      { "label": "обновление", "expr": "w ← w − η·∂L/∂w      b ← b − η·∂L/∂b" }
    ],
    "computation": [
      "Данные того же вида, что в виджете подбора прямой: 20 точек прямой y = 2x + 1 плюс шум. Прямая намеренно стартует неверно: w0 = −1, b0 = 3.",
      "По нажатию **Шаг** виджет вычисляет ŷ для каждой точки, остатки y − ŷ, затем две суммы выше: ∂L/∂w — среднее от −2·x·остаток, ∂L/∂b — среднее от −2·остаток. Оба числа печатаются в строке «градиент».",
      "Затем применяется обновление с текущей η, и печатаются новые w и b с подставленной арифметикой, например w ← −1,00 − 0,05·(−18,4) = −0,08. Кривая потерь запоминает MSE после каждого шага.",
      "**Пуск** повторяет Шаг на каждом кадре анимации, пока MSE не перестанет меняться (сошлось) или не превысит огромное значение (разошлось). Больше ничем Шаг и Пуск не отличаются."
    ],
    "how_to_use": [
      { "control": "Шаг", "text": "нажимайте по одному шагу при η по умолчанию и читайте строки градиента и обновления; первые шаги большие, последующие — крошечные." },
      { "control": "Пуск", "text": "смотрите, как прямая устанавливается, а кривая потерь выравнивается; посчитайте, сколько шагов нужно." },
      { "control": "Скорость обучения η", "text": "поставьте низкую (0,01) и Пуск: медленное ползание. Поставьте 0,3 и выше и Пуск: потери взрываются, виджет сообщает о расходимости." },
      { "control": "Сброс", "text": "обратно к стартовой прямой на тех же данных; так удобно сравнивать разные η на одинаковых данных." },
      { "control": "Новые данные", "text": "другая зашумлённая выборка; оптимум чуть сдвигается, но поведение η — нет." }
    ],
    "notice": [
      "Обновление идёт против градиента; сам градиент указывает вверх.",
      "Длина шага автоматическая: градиент, умноженный на η, поэтому спуск сам замедляется у минимума.",
      "b сходится медленнее w, потому что значения x центрированы и ∂L/∂b меньше.",
      "Предел устойчивости η зависит от данных, а не от вашего терпения."
    ],
    "misconceptions": [
      { "myth": "Чем больше скорость обучения, тем быстрее обучение.", "truth": "только до предела устойчивости; за ним каждый шаг ухудшает результат." },
      { "myth": "Градиентный спуск достигает точного оптимума.", "truth": "он приближается к нему; явное решение МНК — другой метод, попадающий в него сразу." }
    ],
    "links": [
      { "id": "of-linear-fit", "text": "та же поверхность потерь, исследуемая вручную; посмотрите, что именно автоматизирует алгоритм." },
      { "id": "of-logistic-regression", "text": "то же правило обновления на другой функции потерь (log-loss) для классификации." }
    ]
  }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-gd-linear-regression" }));
