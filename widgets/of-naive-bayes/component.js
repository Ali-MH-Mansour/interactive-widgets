// <of-naive-bayes> — Gaussian naive Bayes on two features: drag a test point with two sliders and
// watch prior × likelihoods → posterior computed with real numbers; decision regions behind the data.
// Plain script wrapped in an IIFE (loads from file:// and via import()). No imports, no exports.
(() => {
const TAG = 'of-naive-bayes';

const DEFAULT_CONFIG = Object.freeze({ x1: 0.5, x2: -0.5, n: 30, seed: 5, showRegions: true });
const R = 5;

const I18N = {
  en: { title: 'Naive Bayes: prior × likelihood → posterior', hint: 'Each class is described by a mean and a variance per feature (independence is the "naive" part). Move the test point ✕ and see which class wins and why.',
        x1: 'Test point x1', x2: 'Test point x2', regions: 'Show decision regions', resample: 'New data',
        cls: 'class', prior: 'P(c)', l1: 'p(x1|c)', l2: 'p(x2|c)', prod: 'product', post: 'P(c|x)', winner: 'prediction', mu: 'μ', sd: 'σ' },
  ru: { title: 'Наивный Байес: априорная × правдоподобие → апостериорная', hint: 'Каждый класс описан средним и дисперсией по каждому признаку (независимость — и есть «наивность»). Двигайте тестовую точку ✕ и смотрите, какой класс побеждает и почему.',
        x1: 'Тестовая точка x1', x2: 'Тестовая точка x2', regions: 'Показать области решения', resample: 'Новые данные',
        cls: 'класс', prior: 'P(c)', l1: 'p(x1|c)', l2: 'p(x2|c)', prod: 'произведение', post: 'P(c|x)', winner: 'прогноз', mu: 'μ', sd: 'σ' },
};

const fmt = (n, d = 3) => Number(n).toFixed(d);
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const pdf = (x, mu, sd) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
function hex(c) { const m = /^#?([0-9a-f]{6})$/i.exec(c.trim()); const v = m ? parseInt(m[1], 16) : 0x4cc9f0; return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }

const STYLE = `
  :host { display: block; inline-size: 100%; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text, #e6e9ee); background: var(--bg-card, #1b2129); border: 1px solid var(--border, #2a323d);
          border-radius: 10px; padding: 12px; box-sizing: border-box; container-type: inline-size; }
  :host([lang="ar"]) { direction: rtl; }
  h2 { font-size: 1rem; margin: 0 0 6px 0; }
  .hint { color: var(--text-muted, #9aa4b2); font-size: 0.85rem; margin: 0 0 8px 0; }
  canvas { inline-size: 100%; display: block; border-radius: 6px; background: var(--bg, #0f1216); }
  .controls { display: grid; grid-template-columns: 1fr 1fr auto auto; gap: 10px; margin-block-start: 10px; align-items: end; }
  @container (max-width: 560px) { .controls { grid-template-columns: 1fr; } }
  label { display: grid; gap: 4px; font-size: 0.9rem; } label.check { grid-template-columns: auto 1fr; align-items: center; }
  .row { display: flex; justify-content: space-between; }
  output { font-variant-numeric: tabular-nums; color: var(--accent, #4cc9f0); }
  input[type="range"] { inline-size: 100%; accent-color: var(--accent, #4cc9f0); }
  input:focus-visible, button:focus-visible { outline: 2px solid var(--accent, #4cc9f0); outline-offset: 2px; }
  button { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  table { margin-block-start: 8px; border-collapse: collapse; font-family: ui-monospace, Consolas, monospace; font-size: 0.85rem; inline-size: 100%; }
  th, td { padding: 3px 6px; border-block-end: 1px solid var(--border, #2a323d); text-align: start; } th { color: var(--text-muted, #9aa4b2); font-weight: normal; }
  td.post { color: var(--accent-2, #f9c74f); } .bar { display: inline-block; block-size: 8px; vertical-align: middle; border-radius: 4px; margin-inline-start: 6px; }
  .winner { margin-block-start: 6px; font-family: ui-monospace, Consolas, monospace; color: var(--accent-2, #f9c74f); }
`;

class OfNaiveBayes extends HTMLElement {
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
    const r = rng(this._cfg.seed * 7919 + 41), nA = Math.max(3, Math.round(this._cfg.n * 0.4)), nB = Math.max(3, this._cfg.n - nA);
    const spec = [{ mu: [-1.4, -0.8], sd: [1.0, 0.7] }, { mu: [1.3, 0.9], sd: [0.7, 1.3] }]; this._pts = [];
    [nA, nB].forEach((cnt, y) => { for (let i = 0; i < cnt; i++) this._pts.push({ x1: spec[y].mu[0] + spec[y].sd[0] * gauss(r), x2: spec[y].mu[1] + spec[y].sd[1] * gauss(r), y }); });
    this._model = [0, 1].map((y) => { const P = this._pts.filter((p) => p.y === y), n = P.length, m = (k) => P.reduce((s, p) => s + p[k], 0) / n, mu1 = m('x1'), mu2 = m('x2');
      const sd = (k, mu) => Math.sqrt(Math.max(1e-3, P.reduce((s, p) => s + (p[k] - mu) ** 2, 0) / n)); return { prior: n / this._pts.length, mu1, mu2, sd1: sd('x1', mu1), sd2: sd('x2', mu2) }; });
  }
  _posterior(x1, x2) { const rows = this._model.map((m) => { const l1 = pdf(x1, m.mu1, m.sd1), l2 = pdf(x2, m.mu2, m.sd2); return { ...m, l1, l2, prod: m.prior * l1 * l2 }; }); const Z = rows[0].prod + rows[1].prod || 1e-300; rows.forEach((r) => { r.post = r.prod / Z; }); return rows; }
  _render() {
    const s = I18N[this._lang], c = this._cfg;
    const sl = (k) => `<label><span class="row"><span>${s[k]}</span><output name="${k}">${fmt(c[k], 1)}</output></span><input type="range" name="${k}" min="-5" max="5" step="0.1" value="${c[k]}"></label>`;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <h2>${s.title}</h2><p class="hint">${s.hint}</p>
      <canvas aria-label="${s.title}" role="img"></canvas>
      <div class="controls">${sl('x1')}${sl('x2')}<label class="check"><input type="checkbox" name="showRegions" ${c.showRegions ? 'checked' : ''}><span>${s.regions}</span></label><button type="button" name="resample">${s.resample}</button></div>
      <table aria-live="polite"><thead><tr><th>${s.cls}</th><th>${s.prior}</th><th>${s.l1} (${s.mu}, ${s.sd})</th><th>${s.l2} (${s.mu}, ${s.sd})</th><th>${s.prod}</th><th>${s.post}</th></tr></thead><tbody class="rows"></tbody></table>
      <div class="winner"></div>`;
    this.shadowRoot.querySelectorAll('input').forEach((el) => el.addEventListener('input', this._onInput));
    this.shadowRoot.querySelector('button[name="resample"]').addEventListener('click', () => { this._cfg.seed += 1; this._makeData(); this._scheduleDraw(); this._emit(); });
    this._scheduleDraw();
  }
  _onInput(e) { const { name, type } = e.target; if (type === 'checkbox') this._cfg[name] = e.target.checked; else { this._cfg[name] = Number(e.target.value); this.shadowRoot.querySelector(`output[name="${name}"]`).textContent = fmt(e.target.value, 1); } this._scheduleDraw(); this._emit(); }
  _emit() { this.dispatchEvent(new CustomEvent('change', { detail: this.getConfig(), bubbles: true, composed: true })); }
  _scheduleDraw() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; this._draw(); }); }
  _draw() {
    const canvas = this.shadowRoot.querySelector('canvas'); if (!canvas) return;
    const s = I18N[this._lang], c = this._cfg, dpr = window.devicePixelRatio || 1;
    const w = Math.max(280, canvas.clientWidth || this.clientWidth || 320), h = Math.round(w * 0.6);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(this), col = (n, fb) => css.getPropertyValue(n).trim() || fb;
    const grid = col('--border', '#2a323d'), axis = col('--text-muted', '#9aa4b2'), cA = col('--accent-3', '#f3722c'), cB = col('--accent', '#4cc9f0'), bg = col('--bg', '#0f1216'), cols = [cA, cB];
    const pad = 24, pw = w - 2 * pad, ph = h - 2 * pad, sx = (x) => pad + (x + R) / (2 * R) * pw, sy = (y) => h - pad - (y + R) / (2 * R) * ph;
    ctx.clearRect(0, 0, w, h);
    if (c.showRegions) {
      const G = 56, off = document.createElement('canvas'); off.width = G; off.height = G; const octx = off.getContext('2d'), img = octx.createImageData(G, G), [kr, kg, kb] = hex(bg), rgb = cols.map(hex);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const r = this._posterior(-R + (i + 0.5) / G * 2 * R, R - (j + 0.5) / G * 2 * R), y = r[1].post > 0.5 ? 1 : 0, a = 0.18 + 0.3 * Math.abs(r[1].post - 0.5) * 2, k = (j * G + i) * 4;
        img.data[k] = kr * (1 - a) + rgb[y][0] * a; img.data[k + 1] = kg * (1 - a) + rgb[y][1] * a; img.data[k + 2] = kb * (1 - a) + rgb[y][2] * a; img.data[k + 3] = 255; }
      octx.putImageData(img, 0, 0); ctx.drawImage(off, pad, pad, pw, ph);
    }
    ctx.strokeStyle = grid; ctx.lineWidth = 1; for (let x = -R; x <= R; x++) { ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), h - pad); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pad, sy(x)); ctx.lineTo(w - pad, sy(x)); ctx.stroke(); }
    ctx.strokeStyle = axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(w - pad, sy(0)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), h - pad); ctx.stroke();
    // class means with ±σ ellipses
    this._model.forEach((m, y) => { ctx.strokeStyle = cols[y]; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.ellipse(sx(m.mu1), sy(m.mu2), m.sd1 / (2 * R) * pw, m.sd2 / (2 * R) * ph, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); });
    for (const p of this._pts) { ctx.fillStyle = cols[p.y]; ctx.beginPath(); ctx.arc(sx(p.x1), sy(p.x2), 4, 0, Math.PI * 2); ctx.fill(); }
    const X = sx(c.x1), Y = sy(c.x2); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X - 7, Y - 7); ctx.lineTo(X + 7, Y + 7); ctx.moveTo(X + 7, Y - 7); ctx.lineTo(X - 7, Y + 7); ctx.stroke();
    const rows = this._posterior(c.x1, c.x2), names = ['●', '●'];
    this.shadowRoot.querySelector('.rows').innerHTML = rows.map((r, y) => `<tr><td style="color:${cols[y]}">${names[y]} ${y}</td><td>${fmt(r.prior, 2)}</td><td>${fmt(r.l1)} (${fmt(r.mu1, 1)}, ${fmt(r.sd1, 1)})</td><td>${fmt(r.l2)} (${fmt(r.mu2, 1)}, ${fmt(r.sd2, 1)})</td><td>${r.prod.toExponential(2)}</td><td class="post">${fmt(r.post)}<span class="bar" style="inline-size:${Math.round(r.post * 60)}px;background:${cols[y]}"></span></td></tr>`).join('');
    const win = rows[1].post > rows[0].post ? 1 : 0;
    this.shadowRoot.querySelector('.winner').textContent = `${s.winner}: ${s.cls} ${win}   (P(c|x) = P(c)·p(x1|c)·p(x2|c) / Σ)`;
  }
}
if (!customElements.get(TAG)) customElements.define(TAG, OfNaiveBayes);
})();
