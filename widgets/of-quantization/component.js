// <of-quantization> — symmetric vs asymmetric (affine) quantization of real values to a b-bit integer grid.
// Plain script wrapped in an IIFE (loads from file:// and via import()). No imports, no exports.
(() => {
const TAG = 'of-quantization';

const DEFAULT_CONFIG = Object.freeze({
  mode: 'symmetric',      // 'symmetric' (signed, zero-point 0) | 'asymmetric' (unsigned, affine, zero-point z)
  bits: 3,                // b — the integer grid has 2^b (asymmetric) or 2^b − 1 (symmetric) levels
  lo: -1, hi: 3,          // min and max of the real values (the tensor's range)
  shape: 'uniform',       // 'uniform' | 'bell' | 'skewed' — how the values spread inside [lo, hi]
  x: 1.25,                // the probe value whose quantization is worked out step by step
  n: 16, seed: 3,
  showErrors: true, showCalc: true,
});
const MODES = ['symmetric', 'asymmetric'], SHAPES = ['uniform', 'bell', 'skewed'], MIN_SPAN = 0.5;

const I18N = {
  en: {
    title: 'Quantization: symmetric vs asymmetric',
    hint: 'Real values (dots) are rounded to the nearest level of a b-bit integer grid. Switch the mode and watch the grid, the rounding errors and how many levels the data actually use.',
    mode: 'Mode', symmetric: 'Symmetric (signed, z = 0)', asymmetric: 'Asymmetric (affine, zero-point z)',
    bits: 'Bits b', lo: 'Data min', hi: 'Data max', shape: 'Distribution', uniform: 'Uniform', bell: 'Bell-shaped (weights)', skewed: 'Piled at the min (ReLU activations)',
    x: 'Probe value x', errors: 'Show rounding errors', calc: 'Show the calculation', resample: 'New data',
    scale: 'scale s', zero: 'zero-point z', qrange: 'q ∈', used: 'levels used', mse: 'MSE', maxerr: 'max |x − x̂|',
    other: (m, v, u, t) => `${m} on the same data: MSE = ${v}, ${u} of ${t} levels used`,
    axisReal: 'real values x', axisInt: `integers q`, legend: '● data   — rounding error x → x̂   ◆ probe x   | grid level (hollow = unused)',
    probe: (x, q, xh) => `x = ${x} → q = ${q} → x̂ = ${xh}`, clipped: ' (saturated: x is outside the grid, so it is clipped to the end level)',
    calcTitle: 'The calculation, step by step',
    calcSym: (v) => [
      `Range. The grid is centred on 0 and must reach the largest magnitude: α = max(|${v.lo}|, |${v.hi}|) = ${v.alpha}. The data only span [${v.lo}, ${v.hi}].`,
      `Integer range. b = ${v.bits} signed bits → q ∈ [−(2^${v.bits - 1} − 1), 2^${v.bits - 1} − 1] = [${v.qmin}, ${v.qmax}]: ${v.levels} levels (the value −2^${v.bits - 1} is left out so the grid is symmetric).`,
      `Scale. s = α / qmax = ${v.alpha} / ${v.qmax} = ${v.s}. Zero-point z = 0: the real 0 is the integer 0.`,
      `Quantize the probe x = ${v.x}: q = clamp(round(x / s), qmin, qmax) = clamp(round(${v.xs}), ${v.qmin}, ${v.qmax}) = ${v.q}${v.clip}.`,
      `Dequantize: x̂ = s · q = ${v.s} · ${v.q} = ${v.xhat}. Rounding error x − x̂ = ${v.err}.`,
      `Over the ${v.n} data values: MSE = (1/n) Σ (x − x̂)² = ${v.mse}, max |x − x̂| = ${v.maxerr}; ${v.used} of ${v.levels} levels are used — ${v.unused} unused${v.unused > 0 ? ' (the part of the grid where no data lies)' : ''}.`,
    ],
    calcAsym: (v) => [
      `Range. [min, max] = [${v.lo}, ${v.hi}]${v.widened ? `, widened to [${v.lo2}, ${v.hi2}] so that the real 0 is exactly representable` : ''}.`,
      `Integer range. b = ${v.bits} unsigned bits → q ∈ [0, 2^${v.bits} − 1] = [0, ${v.qmax}]: ${v.levels} levels.`,
      `Scale. s = (max − min) / qmax = (${v.hi2} − (${v.lo2})) / ${v.qmax} = ${v.s}. Zero-point z = round(−min / s) = round(${v.zraw}) = ${v.z}: the integer that stands for the real 0.`,
      `Quantize the probe x = ${v.x}: q = clamp(round(x / s) + z, 0, qmax) = clamp(round(${v.xs}) + ${v.z}, 0, ${v.qmax}) = ${v.q}${v.clip}.`,
      `Dequantize: x̂ = s · (q − z) = ${v.s} · (${v.q} − ${v.z}) = ${v.xhat}. Rounding error x − x̂ = ${v.err}.`,
      `Over the ${v.n} data values: MSE = (1/n) Σ (x − x̂)² = ${v.mse}, max |x − x̂| = ${v.maxerr}; ${v.used} of ${v.levels} levels are used — ${v.unused} unused.`,
    ],
  },
  ru: {
    title: 'Квантование: симметричное и асимметричное',
    hint: 'Вещественные значения (точки) округляются до ближайшего уровня целочисленной сетки из b бит. Переключайте режим и смотрите на сетку, ошибки округления и на то, сколько уровней данные используют на самом деле.',
    mode: 'Режим', symmetric: 'Симметричное (со знаком, z = 0)', asymmetric: 'Асимметричное (аффинное, нулевая точка z)',
    bits: 'Биты b', lo: 'Минимум данных', hi: 'Максимум данных', shape: 'Распределение', uniform: 'Равномерное', bell: 'Колокол (веса)', skewed: 'Скопление у минимума (активации ReLU)',
    x: 'Пробное значение x', errors: 'Показать ошибки округления', calc: 'Показать вычисление', resample: 'Новые данные',
    scale: 'масштаб s', zero: 'нулевая точка z', qrange: 'q ∈', used: 'уровней занято', mse: 'MSE', maxerr: 'max |x − x̂|',
    other: (m, v, u, t) => `${m} на тех же данных: MSE = ${v}, занято ${u} из ${t} уровней`,
    axisReal: 'вещественные значения x', axisInt: 'целые q', legend: '● данные   — ошибка округления x → x̂   ◆ пробное x   | уровень сетки (пустой = не используется)',
    probe: (x, q, xh) => `x = ${x} → q = ${q} → x̂ = ${xh}`, clipped: ' (насыщение: x вне сетки, поэтому он обрезан до крайнего уровня)',
    calcTitle: 'Вычисление по шагам',
    calcSym: (v) => [
      `Диапазон. Сетка центрирована в 0 и должна дотянуться до наибольшего модуля: α = max(|${v.lo}|, |${v.hi}|) = ${v.alpha}. Данные же занимают только [${v.lo}, ${v.hi}].`,
      `Целочисленный диапазон. b = ${v.bits} бит со знаком → q ∈ [−(2^${v.bits - 1} − 1), 2^${v.bits - 1} − 1] = [${v.qmin}, ${v.qmax}]: ${v.levels} уровней (значение −2^${v.bits - 1} не используется, чтобы сетка была симметричной).`,
      `Масштаб. s = α / qmax = ${v.alpha} / ${v.qmax} = ${v.s}. Нулевая точка z = 0: вещественный 0 — это целое 0.`,
      `Квантуем пробное x = ${v.x}: q = clamp(round(x / s), qmin, qmax) = clamp(round(${v.xs}), ${v.qmin}, ${v.qmax}) = ${v.q}${v.clip}.`,
      `Деквантуем: x̂ = s · q = ${v.s} · ${v.q} = ${v.xhat}. Ошибка округления x − x̂ = ${v.err}.`,
      `По ${v.n} значениям данных: MSE = (1/n) Σ (x − x̂)² = ${v.mse}, max |x − x̂| = ${v.maxerr}; занято ${v.used} из ${v.levels} уровней — ${v.unused} не используется${v.unused > 0 ? ' (часть сетки, где нет данных)' : ''}.`,
    ],
    calcAsym: (v) => [
      `Диапазон. [min, max] = [${v.lo}, ${v.hi}]${v.widened ? `, расширен до [${v.lo2}, ${v.hi2}], чтобы вещественный 0 был представим точно` : ''}.`,
      `Целочисленный диапазон. b = ${v.bits} бит без знака → q ∈ [0, 2^${v.bits} − 1] = [0, ${v.qmax}]: ${v.levels} уровней.`,
      `Масштаб. s = (max − min) / qmax = (${v.hi2} − (${v.lo2})) / ${v.qmax} = ${v.s}. Нулевая точка z = round(−min / s) = round(${v.zraw}) = ${v.z}: целое, которое изображает вещественный 0.`,
      `Квантуем пробное x = ${v.x}: q = clamp(round(x / s) + z, 0, qmax) = clamp(round(${v.xs}) + ${v.z}, 0, ${v.qmax}) = ${v.q}${v.clip}.`,
      `Деквантуем: x̂ = s · (q − z) = ${v.s} · (${v.q} − ${v.z}) = ${v.xhat}. Ошибка округления x − x̂ = ${v.err}.`,
      `По ${v.n} значениям данных: MSE = (1/n) Σ (x − x̂)² = ${v.mse}, max |x − x̂| = ${v.maxerr}; занято ${v.used} из ${v.levels} уровней — ${v.unused} не используется.`,
    ],
  },
};

const fmt = (n, d = 2) => Number(n).toFixed(d);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

// The quantizer for one mode: integer range, scale, zero-point. Asymmetric widens the range to include 0
// (the standard "nudge") so that the real 0 has an exact integer; symmetric gets that for free (z = 0).
function quantizer(mode, bits, lo, hi) {
  if (mode === 'symmetric') {
    const qmax = 2 ** (bits - 1) - 1, alpha = Math.max(Math.abs(lo), Math.abs(hi));
    return { mode, bits, qmin: -qmax, qmax, s: alpha / qmax, z: 0, alpha, lo2: -alpha, hi2: alpha, levels: 2 * qmax + 1, widened: false };
  }
  const lo2 = Math.min(lo, 0), hi2 = Math.max(hi, 0), qmax = 2 ** bits - 1, s = (hi2 - lo2) / qmax;
  const zraw = -lo2 / s, z = clamp(Math.round(zraw), 0, qmax);
  return { mode, bits, qmin: 0, qmax, s, z, zraw, lo2, hi2, levels: qmax + 1, widened: lo2 !== lo || hi2 !== hi };
}
const quant = (Q, x) => clamp(Math.round(x / Q.s) + Q.z, Q.qmin, Q.qmax);
const dequant = (Q, q) => Q.s * (q - Q.z);

const STYLE = `
  :host { display: block; inline-size: 100%; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text, #e6e9ee); background: var(--bg-card, #1b2129); border: 1px solid var(--border, #2a323d);
          border-radius: 10px; padding: 12px; box-sizing: border-box; container-type: inline-size; }
  :host([lang="ar"]) { direction: rtl; }
  h2 { font-size: 1rem; margin: 0 0 6px 0; }
  .hint { color: var(--text-muted, #9aa4b2); font-size: 0.85rem; margin: 0 0 8px 0; }
  canvas { inline-size: 100%; display: block; border-radius: 6px; background: var(--bg, #0f1216); }
  .legend { color: var(--text-muted, #9aa4b2); font-size: 0.78rem; margin: 4px 0 0 0; }
  .controls { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-block-start: 10px; align-items: end; }
  @container (max-width: 560px) { .controls { grid-template-columns: 1fr; } }
  label { display: grid; gap: 4px; font-size: 0.9rem; } label.check { grid-template-columns: auto 1fr; align-items: center; }
  .row { display: flex; justify-content: space-between; }
  output { font-variant-numeric: tabular-nums; color: var(--accent, #4cc9f0); }
  input[type="range"] { inline-size: 100%; accent-color: var(--accent, #4cc9f0); }
  select { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 6px 8px; }
  input:focus-visible, button:focus-visible, select:focus-visible { outline: 2px solid var(--accent, #4cc9f0); outline-offset: 2px; }
  button { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  .readout { margin-block-start: 8px; font-family: ui-monospace, Consolas, monospace; color: var(--accent-2, #f9c74f); display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.9rem; }
  .readout .muted { color: var(--text-muted, #9aa4b2); }
  .calc { margin-block-start: 10px; border-top: 1px solid var(--border, #2a323d); padding-block-start: 8px; font-size: 0.86rem; }
  .calc h3 { font-size: 0.9rem; margin: 0 0 4px 0; color: var(--text-muted, #9aa4b2); }
  .calc ol { margin: 0; padding-inline-start: 1.4em; display: grid; gap: 4px; }
  .calc li { font-variant-numeric: tabular-nums; line-height: 1.4; }
  .calc .other { margin: 6px 0 0 0; color: var(--text-muted, #9aa4b2); }
`;

class OfQuantization extends HTMLElement {
  static get observedAttributes() { return ['lang', 'config']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._cfg = { ...DEFAULT_CONFIG }; this._raf = null; this._ro = null; this._onInput = this._onInput.bind(this); }
  connectedCallback() { this._cfg = this._parseConfig(this.getAttribute('config')); this._makeData(); this._render(); this._ro = new ResizeObserver(() => this._scheduleDraw()); this._ro.observe(this); }
  disconnectedCallback() { if (this._ro) { this._ro.disconnect(); this._ro = null; } if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }
  attributeChangedCallback(name, o, n) { if (o === n || !this.shadowRoot.firstChild) return; if (name === 'config') { this._cfg = this._parseConfig(n); this._makeData(); } this._render(); }
  getConfig() { const out = {}; for (const [k, v] of Object.entries(this._cfg)) if (v !== DEFAULT_CONFIG[k]) out[k] = v; return out; }
  get _lang() { const l = (this.getAttribute('lang') || 'en').toLowerCase(); return I18N[l] ? l : 'en'; }
  _parseConfig(raw) {
    if (!raw) return { ...DEFAULT_CONFIG };
    try {
      const obj = JSON.parse(raw); const cfg = { ...DEFAULT_CONFIG };
      for (const k of Object.keys(DEFAULT_CONFIG)) if (k in obj && typeof obj[k] === typeof DEFAULT_CONFIG[k]) cfg[k] = obj[k];
      if (!MODES.includes(cfg.mode)) cfg.mode = DEFAULT_CONFIG.mode;
      if (!SHAPES.includes(cfg.shape)) cfg.shape = DEFAULT_CONFIG.shape;
      cfg.bits = clamp(Math.round(cfg.bits), 2, 8); cfg.n = clamp(Math.round(cfg.n), 2, 200);
      if (!(cfg.hi - cfg.lo >= MIN_SPAN)) { cfg.lo = DEFAULT_CONFIG.lo; cfg.hi = DEFAULT_CONFIG.hi; }
      return cfg;
    } catch (e) { console.warn(`<${TAG}> invalid config attribute, using defaults:`, e.message); return { ...DEFAULT_CONFIG }; }
  }
  _makeData() {
    const c = this._cfg, r = rng(c.seed * 7919 + 13), raw = [];
    for (let i = 0; i < c.n; i++) {
      if (c.shape === 'uniform') raw.push(r());
      else if (c.shape === 'bell') raw.push(0.5 + 0.18 * gauss(r));
      else raw.push(Math.abs(gauss(r)) * 0.4);      // half-normal: piles up at the low end, thin tail to the max
    }
    const mn = Math.min(...raw), mx = Math.max(...raw), span = mx - mn || 1;
    this._pts = raw.map((v) => ({ x: c.lo + (c.hi - c.lo) * ((v - mn) / span), jit: r() }));  // spans exactly [lo, hi]
  }
  _stats(Q) {
    const counts = new Map(); let se = 0, maxerr = 0;
    for (const p of this._pts) { const q = quant(Q, p.x), e = p.x - dequant(Q, q); counts.set(q, (counts.get(q) || 0) + 1); se += e * e; maxerr = Math.max(maxerr, Math.abs(e)); }
    return { counts, mse: se / this._pts.length, maxerr, used: counts.size };
  }
  _render() {
    const s = I18N[this._lang], c = this._cfg;
    const opt = (list, cur) => list.map((m) => `<option value="${m}" ${m === cur ? 'selected' : ''}>${s[m]}</option>`).join('');
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <h2>${s.title}</h2><p class="hint">${s.hint}</p>
      <canvas aria-label="${s.title}" role="img"></canvas>
      <p class="legend">${s.legend}</p>
      <div class="controls">
        <label><span>${s.mode}</span><select name="mode">${opt(MODES, c.mode)}</select></label>
        <label><span class="row"><span>${s.bits}</span><output name="bits">${c.bits}</output></span><input type="range" name="bits" min="2" max="8" step="1" value="${c.bits}"></label>
        <label><span>${s.shape}</span><select name="shape">${opt(SHAPES, c.shape)}</select></label>
        <label><span class="row"><span>${s.lo}</span><output name="lo">${fmt(c.lo, 1)}</output></span><input type="range" name="lo" min="-4" max="4" step="0.1" value="${c.lo}"></label>
        <label><span class="row"><span>${s.hi}</span><output name="hi">${fmt(c.hi, 1)}</output></span><input type="range" name="hi" min="-4" max="4" step="0.1" value="${c.hi}"></label>
        <label><span class="row"><span>${s.x}</span><output name="x">${fmt(c.x)}</output></span><input type="range" name="x" min="-4.5" max="4.5" step="0.01" value="${c.x}"></label>
        <label class="check"><input type="checkbox" name="showErrors" ${c.showErrors ? 'checked' : ''}><span>${s.errors}</span></label>
        <label class="check"><input type="checkbox" name="showCalc" ${c.showCalc ? 'checked' : ''}><span>${s.calc}</span></label>
        <button type="button" name="resample">${s.resample}</button>
      </div>
      <div class="readout" aria-live="polite"><span class="r-scale"></span><span class="r-zero"></span><span class="r-range muted"></span><span class="r-used"></span><span class="r-mse"></span><span class="r-max muted"></span></div>
      <div class="calc" hidden><h3>${s.calcTitle}</h3><ol></ol><p class="other"></p></div>`;
    this.shadowRoot.querySelectorAll('input, select').forEach((el) => el.addEventListener('input', this._onInput));
    this.shadowRoot.querySelector('button[name="resample"]').addEventListener('click', () => { this._cfg.seed += 1; this._makeData(); this._scheduleDraw(); this._emit(); });
    this._scheduleDraw();
  }
  _onInput(e) {
    const el = e.target, { name, type } = el, c = this._cfg;
    if (type === 'checkbox') c[name] = el.checked;
    else if (el.tagName === 'SELECT') c[name] = el.value;
    else {
      let v = Number(el.value);
      if (name === 'lo' && v > c.hi - MIN_SPAN) { v = Math.round((c.hi - MIN_SPAN) * 10) / 10; el.value = v; }
      if (name === 'hi' && v < c.lo + MIN_SPAN) { v = Math.round((c.lo + MIN_SPAN) * 10) / 10; el.value = v; }
      c[name] = v;
      const o = this.shadowRoot.querySelector(`output[name="${name}"]`); if (o) o.textContent = name === 'bits' ? String(v) : fmt(v, name === 'x' ? 2 : 1);
    }
    if (name === 'lo' || name === 'hi' || name === 'shape') this._makeData();
    this._scheduleDraw(); this._emit();
  }
  _emit() { this.dispatchEvent(new CustomEvent('change', { detail: this.getConfig(), bubbles: true, composed: true })); }
  _scheduleDraw() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; this._draw(); }); }
  _draw() {
    const canvas = this.shadowRoot.querySelector('canvas'); if (!canvas) return;
    const s = I18N[this._lang], c = this._cfg, dpr = window.devicePixelRatio || 1;
    const w = Math.max(280, canvas.clientWidth || this.clientWidth || 320), h = Math.round(w * 0.5);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(this), col = (n, fb) => css.getPropertyValue(n).trim() || fb;
    const grid = col('--border', '#2a323d'), axis = col('--text-muted', '#9aa4b2'), accent = col('--accent', '#4cc9f0'), danger = col('--danger', '#f94144'), ok = col('--ok', '#43aa8b'), pt = col('--accent-2', '#f9c74f'), text = col('--text', '#e6e9ee');

    const Q = quantizer(c.mode, c.bits, c.lo, c.hi), st = this._stats(Q);
    const other = quantizer(c.mode === 'symmetric' ? 'asymmetric' : 'symmetric', c.bits, c.lo, c.hi), ost = this._stats(other);
    const qx = quant(Q, c.x), xhat = dequant(Q, qx), clipped = Math.round(c.x / Q.s) + Q.z !== qx;

    // Geometry: the real axis spans the symmetric envelope [−A, A] (same for both modes, so switching compares), the integer axis spans [qmin, qmax].
    const alpha = Math.max(Math.abs(c.lo), Math.abs(c.hi)), A = Math.max(alpha * 1.15, Math.abs(c.x) + 0.3);
    const pad = 34, yT = Math.round(h * 0.36), yB = Math.round(h * 0.80);
    const sx = (x) => pad + (x + A) / (2 * A) * (w - 2 * pad);
    const sq = (q) => pad + (q - Q.qmin + 0.5) / (Q.levels) * (w - 2 * pad);
    ctx.clearRect(0, 0, w, h);
    ctx.font = '12px system-ui, sans-serif'; ctx.textBaseline = 'middle';

    // Representable range of the grid (shaded) and the data range (bracket) on the real axis.
    ctx.fillStyle = accent; ctx.globalAlpha = 0.10; ctx.fillRect(sx(dequant(Q, Q.qmin)), yT - 30, sx(dequant(Q, Q.qmax)) - sx(dequant(Q, Q.qmin)), 60); ctx.globalAlpha = 1;
    ctx.strokeStyle = pt; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx(c.lo), yT + 30); ctx.lineTo(sx(c.lo), yT + 36); ctx.lineTo(sx(c.hi), yT + 36); ctx.lineTo(sx(c.hi), yT + 30); ctx.stroke();
    ctx.fillStyle = pt; ctx.textAlign = 'center'; ctx.fillText(fmt(c.lo, 1), sx(c.lo), yT + 46); ctx.fillText(fmt(c.hi, 1), sx(c.hi), yT + 46);

    // Axes.
    ctx.strokeStyle = axis; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad, yT); ctx.lineTo(w - pad, yT); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, yB); ctx.lineTo(w - pad, yB); ctx.stroke();
    ctx.fillStyle = axis; ctx.textAlign = 'left'; ctx.fillText(s.axisReal, pad, 12); ctx.fillText(s.axisInt, pad, yB + 22);
    // Zero mark on the real axis.
    ctx.strokeStyle = grid; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(sx(0), yT - 34); ctx.lineTo(sx(0), yT + 30); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = axis; ctx.textAlign = 'center'; ctx.fillText('0', sx(0), yT - 40);

    // Grid levels: tick on the real axis (filled = used by some data value, hollow = unused), tick + label on the integer axis, connector when the grid is sparse.
    const labelStep = Math.ceil(Q.levels / 16), connect = Q.levels <= 33, maxCount = Math.max(1, ...st.counts.values());
    for (let q = Q.qmin; q <= Q.qmax; q++) {
      const xq = dequant(Q, q), X = sx(xq), XB = sq(q), used = st.counts.has(q);
      if (connect) { ctx.strokeStyle = accent; ctx.globalAlpha = used ? 0.35 : 0.12; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X, yT + 7); ctx.lineTo(XB, yB - 7); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = accent; ctx.lineWidth = used ? 2.5 : 1; ctx.beginPath(); ctx.moveTo(X, yT - 7); ctx.lineTo(X, yT + 7); ctx.stroke();
      if (!used) { ctx.fillStyle = col('--bg', '#0f1216'); ctx.beginPath(); ctx.arc(X, yT, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.stroke(); }
      // Integer axis: tick, histogram bar of how many data values landed on q, label.
      ctx.strokeStyle = axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(XB, yB - 4); ctx.lineTo(XB, yB + 4); ctx.stroke();
      const cnt = st.counts.get(q) || 0;
      if (cnt) { const bw = Math.max(2, (w - 2 * pad) / Q.levels * 0.6), bh = 6 + 26 * cnt / maxCount; ctx.fillStyle = accent; ctx.globalAlpha = 0.55; ctx.fillRect(XB - bw / 2, yB - 5 - bh, bw, bh); ctx.globalAlpha = 1; }
      if ((q - Q.qmin) % labelStep === 0 || q === Q.qmax) { ctx.fillStyle = q === Q.z ? pt : axis; ctx.textAlign = 'center'; ctx.fillText(String(q), XB, yB + 12); }
    }
    // Zero-point label on the integer axis.
    ctx.fillStyle = pt; ctx.textAlign = 'center'; ctx.fillText('z', sq(Q.z), yB - 44);

    // Data: rounding error segment (x → x̂) and the dot, stacked a little above the axis.
    for (const p of this._pts) {
      const q = quant(Q, p.x), xh = dequant(Q, q), y = yT - 12 - p.jit * 16;
      if (c.showErrors) { ctx.strokeStyle = danger; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(p.x), y); ctx.lineTo(sx(xh), y); ctx.stroke(); }
      ctx.fillStyle = pt; ctx.beginPath(); ctx.arc(sx(p.x), y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    // The probe: diamond on the real axis, arrow to its level, bold connector to its integer, label.
    const Xp = sx(c.x), Xh = sx(xhat), yp = yT + 20;
    ctx.strokeStyle = ok; ctx.fillStyle = ok; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(Xp, yp); ctx.lineTo(Xh, yp); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(Xh, yp); ctx.lineTo(Xh, yT + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(Xp, yp - 7); ctx.lineTo(Xp + 6, yp); ctx.lineTo(Xp, yp + 7); ctx.lineTo(Xp - 6, yp); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(Xh, yT + 7); ctx.lineTo(sq(qx), yB - 7); ctx.stroke();
    ctx.fillStyle = text; ctx.textAlign = 'center';
    const label = s.probe(fmt(c.x), qx, fmt(xhat, 3)); const lx = clamp(Xp, pad + 70, w - pad - 70);
    ctx.fillText(label, lx, yT + 62);
    if (clipped) { ctx.fillStyle = danger; ctx.fillText('⚠ ' + s.clipped.trim().replace(/^\(|\)$/g, ''), w / 2, yT + 78); }

    // Readouts.
    const R = (sel, t) => { this.shadowRoot.querySelector(sel).textContent = t; };
    R('.r-scale', `${s.scale} = ${fmt(Q.s, 4)}`); R('.r-zero', `${s.zero} = ${Q.z}`); R('.r-range', `${s.qrange} [${Q.qmin}, ${Q.qmax}]`);
    R('.r-used', `${s.used}: ${st.used} / ${Q.levels}`); R('.r-mse', `${s.mse} = ${fmt(st.mse, 4)}`); R('.r-max', `${s.maxerr} = ${fmt(st.maxerr, 3)}`);
    // Calculation panel.
    const calc = this.shadowRoot.querySelector('.calc'); calc.hidden = !c.showCalc;
    if (c.showCalc) {
      const v = { lo: fmt(c.lo, 1), hi: fmt(c.hi, 1), lo2: fmt(Q.lo2, 1), hi2: fmt(Q.hi2, 1), alpha: fmt(alpha, 1), bits: c.bits, qmin: Q.qmin, qmax: Q.qmax, levels: Q.levels,
        s: fmt(Q.s, 4), z: Q.z, zraw: fmt(Q.zraw || 0, 3), widened: Q.widened, x: fmt(c.x), xs: fmt(c.x / Q.s, 3), q: qx, clip: clipped ? s.clipped : '',
        xhat: fmt(xhat, 4), err: fmt(c.x - xhat, 4), n: this._pts.length, mse: fmt(st.mse, 4), maxerr: fmt(st.maxerr, 3), used: st.used, unused: Q.levels - st.used };
      const lines = c.mode === 'symmetric' ? s.calcSym(v) : s.calcAsym(v);
      const ol = calc.querySelector('ol'); ol.innerHTML = ''; for (const t of lines) { const li = document.createElement('li'); li.textContent = t; ol.appendChild(li); }
      calc.querySelector('.other').textContent = s.other(s[other.mode], fmt(ost.mse, 4), ost.used, other.levels);
    }
  }
}
if (!customElements.get(TAG)) customElements.define(TAG, OfQuantization);
})();
