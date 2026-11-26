// Checks every issue file against docs/ISSUE_FORMAT.md. Run: npm run validate
import { readdirSync, readFileSync } from 'node:fs';
const dir = new URL('../src/content/issues/', import.meta.url);
const SECTIONS = ['industry','design-ux','development','tools','trends','inspiration','open-source','social','learning','opportunities','experiment'];
const TEAMS = ['design','dev','both'];
const errors = [];
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
if (!files.length) errors.push('No issues found in src/content/issues/');
const numbers = new Map();
for (const f of files) {
  const e = (m) => errors.push(`${f}: ${m}`);
  let d;
  try { d = JSON.parse(readFileSync(new URL(f, dir), 'utf8')); } catch (err) { e(`invalid JSON (${err.message})`); continue; }
  if (d.date + '.json' !== f) e(`date "${d.date}" does not match filename`);
  if (!Number.isInteger(d.number) || d.number < 1) e('number must be a positive integer');
  if (numbers.has(d.number)) e(`number ${d.number} also used by ${numbers.get(d.number)}`); else numbers.set(d.number, f);
  if (!d.headline) e('missing headline');
  if (!Array.isArray(d.dontMiss) || !d.dontMiss.length) e('dontMiss must be a non-empty array');
  if (!Array.isArray(d.stories) || !d.stories.length) { e('stories must be a non-empty array'); continue; }
  const ids = new Set();
  for (const s of d.stories) {
    const w = (m) => e(`story "${s.id}": ${m}`);
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) w('id must be kebab-case');
    if (ids.has(s.id)) w('duplicate id'); ids.add(s.id);
    if (!SECTIONS.includes(s.section)) w(`unknown section "${s.section}"`);
    if (!TEAMS.includes(s.team)) w(`team must be one of ${TEAMS.join(', ')}`);
    if (!s.title || !s.summary) w('needs title and summary');
    if (!Array.isArray(s.sources) || !s.sources.length) w('needs at least one source');
    for (const src of s.sources ?? []) if (!/^https?:\/\//.test(src.url ?? '')) w(`bad source url "${src.url}"`);
  }
  const feat = d.stories.filter((s) => s.featured).length;
  if (feat < 1 || feat > 3) e(`expected 1-3 featured stories, found ${feat}`);
  for (const b of d.brief ?? []) if (!ids.has(b.story)) e(`brief item points to unknown story "${b.story}"`);
  for (const t of d.tools ?? []) {
    const w = (m) => e(`tool "${t.id}": ${m}`);
    if (!t.id || !/^[a-z0-9-]+$/.test(t.id)) w('id must be kebab-case');
    if (ids.has(t.id)) w('id clashes with a story id'); ids.add(t.id);
    if (!['ai','open-source'].includes(t.kind)) w('kind must be ai or open-source');
    if (!TEAMS.includes(t.team)) w('bad team');
    if (!Number.isInteger(t.rating) || t.rating < 1 || t.rating > 10) w('rating must be 1-10');
    if (!/^https?:\/\//.test(t.url ?? '')) w('bad url');
  }
}
if (errors.length) { console.error(`Issue validation failed:\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log(`Validated ${files.length} issue(s).`);
