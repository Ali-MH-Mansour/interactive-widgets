#!/usr/bin/env node
// Render a lesson written as JSON blocks (lessons/<id>.json) into ONE standalone HTML page.
//
// Usage: node tools/render-lesson.js lessons/<id>.json [--out <file>] [--inline] [--check]
//   --out     output file (default: lessons/<id>.html, next to the JSON)
//   --inline  embed lib/of-explain.js and every widget's component.js + explain.js into the page,
//             so the single file can be copied anywhere (e.g. a teaching folder) and still work
//   --check   validate only, write nothing
//   --lang    language the page opens in (default: the lesson's langDefault); the switch still offers all
//
// Block types (docs/lesson-schema.md): heading, paragraph, equation, widget, explain, quiz.
// Every text is i18n ({en, ru}); the page carries all languages and switches without reloading.
// The output opens from file:// — widgets load as classic scripts, no fetch, no modules, no network.
// Pure Node, no dependencies.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REG = JSON.parse(fs.readFileSync(path.join(ROOT, 'widgets', 'registry.json'), 'utf8'));
const WIDGETS = Object.fromEntries(REG.widgets.map((w) => [w.id, w]));
const TYPES = new Set(['heading', 'paragraph', 'equation', 'widget', 'explain', 'quiz']);
const UI = {
  en: { explanations: 'Explanations', check: 'Check', correct: 'Correct.', wrong: 'Not quite.', quiz: 'Quick check', contents: 'Contents' },
  ru: { explanations: 'Объяснения', check: 'Проверить', correct: 'Верно.', wrong: 'Не совсем.', quiz: 'Проверьте себя', contents: 'Содержание' },
};

// ---------- CLI ----------
const argv = process.argv.slice(2);
const flag = (f) => { const i = argv.indexOf(f); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, (v && !v.startsWith('--')) ? 2 : 1); return v && !v.startsWith('--') ? v : true; };
const outArg = flag('--out');
const langArg = flag('--lang');
const INLINE = flag('--inline') === true;
const CHECK = flag('--check') === true;
const src = argv[0];
if (!src) { console.error('usage: node tools/render-lesson.js lessons/<id>.json [--out <file>] [--inline] [--check]'); process.exit(2); }
const srcPath = path.resolve(src);
const lesson = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const outPath = path.resolve(typeof outArg === 'string' ? outArg : path.join(path.dirname(srcPath), `${lesson.id || path.basename(srcPath, '.json')}.html`));

