// <of-logistic-regression> — two classes of points, a probability surface σ(w1·x1 + w2·x2 + b), the
// decision boundary, misclassified points ringed; sliders move the weights by hand, Step/Play lets
// gradient descent on the log-loss learn them. Plain script in an IIFE. No imports, no exports.
(() => {
const TAG = 'of-logistic-regression';

const DEFAULT_CONFIG = Object.freeze({ w1: -1, w2: 1.5, b: 1, lr: 0.5, n: 40, sep: 2.6, seed: 3, showProb: true });
const R = 5, MAXSTEPS = 500;

const I18N = {
  en: { title: 'Logistic regression: learning to separate two classes', hint: 'The colour is P(class ● | x) = σ(w1·x1 + w2·x2 + b); the line is where it equals 0.5. Move the weights by hand, or press Step/Play and let gradient descent on the log-loss move them.',
        w1: 'Weight w1', w2: 'Weight w2', b: 'Bias b', lr: 'Learning rate η', prob: 'Show probability surface', step: 'Step', play: 'Play', pause: 'Pause', reset: 'Reset', resample: 'New data',
        acc: 'accuracy', loss: 'log-loss', wrong: 'misclassified (ringed)', stepN: 'step' },
  ru: { title: 'Логистическая регрессия: учимся разделять два класса', hint: 'Цвет — P(класс ● | x) = σ(w1·x1 + w2·x2 + b); линия — где она равна 0,5. Двигайте веса вручную или нажмите Шаг/Пуск: градиентный спуск по log-loss сдвинет их сам.',
        w1: 'Вес w1', w2: 'Вес w2', b: 'Смещение b', lr: 'Скорость обучения η', prob: 'Показать поверхность вероятности', step: 'Шаг', play: 'Пуск', pause: 'Пауза', reset: 'Сброс', resample: 'Новые данные',
        acc: 'точность', loss: 'log-loss', wrong: 'ошибок (обведены)', stepN: 'шаг' },
};

const fmt = (n, d = 2) => Number(n).toFixed(d);
const sig = (z) => 1 / (1 + Math.exp(-z));
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function hex(c) { const m = /^#?([0-9a-f]{6})$/i.exec(c.trim()); const v = m ? parseInt(m[1], 16) : 0x4cc9f0; return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }

const STYLE = `
  :host { display: block; inline-size: 100%; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text, #e6e9ee); background: var(--bg-card, #1b2129); border: 1px solid var(--border, #2a323d);
          border-radius: 10px; padding: 12px; box-sizing: border-box; container-type: inline-size; }
  :host([lang="ar"]) { direction: rtl; }
  h2 { font-size: 1rem; margin: 0 0 6px 0; }
  .hint { color: var(--text-muted, #9aa4b2); font-size: 0.85rem; margin: 0 0 8px 0; }
  canvas { inline-size: 100%; display: block; border-radius: 6px; background: var(--bg, #0f1216); }
  .controls { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-block-start: 10px; align-items: end; }
  @container (max-width: 560px) { .controls { grid-template-columns: 1fr 1fr; } }
  .buttons { display: flex; gap: 6px; flex-wrap: wrap; margin-block-start: 8px; align-items: center; }
  label { display: grid; gap: 4px; font-size: 0.9rem; } label.check { grid-template-columns: auto 1fr; align-items: center; }
  .row { display: flex; justify-content: space-between; }
  output { font-variant-numeric: tabular-nums; color: var(--accent, #4cc9f0); }
  input[type="range"] { inline-size: 100%; accent-color: var(--accent, #4cc9f0); }
  input:focus-visible, button:focus-visible { outline: 2px solid var(--accent, #4cc9f0); outline-offset: 2px; }
  button { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  .readout { margin-block-start: 8px; font-family: ui-monospace, Consolas, monospace; color: var(--accent-2, #f9c74f); display: flex; gap: 16px; flex-wrap: wrap; }
`;

class OfLogisticRegression extends HTMLElement {
  static get observedAttributes() { return ['lang', 'config']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._cfg = { ...DEFAULT_CONFIG }; this._raf = null; this._ro = null; this._timer = null; this._step = 0; this._onInput = this._onInput.bind(this); }
  connectedCallback() { this._cfg = this._parseConfig(this.getAttribute('config')); this._makeData(); this._render(); this._ro = new ResizeObserver(() => this._scheduleDraw()); this._ro.observe(this); }
  disconnectedCallback() { this._stop(); if (this._ro) { this._ro.disconnect(); this._ro = null; } if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }
  attributeChangedCallback(name, o, n) { if (o === n || !this.shadowRoot.firstChild) return; this._stop(); if (name === 'config') { this._cfg = this._parseConfig(n); this._makeData(); } this._render(); }
  getConfig() { const out = {}; for (const [k, v] of Object.entries(this._cfg)) if (v !== DEFAULT_CONFIG[k]) out[k] = Number.isFinite(v) ? Number(fmt(v, 3)) : v; return out; }
  get _lang() { const l = (this.getAttribute('lang') || 'en').toLowerCase(); return I18N[l] ? l : 'en'; }
  _parseConfig(raw) {
    if (!raw) return { ...DEFAULT_CONFIG };
    try { const obj = JSON.parse(raw); const cfg = { ...DEFAULT_CONFIG }; for (const k of Object.keys(DEFAULT_CONFIG)) if (k in obj && typeof obj[k] === typeof DEFAULT_CONFIG[k]) cfg[k] = obj[k]; return cfg; }
    catch (e) { console.warn(`<${TAG}> invalid config attribute, using defaults:`, e.message); return { ...DEFAULT_CONFIG }; }
  }
  _makeData() {
    const r = rng(this._cfg.seed * 7919 + 29), d = this._cfg.sep / 2; this._pts = []; this._step = 0;
    for (let i = 0; i < this._cfg.n; i++) { const y = i % 2, cx = y ? d : -d, cy = y ? d * 0.6 : -d * 0.6; this._pts.push({ x1: cx + gauss(r), x2: cy + gauss(r), y }); }
  }
  _p(x1, x2) { return sig(this._cfg.w1 * x1 + this._cfg.w2 * x2 + this._cfg.b); }
  _stats() { let loss = 0, wrong = 0; for (const p of this._pts) { const q = Math.min(1 - 1e-9, Math.max(1e-9, this._p(p.x1, p.x2))); loss -= p.y ? Math.log(q) : Math.log(1 - q); if ((q >= 0.5) !== (p.y === 1)) wrong++; } return { loss: loss / this._pts.length, wrong }; }
  _doStep() {
    if (this._step >= MAXSTEPS) { this._stop(); return; }
    let g1 = 0, g2 = 0, gb = 0; for (const p of this._pts) { const e = this._p(p.x1, p.x2) - p.y; g1 += e * p.x1; g2 += e * p.x2; gb += e; }
    const n = this._pts.length, lr = this._cfg.lr; this._cfg.w1 -= lr * g1 / n; this._cfg.w2 -= lr * g2 / n; this._cfg.b -= lr * gb / n; this._step++;
    this._syncSliders(); this._scheduleDraw(); this._emit();
  }
  _syncSliders() { for (const k of ['w1', 'w2', 'b']) { const i = this.shadowRoot.querySelector(`input[name="${k}"]`), o = this.shadowRoot.querySelector(`output[name="${k}"]`); if (i) i.value = String(Math.max(-5, Math.min(5, this._cfg[k]))); if (o) o.textContent = fmt(this._cfg[k]); } }
  _play() { if (this._timer) return; this._timer = setInterval(() => this._doStep(), 100); this._syncPlay(); }
  _stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; } this._syncPlay(); }
  _syncPlay() { const b = this.shadowRoot && this.shadowRoot.querySelector('button[name="play"]'); if (b) b.textContent = this._timer ? I18N[this._lang].pause : I18N[this._lang].play; }
  _render() {
    const s = I18N[this._lang], c = this._cfg;
    const sl = (k, min, max, step, d) => `<label><span class="row"><span>${s[k]}</span><output name="${k}">${fmt(c[k], d)}</output></span><input type="range" name="${k}" min="${min}" max="${max}" step="${step}" value="${c[k]}"></label>`;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <h2>${s.title}</h2><p class="hint">${s.hint}</p>
      <canvas aria-label="${s.title}" role="img"></canvas>
      <div class="controls">${sl('w1', -5, 5, 0.05, 2)}${sl('w2', -5, 5, 0.05, 2)}${sl('b', -5, 5, 0.05, 2)}${sl('lr', 0.01, 3, 0.01, 2)}</div>
      <div class="buttons"><button type="button" name="step">${s.step}</button><button type="button" name="play">${s.play}</button><button type="button" name="reset">${s.reset}</button><button type="button" name="resample">${s.resample}</button>
        <label class="check"><input type="checkbox" name="showProb" ${c.showProb ? 'checked' : ''}><span>${s.prob}</span></label></div>
      <div class="readout" aria-live="polite"><span class="r-step"></span><span class="r-acc"></span><span class="r-loss"></span><span class="r-wrong"></span></div>`;
    this.shadowRoot.querySelectorAll('input').forEach((el) => el.addEventListener('input', this._onInput));
    const q = (n) => this.shadowRoot.querySelector(`button[name="${n}"]`);
    q('step').addEventListener('click', () => { this._stop(); this._doStep(); });
    q('play').addEventListener('click', () => (this._timer ? this._stop() : this._play()));
    q('reset').addEventListener('click', () => { this._stop(); for (const k of ['w1', 'w2', 'b']) this._cfg[k] = DEFAULT_CONFIG[k]; this._step = 0; this._syncSliders(); this._scheduleDraw(); this._emit(); });
    q('resample').addEventListener('click', () => { this._stop(); this._cfg.seed += 1; this._makeData(); this._scheduleDraw(); this._emit(); });
    this._scheduleDraw();
  }
  _onInput(e) {
    const { name, type } = e.target; this._stop();
    if (type === 'checkbox') this._cfg[name] = e.target.checked; else { this._cfg[name] = Number(e.target.value); this.shadowRoot.querySelector(`output[name="${name}"]`).textContent = fmt(e.target.value); if (name !== 'lr') this._step = 0; }
    this._scheduleDraw(); this._emit();
  }
  _emit() { this.dispatchEvent(new CustomEvent('change', { detail: this.getConfig(), bubbles: true, composed: true })); }
  _scheduleDraw() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; this._draw(); }); }
  _draw() {
    const canvas = this.shadowRoot.querySelector('canvas'); if (!canvas) return;
    const s = I18N[this._lang], c = this._cfg, dpr = window.devicePixelRatio || 1;
    const w = Math.max(280, canvas.clientWidth || this.clientWidth || 320), h = Math.round(w * 0.62);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(this), col = (n, fb) => css.getPropertyValue(n).trim() || fb;
    const grid = col('--border', '#2a323d'), axis = col('--text-muted', '#9aa4b2'), cA = col('--accent-3', '#f3722c'), cB = col('--accent', '#4cc9f0'), ring = col('--danger', '#f94144'), bg = col('--bg', '#0f1216');
    const pad = 24, pw = w - 2 * pad, ph = h - 2 * pad, sx = (x) => pad + (x + R) / (2 * R) * pw, sy = (y) => h - pad - (y + R) / (2 * R) * ph;
    ctx.clearRect(0, 0, w, h);
    if (c.showProb) {
      const G = 56, off = document.createElement('canvas'); off.width = G; off.height = G; const octx = off.getContext('2d'), img = octx.createImageData(G, G);
      const [ar, ag, ab] = hex(cA), [br, bgc, bb] = hex(cB), [kr, kg, kb] = hex(bg);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const p = this._p(-R + (i + 0.5) / G * 2 * R, R - (j + 0.5) / G * 2 * R), k = (j * G + i) * 4, a = 0.45;
        img.data[k] = kr * (1 - a) + (ar * (1 - p) + br * p) * a; img.data[k + 1] = kg * (1 - a) + (ag * (1 - p) + bgc * p) * a; img.data[k + 2] = kb * (1 - a) + (ab * (1 - p) + bb * p) * a; img.data[k + 3] = 255; }
      octx.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, pad, pad, pw, ph);
    }
    ctx.strokeStyle = grid; ctx.lineWidth = 1; for (let x = -R; x <= R; x++) { ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), h - pad); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pad, sy(x)); ctx.lineTo(w - pad, sy(x)); ctx.stroke(); }
    ctx.strokeStyle = axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(w - pad, sy(0)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), h - pad); ctx.stroke();
    // boundary w1·x1 + w2·x2 + b = 0
    ctx.save(); ctx.beginPath(); ctx.rect(pad, pad, pw, ph); ctx.clip(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath();
    if (Math.abs(c.w2) > 1e-6) { ctx.moveTo(sx(-R), sy((-c.w1 * -R - c.b) / c.w2)); ctx.lineTo(sx(R), sy((-c.w1 * R - c.b) / c.w2)); } else if (Math.abs(c.w1) > 1e-6) { ctx.moveTo(sx(-c.b / c.w1), pad); ctx.lineTo(sx(-c.b / c.w1), h - pad); }
    ctx.stroke(); ctx.restore();
    for (const p of this._pts) { const wrong = (this._p(p.x1, p.x2) >= 0.5) !== (p.y === 1); ctx.fillStyle = p.y ? cB : cA; ctx.beginPath(); ctx.arc(sx(p.x1), sy(p.x2), 4.5, 0, Math.PI * 2); ctx.fill();
      if (wrong) { ctx.strokeStyle = ring; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(p.x1), sy(p.x2), 8, 0, Math.PI * 2); ctx.stroke(); } }
    const st = this._stats(), n = this._pts.length, q = (k) => this.shadowRoot.querySelector(k);
    q('.r-step').textContent = `${s.stepN} ${this._step}`; q('.r-acc').textContent = `${s.acc} = ${n - st.wrong}/${n} = ${fmt((n - st.wrong) / n * 100, 0)}%`;
    q('.r-loss').textContent = `${s.loss} = ${fmt(st.loss, 3)}`; q('.r-wrong').textContent = `${s.wrong}: ${st.wrong}`;
  }
}
if (!customElements.get(TAG)) customElements.define(TAG, OfLogisticRegression);
})();
