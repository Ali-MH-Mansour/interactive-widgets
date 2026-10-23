---
widget: of-quantization
version: 0.1
duration_target: 3:40
languages: [en, ru, ar]
recorded: {}
---
# Quantization: symmetric vs asymmetric — video script

Pilot script of `docs/video-script-standard.md`. One shot list, three narrations. Every number spoken
is the widget's own number in the stated state (defaults: symmetric · 3 bits · range [−1, 3] · uniform ·
probe 1.25). Read the EN column aloud at a calm pace to check the timing before recording.

## Setup

- Open `widgets/of-quantization/index.html` (or the library page → *Quantization*) in Edge/Chrome,
  window 1920×1080, zoom 125 %, dark theme. Scroll so the widget's plot, the controls and the readout
  line are all visible; the explanation panel below stays out of frame.
- Interface language: **EN** for the EN and AR recordings, **RU** for the RU recording (`lang="ru"`,
  the second instance on the demo page, or the RU button on the library page).
- Starting state = defaults. Both checkboxes on. Cursor highlight on. Do **not** press *New data*
  before scene 7 — the numbers below are for seed 3.

## Shot list (identical in every language)

| # | Time | Screen — what to do, exactly | On-screen text (lower third) |
|---|---|---|---|
| 1 | 0:00–0:18 | Hold on the default view. Circle the cursor once around the dots on the upper axis, then once around the integer axis below. No clicks. | *Quantization — storing real numbers as small integers* |
| 2 | 0:18–0:45 | Point at one tick of the grid, then at the shaded band [−1, 3]. Hover the two hollow (unused) levels at −3 and −2. Point at the readout `scale s = 1.0000 … levels used: 5 / 7`. | *scale s · zero-point z · 2ᵇ − 1 levels* |
| 3 | 0:45–1:15 | Drag **Bits b** from 3 → **2** (pause 2 s: three levels, long red error bars), then slowly to **8** (pause: grid looks continuous, error bars vanish). Return to **3**. | *more bits → smaller s → smaller error* |
| 4 | 1:15–1:50 | Drag **Data min** from −1 → **0** (ReLU-like range [0, 3]). Pause on the hollow levels: the whole left half of the grid is unused. Point at `levels used` in the readout. | *symmetric: half the grid wasted on one-sided data* |
| 5 | 1:50–2:25 | **Mode → Asymmetric (affine, zero-point z)**. Pause: every level lies inside the data; `zero-point z` is no longer 0; `MSE` drops. Point at the grey line under the plot that quotes the other mode's MSE. Then set **Data min** back to **−1**. | *asymmetric: grid fits [min, max]; z marks the real 0* |
| 6 | 2:25–3:00 | Open the **Show the calculation** panel (it is on — scroll it into frame). Drag **Probe value x** slowly from 1.25 to **2.9**, watch steps 4–5 recompute. Push it to **3.6**, past the max: the step shows the clamp. Return to **1.25**. | *quantize: round, clamp — dequantize: s·(q − z)* |
| 7 | 3:00–3:25 | Drag **Data max** from 3 → **6**. Pause: the band stretches, levels spread out, errors on all the small values grow. Press **New data** once: same grid, different points. Set **Data max** back to **3**. | *one outlier coarsens the grid for everyone* |
| 8 | 3:25–3:40 | Return to defaults (**Mode → Symmetric**, **Bits b** 3, [−1, 3], probe 1.25). Hover the three controls in turn: Distribution, Bits b, Mode. Fade out on the widget. | *Now you: Distribution → Bell-shaped. Which mode wins?* |

## Narration — EN

