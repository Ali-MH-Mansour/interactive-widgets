// lib/of-source.js — the ONE content provider (seam S1 of the publishing design, 2026-10-23).
//
// Every consumer that needs CONTENT — the registry, the concept kits, a widget's explanation, a
// lesson's blocks, a bundled dataset — asks `OF.source`, never a path. Two implementations behind
// one interface:
//   local   (default, today)   static files beside the page; explain.js registered on window.OF_EXPLAIN;
//                              works from file:// (no fetch needed for explain, lesson copies are inlined)
//   remote  (publish time)     GET <api>/registry | /concepts | /explain/<id>?lang= | /lesson/<id> | /data/<id>
//                              with a short-lived token from /licence (the gate); nothing in the repo
//                              changes between the modes except the generated pages.
// Mode + API base come from ONE place: <meta name="of-source" content="remote; api=https://host/api">,
// written by the site build (Phase 6.1) and absent on every page built today. `--inline` lecture
// copies never carry it (seam S5) — they are the deliberate offline exception.
//
// Plain script in an IIFE, no imports/exports: loads as a classic <script src> from file:// and via
// import() on the library page. Idempotent — a page may load it twice. Shell code (component.js,
// of-explain, app.js) must not fetch content paths directly; tools/validate-registry.js checks that.
(() => {
if (window.OF && window.OF.source) return;
const OF = (window.OF = window.OF || {});

// ---------- configuration (meta tag → mode, api; script src → root for relative files) ----------
const meta = document.querySelector('meta[name="of-source"]');
const parts = (meta && meta.content ? meta.content : 'local').split(';').map((s) => s.trim());
const mode = parts[0] === 'remote' ? 'remote' : 'local';
const opts = Object.fromEntries(parts.slice(1).map((kv) => { const i = kv.indexOf('='); return i < 0 ? [kv, true] : [kv.slice(0, i).trim(), kv.slice(i + 1).trim()]; }));
const api = (opts.api || '').replace(/\/+$/, '');
// root of the library (the folder holding widgets/, lessons/, lib/) — from this script's own URL when it is
// a classic <script src> (demo and lesson pages); '' = relative to the page when pulled in by import()
// (the library page sits at the root, so relative paths resolve the same way).
const tag = document.currentScript || document.querySelector('script[src$="lib/of-source.js"], script[src*="lib/of-source.js?"]');
const me = tag && tag.src;
const root = me ? me.replace(/lib\/of-source\.js(\?.*)?$/, '') : '';
const isFile = location.protocol === 'file:';

const NOTICE = {
  en: 'This widget needs its home site to load its content. Open it on the library site.',
  ru: 'Этому виджету нужен его сайт, чтобы загрузить содержимое. Откройте его на сайте библиотеки.',
  ar: 'تحتاج هذه الأداة إلى موقعها الأصلي لتحميل محتواها. افتحها على موقع المكتبة.',
};

// ---------- helpers ----------
const jsonCache = new Map();
async function getJson(url, headers) {
  if (jsonCache.has(url)) return jsonCache.get(url);
  const p = fetch(url, { cache: 'no-store', headers: headers || {} }).then((r) => { if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`); return r.json(); });
  jsonCache.set(url, p);
  p.catch(() => jsonCache.delete(url));
  return p;
}
// Load a classic script once (local mode: widgets/<id>/explain.js on demand).
const scriptCache = new Map();
function loadScript(url) {
  if (scriptCache.has(url)) return scriptCache.get(url);
  const p = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = url; s.async = true;
    s.onload = () => res(true); s.onerror = () => rej(new Error(`cannot load ${url}`));
    document.head.appendChild(s);
  });
  scriptCache.set(url, p);
  return p;
}

// ---------- the gate (seam S3) ----------
// local: no-op, resolves ok. remote: one licence call per page; the token it returns is sent with every
// content request. Consumers call gate() once at boot and render notice(lang) instead of content when
// it fails. The heartbeat (re-check every N minutes) is a remote-mode concern added in Phase 6.1.
let token = null;
let gatePromise = null;
function gate() {
  if (gatePromise) return gatePromise;
  gatePromise = (async () => {
    if (mode === 'local') return { ok: true, mode };
    if (!api) return { ok: false, mode, reason: 'no api in <meta name="of-source">' };
    try {
      const r = await fetch(`${api}/licence?host=${encodeURIComponent(location.host)}`, { cache: 'no-store', credentials: 'omit' });
      if (!r.ok) return { ok: false, mode, reason: `licence: HTTP ${r.status}` };
      const j = await r.json();
      if (!j || !j.token) return { ok: false, mode, reason: 'licence: no token' };
      token = j.token;
      return { ok: true, mode, expires: j.expires || null };
    } catch (e) {
      return { ok: false, mode, reason: String(e && e.message || e) };
    }
  })();
  return gatePromise;
}
const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});
async function remote(pathname) {
  const g = await gate();
  if (!g.ok) throw new Error(`gate: ${g.reason}`);
  return getJson(`${api}${pathname}`, authHeaders());
}

// ---------- the interface ----------
const source = {
  mode, api, root,
  gate,
  notice: (lang) => NOTICE[(lang || 'en').toLowerCase()] || NOTICE.en,

  registry: () => (mode === 'remote' ? remote('/registry') : getJson(`${root}widgets/registry.json`)),
  concepts: () => (mode === 'remote' ? remote('/concepts') : getJson(`${root}widgets/concepts.json`)),

  // Synchronous read of an already-registered explanation (what every page built today has, because
  // explain.js is a <script> on the page). Returns null when not loaded.
  explainSync: (id) => ((window.OF_EXPLAIN || {})[id] || null),
  // Asynchronous read: local = the registered object, else load widgets/<id>/explain.js once (http only —
  // from file:// a page must include the script itself); remote = the API, per language.
  async explain(id, lang) {
    if (mode === 'remote') {
      const d = await remote(`/explain/${encodeURIComponent(id)}${lang ? `?lang=${encodeURIComponent(lang)}` : ''}`);
      window.OF_EXPLAIN = window.OF_EXPLAIN || {};
      window.OF_EXPLAIN[id] = Object.assign(window.OF_EXPLAIN[id] || {}, d);
      return window.OF_EXPLAIN[id];
    }
    const have = source.explainSync(id);
    if (have) return have;
    if (isFile || !root) return null;
    await loadScript(`${root}widgets/${id}/explain.js`);
    return source.explainSync(id);
  },

  // A lesson's JSON: the renderer inlines blocks at build time (local), so this is for the platform's
  // runtime-rendered lesson pages (remote) and for tools that read lessons over http.
  lesson: (id) => (mode === 'remote' ? remote(`/lesson/${encodeURIComponent(id)}`)
    : ((window.OF_LESSONS || {})[id] ? Promise.resolve(window.OF_LESSONS[id]) : getJson(`${root}lessons/${id}.json`))),

  // A widget's bundled dataset (contract rule 8: only CNN-type widgets have one, as widgets/<id>/data.json).
  data: (id) => (mode === 'remote' ? remote(`/data/${encodeURIComponent(id)}`)
    : ((window.OF_DATA || {})[id] ? Promise.resolve(window.OF_DATA[id]) : getJson(`${root}widgets/${id}/data.json`))),
};
OF.source = source;
document.dispatchEvent(new CustomEvent('of-source:ready', { detail: { mode } }));
})();
