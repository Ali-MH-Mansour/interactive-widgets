// <of-tree-split> — decision tree on a 2-D point set: the learner picks the root split (feature +
// threshold) and sees Gini/entropy of parent and children and the information gain; deeper levels
// are grown greedily to the chosen depth, with the regions and the tree shown.
// Plain script wrapped in an IIFE (loads from file:// and via import()). No imports, no exports.
(() => {
const TAG = 'of-tree-split';

const DEFAULT_CONFIG = Object.freeze({ feature: 0, threshold: 0, depth: 1, criterion: 'gini', n: 60, seed: 11 });
const R = 4;

const I18N = {
  en: { title: 'Decision tree: choose a split, measure the gain', hint: 'A split asks one question (x1 ≤ t? or x2 ≤ t?). Impurity measures how mixed a region is; a good split lowers it most. Deeper levels are grown automatically with the best split each time.',
        feature: 'Root feature', threshold: 'Root threshold t', depth: 'Tree depth', criterion: 'Impurity', gini: 'Gini', entropy: 'Entropy', best: 'Best root split', resample: 'New data',
        parent: 'parent', left: 'left (≤ t)', right: 'right (> t)', gain: 'gain', acc: 'training accuracy', leaf: 'leaf', yes: 'yes', no: 'no' },
  ru: { title: 'Дерево решений: выберите разбиение, измерьте выигрыш', hint: 'Разбиение задаёт один вопрос (x1 ≤ t? или x2 ≤ t?). Неоднородность показывает, насколько область смешана; хорошее разбиение снижает её сильнее всего. Глубже дерево растёт само, лучшим разбиением на каждом шаге.',
        feature: 'Признак корня', threshold: 'Порог корня t', depth: 'Глубина дерева', criterion: 'Неоднородность', gini: 'Джини', entropy: 'Энтропия', best: 'Лучшее разбиение корня', resample: 'Новые данные',
        parent: 'родитель', left: 'слева (≤ t)', right: 'справа (> t)', gain: 'выигрыш', acc: 'точность на обучении', leaf: 'лист', yes: 'да', no: 'нет' },
};

const fmt = (n, d = 3) => Number(n).toFixed(d);
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function counts(P) { const c = [0, 0]; for (const p of P) c[p.y]++; return c; }
function impurity(P, crit) { const n = P.length; if (!n) return 0; const [a, b] = counts(P), pa = a / n, pb = b / n; if (crit === 'entropy') return -(pa ? pa * Math.log2(pa) : 0) - (pb ? pb * Math.log2(pb) : 0); return 1 - pa * pa - pb * pb; }
function split(P, f, t) { const L = [], Rr = []; for (const p of P) (p.x[f] <= t ? L : Rr).push(p); return [L, Rr]; }
function gainOf(P, f, t, crit) { const [L, Rr] = split(P, f, t), n = P.length; return impurity(P, crit) - (L.length / n) * impurity(L, crit) - (Rr.length / n) * impurity(Rr, crit); }
function bestSplit(P, crit) { let best = { gain: -1, f: 0, t: 0 }; for (const f of [0, 1]) { const xs = [...new Set(P.map((p) => p.x[f]))].sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i++) { const t = (xs[i] + xs[i + 1]) / 2, g = gainOf(P, f, t, crit); if (g > best.gain + 1e-12) best = { gain: g, f, t }; } } return best; }
function grow(P, depth, crit, box) { const c = counts(P), leaf = { leaf: true, c, y: c[1] > c[0] ? 1 : 0, box }; if (depth <= 0 || P.length < 2 || impurity(P, crit) === 0) return leaf; const b = bestSplit(P, crit); if (b.gain <= 1e-9) return leaf; return node(P, b.f, b.t, depth, crit, box); }
function node(P, f, t, depth, crit, box) { const [L, Rr] = split(P, f, t), bl = [...box], br = [...box]; bl[f * 2 + 1] = t; br[f * 2] = t; return { leaf: false, f, t, c: counts(P), gain: gainOf(P, f, t, crit), left: grow(L, depth - 1, crit, bl), right: grow(Rr, depth - 1, crit, br) }; }

const STYLE = `
  :host { display: block; inline-size: 100%; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text, #e6e9ee); background: var(--bg-card, #1b2129); border: 1px solid var(--border, #2a323d);
          border-radius: 10px; padding: 12px; box-sizing: border-box; container-type: inline-size; }
  :host([lang="ar"]) { direction: rtl; }
  h2 { font-size: 1rem; margin: 0 0 6px 0; }
  .hint { color: var(--text-muted, #9aa4b2); font-size: 0.85rem; margin: 0 0 8px 0; }
  .plots { display: grid; grid-template-columns: 3fr 2fr; gap: 10px; }
  @container (max-width: 560px) { .plots { grid-template-columns: 1fr; } .controls { grid-template-columns: 1fr 1fr; } }
  canvas { inline-size: 100%; display: block; border-radius: 6px; background: var(--bg, #0f1216); }
  pre { margin: 0; background: var(--bg, #0f1216); border-radius: 6px; padding: 8px; font-size: 0.8rem; overflow: auto; white-space: pre; color: var(--text, #e6e9ee); }
  .controls { display: grid; grid-template-columns: auto 2fr 1fr auto; gap: 10px; margin-block-start: 10px; align-items: end; }
  .buttons { display: flex; gap: 6px; flex-wrap: wrap; margin-block-start: 8px; }
  label { display: grid; gap: 4px; font-size: 0.9rem; }
  .row { display: flex; justify-content: space-between; }
  output { font-variant-numeric: tabular-nums; color: var(--accent, #4cc9f0); }
  input[type="range"] { inline-size: 100%; accent-color: var(--accent, #4cc9f0); }
  select { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 5px 8px; }
  input:focus-visible, button:focus-visible, select:focus-visible { outline: 2px solid var(--accent, #4cc9f0); outline-offset: 2px; }
  button { font: inherit; color: var(--text, #e6e9ee); background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  table { margin-block-start: 8px; border-collapse: collapse; font-family: ui-monospace, Consolas, monospace; font-size: 0.85rem; inline-size: 100%; }
  th, td { padding: 3px 6px; border-block-end: 1px solid var(--border, #2a323d); text-align: start; } th { color: var(--text-muted, #9aa4b2); font-weight: normal; }
  .gain { color: var(--accent-2, #f9c74f); }
`;

class OfTreeSplit extends HTMLElement {
  static get observedAttributes() { return ['lang', 'config']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._cfg = { ...DEFAULT_CONFIG }; this._raf = null; this._ro = null; this._onInput = this._onInput.bind(this); }
  connectedCallback() { this._cfg = this._parseConfig(this.getAttribute('config')); this._makeData(); this._render(); this._ro = new ResizeObserver(() => this._scheduleDraw()); this._ro.observe(this); }
  disconnectedCallback() { if (this._ro) { this._ro.disconnect(); this._ro = null; } if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }
  attributeChangedCallback(name, o, n) { if (o === n || !this.shadowRoot.firstChild) return; if (name === 'config') { this._cfg = this._parseConfig(n); this._makeData(); } this._render(); }
  getConfig() { const out = {}; for (const [k, v] of Object.entries(this._cfg)) if (v !== DEFAULT_CONFIG[k]) out[k] = v; return out; }
  get _lang() { const l = (this.getAttribute('lang') || 'en').toLowerCase(); return I18N[l] ? l : 'en'; }
  _parseConfig(raw) {
    if (!raw) return { ...DEFAULT_CONFIG };
    try { const obj = JSON.parse(raw); const cfg = { ...DEFAULT_CONFIG }; for (const k of Object.keys(DEFAULT_CONFIG)) if (k in obj && typeof obj[k] === typeof DEFAULT_CONFIG[k]) cfg[k] = obj[k]; if (!['gini', 'entropy'].includes(cfg.criterion)) cfg.criterion = 'gini'; return cfg; }
    catch (e) { console.warn(`<${TAG}> invalid config attribute, using defaults:`, e.message); return { ...DEFAULT_CONFIG }; }
  }
  _makeData() { const r = rng(this._cfg.seed * 7919 + 59); this._pts = []; for (let i = 0; i < this._cfg.n; i++) { const x = [-R + 2 * R * r(), -R + 2 * R * r()]; const inside = x[0] > -1 && x[0] < 2.2 && x[1] > -2.2 && x[1] < 1; this._pts.push({ x, y: inside ? 1 : 0 }); } }
  _tree() { const c = this._cfg; return node(this._pts, c.feature, c.threshold, c.depth, c.criterion, [-R, R, -R, R]); }
  _render() {
    const s = I18N[this._lang], c = this._cfg;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <h2>${s.title}</h2><p class="hint">${s.hint}</p>
      <div class="plots"><canvas aria-label="${s.title}" role="img"></canvas><pre class="tree" aria-live="polite"></pre></div>
      <div class="controls">
        <label><span>${s.feature}</span><select name="feature"><option value="0" ${c.feature === 0 ? 'selected' : ''}>x1</option><option value="1" ${c.feature === 1 ? 'selected' : ''}>x2</option></select></label>
        <label><span class="row"><span>${s.threshold}</span><output name="threshold">${fmt(c.threshold, 1)}</output></span><input type="range" name="threshold" min="-4" max="4" step="0.1" value="${c.threshold}"></label>
        <label><span class="row"><span>${s.depth}</span><output name="depth">${c.depth}</output></span><input type="range" name="depth" min="1" max="5" step="1" value="${c.depth}"></label>
        <label><span>${s.criterion}</span><select name="criterion"><option value="gini" ${c.criterion === 'gini' ? 'selected' : ''}>${s.gini}</option><option value="entropy" ${c.criterion === 'entropy' ? 'selected' : ''}>${s.entropy}</option></select></label>
      </div>
      <div class="buttons"><button type="button" name="best">${s.best}</button><button type="button" name="resample">${s.resample}</button></div>
      <table aria-live="polite"><thead><tr><th></th><th>n (●0 / ●1)</th><th class="crit"></th></tr></thead><tbody>
        <tr><td>${s.parent}</td><td class="p-n"></td><td class="p-i"></td></tr><tr><td>${s.left}</td><td class="l-n"></td><td class="l-i"></td></tr><tr><td>${s.right}</td><td class="r-n"></td><td class="r-i"></td></tr>
        <tr><td>${s.gain}</td><td colspan="2" class="gain g-v"></td></tr><tr><td>${s.acc}</td><td colspan="2" class="a-v"></td></tr></tbody></table>`;
    this.shadowRoot.querySelectorAll('input, select').forEach((el) => el.addEventListener('input', this._onInput));
    this.shadowRoot.querySelector('button[name="best"]').addEventListener('click', () => { const b = bestSplit(this._pts, this._cfg.criterion); this._cfg.feature = b.f; this._cfg.threshold = Number(fmt(b.t, 2)); this._render(); this._emit(); });
    this.shadowRoot.querySelector('button[name="resample"]').addEventListener('click', () => { this._cfg.seed += 1; this._makeData(); this._scheduleDraw(); this._emit(); });
    this._scheduleDraw();
  }
  _onInput(e) { const { name, value } = e.target; this._cfg[name] = name === 'criterion' ? value : Number(value); const o = this.shadowRoot.querySelector(`output[name="${name}"]`); if (o) o.textContent = name === 'depth' ? value : fmt(value, 1); this._scheduleDraw(); this._emit(); }
  _emit() { this.dispatchEvent(new CustomEvent('change', { detail: this.getConfig(), bubbles: true, composed: true })); }
  _scheduleDraw() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; this._draw(); }); }
  _draw() {
    const canvas = this.shadowRoot.querySelector('canvas'); if (!canvas) return;
    const s = I18N[this._lang], c = this._cfg, dpr = window.devicePixelRatio || 1;
    const w = Math.max(240, canvas.clientWidth || this.clientWidth || 320), h = Math.round(w * 0.8);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(this), col = (n, fb) => css.getPropertyValue(n).trim() || fb;
    const grid = col('--border', '#2a323d'), axis = col('--text-muted', '#9aa4b2'), cols = [col('--accent-3', '#f3722c'), col('--accent', '#4cc9f0')];
    const pad = 20, sx = (x) => pad + (x + R) / (2 * R) * (w - 2 * pad), sy = (y) => h - pad - (y + R) / (2 * R) * (h - 2 * pad);
    ctx.clearRect(0, 0, w, h);
    const tree = this._tree(), leaves = [], lines = [];
    (function walk(t) { if (t.leaf) { leaves.push(t); return; } lines.push(t); walk(t.left); walk(t.right); })(tree);
    ctx.globalAlpha = 0.22; for (const l of leaves) { const [x0, x1, y0, y1] = l.box; ctx.fillStyle = cols[l.y]; ctx.fillRect(sx(x0), sy(y1), sx(x1) - sx(x0), sy(y0) - sy(y1)); } ctx.globalAlpha = 1;
    ctx.strokeStyle = grid; ctx.lineWidth = 1; for (let x = -R; x <= R; x++) { ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), h - pad); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pad, sy(x)); ctx.lineTo(w - pad, sy(x)); ctx.stroke(); }
    ctx.strokeStyle = axis; ctx.lineWidth = 1; ctx.strokeRect(sx(-R), sy(R), sx(R) - sx(-R), sy(-R) - sy(R));
    for (const p of this._pts) { ctx.fillStyle = cols[p.y]; ctx.beginPath(); ctx.arc(sx(p.x[0]), sy(p.x[1]), 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#ffffff'; lines.forEach((t, i) => { ctx.lineWidth = i === 0 ? 3 : 1.5; ctx.setLineDash(i === 0 ? [] : [5, 4]); const bx = this._boxOf(tree, t); ctx.beginPath();
      if (t.f === 0) { ctx.moveTo(sx(t.t), sy(bx[3])); ctx.lineTo(sx(t.t), sy(bx[2])); } else { ctx.moveTo(sx(bx[0]), sy(t.t)); ctx.lineTo(sx(bx[1]), sy(t.t)); } ctx.stroke(); }); ctx.setLineDash([]);
    // tree text
    const nm = (t) => `${s.leaf} → ●${t.y}  (${t.c[0]}/${t.c[1]})`;
    const txt = []; (function pr(t, ind, pre) { if (t.leaf) { txt.push(`${ind}${pre}${nm(t)}`); return; } txt.push(`${ind}${pre}x${t.f + 1} ≤ ${fmt(t.t, 2)}?  (${t.c[0]}/${t.c[1]})`); pr(t.left, ind + '  ', `${s.yes}: `); pr(t.right, ind + '  ', `${s.no}:  `); })(tree, '', '');
    this.shadowRoot.querySelector('.tree').textContent = txt.join('\n');
    const [L, Rr] = split(this._pts, c.feature, c.threshold), q = (k) => this.shadowRoot.querySelector(k), cr = c.criterion, cc = (P) => { const [a, b] = counts(P); return `${P.length} (${a} / ${b})`; };
    q('.crit').textContent = s[cr]; q('.p-n').textContent = cc(this._pts); q('.p-i').textContent = fmt(impurity(this._pts, cr)); q('.l-n').textContent = cc(L); q('.l-i').textContent = fmt(impurity(L, cr)); q('.r-n').textContent = cc(Rr); q('.r-i').textContent = fmt(impurity(Rr, cr));
    q('.g-v').textContent = `${fmt(impurity(this._pts, cr))} − (${L.length}/${this._pts.length})·${fmt(impurity(L, cr))} − (${Rr.length}/${this._pts.length})·${fmt(impurity(Rr, cr))} = ${fmt(gainOf(this._pts, c.feature, c.threshold, cr))}`;
    let ok = 0; for (const p of this._pts) { let t = tree; while (!t.leaf) t = p.x[t.f] <= t.t ? t.left : t.right; if (t.y === p.y) ok++; }
    q('.a-v').textContent = `${ok}/${this._pts.length} = ${fmt(ok / this._pts.length * 100, 0)}%`;
  }
  _boxOf(root, target) { let found = null; (function walk(t, box) { if (found || t.leaf) return; if (t === target) { found = box; return; } const bl = [...box], br = [...box]; bl[t.f * 2 + 1] = t.t; br[t.f * 2] = t.t; walk(t.left, bl); walk(t.right, br); })(root, [-R, R, -R, R]); return found || [-R, R, -R, R]; }
}
if (!customElements.get(TAG)) customElements.define(TAG, OfTreeSplit);
})();