| # | Words |
|---|---|
| 1 | A trained neural network is millions of real numbers, each stored in thirty-two bits. Quantization stores them as small integers instead — eight bits, four, even two — so the model takes a fraction of the memory and runs on integer hardware. This widget shows exactly what that costs. |
| 2 | The upper axis holds sixteen real values. The lower axis is the integer grid: with three bits we get seven levels, one unit apart, so the scale s is one. Each value jumps to its nearest level, and the red bar is the rounding error. Notice the two hollow levels on the left — nothing lands there. Five of seven levels are used. |
| 3 | The scale is the whole story. Two bits: three levels, huge errors. Eight bits: the grid looks continuous and the errors disappear. Every extra bit halves the scale and quarters the mean squared error. But bits cost memory, so the question becomes: how do we get a small error without more bits? |
| 4 | Here is the catch with the symmetric grid. Move the data minimum to zero, like the outputs of a ReLU layer, which are never negative. The grid still runs from minus three to plus three, so its entire left half is empty. We are paying for seven levels and using four. |
| 5 | Switch to asymmetric. The grid now covers exactly the data range, from min to max, and the zero-point z records which integer stands for the real zero. Every level is somewhere the data can be, the scale shrinks, and the mean squared error falls — read the grey line: it quotes what the other mode would give on the same data. The price is that z must travel with every multiplication. |
| 6 | The calculation panel is the formulas with live numbers. Divide x by the scale, round, clamp into the integer range — that is q. Multiply back by the scale, subtract the zero-point — that is x-hat, and the difference is the error. Push the probe past the maximum and watch the clamp: the value saturates at the last level, and the error grows without limit. |
| 7 | Which is why outliers hurt. Stretch the maximum to six: one large value widens the grid, the scale doubles, and every small value now rounds more coarsely. Calibration — choosing the range from the data, sometimes clipping on purpose — exists because of this picture. New data, same range: the grid does not care which points you have, only where the range ends. |
| 8 | So: the scale decides the error; symmetric is simpler and fine for centred data like weights; asymmetric fits one-sided data like activations; and the range matters more than the bits. Now try it yourself — switch the distribution to bell-shaped and see which mode wins. |

## Narration — RU

| # | Слова |
|---|---|
| 1 | Обученная нейросеть — это миллионы вещественных чисел по тридцать два бита каждое. Квантование хранит их как маленькие целые — восемь бит, четыре, даже два, — и модель занимает в разы меньше памяти и работает на целочисленном железе. Этот виджет показывает, чего это стоит. |
| 2 | Верхняя ось — шестнадцать вещественных значений. Нижняя — целочисленная сетка: при трёх битах семь уровней с шагом один, масштаб s равен единице. Каждое значение прыгает на ближайший уровень, красная полоска — ошибка округления. Два пустых уровня слева не заняты ничем: используется пять из семи. |
| 3 | Масштаб — вот вся суть. Два бита: три уровня, огромные ошибки. Восемь бит: сетка почти непрерывна, ошибок не видно. Каждый лишний бит делит масштаб пополам и ошибку — на четыре. Но биты стоят памяти. Как уменьшить ошибку, не добавляя бит? |
| 4 | Вот ловушка симметричной сетки. Сдвинем минимум данных к нулю — как выходы ReLU, они не бывают отрицательными. Сетка по-прежнему от минус трёх до трёх, и вся её левая половина пуста. Платим за семь уровней, используем четыре. |
| 5 | Переключаем на асимметричное. Сетка теперь занимает ровно диапазон данных, от минимума до максимума, а нулевая точка z запоминает, какое целое означает вещественный ноль. Каждый уровень там, где есть данные, масштаб меньше, ошибка падает — серая строка показывает, что дал бы другой режим на тех же данных. Цена: z приходится нести через каждое умножение. |
| 6 | Панель вычислений — те же формулы с живыми числами. Делим x на масштаб, округляем, зажимаем в целочисленный диапазон — это q. Умножаем обратно на масштаб, вычитаем нулевую точку — это x с крышкой, разница и есть ошибка. Выведем зонд за максимум: значение насыщается на последнем уровне, и ошибка растёт без предела. |
| 7 | Поэтому выбросы так вредны. Растянем максимум до шести: одно большое значение расширяет сетку, масштаб удваивается, и каждое маленькое значение округляется грубее. Калибровка — выбор диапазона по данным, иногда с намеренным отсечением — существует ради этой картинки. Новые данные, тот же диапазон: сетке важно только, где заканчивается диапазон. |
| 8 | Итак: ошибку задаёт масштаб; симметричное проще и годится для центрированных данных вроде весов; асимметричное подходит односторонним данным вроде активаций; диапазон важнее числа бит. Попробуйте сами: поставьте колоколообразное распределение и посмотрите, какой режим выигрывает. |