// ---------- validation ----------
const errors = [];
const LANGS = lesson.languages || REG.vocabulary.languages;
const langDefault = (typeof langArg === 'string' ? langArg : lesson.langDefault) || LANGS[0];
for (const l of LANGS) if (!REG.vocabulary.languages.includes(l)) errors.push(`language ${l} is not in registry.vocabulary.languages`);
if (!LANGS.includes(langDefault)) errors.push(`langDefault ${langDefault} is not one of ${LANGS.join(',')}`);
if (lesson.id !== path.basename(srcPath, '.json')) errors.push(`lesson id ${JSON.stringify(lesson.id)} does not match the file name ${path.basename(srcPath, '.json')}`);
const i18nOk = (obj, where) => {
  if (!obj || typeof obj !== 'object') { errors.push(`${where}: missing i18n object`); return false; }
  let ok = true;
  for (const l of LANGS) if (obj[l] === undefined || obj[l] === null || obj[l] === '') { errors.push(`${where}: lacks language ${l}`); ok = false; }
  return ok;
};
i18nOk(lesson.title_i18n, 'title_i18n');
if (!Array.isArray(lesson.blocks) || !lesson.blocks.length) errors.push('blocks[] is missing or empty');
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
const ids = new Set();
const usedWidgets = [];
let quizN = 0;
(lesson.blocks || []).forEach((b, i) => {
  const at = `blocks[${i}] (${b.type || '?'})`;
  if (!TYPES.has(b.type)) { errors.push(`${at}: unknown type; allowed: ${[...TYPES].join(', ')}`); return; }
  switch (b.type) {
    case 'heading': {
      i18nOk(b.text_i18n, at);
      if (b.level !== undefined && ![2, 3].includes(b.level)) errors.push(`${at}: level must be 2 or 3`);
      b._id = b.id || slug(b.text_i18n && b.text_i18n[langDefault]);
      if (ids.has(b._id)) errors.push(`${at}: duplicate heading id ${b._id}`); ids.add(b._id);
      break;
    }
    case 'paragraph': i18nOk(b.text_i18n, at); break;
    case 'equation':
      if (!b.expr && !b.expr_i18n) errors.push(`${at}: needs expr or expr_i18n`);
      if (b.expr_i18n) i18nOk(b.expr_i18n, at);
      if (b.label_i18n) i18nOk(b.label_i18n, `${at} label`);
      break;
    case 'widget': case 'explain': {
      const w = WIDGETS[b.widgetId];
      if (!w) { errors.push(`${at}: widgetId ${b.widgetId} is not in widgets/registry.json`); break; }
      if (w.status !== 'published') errors.push(`${at}: ${b.widgetId} is ${w.status}, not published`);
      const file = path.join(ROOT, 'widgets', b.widgetId, b.type === 'widget' ? 'component.js' : 'explain.js');
      if (!fs.existsSync(file)) errors.push(`${at}: ${path.relative(ROOT, file)} does not exist`);
      if (b.type === 'widget' && b.config !== undefined && (typeof b.config !== 'object' || Array.isArray(b.config))) errors.push(`${at}: config must be an object`);
      if (!usedWidgets.includes(b.widgetId)) usedWidgets.push(b.widgetId);
      break;
    }
    case 'quiz': {
      quizN++;
      i18nOk(b.question_i18n, at);
      if (!b.options_i18n) { errors.push(`${at}: needs options_i18n`); break; }
      const n = (b.options_i18n[langDefault] || []).length;
      for (const l of LANGS) {
        const o = b.options_i18n[l];
        if (!Array.isArray(o) || !o.length) errors.push(`${at}: options_i18n.${l} missing`);
        else if (o.length !== n) errors.push(`${at}: options_i18n.${l} has ${o.length} options, ${langDefault} has ${n}`);
      }
      if (!Number.isInteger(b.answer) || b.answer < 0 || b.answer >= n) errors.push(`${at}: answer must be an index 0..${n - 1}`);
      if (b.feedback_i18n) i18nOk(b.feedback_i18n, `${at} feedback`);
      break;
    }
  }
});
if (errors.length) { for (const e of errors) console.error('error:', e); process.exit(1); }
console.log(`ok: ${lesson.id} — ${lesson.blocks.length} blocks, ${usedWidgets.length} widgets, ${quizN} quizzes, languages ${LANGS.join('+')}`);
if (CHECK) process.exit(0);

// ---------- rendering ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Inline mark-up allowed in lesson text: `code` and **bold** (same subset as explain.js).
const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const i18n = (obj, f = inline) => LANGS.map((l) => `<span class="i18n" lang="${l}"${l === langDefault ? '' : ' hidden'}>${f(obj[l])}</span>`).join('');
const attr = (v) => esc(JSON.stringify(v));
const uiLabel = (key) => LANGS.map((l) => `<span class="i18n" lang="${l}"${l === langDefault ? '' : ' hidden'}>${esc((UI[l] || UI.en)[key])}</span>`).join('');

