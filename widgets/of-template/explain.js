// Explanation data for <of-template> — the reference every widget's explain.js is copied from.
// Pure data: the object between the JSON markers is strict JSON (tools/validate-registry.js and
// tools/build-graph.py read it). Rendered by <of-explain for="of-template" lang="en">. Shape: docs/explain-schema.md.
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-template"] = /* JSON-START */ {
  "id": "of-template",
  "concept": "linear-function",
  "version": "0.1.0",
  "en": {
    "summary": "A line is the simplest function with two knobs: a slope a and an intercept b. Every other widget in the library builds on reading a parameter off a plot the way this one does.",
    "concept": [
      "**y = a·x + b.** The slope a is how much y changes when x grows by 1; the intercept b is the value of y at x = 0. Two numbers fix the line completely.",
      "**Reading a parameter from a plot.** Change one knob and watch what stays fixed: a rotates the line about its intercept, b lifts it without turning. This 'change one thing, watch the effect' loop is the pattern every widget here follows."
    ],
    "formulas": [
      { "label": "line", "expr": "y = a·x + b" }
    ],
    "computation": [
      "The widget evaluates y = a·x + b at many x across the visible range and joins the points; the equation readout substitutes the current a and b."
    ],
    "how_to_use": [
      { "control": "a", "text": "drag the slope slider; the line pivots around (0, b)." },
      { "control": "b", "text": "drag the intercept slider; the line moves up and down." }
    ],
    "notice": [
      "Negative a tilts the line downward; a = 0 is a horizontal line at height b."
    ],
    "misconceptions": [
      { "myth": "The intercept is where the line crosses the x axis.", "truth": "b is the crossing of the y axis (x = 0); the x-axis crossing is −b/a." }
    ],
    "links": [
      { "id": "of-linear-fit", "text": "the same line used as a model fitted to data." }
    ]
  },
  "ru": {
    "summary": "Прямая — простейшая функция с двумя ручками: наклоном a и смещением b. Каждый другой виджет библиотеки опирается на умение считывать параметр с графика так, как это делает этот.",
    "concept": [
      "**y = a·x + b.** Наклон a — насколько меняется y при росте x на 1; смещение b — значение y при x = 0. Два числа задают прямую полностью.",
      "**Чтение параметра с графика.** Измените одну ручку и смотрите, что остаётся неизменным: a поворачивает прямую вокруг точки пересечения с осью y, b поднимает её без поворота. Цикл «измени одно — посмотри на эффект» и есть образец, которому следуют все виджеты."
    ],
    "formulas": [
      { "label": "прямая", "expr": "y = a·x + b" }
    ],
    "computation": [
      "Виджет вычисляет y = a·x + b во многих x видимого диапазона и соединяет точки; в уравнение подставляются текущие a и b."
    ],
    "how_to_use": [
      { "control": "a", "text": "двигайте ползунок наклона; прямая вращается вокруг (0, b)." },
      { "control": "b", "text": "двигайте ползунок смещения; прямая движется вверх и вниз." }
    ],
    "notice": [
      "Отрицательное a наклоняет прямую вниз; a = 0 — горизонтальная прямая на высоте b."
    ],
    "misconceptions": [
      { "myth": "Смещение — это точка пересечения с осью x.", "truth": "b — пересечение с осью y (x = 0); с осью x прямая пересекается в −b/a." }
    ],
    "links": [
      { "id": "of-linear-fit", "text": "та же прямая как модель, подобранная по данным." }
    ]
  }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-template" }));