## Narration — AR

| # | الكلمات |
|---|---|
| 1 | الشبكة العصبية المدرَّبة ملايين من الأعداد الحقيقية، كلٌّ منها مخزَّن في اثنين وثلاثين بتاً. التكميم يخزّنها كأعداد صحيحة صغيرة بدلاً من ذلك — ثمانية بتات، أو أربعة، أو حتى اثنان — فيأخذ النموذج جزءاً يسيراً من الذاكرة ويعمل على عتاد الأعداد الصحيحة. هذه الأداة تُظهر بالضبط ما يكلّفه ذلك. |
| 2 | المحور العلوي يحمل ستة عشر قيمة حقيقية. المحور السفلي هو شبكة الأعداد الصحيحة: بثلاثة بتات لدينا سبعة مستويات، المسافة بينها واحد، فالمقياس s يساوي واحداً. كل قيمة تقفز إلى أقرب مستوى، والشريط الأحمر هو خطأ التقريب. لاحظ المستويين الفارغين على اليسار — لا شيء يصل إليهما. المستخدَم خمسة من سبعة. |
| 3 | المقياس هو القصة كلها. بتان: ثلاثة مستويات وأخطاء ضخمة. ثمانية بتات: تبدو الشبكة متصلة وتختفي الأخطاء. كل بت إضافي ينصّف المقياس ويقسم متوسط مربع الخطأ على أربعة. لكن البتات تكلّف ذاكرة، فيصبح السؤال: كيف نصغّر الخطأ دون بتات أكثر؟ |
| 4 | هنا مأزق الشبكة المتماثلة. حرّك الحد الأدنى للبيانات إلى الصفر، كمخرجات طبقة ReLU التي لا تكون سالبة أبداً. ما زالت الشبكة تمتد من سالب ثلاثة إلى ثلاثة، فنصفها الأيسر كله فارغ. ندفع ثمن سبعة مستويات ونستعمل أربعة. |
| 5 | بدّل إلى اللامتماثل. الشبكة الآن تغطي مدى البيانات بالضبط، من الأدنى إلى الأعلى، ونقطة الصفر z تسجّل أي عدد صحيح يمثّل الصفر الحقيقي. كل مستوى في مكان يمكن أن تقع فيه البيانات، يصغر المقياس، وينخفض متوسط مربع الخطأ — اقرأ السطر الرمادي: يذكر ما كان سيعطيه الوضع الآخر على البيانات نفسها. الثمن أن z يجب أن ترافق كل عملية ضرب. |
| 6 | لوحة الحساب هي المعادلات بأرقام حيّة. اقسم x على المقياس، قرّب، واحصر النتيجة في مدى الأعداد الصحيحة — هذا q. اضرب مرة أخرى في المقياس واطرح نقطة الصفر — هذا x̂، والفرق هو الخطأ. ادفع قيمة المسبار إلى ما بعد الحد الأعلى وراقب الحصر: تتشبّع القيمة عند آخر مستوى، ويكبر الخطأ بلا حد. |
| 7 | ولهذا تضرّ القيم الشاذة. مدّد الحد الأعلى إلى ستة: قيمة كبيرة واحدة توسّع الشبكة، يتضاعف المقياس، وكل قيمة صغيرة تُقرَّب الآن بخشونة أكبر. المعايرة — اختيار المدى من البيانات، وأحياناً القصّ عمداً — وُجدت بسبب هذه الصورة. بيانات جديدة بالمدى نفسه: لا يهمّ الشبكة أي نقاط لديك، بل أين ينتهي المدى. |
| 8 | إذن: المقياس يقرّر الخطأ؛ المتماثل أبسط ويكفي للبيانات المتمركزة حول الصفر كالأوزان؛ اللامتماثل يناسب البيانات أحادية الجانب كالتفعيلات؛ والمدى أهم من عدد البتات. جرّب بنفسك الآن — بدّل التوزيع إلى الجرسي وانظر أي وضع يفوز. |

