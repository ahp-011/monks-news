// Monks News daily publisher. Runs in GitHub Actions every morning (see .github/workflows/daily.yml).
//
//   1. Collect: real items from the last 24 hours (48 on a slow day) (feeds, Hacker News, GitHub, Product Hunt).
//   2. Write:   Gemini picks the hottest, most useful stories and writes the text. It may only
//               use the collected items; links and dates always come from the items themselves.
//   3. Fallback: if Gemini is unavailable, publish a links-only issue so no day is missed.
//
// Env: GEMINI_API_KEY (optional; without it the fallback is used), GEMINI_MODEL (optional),
//      GITHUB_TOKEN (optional, raises GitHub API limits), FORCE=1 (overwrite today's issue).
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { XMLParser } from 'fast-xml-parser';
import { FEEDS, RELEVANT, OFFTOPIC } from './sources.mjs';

const ROOT = new URL('../../', import.meta.url);
const ISSUES = new URL('src/content/issues/', ROOT);
const SECTIONS = ['industry', 'design-ux', 'branding', 'development', 'ai-engineering', 'tools', 'trends', 'inspiration', 'open-source', 'social', 'learning', 'opportunities', 'experiment'];
const ACTIONABLE = ['industry', 'design-ux', 'branding', 'development', 'ai-engineering', 'tools', 'open-source'];
const TEAMS = ['design', 'dev', 'both'];
const UA = 'Mozilla/5.0 (compatible; MonksNewsBot/1.0; +https://monks-news.vercel.app)';
const H = 3600e3;
const now = Date.now();
const dhaka = (t) => new Date(t + 6 * H).toISOString().slice(0, 10);
const TODAY = process.env.ISSUE_DATE || dhaka(now);
const log = (...a) => console.log('[monks-news]', ...a);

// ---------------------------------------------------------------- helpers
const strip = (s = '') => String(s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&#8217;|&rsquo;/g, "'").replace(/&quot;|&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"').replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, '-').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);
const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'story';
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'source'; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, { json = false, headers = {}, timeout = 20000 } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, ...headers }, signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return json ? await r.json() : await r.text();
  } finally { clearTimeout(t); }
}
const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

// ---------------------------------------------------------------- 1. collect
const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', textNodeName: '#text' });
const text = (v) => (v == null ? '' : typeof v === 'object' ? (v['#text'] ?? v.href ?? '') : String(v));
function feedItems(doc) {
  const ch = doc?.rss?.channel ?? doc?.['rdf:RDF'] ?? null;
  const raw = ch ? ch.item ?? doc['rdf:RDF']?.item : doc?.feed?.entry;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.map((it) => {
    let link = it.link;
    if (Array.isArray(link)) link = (link.find((l) => !l.rel || l.rel === 'alternate') ?? link[0]);
    link = typeof link === 'object' ? link.href ?? text(link) : link;
    return {
      title: strip(text(it.title)),
      url: String(link || text(it.guid) || '').trim(),
      date: Date.parse(text(it.pubDate ?? it.published ?? it.updated ?? it['dc:date'] ?? '')),
      desc: strip(text(it.description ?? it.summary ?? it['content:encoded'] ?? it.content ?? '')),
    };
  });
}