const nav = [];
let q = 0;
const body = lesson.blocks.map((b) => {
  switch (b.type) {
    case 'heading': {
      const lv = b.level || 2;
      if (lv === 2) nav.push(`<a href="#${b._id}">${i18n(b.text_i18n)}</a>`);
      return `<h${lv} id="${b._id}">${i18n(b.text_i18n)}</h${lv}>`;
    }
    case 'paragraph': return `<p>${i18n(b.text_i18n)}</p>`;
    case 'equation': {
      const label = b.label_i18n ? `<span class="label">${i18n(b.label_i18n)}</span>` : '';
      const expr = b.expr_i18n ? i18n(b.expr_i18n, esc) : esc(b.expr);
      return `<div class="equation">${label}<code>${expr}</code></div>`;
    }
    case 'widget': return `<${b.widgetId} lang="${langDefault}"${b.config ? ` config="${attr(b.config)}"` : ''}></${b.widgetId}>`;
    case 'explain': return `<of-explain for="${b.widgetId}" lang="${langDefault}"${b.open ? ` open="${esc(b.open)}"` : ''}></of-explain>`;
    case 'quiz': {
      q++;
      const opts = LANGS.map((l) => `<ol class="i18n" lang="${l}"${l === langDefault ? '' : ' hidden'}>${b.options_i18n[l].map((o, i) => `<li><label><input type="radio" name="q${q}" value="${i}"> ${inline(o)}</label></li>`).join('')}</ol>`).join('');
      const fb = b.feedback_i18n ? i18n(b.feedback_i18n) : '';
      return `<div class="quiz" data-answer="${b.answer}"><p class="q"><span class="tag">${uiLabel('quiz')}</span> ${i18n(b.question_i18n)}</p>${opts}<button type="button" class="check">${uiLabel('check')}</button><p class="feedback" hidden><span class="verdict"></span> ${fb}</p></div>`;
    }
  }
  return '';
});

// group blocks into <section>s: a level-2 heading opens a new section
const sections = [];
lesson.blocks.forEach((b, i) => {
  if (b.type === 'heading' && (b.level || 2) === 2) sections.push({ id: b._id, html: [] });
  if (!sections.length) sections.push({ id: null, html: [] });
  sections[sections.length - 1].html.push(body[i]);
});
const main = sections.map((s) => `  <section${s.id ? ` id="${s.id}"` : ''}>\n    ${s.html.join('\n    ')}\n  </section>`).join('\n\n');

// scripts: of-explain first, then component.js + explain.js per widget in order of first use
const files = [path.join('lib', 'of-explain.js')];
for (const w of usedWidgets) files.push(path.join('widgets', w, 'component.js'), path.join('widgets', w, 'explain.js'));
const rel = (p) => path.relative(path.dirname(outPath), path.join(ROOT, p)).split(path.sep).join('/');
const scripts = files.map((f) => INLINE
  ? `  <script>/* ${f.split(path.sep).join('/')} */\n${fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/<\/script/gi, '<\\/script')}\n  </script>`
  : `  <script src="${rel(f)}"></script>`).join('\n');
const styles = INLINE ? `<style>\n${fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')}\n  </style>` : `<link rel="stylesheet" href="${rel('styles.css')}">`;
const langButtons = LANGS.map((l) => `<button type="button" data-lang="${l}" aria-pressed="${l === langDefault}">${l.toUpperCase()}</button>`).join('');
const title = LANGS.map((l) => esc(lesson.title_i18n[l])).join(' · ');

