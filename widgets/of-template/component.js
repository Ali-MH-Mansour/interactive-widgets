// <of-template> — the reference widget. A slider-driven line plot: y = a·x + b.
// Copy this folder to start a new widget; see docs/widget-authoring.md for the contract.
// ES module, no imports, no globals, everything inside a shadow root.

const TAG = 'of-template';

const DEFAULT_CONFIG = Object.freeze({
  a: 1,          // slope
  b: 0,          // intercept
  xmin: -5, xmax: 5,
  ymin: -10, ymax: 10,
  showGrid: true,
});

const I18N = {
  en: {
    title: 'Line: y = a·x + b',
    slope: 'Slope a',
    intercept: 'Intercept b',
    hint: 'Move the sliders and watch the line tilt and shift.',
    equation: (a, b) => `y = ${fmt(a)}·x ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b))}`,
  },
  ru: {
    title: 'Прямая: y = a·x + b',
    slope: 'Наклон a',
    intercept: 'Сдвиг b',
    hint: 'Двигайте ползунки и смотрите, как прямая наклоняется и смещается.',
    equation: (a, b) => `y = ${fmt(a)}·x ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b))}`,
  },
  // ar: reserved — add strings here and the widget renders RTL automatically.
};

function fmt(n) { return Number(n).toFixed(1).replace(/\.0$/, ''); }

const STYLE = `
  :host { display: block; inline-size: 100%; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text, #e6e9ee); background: var(--bg-card, #1b2129); border: 1px solid var(--border, #2a323d);
          border-radius: 10px; padding: 12px; box-sizing: border-box; container-type: inline-size; }
  :host([lang="ar"]) { direction: rtl; }
  h2 { font-size: 1rem; margin: 0 0 6px 0; }
  .hint { color: var(--text-muted, #9aa4b2); font-size: 0.85rem; margin: 0 0 8px 0; }
  canvas { inline-size: 100%; display: block; border-radius: 6px; background: var(--bg, #0f1216); }
  .controls { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-block-start: 10px; }
  @container (max-width: 480px) { .controls { grid-template-columns: 1fr; } }
  label { display: grid; gap: 4px; font-size: 0.9rem; }
  .row { display: flex; justify-content: space-between; }
  output { font-variant-numeric: tabular-nums; color: var(--accent, #4cc9f0); }
  input[type="range"] { inline-size: 100%; accent-color: var(--accent, #4cc9f0); }
  input[type="range"]:focus-visible { outline: 2px solid var(--accent, #4cc9f0); outline-offset: 2px; }
  .equation { margin-block-start: 8px; font-family: ui-monospace, Consolas, monospace; color: var(--accent-2, #f9c74f); }
`;

class OfTemplate extends HTMLElement {
  static get observedAttributes() { return ['lang', 'config']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._cfg = { ...DEFAULT_CONFIG };
    this._raf = null;
    this._ro = null;
    this._onInput = this._onInput.bind(this);
  }

  // ---- lifecycle -------------------------------------------------------
  connectedCallback() {
    this._cfg = this._parseConfig(this.getAttribute('config'));
    this._render();
    this._ro = new ResizeObserver(() => this._scheduleDraw());
    this._ro.observe(this);
  }

