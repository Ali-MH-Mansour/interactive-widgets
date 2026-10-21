// Interactive Widgets — library page.
// Reads widgets/registry.json and i18n.json, lists cards, mounts the selected widget as a live
// preview, builds the embed snippet from the widget's own getConfig(). Plain ES module, no deps.

const LANG_KEY = 'iw.lang';
const state = { lang: 'en', i18n: null, registry: null, selected: null, mounted: null };

const $ = (sel) => document.querySelector(sel);

async function loadJson(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

function t(key, vars = {}) {
  const row = state.i18n?.strings?.[key];
  let s = (row && (row[state.lang] ?? row.en)) ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

function i18nText(obj) {
  if (!obj) return '';
  return obj[state.lang] ?? obj.en ?? Object.values(obj)[0] ?? '';
}

function applyStaticStrings() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('.lang-switch button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang));
  });
}

function matches(entry, q) {
  if (!q) return true;
  const hay = [
    i18nText(entry.title_i18n), i18nText(entry.description_i18n),
    ...(entry.tags || []), entry.id, entry.concept, entry.topic, ...(entry.domains || []),
  ].join(' ').toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderCards() {
  const q = $('#search').value.trim();
  const list = state.registry.widgets.filter((w) => matches(w, q));
  $('#count').textContent = t('count.widgets', { n: list.length });
  const cards = $('#cards');
  cards.innerHTML = '';
  for (const w of list) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'option');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-selected', String(state.selected?.id === w.id));
    const planned = w.status === 'planned';
    card.innerHTML = `
      <h3>${esc(i18nText(w.title_i18n))}${planned ? ` <span class="chip planned">${esc(t('status.planned'))}</span>` : ''}</h3>
      <p>${esc(i18nText(w.description_i18n))}</p>
      <div class="chips">
        ${(w.domains || []).map((d) => `<span class="chip domain-${esc(d)}">${esc(t('domain.' + d))}</span>`).join('')}
        ${(w.tags || []).slice(0, 3).map((tag) => `<span class="chip">${esc(tag)}</span>`).join('')}
      </div>
      <div class="difficulty" aria-label="${esc(t('meta.difficulty'))} ${w.difficulty}/5">${'●'.repeat(w.difficulty)}${'○'.repeat(5 - w.difficulty)}</div>`;
    const pick = () => select(w);
    card.addEventListener('click', pick);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    cards.appendChild(card);
  }
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function select(w) {
  state.selected = w;
  renderCards();
  renderMeta(w);
  await mount(w);
}

async function mount(w) {
  const host = $('#preview');
  host.innerHTML = '';
  state.mounted = null;
  if (w.status === 'planned') {
    host.innerHTML = `<div class="preview-placeholder">${esc(t('preview.planned'))}</div>`;
    $('#embed').hidden = true;
    return;
  }
  host.innerHTML = `<div class="preview-placeholder">${esc(t('preview.loading'))}</div>`;
  try {
    await import(`./widgets/${w.id}/component.js`);
    const el = document.createElement(w.id);
    el.setAttribute('lang', state.lang);
    host.innerHTML = '';
    host.appendChild(el);
    state.mounted = el;
    el.addEventListener('change', updateEmbed);
    $('#embed').hidden = false;
    updateEmbed();
  } catch (err) {
    host.innerHTML = `<div class="preview-placeholder">${esc(String(err))}</div>`;
    $('#embed').hidden = true;
  }
}

function updateEmbed() {
  const w = state.selected; const el = state.mounted;
  if (!w || !el) return;
  const cfg = typeof el.getConfig === 'function' ? el.getConfig() : {};
  const json = JSON.stringify(cfg).replace(/'/g, '&#39;');
  $('#embed-code').textContent =
    `<script type="module" src="widgets/${w.id}/component.js"></script>\n` +
    `<${w.id} lang="${state.lang}" config='${json}'></${w.id}>`;
}

function renderMeta(w) {
  const dl = $('#meta-list');
  const none = t('meta.none');
  const rows = [
    ['meta.id', w.id],
    ['meta.topic', t('topic.' + w.topic)],
    ['meta.concept', w.concept],
    ['meta.domains', (w.domains || []).map((d) => t('domain.' + d)).join(', ') || none],
    ['meta.tags', (w.tags || []).join(', ') || none],
    ['meta.prerequisites', (w.prerequisites || []).join(', ') || none],
    ['meta.difficulty', `${w.difficulty} / 5`],
    ['meta.version', w.version],
    ['meta.author', w.author],
    ['meta.created', w.created],
  ];
  dl.innerHTML = rows.map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#meta').hidden = false;
}

function setLang(lang) {
  state.lang = lang;
  localStorage.setItem(LANG_KEY, lang);
  applyStaticStrings();
  renderCards();
  if (state.selected) renderMeta(state.selected);
  if (state.mounted) { state.mounted.setAttribute('lang', lang); updateEmbed(); }
}

async function init() {
  const saved = localStorage.getItem(LANG_KEY);
  [state.i18n, state.registry] = await Promise.all([loadJson('i18n.json'), loadJson('widgets/registry.json')]);
  if (saved && state.i18n.languages.includes(saved)) state.lang = saved;
  applyStaticStrings();
  renderCards();
  $('#search').addEventListener('input', renderCards);
  document.querySelectorAll('.lang-switch button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  $('#copy').addEventListener('click', async () => {
    await navigator.clipboard.writeText($('#embed-code').textContent);
    const btn = $('#copy'); btn.textContent = t('embed.copied');
    setTimeout(() => { btn.textContent = t('embed.copy'); }, 1200);
  });
}

init().catch((err) => {
  $('#preview').innerHTML = `<div class="preview-placeholder">${esc(String(err))}<br>Serve this folder over http (start-server.bat); fetch of JSON is blocked on file://.</div>`;
});