const html = `<!DOCTYPE html>
<!-- GENERATED by tools/render-lesson.js from ${path.relative(ROOT, srcPath).split(path.sep).join('/')} — edit the JSON, then re-render. -->
<html lang="${langDefault}" data-theme="dark" data-lang="${langDefault}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(lesson.title_i18n[langDefault])}</title>
  ${styles}
  <style>
    body { padding: 24px; max-width: 960px; margin: auto; }
    header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    header h1 { margin: 0; font-size: 1.5rem; }
    section { margin-block: 28px; display: grid; gap: 10px; }
    h2 { margin: 0; } h3 { margin: 8px 0 0; } p { margin: 0; color: var(--text-muted, #9aa4b2); }
    .lang-switch button[aria-pressed="true"] { background: var(--accent, #4cc9f0); color: #0f1216; border-color: var(--accent, #4cc9f0); }
    nav a { margin-inline-end: 12px; }
    .explain-toggle { font-size: 0.85rem; }
    body.no-explain of-explain { display: none; }
    .equation { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; align-items: baseline; padding: 8px 12px; border: 1px solid var(--border, #2a323d); border-radius: 8px; background: var(--bg-card, #1b2129); }
    .equation .label { color: var(--text-muted, #9aa4b2); font-size: 0.9rem; }
    .equation code { background: transparent; color: var(--accent-2, #f9c74f); font-size: 1rem; white-space: pre-wrap; }
    .quiz { border: 1px dashed var(--border, #2a323d); border-radius: 8px; padding: 10px 14px; display: grid; gap: 6px; }
    .quiz .q { color: var(--text, #e6e9ee); } .quiz .tag { color: var(--accent, #4cc9f0); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-inline-end: 6px; }
    .quiz ol { margin: 0; padding-inline-start: 22px; } .quiz li { margin: 3px 0; } .quiz label { cursor: pointer; }
    .quiz button { justify-self: start; } .quiz .feedback { color: var(--text, #e6e9ee); }
    .quiz .feedback.ok .verdict { color: #90be6d; } .quiz .feedback.ko .verdict { color: var(--accent-3, #f3722c); }
    html[data-lang="ar"] body { direction: rtl; }
    @media print { .lang-switch, nav { display: none; } }
  </style>
</head>
<body>
  <header>
    <h1>${i18n(lesson.title_i18n, esc)}</h1>
    <div class="lang-switch" role="group" aria-label="Language">${langButtons}<button type="button" id="toggle-explain" class="explain-toggle" aria-pressed="true">${uiLabel('explanations')}</button></div>
  </header>
${nav.length ? `  <nav class="muted">${nav.join('')}</nav>\n` : ''}
${main}

${scripts}
  <script>
    (() => {
      const root = document.documentElement;
      const setLang = (lang) => {
        root.dataset.lang = lang; root.lang = lang;
        document.querySelectorAll('.i18n').forEach((el) => { el.hidden = el.getAttribute('lang') !== lang; });
        document.querySelectorAll('[lang]').forEach((el) => { if (el.tagName.startsWith('OF-')) el.setAttribute('lang', lang); });
        document.querySelectorAll('.lang-switch button[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
        try { localStorage.setItem('iw-lesson-lang', lang); } catch (e) { /* file:// may refuse storage */ }
      };
      document.querySelectorAll('.lang-switch button[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
      let saved = null; try { saved = localStorage.getItem('iw-lesson-lang'); } catch (e) { /* ignore */ }
      if (saved && saved !== root.dataset.lang && document.querySelector('.lang-switch button[data-lang="' + saved + '"]')) setLang(saved);
      const tg = document.getElementById('toggle-explain');
      tg.addEventListener('click', () => { const on = tg.getAttribute('aria-pressed') !== 'true'; tg.setAttribute('aria-pressed', String(on)); document.body.classList.toggle('no-explain', !on); });
      const UI = ${JSON.stringify(Object.fromEntries(LANGS.map((l) => [l, UI[l] || UI.en])))};
      document.querySelectorAll('.quiz').forEach((qz) => {
        qz.querySelector('.check').addEventListener('click', () => {
          const picked = qz.querySelector('input[type=radio]:checked');
          if (!picked) return;
          const ok = Number(picked.value) === Number(qz.dataset.answer);
          const fb = qz.querySelector('.feedback');
          fb.hidden = false; fb.classList.toggle('ok', ok); fb.classList.toggle('ko', !ok);
          fb.querySelector('.verdict').textContent = (UI[root.dataset.lang] || UI.en)[ok ? 'correct' : 'wrong'];
        });
      });
    })();
  </script>
</body>
</html>
`;
fs.writeFileSync(outPath, html, 'utf8');
console.log('wrote', path.relative(ROOT, outPath).split(path.sep).join('/'), INLINE ? '(inline, self-contained)' : '(links to ../lib and ../widgets)');
