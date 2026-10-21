// <of-explain for="of-xxx" lang="en" open="concept,how"> — renders the explanation a widget ships in
// widgets/<id>/explain.js (registered on window.OF_EXPLAIN[id]). Plain script in an IIFE, no imports,
// no exports: loads from file:// as a classic <script src> and via import() on the library page.
// Data shape: docs/explain-schema.md. The element is pure presentation — all text lives in the data.
(() => {
const TAG = 'of-explain';
const SECTIONS = ['concept', 'formulas', 'computation', 'how', 'notice', 'misconceptions', 'links'];
const L = {
  en: { concept: 'The concept', formulas: 'Formulas', computation: 'How the widget computes what it shows',
        how: 'How to use the widget', notice: 'What to notice', misconceptions: 'Common misconceptions',
        links: 'Related widgets', myth: 'Myth', truth: 'In fact', control: 'control',
        missing: (id) => `No explanation registered for <${id}>: load widgets/${id}/explain.js before this element.` },
  ru: { concept: 'Понятие', formulas: 'Формулы', computation: 'Как виджет вычисляет то, что показывает',
        how: 'Как пользоваться виджетом', notice: 'На что обратить внимание', misconceptions: 'Типичные заблуждения',
        links: 'Связанные виджеты', myth: 'Миф', truth: 'На самом деле', control: 'элемент управления',
        missing: (id) => `Для <${id}> не зарегистрировано объяснение: подключите widgets/${id}/explain.js перед этим элементом.` },
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Inline mark-up allowed in the data: `code` and **bold**. Nothing else (no underscores: subscripts use them).
const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const paras = (arr) => (arr || []).map((p) => `<p>${inline(p)}</p>`).join('');
const steps = (arr) => `<ol>${(arr || []).map((p) => `<li>${inline(p)}</li>`).join('')}</ol>`;

const STYLE = `
  :host { display: block; inline-size: 100%; box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text, #e6e9ee); background: var(--bg-card, #1b2129); border: 1px solid var(--border, #2a323d); border-radius: 10px; padding: 12px 14px; font-size: 0.92rem; line-height: 1.5; }
  :host([lang="ar"]) { direction: rtl; }
  .summary { margin: 0 0 6px 0; color: var(--text, #e6e9ee); }
  details { border-block-start: 1px solid var(--border, #2a323d); padding: 6px 0; }
  summary { cursor: pointer; font-weight: 600; color: var(--accent, #4cc9f0); list-style: none; display: flex; gap: 8px; align-items: center; }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: '▸'; color: var(--text-muted, #9aa4b2); font-size: 0.8em; transition: transform .15s; }
  details[open] > summary::before { transform: rotate(90deg); }
  p { margin: 6px 0; } ol, ul { margin: 6px 0; padding-inline-start: 22px; } li { margin: 3px 0; }
  code { font-family: ui-monospace, Consolas, monospace; font-size: 0.9em; background: var(--bg-elev, #161b22); padding: 0 4px; border-radius: 4px; }
  .formula { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; margin: 6px 0; }
  .formula span { color: var(--text-muted, #9aa4b2); } .formula code { background: transparent; padding: 0; font-size: 0.95em; color: var(--accent-2, #f9c74f); white-space: pre-wrap; }
  kbd { font-family: inherit; font-size: 0.85em; background: var(--bg-elev, #161b22); border: 1px solid var(--border, #2a323d); border-radius: 5px; padding: 0 6px; color: var(--accent, #4cc9f0); margin-inline-end: 4px; }
  .myth { color: var(--text-muted, #9aa4b2); } .truth { }
  .missing { color: var(--accent-3, #f3722c); font-family: ui-monospace, Consolas, monospace; font-size: 0.85em; }
  .links li code { color: var(--accent, #4cc9f0); }
`;

class OfExplain extends HTMLElement {
  static get observedAttributes() { return ['for', 'lang', 'open']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._onRegister = (e) => { if (e.detail === this.getAttribute('for')) this._render(); }; }
  connectedCallback() { document.addEventListener('of-explain:register', this._onRegister); this._render(); }
  disconnectedCallback() { document.removeEventListener('of-explain:register', this._onRegister); }
  attributeChangedCallback(n, o, v) { if (o !== v && this.shadowRoot) this._render(); }
  get _lang() { const l = (this.getAttribute('lang') || 'en').toLowerCase(); return L[l] ? l : 'en'; }
  get data() { const id = this.getAttribute('for'); return (window.OF_EXPLAIN || {})[id] || null; }
  _render() {
    const id = this.getAttribute('for') || '', lang = this._lang, lab = L[lang], d = this.data;
    const t = d && (d[lang] || d.en);
    if (!t) { this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="missing">${esc(lab.missing(id))}</div>`; return; }
    const open = new Set((this.getAttribute('open') || 'concept,how').split(',').map((s) => s.trim()));
    const sec = (key, body) => body ? `<details ${open.has(key) ? 'open' : ''}><summary>${esc(lab[key])}</summary>${body}</details>` : '';
    const formulas = (t.formulas && t.formulas.length) ? `<div class="formula">${t.formulas.map((f) => `<span>${inline(f.label)}</span><code>${esc(f.expr)}</code>`).join('')}</div>` : '';
    const how = (t.how_to_use && t.how_to_use.length) ? `<ol>${t.how_to_use.map((s) => `<li>${s.control ? `<kbd>${esc(s.control)}</kbd>` : ''}${inline(s.text)}</li>`).join('')}</ol>` : '';
    const mis = (t.misconceptions && t.misconceptions.length) ? `<ul>${t.misconceptions.map((m) => `<li><span class="myth">${esc(lab.myth)}: «${inline(m.myth)}»</span><br><span class="truth">${esc(lab.truth)}: ${inline(m.truth)}</span></li>`).join('')}</ul>` : '';
    const links = (t.links && t.links.length) ? `<ul class="links">${t.links.map((l) => `<li><code>${esc(l.id)}</code> — ${inline(l.text)}</li>`).join('')}</ul>` : '';
    this.shadowRoot.innerHTML = `<style>${STYLE}</style>
      <p class="summary">${inline(t.summary || '')}</p>
      ${sec('concept', paras(t.concept))}
      ${sec('formulas', formulas)}
      ${sec('computation', (t.computation && t.computation.length) ? steps(t.computation) : '')}
      ${sec('how', how)}
      ${sec('notice', (t.notice && t.notice.length) ? `<ul>${t.notice.map((p) => `<li>${inline(p)}</li>`).join('')}</ul>` : '')}
      ${sec('misconceptions', mis)}
      ${sec('links', links)}`;
  }
}
if (!customElements.get(TAG)) customElements.define(TAG, OfExplain);
})();