async function collect(windowH) {
  const since = now - windowH * H;
  const out = [];
  const JUNK = /\b(deals?|discount|% off|\$\d+ off|best price|black friday|cyber monday|prime day|on sale|sale price|coupon|giveaway|sponsored)\b/i;
  const add = (c, min = since) => { if (c.title && !JUNK.test(c.title) && !OFFTOPIC.test(`${c.title} ${c.desc ?? ''}`) && /^https?:\/\//.test(c.url) && c.date > min && c.date <= now + H) out.push(c); };

  const feeds = await Promise.allSettled(FEEDS.map(async (f) => {
    const items = feedItems(xml.parse(await get(f.url)));
    const min = f.section === 'learning' ? now - 6 * 24 * H : since;
    const fresh = f.trending ? items : items.filter((i) => i.date > min);
    for (const i of fresh.slice(0, f.limit ?? 12)) {
      const c = { ...i, desc: cut(i.desc, 420), source: f.name, section: f.section, team: f.team, kind: f.kind ?? 'news', official: !!f.official };
      if (f.google) { // "Headline - Publisher": keep the publisher as the source
        const m = c.title.match(/^(.*) - ([^-]{2,60})$/);
        if (m) { c.title = m[1]; c.source = m[2].trim(); }
        if (c.desc.startsWith(c.title)) c.desc = '';
      }
      if (f.trending) { if (!(c.date > 0)) c.date = now - H; c.title = c.title.replace(/^\s+|\s+$/g, ''); c.scoreLabel = 'Trending on GitHub today'; c.trending = true; c.relevant = RELEVANT.test(`${c.title} ${c.desc}`); }
      add(c, f.trending ? 0 : min);
    }
    return fresh.length;
  }));
  feeds.forEach((r, i) => { if (r.status === 'rejected') log(`feed failed: ${FEEDS[i].name} (${r.reason?.message ?? r.reason})`); });
  // Hacker News: stories with real traction in the window
  try {
    const q = `https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>${Math.floor(since / 1000)},points>60&hitsPerPage=100`;
    const { hits } = await get(q, { json: true });
    for (const h of hits) {
      const discuss = `https://news.ycombinator.com/item?id=${h.objectID}`;
      add({ title: strip(h.title), url: h.url || discuss, discuss, date: h.created_at_i * 1000, desc: h.story_text ? cut(strip(h.story_text), 300) : '', source: 'Hacker News', section: 'social', team: 'both', kind: 'news', score: h.points, scoreLabel: `${compact(h.points)} points on Hacker News`, comments: h.num_comments, relevant: RELEVANT.test(h.title) });
    }
  } catch (e) { log('Hacker News failed:', e.message); }

  // Hugging Face: AI papers the community is upvoting today
  try {
    const papers = await get('https://huggingface.co/api/daily_papers', { json: true });
    for (const p of papers.sort((a, b) => (b.paper?.upvotes ?? 0) - (a.paper?.upvotes ?? 0)).slice(0, 8)) {
      if (!p.paper?.id) continue;
      add({ title: strip(p.paper.title), url: `https://huggingface.co/papers/${p.paper.id}`, date: Date.parse(p.publishedAt || p.paper.publishedAt) || now, desc: cut(strip(p.paper.summary || ''), 380), source: 'Hugging Face Papers', section: 'ai-engineering', team: 'dev', kind: 'news', score: p.paper.upvotes, scoreLabel: `${p.paper.upvotes} upvotes on Hugging Face Papers` }, now - 3 * 24 * H);
    }
  } catch (e) { log('Hugging Face failed:', e.message); }

  // GitHub: new repositories gaining stars fast
  try {
    const d = new Date(now - 7 * 24 * H).toISOString().slice(0, 10);
    const headers = { accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
    const { items } = await get(`https://api.github.com/search/repositories?q=created:>${d}+stars:>80&sort=stars&order=desc&per_page=40`, { json: true, headers });
    for (const r of items) {
      out.push({ title: `${r.full_name}: ${strip(r.description || '')}`.slice(0, 160), url: r.html_url, date: Date.parse(r.pushed_at) || now, desc: cut(`${strip(r.description || '')}${r.language ? ` (${r.language})` : ''}. Topics: ${(r.topics || []).slice(0, 6).join(', ')}`, 300), source: 'GitHub', section: 'open-source', team: 'dev', kind: 'repo', score: r.stargazers_count, scoreLabel: `${compact(r.stargazers_count)} GitHub stars in its first week`, relevant: RELEVANT.test(`${r.description} ${(r.topics || []).join(' ')}`) && !OFFTOPIC.test(`${r.full_name} ${r.description}`), name: r.name });
    }
  } catch (e) { log('GitHub failed:', e.message); }

  // de-duplicate by URL and near-identical titles
  const seen = new Set();
  const uniq = out.filter((c) => {
    const k1 = c.url.replace(/[?#].*$/, '').replace(/\/$/, '');
    const k2 = slug(c.title).slice(0, 40);
    if (seen.has(k1) || seen.has(k2)) return false;
    seen.add(k1); seen.add(k2); return true;
  });
  const STOP = new Set('with from that this have will into your about after over just more than they their what when which while says said new how why the and for are its'.split(' '));
  const words = (t) => new Set(t.toLowerCase().replace(/[^a-z0-9.+# ]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)));
  const W = uniq.map((c) => words(c.title));
  const merged = new Set();
  for (let i = 0; i < uniq.length; i++) {
    if (merged.has(i)) continue;
    const outlets = new Set([uniq[i].source]); const alts = [];
    for (let j = i + 1; j < uniq.length; j++) {
      if (merged.has(j)) continue;
      let k = 0; for (const w of W[i]) if (W[j].has(w)) k++;
      if (k >= 3 && k / Math.min(W[i].size, W[j].size) >= 0.6) { merged.add(j); outlets.add(uniq[j].source); alts.push(uniq[j]); }
    }
    const c = uniq[i];
    // keep the strongest version (official source or highest score) as the main item
    const best = [c, ...alts].sort((a, b) => (b.official - a.official) || ((b.score ?? 0) - (a.score ?? 0)))[0];
    if (best !== c) { uniq[i] = { ...best, discuss: best.discuss ?? c.discuss, score: Math.max(best.score ?? 0, c.score ?? 0) || undefined, scoreLabel: best.scoreLabel ?? c.scoreLabel }; }
    uniq[i].coverage = outlets.size;
    uniq[i].alsoIn = [c, ...alts].filter((x) => x.url !== uniq[i].url).slice(0, 2).map((x) => ({ name: x.source, url: x.url }));
    if (outlets.size >= 3 && !uniq[i].scoreLabel) uniq[i].scoreLabel = `Covered by ${outlets.size} outlets today`;
  }
  // off-topic repos (games, mods, personal tools) are not news for designers and developers
  const items = uniq.filter((c, i) => !merged.has(i) && !(c.kind === 'repo' && !c.relevant));
  // one comparable heat score: HN points, a share of GitHub stars, outlets covering it, trending today, freshness
  const heat = (c) => (c.source === 'Hacker News' ? (c.score ?? 0) : c.kind === 'repo' ? Math.min(400, (c.score ?? 0) / 6) : c.source === 'Hugging Face Papers' ? (c.score ?? 0) * 3 : (c.official ? 160 : 70))
    + (c.coverage - 1) * 140 + (c.trending ? 150 : 0) - Math.max(0, (now - c.date) / H - 6) * 2;
  items.sort((a, b) => heat(b) - heat(a) || b.date - a.date);
  return items.slice(0, 300).map((c, i) => ({ ...c, cid: `c${i + 1}` }));
}

// ---------------------------------------------------------------- 2. write with Gemini
const BRIEF = `You are the editor of Monks News, the morning brief that designers and developers at two Dhaka agencies read before work at 9:00.
- Design Monks (team "design"): UI/UX for apps, websites and dashboards; prototyping, interaction and product design; logo and branding; Webflow and Framer sites.
- Dev Monks (team "dev"): AI engineering (agents, custom LLM solutions, RAG, automation); SaaS platforms (multi-tenant, portals, MVPs, backend and APIs); mobile apps (iOS, Android, cross-platform).
- Client industries: FinTech, EdTech, travel, fitness, health, FMCG, SaaS startups.

Pick the hottest and most USEFUL items from the candidates. The test for every story: would a designer or developer here do something differently today because they read it? Skip business gossip, stock moves, politics, lawsuits and announcements with nothing to try, unless they truly change the work. Prefer the newest items (last 24 hours), items with high scores, items covered by several outlets ("outlets") and items trending on GitHub. Cover news from anywhere in the world, not one country. Use ONLY facts in the candidate text; never invent numbers, dates, quotes or features. If a claim is a vendor claim, say so. Plain, specific sentences, sentence-case headlines, no hype words, no emoji. The two agencies are one company: never write the names "Design Monks" or "Dev Monks" in any text; say "designers", "developers" or "the team". Never mention publishing times.

Sections: industry (AI industry news), design-ux (product design and UX), branding (branding and identity), development (web, mobile and SaaS), ai-engineering (agents, LLM APIs, RAG, automation), tools (new AI tools), trends (trends to watch), inspiration (design inspiration), open-source (GitHub and open source), social (what designers and devs are discussing), learning (guides worth the time), opportunities (client demand, awards, events), experiment (one hands-on task for today, based on a story).`;

const SHAPE = `Return JSON only, exactly this shape:
{
  "headline": "the lead story headline, max 70 chars",
  "dontMiss": ["3 concrete actions someone can do in under 30 minutes today"],
  "brief": [{ "cid": "c12", "title": "Short sentence with a period.", "text": "One sentence." }],   // exactly 5, the 5 things to know before 9:00
  "stories": [{
    "cid": "c12",                       // the candidate this story is based on
    "deeper": ["c40"],                  // 0-2 OTHER candidate ids that go deeper on the same topic (docs, repo, discussion)
    "section": "development", "team": "design|dev|both", "featured": false,
    "title": "Specific headline", "summary": "2-3 factual sentences from the candidate text.",
    "why": "1-2 sentences: why it matters for an agency team.",
    "forTeam": "1-2 sentences: a concrete action for designers or developers."
  }],                                    // 18-26 stories, exactly 3 featured (the hottest and most useful), at least 1 experiment, cover as many sections as the candidates allow
  "tools": [{ "cid": "c7", "name": "Tool name", "kind": "ai|open-source", "team": "design|dev|both", "rating": 8, "text": "What it does.", "for": "Who it helps here." }]  // 4-6 tools worth trying, honest 1-10 ratings
}`;

async function geminiModels(key) {
  const pref = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL.replace(/^models\//, '')] : [];
  try {
    const { models = [] } = await get(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${key}`, { json: true });
    const ok = models.filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace(/^models\//, ''))
      .filter((n) => /^gemini-/.test(n) && !/(image|tts|audio|live|embedding|vision|exp|learnlm|nano)/.test(n));
    const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
    const rank = (n) => (/flash/.test(n) && !/lite/.test(n) ? 3 : /pro/.test(n) ? 2 : /lite/.test(n) ? 1 : 0) * 100 + ver(n) * 10 - (/preview/.test(n) ? 5 : 0) - (/-\d{3,}$/.test(n) ? 1 : 0);
    ok.sort((a, b) => rank(b) - rank(a));
    return [...new Set([...pref, ...ok])].slice(0, 5);
  } catch (e) {
    log('could not list Gemini models:', e.message);
    return [...pref, 'gemini-flash-latest', 'gemini-2.5-flash'];
  }
}

async function writeWithGemini(cands) {
  if (process.env.DUMP_CANDIDATES) writeFileSync(process.env.DUMP_CANDIDATES, JSON.stringify(cands, null, 1));
  if (process.env.MOCK_DRAFT) return JSON.parse(readFileSync(process.env.MOCK_DRAFT, 'utf8')); // for local testing
  const key = process.env.GEMINI_API_KEY;
  if (!key) { log('GEMINI_API_KEY not set'); return null; }
  const lines = cands.map((c) => JSON.stringify({ cid: c.cid, source: c.source, kind: c.kind, title: c.title, text: c.desc, age_hours: Math.max(0, Math.round((now - c.date) / H)), score: c.scoreLabel || undefined, outlets: c.coverage > 1 ? c.coverage : undefined, hint: `${c.section}/${c.team}` }));
  const prompt = `${BRIEF}\n\nToday in Dhaka is ${TODAY}.\n\n${SHAPE}\n\nCandidates (one JSON object per line):\n${lines.join('\n')}`;
  for (const model of await geminiModels(key)) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        log(`writing with ${model} (attempt ${attempt})`);
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 32768 } }),
          signal: AbortSignal.timeout(240000),
        });
        if (r.status === 429 || r.status >= 500) { log(`${model}: HTTP ${r.status}`); await sleep(attempt * 20000); continue; }
        if (!r.ok) { log(`${model}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`); break; }
        const data = await r.json();
        const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') ?? '';
        const json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ''));
        if (Array.isArray(json.stories) && json.stories.length >= 8) return json;
        log(`${model}: too few stories (${json.stories?.length ?? 0})`);
      } catch (e) { log(`${model}: ${e.message}`); await sleep(5000); }
    }
  }
  return null;
}

// ---------------------------------------------------------------- 3. assemble (shared by AI and fallback)
function assemble(draft, cands, number, mode) {
  const byCid = new Map(cands.map((c) => [c.cid, c]));
  const ids = new Set();
  const uid = (base) => { let id = slug(base), n = 2; while (ids.has(id)) id = `${slug(base)}-${n++}`; ids.add(id); return id; };
  const used = new Set();
  const age = (c) => Math.round((Date.parse(TODAY) - Date.parse(dhaka(c.date))) / (24 * H));

  let stories = [];
  for (const s of draft.stories ?? []) {
    const c = byCid.get(s.cid);
    if (!c || used.has(c.cid)) continue;
    const section = SECTIONS.includes(s.section) ? s.section : c.section;
    const forTeam = strip(s.forTeam || '');
    if (mode === 'ai' && ACTIONABLE.includes(section) && !forTeam) continue;
    if (age(c) > 7 && !['learning', 'experiment'].includes(section)) continue;
    used.add(c.cid);
    const deeper = [];
    if (c.discuss && c.discuss !== c.url) deeper.push({ name: `Discussion on Hacker News${c.comments ? ` (${c.comments} comments)` : ''}`, url: c.discuss });
    for (const a of c.alsoIn ?? []) if (deeper.length < 2 && a.url !== c.url) deeper.push({ name: `Also covered by ${a.name}`, url: a.url });
    for (const d of s.deeper ?? []) { const x = byCid.get(d); if (x && x.url !== c.url && deeper.length < 3) deeper.push({ name: `${x.source}: ${cut(x.title, 70)}`, url: x.url }); }
    stories.push({
      id: uid(s.title || c.title), section, team: TEAMS.includes(s.team) ? s.team : c.team, featured: !!s.featured,
      title: cut(strip(s.title || c.title), 120), summary: strip(s.summary || c.desc || c.title),
      ...(s.why ? { why: strip(s.why) } : {}), ...(forTeam ? { forTeam } : {}),
      published: dhaka(Math.min(c.date, now)), ...(c.scoreLabel ? { buzz: c.scoreLabel } : {}),
      sources: [{ name: c.kind === 'repo' ? 'GitHub' : c.official ? c.source : host(c.url), url: c.url }],
      ...(deeper.length ? { deeper } : {}), _cid: c.cid, _score: c.score ?? 0,
    });
  }
  // freshness: at least 60% dated today or yesterday (Dhaka)
  const freshShare = () => stories.filter((s) => age(byCid.get(s._cid)) <= 1).length / Math.max(1, stories.length);
  while (stories.length > 8 && freshShare() < 0.6) {
    const oldest = [...stories].filter((s) => !s.featured && !['learning', 'experiment'].includes(s.section)).sort((a, b) => a.published.localeCompare(b.published))[0]
      ?? [...stories].sort((a, b) => a.published.localeCompare(b.published))[0];
    stories = stories.filter((s) => s !== oldest);
  }
  // exactly 3 featured, each with something to go deeper into
  let feat = stories.filter((s) => s.featured);
  if (feat.length > 3) feat.slice(3).forEach((s) => (s.featured = false));
  if (feat.length < 3) [...stories].filter((s) => !s.featured).sort((a, b) => b._score - a._score).slice(0, 3 - feat.length).forEach((s) => (s.featured = true));
  stories.sort((a, b) => Number(b.featured) - Number(a.featured));
  for (const s of stories.filter((x) => x.featured)) if (!s.deeper?.length) s.deeper = [{ name: `Read the full story on ${s.sources[0].name}`, url: s.sources[0].url }];

  const cidToId = new Map(stories.map((s) => [s._cid, s.id]));
  let brief = (draft.brief ?? []).filter((b) => cidToId.has(b.cid)).slice(0, 5).map((b) => ({ story: cidToId.get(b.cid), title: strip(b.title), text: strip(b.text) }));
  for (const s of stories) {
    if (brief.length >= 5) break;
    if (!brief.some((b) => b.story === s.id)) brief.push({ story: s.id, title: s.title.replace(/[.!?]?$/, '.'), text: cut(s.summary, 160) });
  }

  const tools = [];
  for (const t of draft.tools ?? []) {
    const c = byCid.get(t.cid);
    if (!c || tools.length >= 6 || !t.name) continue;
    const id = uid(`tool-${t.name}`);
    tools.push({ id, name: cut(strip(t.name), 60), kind: t.kind === 'open-source' || c.kind === 'repo' ? 'open-source' : 'ai', team: TEAMS.includes(t.team) ? t.team : c.team, rating: Math.min(10, Math.max(1, Math.round(Number(t.rating) || 6))), text: strip(t.text || c.desc), for: strip(t.for || 'Designers and developers trying new tools.'), url: c.url });
  }

  const lead = stories.find((s) => s.featured) ?? stories[0];
  const dontMiss = (draft.dontMiss ?? []).map(strip).filter(Boolean).slice(0, 3);
  return {
    number, date: TODAY, ...(mode === 'links' ? { mode: 'links' } : {}),
    headline: cut(strip(draft.headline || lead.title), 90),
    dontMiss: dontMiss.length ? dontMiss : stories.filter((s) => s.forTeam).slice(0, 3).map((s) => s.forTeam),
    brief, stories: stories.map(({ _cid, _score, ...s }) => s), tools,
  };
}

// No-AI fallback: rank the candidates and use their own descriptions.
function fallbackDraft(cands) {
  // Comparable score across sources: HN points, a share of GitHub stars, and a base for official news.
  const weight = (c) => (c.coverage - 1) * 120 + (c.trending ? 140 : 0) + (c.source === 'Hacker News' ? c.score : c.kind === 'repo' ? (c.score ?? 0) / 4 : (c.official ? 180 : 90) - (now - c.date) / H)
    * (c.source === 'DEV Community' ? 0.3 : 1);
  const pool = cands.filter((c) => (c.source !== 'Hacker News' && c.kind !== 'repo') || c.relevant)
    .map((c) => ({ c, w: weight(c), sec: c.kind === 'product' ? 'tools' : c.section }))
    .sort((a, b) => b.w - a.w);
  // Round-robin across sections so design, dev and AI are all represented.
  const groups = new Map();
  for (const x of pool) { if (!groups.has(x.sec)) groups.set(x.sec, []); groups.get(x.sec).push(x); }
  const pick = [];
  const perSource = new Map();
  while (pick.length < 22 && [...groups.values()].some((g) => g.length)) {
    for (const g of groups.values()) {
      while (g.length) {
        const x = g.shift();
        const n = perSource.get(x.c.source) ?? 0;
        if (n >= (x.c.source === 'Hacker News' ? 5 : 2)) continue;
        perSource.set(x.c.source, n + 1); pick.push(x); break;
      }
      if (pick.length >= 22) break;
    }
  }
  pick.sort((a, b) => b.w - a.w);
  const featured = new Set(pick.filter((x) => x.c.kind !== 'repo').slice(0, 3).map((x) => x.c.cid));
  return {
    stories: pick.map(({ c, sec }) => ({ cid: c.cid, section: sec, team: c.team, featured: featured.has(c.cid), title: c.title, summary: c.desc || c.title })),
    brief: pick.slice(0, 5).map(({ c }) => ({ cid: c.cid, title: cut(c.title, 90).replace(/[.!?]?$/, '.'), text: cut(c.desc || `From ${c.source}.`, 160) })),
    tools: [], dontMiss: [],
  };
}

// ---------------------------------------------------------------- main
function validate() {
  try { execFileSync('node', [new URL('scripts/validate.mjs', ROOT).pathname], { stdio: 'pipe' }); return null; }
  catch (e) { return String(e.stderr || e.stdout || e.message); }
}

async function main() {
  const file = new URL(`${TODAY}.json`, ISSUES);
  if (existsSync(file) && !process.env.FORCE) { log(`issue for ${TODAY} already exists; nothing to do`); return; }
  const prev = readdirSync(ISSUES).filter((f) => f.endsWith('.json') && f !== `${TODAY}.json`).map((f) => JSON.parse(readFileSync(new URL(f, ISSUES), 'utf8')));
  const number = Math.max(0, ...prev.map((p) => p.number)) + 1;
  const recentUrls = new Set(prev.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).flatMap((p) => p.stories.flatMap((s) => s.sources.map((x) => x.url))));

  let cands = (await collect(24)).filter((c) => !recentUrls.has(c.url));
  if (cands.length < 40) { log(`only ${cands.length} items in 24h; widening to 48h`); cands = (await collect(48)).filter((c) => !recentUrls.has(c.url)); }
  log(`${cands.length} candidate items`);
  if (cands.length < 8) throw new Error('too few candidate items; are the sources reachable?');

  let issue = null;
  const draft = await writeWithGemini(cands);
  if (draft) {
    issue = assemble(draft, cands, number, 'ai');
    writeFileSync(file, JSON.stringify(issue, null, 2) + '\n');
    const err = validate();
    if (err) { log('AI issue failed validation, using fallback:\n' + err); issue = null; }
  }
  if (!issue) {
    issue = assemble(fallbackDraft(cands), cands, number, 'links');
    writeFileSync(file, JSON.stringify(issue, null, 2) + '\n');
    const err = validate();
    if (err) throw new Error('fallback issue failed validation:\n' + err);
  }
  log(`published No. ${number} for ${TODAY}: ${issue.stories.length} stories, ${issue.tools.length} tools, mode ${issue.mode ?? 'ai'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
