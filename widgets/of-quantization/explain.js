// Explanation data for <of-quantization>. Pure data; strict JSON between the markers (read by tools).
window.OF_EXPLAIN = window.OF_EXPLAIN || {};
window.OF_EXPLAIN["of-quantization"] = /* JSON-START */ {
  "id": "of-quantization",
  "concept": "quantization",
  "version": "0.1.0",
  "en": {
    "summary": "Quantization stores real numbers (weights, activations) as small integers — 8 bits instead of 32 — so a model takes a quarter of the memory and runs on integer hardware. A real value is mapped to the nearest level of an integer grid and read back with a small rounding error. Symmetric quantization centres the grid on zero; asymmetric quantization fits the grid to the actual range and shifts it by a zero-point.",
    "concept": [
      "**The idea.** A float32 number costs 32 bits. A neural network has millions of them, and most lie in a narrow range such as [−1, 3]. Instead of storing every value exactly, choose 2^b evenly spaced *levels* across the range and store only the index q of the nearest level — an integer of b bits. Reading back (dequantization) gives the level's value x̂ = s·(q − z), close to the original x but not equal: the difference is the *rounding error*.",
      "**Two numbers define the grid.** The *scale* s is the distance between neighbouring levels — the resolution. The *zero-point* z is the integer that stands for the real value 0. Every quantized tensor carries just these two numbers beside its integers.",
      "**Symmetric quantization.** The grid is centred on 0: it spans [−α, α] where α is the largest magnitude in the data, and z = 0. Integers are signed, q ∈ [−(2^(b−1) − 1), 2^(b−1) − 1] (−128 is skipped for int8 so the grid is mirror-symmetric). Simple and fast — a multiply with no offset — but if the data are not centred on 0, the half of the grid on the empty side is wasted and the levels are coarser than they need to be.",
      "**Asymmetric (affine) quantization.** The grid spans exactly [min, max] of the data (widened to include 0 if needed), with unsigned integers q ∈ [0, 2^b − 1] and a zero-point z = round(−min / s) that marks where 0 sits. Every level lies where data can lie, so the scale is smaller and the rounding error lower on skewed data such as ReLU outputs, which are never negative. The cost: the offset z must be carried through every multiplication.",
      "**Saturation.** A value outside the grid is *clipped* to the end level — its error can be large. That is why the range (min/max or α) is chosen from the data (calibration), and why a few outliers can hurt: they stretch the range and coarsen the grid for everyone else."
    ],
    "formulas": [
      { "label": "quantize", "expr": "q = clamp( round(x / s) + z ,  q_min, q_max )" },
      { "label": "dequantize", "expr": "x̂ = s · (q − z)" },
      { "label": "symmetric", "expr": "α = max|x|      s = α / (2^(b−1) − 1)      z = 0      q ∈ [−(2^(b−1) − 1), 2^(b−1) − 1]" },
      { "label": "asymmetric", "expr": "s = (max − min) / (2^b − 1)      z = round(−min / s)      q ∈ [0, 2^b − 1]" },
      { "label": "rounding error", "expr": "e = x − x̂,  |e| ≤ s / 2 inside the grid      MSE ≈ s² / 12 for spread-out data" }
    ],
    "computation": [
      "The data are 16 values spread uniformly over the chosen range [−1, 3] (the min and max are always present). With b = 3 bits the symmetric grid has 7 levels: α = max(|−1|, |3|) = 3, s = 3 / 3 = 1.0000, levels at −3, −2, −1, 0, 1, 2, 3. The data occupy only [−1, 3], so the levels −3 and −2 are never used: 5 of 7 levels are used.",
      "The probe x = 1.25: q = clamp(round(1.25 / 1), −3, 3) = 1, x̂ = 1 · 1 = 1.0000, error 0.2500. Over the 16 values the MSE is about 0.063 and the largest error is 0.39 (never more than half a level, 0.5).",
      "Switch to asymmetric with the same data: s = (3 − (−1)) / 7 = 0.5714, z = round(1 / 0.5714) = round(1.750) = 2, so the 8 levels are 0.5714·(q − 2) for q = 0…7, from −1.1429 to 2.8571. All 8 levels lie where data lie (7 of them are hit by this sample); the probe gives q = clamp(round(2.188) + 2, 0, 7) = 4, x̂ = 0.5714 · 2 = 1.1429, error 0.1071. The MSE falls to about 0.030 — roughly half, because the scale is 0.57 instead of 1.00.",
      "Each extra bit halves the scale and quarters the MSE: the readout under the plot and the last step of the calculation panel print the exact numbers for the current settings, and the grey line names what the other mode would give on the same data."
    ],
    "how_to_use": [
      { "control": "Mode", "text": "flip between symmetric and asymmetric with everything else fixed; compare the shaded grid range, the hollow (unused) levels, the scale s and the MSE." },
      { "control": "Bits b", "text": "go from 2 to 8 bits. Watch the levels densify and the red error bars shrink; at 8 bits the grid looks continuous." },
      { "control": "Data min", "text": "move the minimum towards 0 and above it (e.g. [0, 3] = ReLU outputs): symmetric wastes half its grid, asymmetric does not." },
      { "control": "Data max", "text": "stretch the maximum alone: one large value coarsens the whole grid — the outlier problem of calibration." },
      { "control": "Distribution", "text": "bell-shaped (like trained weights), uniform, or piled at the minimum (like activations after ReLU); see which mode wastes levels." },
      { "control": "Probe value x", "text": "drag one value along the axis and follow the calculation panel: x / s, the rounding, the clamp, x̂ and the error. Push x beyond the grid to see saturation." },
      { "control": "Show the calculation", "text": "the numbered steps are the formulas above with the current numbers substituted; the last line is the summary over all data." },
      { "control": "New data", "text": "another sample with the same min, max and shape: the grid is unchanged, only which levels are hit." }
    ],
    "notice": [
      "The rounding error is never larger than s / 2 inside the grid — the scale is the whole story.",
      "Symmetric with data in [−1, 3] uses 5 of 7 levels; asymmetric has all 8 inside the data. Same bits, about half the MSE.",
      "Asymmetric is not always better: for data centred on 0 (weights) the two grids nearly coincide and symmetric is cheaper to compute.",
      "A single outlier at the max coarsens the grid for every other value — clipping the range on purpose can lower the total error."
    ],
    "misconceptions": [
      { "myth": "Quantization just rounds each number to fewer decimals.", "truth": "it rounds to a grid whose spacing s is chosen from the data range and the bit width; the grid, not the decimals, is the design decision." },
      { "myth": "More bits is the only way to reduce the error.", "truth": "fitting the grid to the data (asymmetric, or a tighter calibrated range) reduces s at the same bit width." },
      { "myth": "The zero-point is the smallest value.", "truth": "z is the *integer* that represents the real 0; it is chosen so that 0 is exactly representable, which padding and ReLU rely on." }
    ],
    "links": [
      { "id": "of-linear-fit", "text": "the same MSE measures the rounding error here and the residuals there — the mean of squared differences." }
    ]
  },
  "ru": {
    "summary": "Квантование хранит вещественные числа (веса, активации) как маленькие целые — 8 бит вместо 32: модель занимает в четыре раза меньше памяти и работает на целочисленном оборудовании. Вещественное значение отображается в ближайший уровень целочисленной сетки и читается обратно с небольшой ошибкой округления. Симметричное квантование центрирует сетку в нуле; асимметричное подгоняет сетку под реальный диапазон и сдвигает её нулевой точкой.",
    "concept": [
      "**Идея.** Число float32 стоит 32 бита. В нейросети их миллионы, и большинство лежит в узком диапазоне, например [−1, 3]. Вместо точного хранения каждого значения выберем 2^b равноотстоящих *уровней* на этом диапазоне и будем хранить только индекс q ближайшего уровня — целое из b бит. Обратное чтение (деквантование) даёт значение уровня x̂ = s·(q − z), близкое к исходному x, но не равное ему: разница — *ошибка округления*.",
      "**Сетку задают два числа.** *Масштаб* s — расстояние между соседними уровнями, то есть разрешение. *Нулевая точка* z — целое, которое изображает вещественный 0. Квантованный тензор несёт рядом со своими целыми только эти два числа.",
      "**Симметричное квантование.** Сетка центрирована в 0: она занимает [−α, α], где α — наибольший модуль в данных, и z = 0. Целые со знаком, q ∈ [−(2^(b−1) − 1), 2^(b−1) − 1] (для int8 значение −128 пропускают, чтобы сетка была зеркальной). Просто и быстро — умножение без сдвига, — но если данные не центрированы в 0, половина сетки с пустой стороны пропадает, а уровни получаются грубее, чем нужно.",
      "**Асимметричное (аффинное) квантование.** Сетка занимает ровно [min, max] данных (при необходимости расширенный до 0), целые без знака q ∈ [0, 2^b − 1], а нулевая точка z = round(−min / s) показывает, где стоит 0. Каждый уровень лежит там, где могут лежать данные, поэтому масштаб меньше и ошибка округления ниже на скошенных данных — например, на выходах ReLU, которые никогда не отрицательны. Цена: сдвиг z приходится проносить через каждое умножение.",
      "**Насыщение.** Значение вне сетки *обрезается* до крайнего уровня — его ошибка может быть большой. Поэтому диапазон (min/max или α) выбирают по данным (калибровка), и поэтому несколько выбросов вредят: они растягивают диапазон и делают сетку грубее для всех остальных."
    ],
    "formulas": [
      { "label": "квантование", "expr": "q = clamp( round(x / s) + z ,  q_min, q_max )" },
      { "label": "деквантование", "expr": "x̂ = s · (q − z)" },
      { "label": "симметричное", "expr": "α = max|x|      s = α / (2^(b−1) − 1)      z = 0      q ∈ [−(2^(b−1) − 1), 2^(b−1) − 1]" },
      { "label": "асимметричное", "expr": "s = (max − min) / (2^b − 1)      z = round(−min / s)      q ∈ [0, 2^b − 1]" },
      { "label": "ошибка округления", "expr": "e = x − x̂,  |e| ≤ s / 2 внутри сетки      MSE ≈ s² / 12 для разбросанных данных" }
    ],
    "computation": [
      "Данные — 16 значений, равномерно разбросанных по выбранному диапазону [−1, 3] (минимум и максимум присутствуют всегда). При b = 3 бит симметричная сетка имеет 7 уровней: α = max(|−1|, |3|) = 3, s = 3 / 3 = 1,0000, уровни −3, −2, −1, 0, 1, 2, 3. Данные занимают только [−1, 3], поэтому уровни −3 и −2 не используются никогда: занято 5 из 7 уровней.",
      "Пробное x = 1,25: q = clamp(round(1,25 / 1), −3, 3) = 1, x̂ = 1 · 1 = 1,0000, ошибка 0,2500. По 16 значениям MSE около 0,063, наибольшая ошибка 0,39 (никогда не больше пол-уровня, 0,5).",
      "Переключитесь на асимметричное с теми же данными: s = (3 − (−1)) / 7 = 0,5714, z = round(1 / 0,5714) = round(1,750) = 2, так что 8 уровней равны 0,5714·(q − 2) при q = 0…7 — от −1,1429 до 2,8571. Все 8 уровней лежат там, где лежат данные (в эту выборку попадают 7 из них); для пробного значения q = clamp(round(2,188) + 2, 0, 7) = 4, x̂ = 0,5714 · 2 = 1,1429, ошибка 0,1071. MSE падает примерно до 0,030 — примерно вдвое, потому что масштаб 0,57 вместо 1,00.",
      "Каждый дополнительный бит вдвое уменьшает масштаб и вчетверо — MSE: индикаторы под графиком и последний шаг панели вычисления печатают точные числа для текущих настроек, а серая строка называет, что дал бы другой режим на тех же данных."
    ],
    "how_to_use": [
      { "control": "Режим", "text": "переключайте симметричное и асимметричное при прочих равных; сравнивайте закрашенный диапазон сетки, пустые (неиспользуемые) уровни, масштаб s и MSE." },
      { "control": "Биты b", "text": "пройдите от 2 до 8 бит. Смотрите, как уровни сгущаются и красные столбики ошибок укорачиваются; при 8 битах сетка выглядит сплошной." },
      { "control": "Минимум данных", "text": "сдвигайте минимум к 0 и выше него (например, [0, 3] — выходы ReLU): симметричное теряет половину сетки, асимметричное — нет." },
      { "control": "Максимум данных", "text": "растяните один максимум: одно большое значение делает грубее всю сетку — проблема выбросов при калибровке." },
      { "control": "Распределение", "text": "колокол (как обученные веса), равномерное или скопление у минимума (как активации после ReLU); смотрите, какой режим теряет уровни." },
      { "control": "Пробное значение x", "text": "тяните одно значение вдоль оси и следите за панелью вычисления: x / s, округление, clamp, x̂ и ошибка. Выведите x за пределы сетки, чтобы увидеть насыщение." },
      { "control": "Показать вычисление", "text": "нумерованные шаги — формулы выше с подставленными текущими числами; последняя строка — итог по всем данным." },
      { "control": "Новые данные", "text": "другая выборка с теми же минимумом, максимумом и формой: сетка не меняется, меняется лишь то, какие уровни заняты." }
    ],
    "notice": [
      "Ошибка округления внутри сетки никогда не больше s / 2 — масштаб решает всё.",
      "Симметричное на данных [−1, 3] использует 5 из 7 уровней; у асимметричного все 8 лежат внутри данных. Те же биты, примерно вдвое меньшая MSE.",
      "Асимметричное не всегда лучше: для данных, центрированных в 0 (веса), сетки почти совпадают, а симметричное дешевле в вычислении.",
      "Один выброс на максимуме делает сетку грубее для всех остальных значений — намеренная обрезка диапазона может уменьшить суммарную ошибку."
    ],
    "misconceptions": [
      { "myth": "Квантование — это просто округление каждого числа до меньшего числа знаков.", "truth": "это округление до сетки, шаг s которой выбран по диапазону данных и числу бит; проектное решение — сетка, а не знаки после запятой." },
      { "myth": "Уменьшить ошибку можно только добавив биты.", "truth": "подгонка сетки под данные (асимметричная или более узкий калиброванный диапазон) уменьшает s при том же числе бит." },
      { "myth": "Нулевая точка — это наименьшее значение.", "truth": "z — *целое*, изображающее вещественный 0; его выбирают так, чтобы 0 был представим точно, на что опираются паддинг и ReLU." }
    ],
    "links": [
      { "id": "of-linear-fit", "text": "та же MSE измеряет здесь ошибку округления, а там — остатки: среднее квадратов разностей." }
    ]
  }
} /* JSON-END */;
document.dispatchEvent(new CustomEvent("of-explain:register", { detail: "of-quantization" }));
