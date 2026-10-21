// <of-linear-fit> — fit a line to a scatter by hand: w and b sliders, residual bars, live MSE.
// Plain script wrapped in an IIFE (loads from file:// and via import()). No imports, no exports.
(() => {
const TAG = 'of-linear-fit';

const DEFAULT_CONFIG = Object.freeze({
  w: 0.5, b: 1,            // the learner's line ŷ = w·x + b
  noise: 1.5, n: 20, seed: 7,
  showResiduals: true, showBest: false,
});
const TRUE_W = 2, TRUE_B = 1, XR = 5, YR = 12;

const I18N = {
  en: { title: 'Fit a line by hand: ŷ = w·x + b', hint: 'Move w and b so the line passes as close as possible to all points. The bars are the residuals y − ŷ; MSE is their mean square.',
        w: 'Weight w (slope)', b: 'Bias b (intercept)', noise: 'Noise', resample: 'New data', residuals: 'Show residuals', best: 'Show least-squares line',
        mse: 'MSE', bestMse: 'best possible MSE', formula: (n) => `MSE = (1/${n}) · Σ (y − ŷ)²` },
  ru: { title: 'Подберите прямую вручную: ŷ = w·x + b', hint: 'Двигайте w и b, чтобы прямая прошла как можно ближе ко всем точкам. Столбики — остатки y − ŷ; MSE — средний их квадрат.',
        w: 'Вес w (наклон)', b: 'Смещение b', noise: 'Шум', resample: 'Новые данные', residuals: 'Показать остатки', best: 'Показать МНК-прямую',
        mse: 'MSE', bestMse: 'наименьшее возможное MSE', formula: (n) => `MSE = (1/${n}) · Σ (y − ŷ)²` },
};

const fmt = (n, d = 2) => Number(n).toFixed(d);
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

const STYLE = `
  :host { display: block; inline-size: 100%; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text, #e6e9ee); background: var(--bg-card, #1b2129); border: 1px solid var(--border, #2a323d);
          border-radius: 10px; padding: 12px; box-sizing: border-box; container-type: inline-size; }
  :host([lang="ar"]) { direction: rtl; }
  h2 { font-size: 1rem; margin: 0 0 6px 0; }
  .hint { color: var(--text-muted, #9aa4b2); font-size: 0.85rem; margin: 0 0 8px 0; }
  canvas { inline-size: 100%; display: block; border-radius: 6px; background: var(--bg, #0f1216); }
  .controls { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-block-start: 10px; align-items: end; }
  @container (max-width: 560px) { .controls { grid-template-columns: 1fr; } }
  label { display: grid; gap: 4px; font-size: 0.9rem; } label.check { grid-template-columns: auto 1fr; align-items: center; }
  .row { display: flex; justify-content: space-between; }
  output { font-variant-numeric: tabular-nums; color: var(--accent, #4cc9f0); }
  input[type="range"] { inline-size: 100%; accent-color: var(--accent, #4cc9f0); }
  input:focus-visible, button:focus-visible { outline: 2px solid var(--accent, #4cc9f0); outline-offset: 2px; }
  button { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  .readout { margin-block-start: 8px; font-family: ui-monospace, Consolas, monospace; color: var(--accent-2, #f9c74f); display: flex; gap: 16px; flex-wrap: wrap; }
  .readout .muted { color: var(--text-muted, #9aa4b2); }
`;

class OfLinearFit extends HTMLElement {
  static get observedAttributes() { return ['lang', 'config']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._cfg = { ...DEFAULT_CONFIG }; this._raf = null; this._ro = null; this._onInput = this._onInput.bind(this); }
  connectedCallback() { this._cfg = this._parseConfig(this.getAttribute('config')); this._makeData(); this._render(); this._ro = new ResizeObserver(() => this._scheduleDraw()); this._ro.observe(this); }
  disconnectedCallback() { if (this._ro) { this._ro.disconnect(); this._ro = null; } if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }
  attributeChangedCallback(name, o, n) { if (o === n || !this.shadowRoot.firstChild) return; if (name === 'config') { this._cfg = this._parseConfig(n); this._makeData(); } this._render(); }
  getConfig() { const out = {}; for (const [k, v] of Object.entries(this._cfg)) if (v !== DEFAULT_CONFIG[k]) out[k] = v; return out; }
  get _lang() { const l = (this.getAttribute('lang') || 'en').toLowerCase(); return I18N[l] ? l : 'en'; }
  _parseConfig(raw) {
    if (!raw) return { ...DEFAULT_CONFIG };
    try { const obj = JSON.parse(raw); const cfg = { ...DEFAULT_CONFIG }; for (const k of Object.keys(DEFAULT_CONFIG)) if (k in obj && typeof obj[k] === typeof DEFAULT_CONFIG[k]) cfg[k] = obj[k]; return cfg; }
    catch (e) { console.warn(`<${TAG}> invalid config attribute, using defaults:`, e.message); return { ...DEFAULT_CONFIG }; }
  }
  _makeData() {
    const r = rng(this._cfg.seed * 7919 + 13); const pts = [];
    for (let i = 0; i < this._cfg.n; i++) { const x = -4 + 8 * r(); pts.push({ x, y: TRUE_W * x + TRUE_B + this._cfg.noise * gauss(r) }); }
    this._pts = pts;
    const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
    let sxy = 0, sxx = 0; for (const p of pts) { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; }
    this._best = { w: sxy / sxx, b: my - (sxy / sxx) * mx };
  }
  _mse(w, b) { return this._pts.reduce((s, p) => s + (p.y - (w * p.x + b)) ** 2, 0) / this._pts.length; }
  _render() {
    const s = I18N[this._lang], c = this._cfg;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <h2>${s.title}</h2><p class="hint">${s.hint}</p>
      <canvas aria-label="${s.title}" role="img"></canvas>
      <div class="controls">
        <label><span class="row"><span>${s.w}</span><output name="w">${fmt(c.w)}</output></span><input type="range" name="w" min="-4" max="4" step="0.05" value="${c.w}"></label>
        <label><span class="row"><span>${s.b}</span><output name="b">${fmt(c.b)}</output></span><input type="range" name="b" min="-6" max="6" step="0.1" value="${c.b}"></label>
        <label><span class="row"><span>${s.noise}</span><output name="noise">${fmt(c.noise, 1)}</output></span><input type="range" name="noise" min="0" max="3" step="0.1" value="${c.noise}"></label>
        <label class="check"><input type="checkbox" name="showResiduals" ${c.showResiduals ? 'checked' : ''}><span>${s.residuals}</span></label>
        <label class="check"><input type="checkbox" name="showBest" ${c.showBest ? 'checked' : ''}><span>${s.best}</span></label>
        <button type="button" name="resample">${s.resample}</button>
      </div>
      <div class="readout" aria-live="polite"><span class="mse"></span><span class="muted formula">${s.formula(c.n)}</span><span class="muted best"></span></div>`;
    this.shadowRoot.querySelectorAll('input').forEach((el) => el.addEventListener('input', this._onInput));
    this.shadowRoot.querySelector('button[name="resample"]').addEventListener('click', () => { this._cfg.seed += 1; this._makeData(); this._scheduleDraw(); this._emit(); });
    this._scheduleDraw();
  }
  _onInput(e) {
    const { name, type } = e.target;
    if (type === 'checkbox') this._cfg[name] = e.target.checked; else { this._cfg[name] = Number(e.target.value); const o = this.shadowRoot.querySelector(`output[name="${name}"]`); if (o) o.textContent = fmt(e.target.value, name === 'noise' ? 1 : 2); }
    if (name === 'noise') this._makeData();
    this._scheduleDraw(); this._emit();
  }
  _emit() { this.dispatchEvent(new CustomEvent('change', { detail: this.getConfig(), bubbles: true, composed: true })); }
  _scheduleDraw() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; this._draw(); }); }
  _draw() {
    const canvas = this.shadowRoot.querySelector('canvas'); if (!canvas) return;
    const s = I18N[this._lang], c = this._cfg, dpr = window.devicePixelRatio || 1;
    const w = Math.max(280, canvas.clientWidth || this.clientWidth || 320), h = Math.round(w * 0.6);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(this), col = (n, fb) => css.getPropertyValue(n).trim() || fb;
    const grid = col('--border', '#2a323d'), axis = col('--text-muted', '#9aa4b2'), line = col('--accent', '#4cc9f0'), res = col('--danger', '#f94144'), best = col('--ok', '#43aa8b'), pt = col('--accent-2', '#f9c74f');
    const pad = 28, sx = (x) => pad + (x + XR) / (2 * XR) * (w - 2 * pad), sy = (y) => h - pad - (y + YR) / (2 * YR) * (h - 2 * pad);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = grid; ctx.lineWidth = 1;
    for (let x = -XR; x <= XR; x++) { ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), h - pad); ctx.stroke(); }
    for (let y = -YR; y <= YR; y += 4) { ctx.beginPath(); ctx.moveTo(pad, sy(y)); ctx.lineTo(w - pad, sy(y)); ctx.stroke(); }
    ctx.strokeStyle = axis; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(w - pad, sy(0)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), h - pad); ctx.stroke();
    if (c.showResiduals) { ctx.strokeStyle = res; ctx.lineWidth = 2; for (const p of this._pts) { ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(sx(p.x), sy(c.w * p.x + c.b)); ctx.stroke(); } }
    if (c.showBest) { ctx.setLineDash([6, 4]); ctx.strokeStyle = best; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(-XR), sy(this._best.w * -XR + this._best.b)); ctx.lineTo(sx(XR), sy(this._best.w * XR + this._best.b)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.strokeStyle = line; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx(-XR), sy(c.w * -XR + c.b)); ctx.lineTo(sx(XR), sy(c.w * XR + c.b)); ctx.stroke();
    ctx.fillStyle = pt; for (const p of this._pts) { ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), 4, 0, Math.PI * 2); ctx.fill(); }
    this.shadowRoot.querySelector('.mse').textContent = `${s.mse} = ${fmt(this._mse(c.w, c.b))}`;
    this.shadowRoot.querySelector('.best').textContent = c.showBest ? `${s.bestMse}: ${fmt(this._mse(this._best.w, this._best.b))} (w=${fmt(this._best.w)}, b=${fmt(this._best.b)})` : '';
  }
}
if (!customElements.get(TAG)) customElements.define(TAG, OfLinearFit);
})();
