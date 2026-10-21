// Explanation data for <of-tree-split>. Pure data; strict JSON between the markers (read by tools).
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-tree-split"] = /* JSON-START */ {
  "id": "of-tree-split",
  "concept": "decision-tree",
  "version": "0.1.0",
  "en": {
    "summary": "A decision tree classifies by asking threshold questions, one feature at a time: is x1 ≤ t? Each answer sends the point left or right until it reaches a leaf that votes for a class. Building the tree means choosing, at every node, the question that makes the two resulting groups as pure as possible.",
    "concept": [
      "**A split.** One feature and one threshold: x_j ≤ t. It cuts the current region in two along an axis-aligned line. The region's points are divided into left (≤ t) and right (> t).",
      "**Impurity.** How mixed a group of points is. Gini = 1 − Σ p_k² and entropy = −Σ p_k log2 p_k, where p_k is the share of class k in the group. Both are 0 for a pure group and largest for a 50/50 mix. They almost always rank splits the same way; they differ in scale.",
      "**Gain.** How much a split lowers impurity: the parent's impurity minus the size-weighted average impurity of the two children. A split that leaves one child huge and impure gains little even if the other child is pure.",
      "**Greedy growth.** The algorithm tries every feature and every threshold between neighbouring points, keeps the split with the largest gain, and repeats inside each child until a maximum depth or pure leaves. It never revisits an earlier split, so the first choice can be locally best and globally wrong."
    ],
    "formulas": [
      { "label": "Gini", "expr": "G = 1 − Σ_k p_k²" },
      { "label": "entropy", "expr": "H = −Σ_k p_k log2 p_k" },
      { "label": "gain", "expr": "gain = I(parent) − [ n_L/n · I(left) + n_R/n · I(right) ]" }
    ],
    "computation": [
      "The data are 60 points; class 1 lies inside a hidden rectangle, class 0 outside. A tree with two or three axis-aligned cuts can recover a rectangle exactly, which is why depth 3 is enough here.",
      "For the root split you choose, the widget counts the class shares on each side, computes the chosen impurity for parent, left and right, and the gain with the formula above. The three impurities and the gain are printed.",
      "**Best root split** scans every feature and every candidate threshold (midpoints between sorted values), computes the gain of each and selects the maximum; that is exactly what a library implementation does at every node.",
      "For depths below the root the widget grows greedily: in each child region it repeats the scan, splits, and continues until **Tree depth** is reached or a region is pure. The coloured regions are the leaves' majority classes; training accuracy counts points whose leaf agrees with their class."
    ],
    "how_to_use": [
      { "control": "Root feature / Root threshold t", "text": "pick a question by hand and watch the impurity of the two children and the gain; try to beat the best split." },
      { "control": "Best root split", "text": "let the widget choose; compare its gain with yours." },
      { "control": "Impurity", "text": "switch between Gini and Entropy; note the numbers change but the chosen split rarely does." },
      { "control": "Tree depth", "text": "grow from 1 to 5. Depth 2–3 finds the rectangle; depth 5 starts carving out single points (overfitting)." },
      { "control": "New data", "text": "another rectangle and another sample; the greedy tree may now need a different first cut." }
    ],
    "notice": [
      "Every boundary is axis-aligned: a tree cannot draw a diagonal line except as a staircase.",
      "Gain rewards pure children, not balanced ones.",
      "A worse root split can sometimes finish the rectangle faster at depth 2; greedy is not optimal.",
      "Training accuracy keeps rising with depth; it says nothing about new points."
    ],
    "misconceptions": [
      { "myth": "Entropy and Gini give different trees.", "truth": "they nearly always choose the same split; only the scale of the numbers differs." },
      { "myth": "Deeper is better.", "truth": "training accuracy rises, generalisation does not; the single-point leaves at depth 5 are noise." }
    ],
    "links": [
      { "id": "of-logistic-regression", "text": "a single straight boundary; compare with the staircase regions of a tree." },
      { "id": "of-naive-bayes", "text": "probabilities per class instead of questions per feature." }
    ]
  },
  "ru": {
    "summary": "Дерево решений классифицирует, задавая пороговые вопросы по одному признаку: x1 ≤ t? Каждый ответ отправляет точку влево или вправо, пока она не дойдёт до листа, голосующего за класс. Построить дерево — значит в каждом узле выбрать вопрос, делающий две получившиеся группы как можно чище.",
    "concept": [
      "**Разбиение.** Один признак и один порог: x_j ≤ t. Оно режет текущую область надвое по линии, параллельной оси. Точки области делятся на левые (≤ t) и правые (> t).",
      "**Неоднородность.** Насколько смешана группа точек. Джини = 1 − Σ p_k², энтропия = −Σ p_k log2 p_k, где p_k — доля класса k в группе. Обе равны 0 для чистой группы и максимальны при смеси 50/50. Они почти всегда ранжируют разбиения одинаково; различается масштаб.",
      "**Выигрыш.** Насколько разбиение снижает неоднородность: неоднородность родителя минус взвешенная по размеру средняя неоднородность двух детей. Разбиение, оставляющее одного ребёнка огромным и смешанным, даёт мало выигрыша, даже если другой ребёнок чист.",
      "**Жадный рост.** Алгоритм перебирает все признаки и все пороги между соседними точками, оставляет разбиение с наибольшим выигрышем и повторяет внутри каждого ребёнка до максимальной глубины или чистых листьев. Он никогда не пересматривает прежние разбиения, поэтому первый выбор может быть локально лучшим и глобально неверным."
    ],
    "formulas": [
      { "label": "Джини", "expr": "G = 1 − Σ_k p_k²" },
      { "label": "энтропия", "expr": "H = −Σ_k p_k log2 p_k" },
      { "label": "выигрыш", "expr": "gain = I(parent) − [ n_L/n · I(left) + n_R/n · I(right) ]" }
    ],
    "computation": [
      "Данные — 60 точек; класс 1 лежит внутри скрытого прямоугольника, класс 0 снаружи. Дерево из двух-трёх разрезов вдоль осей восстанавливает прямоугольник точно, поэтому здесь достаточно глубины 3.",
      "Для выбранного вами корневого разбиения виджет считает доли классов с каждой стороны, вычисляет выбранную неоднородность родителя, левой и правой частей и выигрыш по формуле выше. Три неоднородности и выигрыш печатаются.",
      "**Лучшее разбиение корня** перебирает все признаки и все пороги-кандидаты (середины между отсортированными значениями), считает выигрыш каждого и берёт максимум — ровно то, что делает библиотечная реализация в каждом узле.",
      "Ниже корня виджет растёт жадно: в каждой дочерней области повторяет перебор, разбивает и продолжает до **Глубины дерева** или чистой области. Закрашенные области — классы большинства в листьях; точность на обучении считает точки, чей лист согласен с их классом."
    ],
    "how_to_use": [
      { "control": "Признак корня / Порог корня t", "text": "задайте вопрос вручную и смотрите на неоднородность двух детей и выигрыш; попробуйте обойти лучшее разбиение." },
      { "control": "Лучшее разбиение корня", "text": "дайте выбрать виджету; сравните его выигрыш с вашим." },
      { "control": "Неоднородность", "text": "переключайте Джини и Энтропию; числа меняются, а выбранное разбиение — редко." },
      { "control": "Глубина дерева", "text": "растите от 1 до 5. Глубина 2–3 находит прямоугольник; глубина 5 начинает вырезать отдельные точки (переобучение)." },
      { "control": "Новые данные", "text": "другой прямоугольник и другая выборка; жадному дереву может понадобиться другой первый разрез." }
    ],
    "notice": [
      "Каждая граница параллельна оси: дерево не умеет рисовать диагональ иначе как лесенкой.",
      "Выигрыш поощряет чистых детей, а не сбалансированных.",
      "Худшее корневое разбиение иногда быстрее завершает прямоугольник на глубине 2; жадность не оптимальна.",
      "Точность на обучении растёт с глубиной; о новых точках она ничего не говорит."
    ],
    "misconceptions": [
      { "myth": "Энтропия и Джини дают разные деревья.", "truth": "они почти всегда выбирают одно и то же разбиение; различается только масштаб чисел." },
      { "myth": "Чем глубже, тем лучше.", "truth": "точность на обучении растёт, обобщение — нет; листья из одной точки на глубине 5 — это шум." }
    ],
    "links": [
      { "id": "of-logistic-regression", "text": "одна прямая граница; сравните с лесенкой областей дерева." },
      { "id": "of-naive-bayes", "text": "вероятности по классам вместо вопросов по признакам." }
    ]
  }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-tree-split" }));
