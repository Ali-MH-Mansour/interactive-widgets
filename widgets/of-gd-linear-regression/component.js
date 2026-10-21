// <of-gd-linear-regression> — gradient descent learns w and b of a line: step by step, with the
// gradient and the weight-update formula shown with real numbers, and the loss curve.
// Plain script wrapped in an IIFE (loads from file:// and via import()). No imports, no exports.
(() => {
const TAG = 'of-gd-linear-regression';

const DEFAULT_CONFIG = Object.freeze({ lr: 0.05, w0: -1, b0: 3, noise: 1.2, n: 20, seed: 7 });
const TRUE_W = 2, TRUE_B = 1, XR = 4, YR = 12, MAXSTEPS = 300;

const I18N = {
  en: { title: 'Gradient descent on a line: w ← w − η·∂L/∂w', hint: 'Each step computes the gradient of the MSE and moves w and b a little against it. Watch the line settle and the loss fall; raise η until it diverges.',
        lr: 'Learning rate η', step: 'Step', play: 'Play', pause: 'Pause', reset: 'Reset', resample: 'New data',
        stepN: 'step', loss: 'MSE', grad: 'gradient', update: 'update', lossAxis: 'MSE per step', diverged: 'diverged — η too large' },
  ru: { title: 'Градиентный спуск для прямой: w ← w − η·∂L/∂w', hint: 'На каждом шаге считается градиент MSE, и w, b чуть сдвигаются против него. Смотрите, как прямая устанавливается, а потери падают; увеличьте η до расхождения.',
        lr: 'Скорость обучения η', step: 'Шаг', play: 'Пуск', pause: 'Пауза', reset: 'Сброс', resample: 'Новые данные',
        stepN: 'шаг', loss: 'MSE', grad: 'градиент', update: 'обновление', lossAxis: 'MSE по шагам', diverged: 'расходится — η слишком велика' },
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
  .plots { display: grid; grid-template-columns: 3fr 2fr; gap: 10px; }
  @container (max-width: 560px) { .plots { grid-template-columns: 1fr; } .controls { grid-template-columns: 1fr; } }
  canvas { inline-size: 100%; display: block; border-radius: 6px; background: var(--bg, #0f1216); }
  .controls { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-block-start: 10px; align-items: end; }
  .buttons { display: flex; gap: 6px; flex-wrap: wrap; }
  label { display: grid; gap: 4px; font-size: 0.9rem; }
  .row { display: flex; justify-content: space-between; }
  output { font-variant-numeric: tabular-nums; color: var(--accent, #4cc9f0); }
  input[type="range"] { inline-size: 100%; accent-color: var(--accent, #4cc9f0); }
  input:focus-visible, button:focus-visible { outline: 2px solid var(--accent, #4cc9f0); outline-offset: 2px; }
  button { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  table { margin-block-start: 8px; border-collapse: collapse; font-family: ui-monospace, Consolas, monospace; font-size: 0.85rem; inline-size: 100%; }
  td { padding: 2px 8px; border-block-end: 1px solid var(--border, #2a323d); } td:first-child { color: var(--text-muted, #9aa4b2); }
  .upd { color: var(--accent-2, #f9c74f); } .warn { color: var(--danger, #f94144); }
`;

class OfGdLinearRegression extends HTMLElement {
  static get observedAttributes() { return ['lang', 'config']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._cfg = { ...DEFAULT_CONFIG }; this._raf = null; this._ro = null; this._timer = null; this._onInput = this._onInput.bind(this); }
  connectedCallback() { this._cfg = this._parseConfig(this.getAttribute('config')); this._makeData(); this._reset(); this._render(); this._ro = new ResizeObserver(() => this._scheduleDraw()); this._ro.observe(this); }
  disconnectedCallback() { this._stop(); if (this._ro) { this._ro.disconnect(); this._ro = null; } if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }
  attributeChangedCallback(name, o, n) { if (o === n || !this.shadowRoot.firstChild) return; this._stop(); if (name === 'config') { this._cfg = this._parseConfig(n); this._makeData(); this._reset(); } this._render(); }
  getConfig() { const out = {}; for (const [k, v] of Object.entries(this._cfg)) if (v !== DEFAULT_CONFIG[k]) out[k] = v; return out; }
  get _lang() { const l = (this.getAttribute('lang') || 'en').toLowerCase(); return I18N[l] ? l : 'en'; }
  _parseConfig(raw) {
    if (!raw) return { ...DEFAULT_CONFIG };
    try { const obj = JSON.parse(raw); const cfg = { ...DEFAULT_CONFIG }; for (const k of Object.keys(DEFAULT_CONFIG)) if (k in obj && typeof obj[k] === typeof DEFAULT_CONFIG[k]) cfg[k] = obj[k]; return cfg; }
    catch (e) { console.warn(`<${TAG}> invalid config attribute, using defaults:`, e.message); return { ...DEFAULT_CONFIG }; }
  }
  _makeData() { const r = rng(this._cfg.seed * 7919 + 13); this._pts = []; for (let i = 0; i < this._cfg.n; i++) { const x = -3 + 6 * r(); this._pts.push({ x, y: TRUE_W * x + TRUE_B + this._cfg.noise * gauss(r) }); } }
  _reset() { this._w = this._cfg.w0; this._b = this._cfg.b0; this._step = 0; this._hist = [this._loss()]; this._trail = []; this._last = null; }
  _loss(w = this._w, b = this._b) { return this._pts.reduce((s, p) => s + (p.y - (w * p.x + b)) ** 2, 0) / this._pts.length; }
  _grad() { let dw = 0, db = 0; for (const p of this._pts) { const e = (this._w * p.x + this._b) - p.y; dw += 2 * e * p.x; db += 2 * e; } return { dw: dw / this._pts.length, db: db / this._pts.length }; }
  _doStep() {
    if (this._step >= MAXSTEPS || !Number.isFinite(this._w)) { this._stop(); return; }
    const g = this._grad(), lr = this._cfg.lr; this._trail.push([this._w, this._b]); if (this._trail.length > 10) this._trail.shift();
    this._last = { w: this._w, b: this._b, ...g, w1: this._w - lr * g.dw, b1: this._b - lr * g.db };
    this._w = this._last.w1; this._b = this._last.b1; this._step++; this._hist.push(this._loss());
    if (!Number.isFinite(this._hist.at(-1)) || this._hist.at(-1) > 1e6) this._stop();
    this._scheduleDraw();
  }
  _play() { if (this._timer) return; this._timer = setInterval(() => this._doStep(), 120); this._syncPlay(); }
  _stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; } this._syncPlay(); }
  _syncPlay() { const b = this.shadowRoot && this.shadowRoot.querySelector('button[name="play"]'); if (b) b.textContent = this._timer ? I18N[this._lang].pause : I18N[this._lang].play; }
  _render() {
    const s = I18N[this._lang], c = this._cfg;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <h2>${s.title}</h2><p class="hint">${s.hint}</p>
      <div class="plots"><canvas class="fit" aria-label="${s.title}" role="img"></canvas><canvas class="loss" aria-label="${s.lossAxis}" role="img"></canvas></div>
      <div class="controls">
        <label><span class="row"><span>${s.lr}</span><output name="lr">${fmt(c.lr, 3)}</output></span><input type="range" name="lr" min="0.005" max="0.4" step="0.005" value="${c.lr}"></label>
        <div class="buttons"><button type="button" name="step">${s.step}</button><button type="button" name="play">${s.play}</button><button type="button" name="reset">${s.reset}</button><button type="button" name="resample">${s.resample}</button></div>
      </div>
      <table aria-live="polite"><tbody>
        <tr><td>${s.stepN}</td><td class="t-step"></td><td>${s.loss}</td><td class="t-loss"></td></tr>
        <tr><td>w, b</td><td class="t-wb"></td><td>${s.grad}</td><td class="t-grad"></td></tr>
        <tr><td>${s.update}</td><td colspan="3" class="t-upd upd"></td></tr>
      </tbody></table>`;
    this.shadowRoot.querySelector('input[name="lr"]').addEventListener('input', this._onInput);
    const q = (n) => this.shadowRoot.querySelector(`button[name="${n}"]`);
    q('step').addEventListener('click', () => { this._stop(); this._doStep(); });
    q('play').addEventListener('click', () => (this._timer ? this._stop() : this._play()));
    q('reset').addEventListener('click', () => { this._stop(); this._reset(); this._scheduleDraw(); });
    q('resample').addEventListener('click', () => { this._stop(); this._cfg.seed += 1; this._makeData(); this._reset(); this._scheduleDraw(); this._emit(); });
    this._scheduleDraw();
  }
  _onInput(e) { this._cfg.lr = Number(e.target.value); this.shadowRoot.querySelector('output[name="lr"]').textContent = fmt(this._cfg.lr, 3); this._scheduleDraw(); this._emit(); }
  _emit() { this.dispatchEvent(new CustomEvent('change', { detail: this.getConfig(), bubbles: true, composed: true })); }
  _scheduleDraw() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; this._draw(); }); }
  _setup(canvas, ratio) {
    const dpr = window.devicePixelRatio || 1, w = Math.max(200, canvas.clientWidth || 300), h = Math.round(w * ratio);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); return { ctx, w, h };
  }
  _draw() {
    const s = I18N[this._lang], css = getComputedStyle(this), col = (n, fb) => css.getPropertyValue(n).trim() || fb;
    const grid = col('--border', '#2a323d'), axis = col('--text-muted', '#9aa4b2'), line = col('--accent', '#4cc9f0'), pt = col('--accent-2', '#f9c74f'), lossc = col('--accent-3', '#f3722c');
    const fitC = this.shadowRoot.querySelector('canvas.fit'), lossC = this.shadowRoot.querySelector('canvas.loss'); if (!fitC || !lossC) return;
    { const { ctx, w, h } = this._setup(fitC, 0.66), pad = 24, sx = (x) => pad + (x + XR) / (2 * XR) * (w - 2 * pad), sy = (y) => h - pad - (y + YR) / (2 * YR) * (h - 2 * pad);
      ctx.strokeStyle = grid; ctx.lineWidth = 1; for (let x = -XR; x <= XR; x++) { ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), h - pad); ctx.stroke(); } for (let y = -YR; y <= YR; y += 4) { ctx.beginPath(); ctx.moveTo(pad, sy(y)); ctx.lineTo(w - pad, sy(y)); ctx.stroke(); }
      ctx.strokeStyle = axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(w - pad, sy(0)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), h - pad); ctx.stroke();
      this._trail.forEach(([tw, tb], i) => { ctx.globalAlpha = 0.08 + 0.3 * i / this._trail.length; ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx(-XR), sy(tw * -XR + tb)); ctx.lineTo(sx(XR), sy(tw * XR + tb)); ctx.stroke(); });
      ctx.globalAlpha = 1; if (Number.isFinite(this._w)) { ctx.strokeStyle = line; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx(-XR), sy(this._w * -XR + this._b)); ctx.lineTo(sx(XR), sy(this._w * XR + this._b)); ctx.stroke(); }
      ctx.fillStyle = pt; for (const p of this._pts) { ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), 4, 0, Math.PI * 2); ctx.fill(); } }
    { const { ctx, w, h } = this._setup(lossC, 0.99), pad = 24, hist = this._hist.map((v) => (Number.isFinite(v) ? Math.min(v, 1e6) : 1e6));
      const maxL = Math.max(1, ...hist.slice(0, Math.min(hist.length, 60))), nX = Math.max(20, hist.length);
      const sx = (i) => pad + i / nX * (w - 2 * pad), sy = (v) => h - pad - Math.min(v, maxL) / maxL * (h - 2 * pad);
      ctx.strokeStyle = axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();
      ctx.fillStyle = axis; ctx.font = '11px system-ui, sans-serif'; ctx.fillText(s.lossAxis, pad + 4, pad - 8); ctx.fillText(fmt(maxL, 0), pad + 2, pad + 10);
      ctx.strokeStyle = lossc; ctx.lineWidth = 2; ctx.beginPath(); hist.forEach((v, i) => (i ? ctx.lineTo(sx(i), sy(v)) : ctx.moveTo(sx(i), sy(v)))); ctx.stroke();
      if (hist.length) { ctx.fillStyle = lossc; ctx.beginPath(); ctx.arc(sx(hist.length - 1), sy(hist.at(-1)), 3.5, 0, Math.PI * 2); ctx.fill(); } }
    const q = (c) => this.shadowRoot.querySelector(c), L = this._hist.at(-1), diverged = !Number.isFinite(L) || L > 1e6;
    q('.t-step').textContent = String(this._step); q('.t-loss').textContent = diverged ? s.diverged : fmt(L, 3); q('.t-loss').className = `t-loss${diverged ? ' warn' : ''}`;
    q('.t-wb').textContent = `w = ${fmt(this._w)}, b = ${fmt(this._b)}`;
    const g = Number.isFinite(this._w) ? this._grad() : { dw: NaN, db: NaN }; q('.t-grad').textContent = `∂L/∂w = ${fmt(g.dw)}, ∂L/∂b = ${fmt(g.db)}`;
    const l = this._last; q('.t-upd').textContent = l ? `w ← ${fmt(l.w)} − ${fmt(this._cfg.lr, 3)}·(${fmt(l.dw)}) = ${fmt(l.w1)}    b ← ${fmt(l.b)} − ${fmt(this._cfg.lr, 3)}·(${fmt(l.db)}) = ${fmt(l.b1)}` : `w ← w − η·∂L/∂w,  b ← b − η·∂L/∂b`;
  }
}
if (!customElements.get(TAG)) customElements.define(TAG, OfGdLinearRegression);
})();