  disconnectedCallback() {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal || !this.shadowRoot.firstChild) return;
    if (name === 'config') this._cfg = this._parseConfig(newVal);
    this._render();
  }

  // ---- public API --------------------------------------------------------
  getConfig() {
    // Only what differs from the defaults, so embed snippets stay short.
    const out = {};
    for (const [k, v] of Object.entries(this._cfg)) if (v !== DEFAULT_CONFIG[k]) out[k] = v;
    return out;
  }

  // ---- internals -------------------------------------------------------
  get _lang() {
    const l = (this.getAttribute('lang') || 'en').toLowerCase();
    return I18N[l] ? l : 'en';
  }

  _parseConfig(raw) {
    if (!raw) return { ...DEFAULT_CONFIG };
    try {
      const obj = JSON.parse(raw);
      const cfg = { ...DEFAULT_CONFIG };
      for (const k of Object.keys(DEFAULT_CONFIG)) {
        if (k in obj && typeof obj[k] === typeof DEFAULT_CONFIG[k]) cfg[k] = obj[k];
      }
      return cfg;
    } catch (e) {
      console.warn(`<${TAG}> invalid config attribute, using defaults:`, e.message);
      return { ...DEFAULT_CONFIG };
    }
  }

  _render() {
    const s = I18N[this._lang];
    const c = this._cfg;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <h2>${s.title}</h2>
      <p class="hint">${s.hint}</p>
      <canvas aria-label="${s.title}" role="img"></canvas>
      <div class="controls">
        <label>
          <span class="row"><span>${s.slope}</span><output name="a">${fmt(c.a)}</output></span>
          <input type="range" name="a" min="-5" max="5" step="0.1" value="${c.a}">
        </label>
        <label>
          <span class="row"><span>${s.intercept}</span><output name="b">${fmt(c.b)}</output></span>
          <input type="range" name="b" min="-10" max="10" step="0.5" value="${c.b}">
        </label>
      </div>
      <div class="equation" aria-live="polite"></div>
    `;
    this.shadowRoot.querySelectorAll('input[type="range"]').forEach((el) => el.addEventListener('input', this._onInput));
    this._scheduleDraw();
  }

  _onInput(e) {
    const { name, value } = e.target;
    this._cfg[name] = Number(value);
    this.shadowRoot.querySelector(`output[name="${name}"]`).textContent = fmt(value);
    this._scheduleDraw();
    this.dispatchEvent(new CustomEvent('change', { detail: this.getConfig(), bubbles: true, composed: true }));
  }

  _scheduleDraw() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = null; this._draw(); });
  }

  _draw() {
    const canvas = this.shadowRoot.querySelector('canvas');
    if (!canvas) return;
    const s = I18N[this._lang];
    const c = this._cfg;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(280, canvas.clientWidth || this.clientWidth || 320);
    const h = Math.round(w * 0.6);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const css = getComputedStyle(this);
    const col = (name, fb) => css.getPropertyValue(name).trim() || fb;
    const grid = col('--border', '#2a323d'), axis = col('--text-muted', '#9aa4b2'), line = col('--accent', '#4cc9f0');

    const pad = 28;
    const sx = (x) => pad + (x - c.xmin) / (c.xmax - c.xmin) * (w - 2 * pad);
    const sy = (y) => h - pad - (y - c.ymin) / (c.ymax - c.ymin) * (h - 2 * pad);

    ctx.clearRect(0, 0, w, h);
    if (c.showGrid) {
      ctx.strokeStyle = grid; ctx.lineWidth = 1;
      for (let x = Math.ceil(c.xmin); x <= c.xmax; x++) { ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), h - pad); ctx.stroke(); }
      for (let y = Math.ceil(c.ymin); y <= c.ymax; y += 2) { ctx.beginPath(); ctx.moveTo(pad, sy(y)); ctx.lineTo(w - pad, sy(y)); ctx.stroke(); }
    }
    ctx.strokeStyle = axis; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(w - pad, sy(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), h - pad); ctx.stroke();
    ctx.fillStyle = axis; ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(String(c.xmax), w - pad - 10, sy(0) - 4);
    ctx.fillText(String(c.ymax), sx(0) + 4, pad + 10);

    ctx.strokeStyle = line; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx(c.xmin), sy(c.a * c.xmin + c.b));
    ctx.lineTo(sx(c.xmax), sy(c.a * c.xmax + c.b));
    ctx.stroke();

    ctx.fillStyle = line;
    ctx.beginPath(); ctx.arc(sx(0), sy(c.b), 4, 0, Math.PI * 2); ctx.fill();

    this.shadowRoot.querySelector('.equation').textContent = s.equation(c.a, c.b);
  }
}

if (!customElements.get(TAG)) customElements.define(TAG, OfTemplate);
export { OfTemplate, DEFAULT_CONFIG, TAG };
