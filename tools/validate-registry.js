#!/usr/bin/env node
// Validate widgets/registry.json against docs/registry-schema.md.
// Usage: node tools/validate-registry.js [path/to/registry.json]
// Exit code 0 = valid, 1 = errors found. No dependencies.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const file = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'widgets', 'registry.json');

const errors = [];
const warn = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);

let reg;
try {
  reg = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`Cannot read ${file}: ${e.message}`);
  process.exit(1);
}

const vocab = reg.vocabulary || {};
const TOPICS = vocab.topics || [];
const DOMAINS = vocab.domains || [];
const LANGS = vocab.languages || ['en', 'ru'];
const STATUSES = vocab.statuses || ['published', 'planned'];
const ROLES = vocab.roles || ['foundation', 'mechanism', 'algorithm', 'application', 'pitfall', 'extension'];

if (!Array.isArray(reg.widgets)) { console.error('registry: "widgets" must be an array'); process.exit(1); }
for (const key of ['topics', 'domains', 'languages']) {
  if (!Array.isArray(vocab[key]) || vocab[key].length === 0) err('registry', `vocabulary.${key} missing or empty`);
}

const ID_RE = /^of-[a-z0-9]+(-[a-z0-9]+)*$/;
const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Explanation (docs/explain-schema.md): widgets/<id>/explain.js, strict JSON between the markers,
// every language, the required sections, links to known ids. Missing file = warning; broken file = error.
const EXPLAIN_REQUIRED = ['summary', 'concept', 'how_to_use'];
const explainLinks = [];
function checkExplain(id) {
  const file = path.join(ROOT, 'widgets', id, 'explain.js');
  if (!fs.existsSync(file)) { warn.push(`${id}: widgets/${id}/explain.js missing (no explanation)`); return; }
  const m = /\/\*\s*JSON-START\s*\*\/([\s\S]*?)\/\*\s*JSON-END\s*\*\//.exec(fs.readFileSync(file, 'utf8'));
  if (!m) { err(id, 'explain.js has no JSON-START/JSON-END span'); return; }
  let data;
  try { data = JSON.parse(m[1]); } catch (e) { err(id, `explain.js JSON does not parse: ${e.message}`); return; }
  if (data.id !== id) err(id, `explain.js id is "${data.id}"`);
  for (const lang of LANGS) {
    if (!data[lang] || typeof data[lang] !== 'object') { err(id, `explain.js lacks language ${lang}`); continue; }
    for (const key of EXPLAIN_REQUIRED) if (!data[lang][key] || data[lang][key].length === 0) err(id, `explain.${lang} lacks ${key}`);
    for (const l of data[lang].links || []) explainLinks.push([id, lang, l.id]);
  }
}

const ids = new Set();
const byId = new Map();

function checkI18n(id, field, obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { err(id, `${field} must be an object {lang: string}`); return; }
  for (const lang of LANGS) {
    if (typeof obj[lang] !== 'string' || obj[lang].trim() === '') err(id, `${field}.${lang} missing or empty`);
  }
  for (const lang of Object.keys(obj)) {
    if (!LANGS.includes(lang) && !(vocab.reserved || ['ar']).includes(lang)) warn.push(`${id}: ${field} has unknown language "${lang}"`);
  }
}

for (const w of reg.widgets) {
  const id = typeof w.id === 'string' ? w.id : '<no id>';
  if (!ID_RE.test(id)) err(id, 'id must be kebab-case with the "of-" prefix and no version suffix');
  if (ids.has(id)) err(id, 'duplicate id');
  ids.add(id); byId.set(id, w);

  const status = w.status ?? 'published';
  if (!STATUSES.includes(status)) err(id, `status must be one of ${STATUSES.join(', ')}`);

  checkI18n(id, 'title_i18n', w.title_i18n);
  checkI18n(id, 'description_i18n', w.description_i18n);

  if (!TOPICS.includes(w.topic)) err(id, `topic "${w.topic}" not in vocabulary.topics`);
  if (typeof w.concept !== 'string' || !KEBAB_RE.test(w.concept)) err(id, 'concept must be a kebab-case string');
  if (!Array.isArray(w.domains) || w.domains.length === 0) err(id, 'domains must be a non-empty array');
  else for (const d of w.domains) if (!DOMAINS.includes(d)) err(id, `unknown domain "${d}"`);

  if (!Array.isArray(w.tags)) err(id, 'tags must be an array');
  else for (const tg of w.tags) if (typeof tg !== 'string' || !KEBAB_RE.test(tg)) err(id, `tag "${tg}" must be kebab-case`);

  if (!Array.isArray(w.prerequisites)) err(id, 'prerequisites must be an array of widget ids');
  if (!Number.isInteger(w.difficulty) || w.difficulty < 1 || w.difficulty > 5) err(id, 'difficulty must be an integer 1..5');
  // Concept-kit fields (docs/registry-schema.md, concept kits): optional, but when present they must be sane.
  if (w.concept_order !== undefined && (!Number.isInteger(w.concept_order) || w.concept_order < 1)) err(id, 'concept_order must be an integer >= 1');
  if (w.concept_role !== undefined && !ROLES.includes(w.concept_role)) err(id, `concept_role "${w.concept_role}" not in vocabulary.roles`);
  if (typeof w.version !== 'string' || !SEMVER_RE.test(w.version)) err(id, 'version must be semver x.y.z');
  if (typeof w.author !== 'string' || w.author.trim() === '') err(id, 'author must be a non-empty string');
  if (typeof w.created !== 'string' || !DATE_RE.test(w.created)) err(id, 'created must be YYYY-MM-DD');

  if (status === 'published') {
    const comp = path.join(ROOT, 'widgets', id, 'component.js');
    if (!fs.existsSync(comp)) err(id, `published but widgets/${id}/component.js is missing`);
    if (typeof w.preview !== 'string') err(id, 'preview path missing');
    else if (!fs.existsSync(path.join(ROOT, w.preview))) err(id, `preview "${w.preview}" not found`);
    const readme = path.join(ROOT, 'widgets', id, 'README.md');
    if (!fs.existsSync(readme)) warn.push(`${id}: widgets/${id}/README.md missing`);
    checkExplain(id);
  }
}

