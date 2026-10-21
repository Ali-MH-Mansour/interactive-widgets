// <of-kmeans-steps> — k-means one step at a time: Assign recolours the points to the nearest
// centroid, Update moves each centroid to the mean of its points; inertia drops until it converges.
// Plain script wrapped in an IIFE (loads from file:// and via import()). No imports, no exports.
(() => {
const TAG = 'of-kmeans-steps';

const DEFAULT_CONFIG = Object.freeze({ k: 3, blobs: 3, n: 60, seed: 2, showLines: true });
const R = 5, COLORS = ['#4cc9f0', '#f9c74f', '#f3722c', '#43aa8b', '#f94144', '#b388ff'];

const I18N = {
  en: { title: 'k-means, step by step', hint: 'Centroids start at random points. Assign gives every point the colour of its nearest centroid; Update moves each centroid to the mean of its points. Repeat until nothing changes.',
        k: 'Number of clusters k', lines: 'Lines to centroids', assign: 'Assign', update: 'Update', step: 'Step (both)', play: 'Play', pause: 'Pause', reset: 'Restart', resample: 'New data',
        iter: 'iteration', inertia: 'inertia Σ‖x − μ‖²', next: 'next', converged: 'converged — assignments stopped changing', unassigned: 'not assigned yet' },
  ru: { title: 'k-средних, шаг за шагом', hint: 'Центроиды начинают в случайных точках. «Назначить» красит каждую точку в цвет ближайшего центроида; «Обновить» сдвигает центроид в среднее своих точек. Повторяйте, пока ничего не меняется.',
        k: 'Число кластеров k', lines: 'Линии к центроидам', assign: 'Назначить', update: 'Обновить', step: 'Шаг (оба)', play: 'Пуск', pause: 'Пауза', reset: 'Заново', resample: 'Новые данные',
        iter: 'итерация', inertia: 'инерция Σ‖x − μ‖²', next: 'далее', converged: 'сошлось — назначения перестали меняться', unassigned: 'ещё не назначено' },
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
  .controls { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-block-start: 10px; align-items: end; }
  @container (max-width: 560px) { .controls { grid-template-columns: 1fr; } }
  .buttons { display: flex; gap: 6px; flex-wrap: wrap; margin-block-start: 8px; align-items: center; }
  label { display: grid; gap: 4px; font-size: 0.9rem; } label.check { grid-template-columns: auto 1fr; align-items: center; }
  .row { display: flex; justify-content: space-between; }
  output { font-variant-numeric: tabular-nums; color: var(--accent, #4cc9f0); }
  input[type="range"] { inline-size: 100%; accent-color: var(--accent, #4cc9f0); }
  input:focus-visible, button:focus-visible { outline: 2px solid var(--accent, #4cc9f0); outline-offset: 2px; }
  button { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  button.next { border-color: var(--accent, #4cc9f0); }
  .readout { margin-block-start: 8px; font-family: ui-monospace, Consolas, monospace; color: var(--accent-2, #f9c74f); display: flex; gap: 16px; flex-wrap: wrap; }
  .ok { color: var(--ok, #43aa8b); }
`;

class OfKmeansSteps extends HTMLElement {
  static get observedAttributes() { return ['lang', 'config']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._cfg = { ...DEFAULT_CONFIG }; this._raf = null; this._ro = null; this._timer = null; this._onInput = this._onInput.bind(this); }
  connectedCallback() { this._cfg = this._parseConfig(this.getAttribute('config')); this._makeData(); this._init(); this._render(); this._ro = new ResizeObserver(() => this._scheduleDraw()); this._ro.observe(this); }
  disconnectedCallback() { this._stop(); if (this._ro) { this._ro.disconnect(); this._ro = null; } if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }
  attributeChangedCallback(name, o, n) { if (o === n || !this.shadowRoot.firstChild) return; this._stop(); if (name === 'config') { this._cfg = this._parseConfig(n); this._makeData(); this._init(); } this._render(); }
  getConfig() { const out = {}; for (const [k, v] of Object.entries(this._cfg)) if (v !== DEFAULT_CONFIG[k]) out[k] = v; return out; }
  get _lang() { const l = (this.getAttribute('lang') || 'en').toLowerCase(); return I18N[l] ? l : 'en'; }
  _parseConfig(raw) {
    if (!raw) return { ...DEFAULT_CONFIG };
    try { const obj = JSON.parse(raw); const cfg = { ...DEFAULT_CONFIG }; for (const k of Object.keys(DEFAULT_CONFIG)) if (k in obj && typeof obj[k] === typeof DEFAULT_CONFIG[k]) cfg[k] = obj[k]; cfg.k = Math.max(1, Math.min(6, Math.round(cfg.k))); return cfg; }
    catch (e) { console.warn(`<${TAG}> invalid config attribute, using defaults:`, e.message); return { ...DEFAULT_CONFIG }; }
  }
  _makeData() { const r = rng(this._cfg.seed * 7919 + 71), B = Math.max(1, this._cfg.blobs), centers = []; for (let b = 0; b < B; b++) centers.push([-3 + 6 * r(), -3 + 6 * r()]); this._pts = []; for (let i = 0; i < this._cfg.n; i++) { const c = centers[i % B]; this._pts.push({ x: c[0] + 0.8 * gauss(r), y: c[1] + 0.8 * gauss(r), a: -1 }); } this._restarts = 0; }
  _init() { const r = rng(this._cfg.seed * 131 + this._restarts * 17 + 5); this._cent = []; const used = new Set(); while (this._cent.length < this._cfg.k) { const i = Math.floor(r() * this._pts.length); if (used.has(i) && used.size < this._pts.length) continue; used.add(i); this._cent.push({ x: this._pts[i].x, y: this._pts[i].y }); } for (const p of this._pts) p.a = -1; this._iter = 0; this._phase = 'assign'; this._converged = false; }
  _assign() { let changed = 0; for (const p of this._pts) { let best = 0, bd = Infinity; this._cent.forEach((c, i) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; best = i; } }); if (p.a !== best) changed++; p.a = best; } if (this._iter > 0 && changed === 0) { this._converged = true; this._stop(); } this._phase = 'update'; }
  _update() { this._cent.forEach((c, i) => { const P = this._pts.filter((p) => p.a === i); if (P.length) { c.x = P.reduce((s, p) => s + p.x, 0) / P.length; c.y = P.reduce((s, p) => s + p.y, 0) / P.length; } }); this._iter++; this._phase = 'assign'; }
  _inertia() { return this._pts.reduce((s, p) => (p.a < 0 ? s : s + (p.x - this._cent[p.a].x) ** 2 + (p.y - this._cent[p.a].y) ** 2), 0); }
  _doPhase() { if (this._converged) { this._stop(); return; } if (this._phase === 'assign') this._assign(); else this._update(); this._scheduleDraw(); }
  _play() { if (this._timer || this._converged) return; this._timer = setInterval(() => this._doPhase(), 600); this._syncPlay(); }
  _stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; } this._syncPlay(); }
  _syncPlay() { const b = this.shadowRoot && this.shadowRoot.querySelector('button[name="play"]'); if (b) b.textContent = this._timer ? I18N[this._lang].pause : I18N[this._lang].play; }
  _render() {
    const s = I18N[this._lang], c = this._cfg;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <h2>${s.title}</h2><p class="hint">${s.hint}</p>
      <canvas aria-label="${s.title}" role="img"></canvas>
      <div class="controls"><label><span class="row"><span>${s.k}</span><output name="k">${c.k}</output></span><input type="range" name="k" min="1" max="6" step="1" value="${c.k}"></label>
        <label class="check"><input type="checkbox" name="showLines" ${c.showLines ? 'checked' : ''}><span>${s.lines}</span></label></div>
      <div class="buttons"><button type="button" name="assign">${s.assign}</button><button type="button" name="update">${s.update}</button><button type="button" name="step">${s.step}</button><button type="button" name="play">${s.play}</button><button type="button" name="reset">${s.reset}</button><button type="button" name="resample">${s.resample}</button></div>
      <div class="readout" aria-live="polite"><span class="r-iter"></span><span class="r-in"></span><span class="r-state"></span></div>`;
    this.shadowRoot.querySelectorAll('input').forEach((el) => el.addEventListener('input', this._onInput));
    const q = (n) => this.shadowRoot.querySelector(`button[name="${n}"]`);
    q('assign').addEventListener('click', () => { this._stop(); if (this._phase === 'assign') this._doPhase(); });
    q('update').addEventListener('click', () => { this._stop(); if (this._phase === 'update') this._doPhase(); });
    q('step').addEventListener('click', () => { this._stop(); if (this._phase === 'update') this._doPhase(); this._doPhase(); this._doPhase(); });
    q('play').addEventListener('click', () => (this._timer ? this._stop() : this._play()));
    q('reset').addEventListener('click', () => { this._stop(); this._restarts++; this._init(); this._scheduleDraw(); });
    q('resample').addEventListener('click', () => { this._stop(); this._cfg.seed += 1; this._makeData(); this._init(); this._scheduleDraw(); this._emit(); });
    this._scheduleDraw();
  }
  _onInput(e) { const { name, type } = e.target; this._stop(); if (type === 'checkbox') this._cfg[name] = e.target.checked; else { this._cfg[name] = Number(e.target.value); this.shadowRoot.querySelector(`output[name="${name}"]`).textContent = e.target.value; this._init(); } this._scheduleDraw(); this._emit(); }
  _emit() { this.dispatchEvent(new CustomEvent('change', { detail: this.getConfig(), bubbles: true, composed: true })); }
  _scheduleDraw() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; this._draw(); }); }
  _draw() {
    const canvas = this.shadowRoot.querySelector('canvas'); if (!canvas) return;
    const s = I18N[this._lang], c = this._cfg, dpr = window.devicePixelRatio || 1;
    const w = Math.max(280, canvas.clientWidth || this.clientWidth || 320), h = Math.round(w * 0.62);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(this), col = (n, fb) => css.getPropertyValue(n).trim() || fb, grid = col('--border', '#2a323d'), axis = col('--text-muted', '#9aa4b2');
    const pad = 20, sx = (x) => pad + (x + R) / (2 * R) * (w - 2 * pad), sy = (y) => h - pad - (y + R) / (2 * R) * (h - 2 * pad);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = grid; ctx.lineWidth = 1; for (let x = -R; x <= R; x++) { ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), h - pad); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pad, sy(x)); ctx.lineTo(w - pad, sy(x)); ctx.stroke(); }
    if (c.showLines) { ctx.lineWidth = 1; ctx.globalAlpha = 0.35; for (const p of this._pts) if (p.a >= 0) { ctx.strokeStyle = COLORS[p.a]; ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(sx(this._cent[p.a].x), sy(this._cent[p.a].y)); ctx.stroke(); } ctx.globalAlpha = 1; }
    for (const p of this._pts) { ctx.fillStyle = p.a >= 0 ? COLORS[p.a] : axis; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), 4, 0, Math.PI * 2); ctx.fill(); }
    this._cent.forEach((m, i) => { ctx.fillStyle = COLORS[i]; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#0f1216'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), sx(m.x), sy(m.y)); });
    const q = (k) => this.shadowRoot.querySelector(k), assigned = this._pts.some((p) => p.a >= 0);
    q('.r-iter').textContent = `${s.iter} ${this._iter}`; q('.r-in').textContent = assigned ? `${s.inertia} = ${fmt(this._inertia(), 1)}` : s.unassigned;
    q('.r-state').textContent = this._converged ? s.converged : `${s.next}: ${this._phase === 'assign' ? s.assign : s.update}`; q('.r-state').className = `r-state${this._converged ? ' ok' : ''}`;
    for (const n of ['assign', 'update']) { const b = q(`button[name="${n}"]`); b.classList.toggle('next', !this._converged && this._phase === n); b.disabled = this._converged || this._phase !== n; }
  }
}
if (!customElements.get(TAG)) customElements.define(TAG, OfKmeansSteps);
})();