## Chapters (scene → chapter title → widget state)

| # | t | en | ru | ar | config (reproduces the scene's end state) |
|---|---|---|---|---|---|
| 1 | 0:00 | What quantization is | Что такое квантование | ما هو التكميم | `{}` |
| 2 | 0:18 | The grid: scale and levels | Сетка: масштаб и уровни | الشبكة: المقياس والمستويات | `{}` |
| 3 | 0:45 | Bits and the error | Биты и ошибка | البتات والخطأ | `{"bits": 8}` |
| 4 | 1:15 | Symmetric wastes half the grid | Симметричное теряет полсетки | المتماثل يهدر نصف الشبكة | `{"lo": 0}` |
| 5 | 1:50 | Asymmetric fits the data | Асимметричное подгоняется под данные | اللامتماثل يلائم البيانات | `{"mode": "asymmetric", "lo": 0}` |
| 6 | 2:25 | The calculation, step by step | Вычисление по шагам | الحساب خطوة خطوة | `{"mode": "asymmetric", "x": 2.9}` |
| 7 | 3:00 | Outliers and calibration | Выбросы и калибровка | القيم الشاذة والمعايرة | `{"mode": "asymmetric", "hi": 6}` |
| 8 | 3:25 | Now you try | Теперь вы | جرّب بنفسك | `{"shape": "bell"}` |

## Upload (copy-paste per language)

| | en | ru | ar |
|---|---|---|---|
| Title | Quantization explained in 3 minutes: symmetric vs asymmetric (interactive) | Квантование за 3 минуты: симметричное и асимметричное (интерактивно) | التكميم في ثلاث دقائق: المتماثل واللامتماثل (تفاعلي) |
| Description, first line | How neural networks store real numbers as small integers — scale, zero-point, rounding error, outliers — shown on a live widget you can open and drag yourself: <site url>/w/of-quantization | Как нейросети хранят вещественные числа маленькими целыми — масштаб, нулевая точка, ошибка округления, выбросы — на живом виджете, который можно открыть и покрутить самому: <site url>/w/of-quantization | كيف تخزّن الشبكات العصبية الأعداد الحقيقية كأعداد صحيحة صغيرة — المقياس، نقطة الصفر، خطأ التقريب، القيم الشاذة — على أداة حيّة يمكنك فتحها وتجريبها بنفسك: <site url>/w/of-quantization |
| Then | the 8 chapter lines `m:ss Title` from the table above, in that language | | |
| Tags | quantization, int8, neural networks, machine learning, zero-point, scale, interactive | квантование, int8, нейросети, машинное обучение, нулевая точка, масштаб | التكميم, الشبكات العصبية, تعلم الآلة, int8, تفاعلي |
| Playlist | Interactive ML widgets (EN) | Интерактивные виджеты по ML (RU) | أدوات تفاعلية لتعلّم الآلة (AR) |
| Thumbnail text | 7 levels · s = 1 — vs — 8 levels · s = 0.57 | 7 уровней · s = 1 — vs — 8 уровней · s = 0,57 | ٧ مستويات · s = 1 — مقابل — ٨ مستويات · s = 0.57 |

## Changelog

- **0.1 (2026-10-23)** — pilot script, written from `explain.js` 0.1.0 numbers; not yet recorded.