// Prerequisites: must resolve to ids; no cycles.
for (const w of reg.widgets) {
  for (const p of w.prerequisites || []) {
    if (!ids.has(p)) err(w.id, `prerequisite "${p}" is not a widget id in the registry`);
    if (p === w.id) err(w.id, 'widget lists itself as a prerequisite');
  }
}
for (const [id, lang, target] of explainLinks) if (!ids.has(target)) err(id, `explain.${lang} links to unknown widget "${target}"`);
const visiting = new Set(); const done = new Set();
function dfs(id, trail) {
  if (done.has(id)) return;
  if (visiting.has(id)) { err(id, `prerequisite cycle: ${[...trail, id].join(' -> ')}`); return; }
  visiting.add(id);
  for (const p of byId.get(id)?.prerequisites || []) if (byId.has(p)) dfs(p, [...trail, id]);
  visiting.delete(id); done.add(id);
}
for (const id of ids) dfs(id, []);

// Concept kits (widgets/concepts.json): a concept record names its ordered parts; every registry widget of that
// concept must be a part and every part must be a registry widget of that concept. Missing file = no kits.
const conceptsFile = path.join(path.dirname(file), 'concepts.json');
let kitCount = 0;
if (fs.existsSync(conceptsFile)) {
  let kits;
  try { kits = JSON.parse(fs.readFileSync(conceptsFile, 'utf8')); } catch (e) { err('concepts', `concepts.json does not parse: ${e.message}`); kits = { concepts: [] }; }
  const kitIds = new Set();
  for (const c of kits.concepts || []) {
    const cid = typeof c.id === 'string' ? c.id : '<no id>';
    const tag = `concept:${cid}`;
    if (!KEBAB_RE.test(cid)) err(tag, 'concept id must be kebab-case');
    if (kitIds.has(cid)) err(tag, 'duplicate concept id');
    kitIds.add(cid); kitCount++;
    if (!TOPICS.includes(c.topic)) err(tag, `topic "${c.topic}" not in vocabulary.topics`);
    checkI18n(tag, 'title_i18n', c.title_i18n);
    checkI18n(tag, 'summary_i18n', c.summary_i18n);
    if (!Array.isArray(c.parts) || c.parts.length === 0) { err(tag, 'parts must be a non-empty array of widget ids'); continue; }
    const seen = new Set();
    c.parts.forEach((pid, i) => {
      if (seen.has(pid)) err(tag, `part "${pid}" listed twice`);
      seen.add(pid);
      const w = byId.get(pid);
      if (!w) { err(tag, `part "${pid}" is not a widget id in the registry`); return; }
      if (w.concept !== cid) err(tag, `part "${pid}" has concept "${w.concept}", not "${cid}"`);
      if (w.concept_order !== undefined && w.concept_order !== i + 1) err(tag, `part "${pid}" is at position ${i + 1} but carries concept_order ${w.concept_order}`);
      if (w.concept_role === undefined) warn.push(`${tag}: part "${pid}" has no concept_role`);
    });
    for (const w of reg.widgets) if (w.concept === cid && !seen.has(w.id)) err(tag, `widget "${w.id}" has this concept but is not in parts`);
    for (const r of c.related || []) if (!ids.has(r)) err(tag, `related "${r}" is not a widget id in the registry`);
  }
}

for (const w of warn) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} error(s) in ${path.relative(ROOT, file)}`);
  process.exit(1);
}
console.log(`ok: ${reg.widgets.length} widget(s) valid in ${path.relative(ROOT, file)}, ${kitCount} concept kit(s)`);
