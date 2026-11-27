// Lays out one issue as DM Bytes, the printed-paper edition. Pages are 600x840.
// Stories are packed into pages by an estimate of their height; in the browser a
// fit-to-page step shrinks the type slightly on any page that still runs long.
import { SECTIONS, type Issue, type Story, type Team } from '../data';
import { art } from '../art';

const e = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const TEAM: Record<Team, string> = { design: 'Design Monks', dev: 'Dev Monks', both: 'Both teams' };
const SEC_TITLE: Record<string, string> = { industry: 'Industry', 'design-ux': 'Design & UX', branding: 'Branding', development: 'Development', 'ai-engineering': 'AI engineering', tools: 'New tools', trends: 'Trends', inspiration: 'Inspiration', 'open-source': 'Open source', social: 'Social buzz', learning: 'Learning', opportunities: 'Opportunities', experiment: 'Experiment' };
const POSTER: Record<string, [string, string]> = { industry: ['AI NOW', 'red'], 'design-ux': ['PIXELS', 'violet'], branding: ['BRAND', 'orange'], development: ['SHIP IT', 'green'], 'ai-engineering': ['AGENTS', 'green'], tools: ['TRY IT', 'violet'], 'open-source': ['FORK', 'orange'], trends: ['NEXT', 'red'] };
const ROT = [-6, 4, -2, 7, -5, 3, -8, 5, -3, 6, -4, 2];
const OFF = [0, 6, -4, 8, -2, 5, -6, 3, 7, -3, 4, -5];

const team = (t: Team) => `<span class="tm tm--${t}">${TEAM[t]}</span>`;
const clean = (t?: string) => (t ?? '').replace(/^\s*(why it matters|for the team)\s*:\s*/i, '');
function sources(s: Story) {
  const l = s.sources.map((x) => `<a href="${e(x.url)}" target="_blank" rel="noopener">${e(host(x.url))}</a>`);
  if (s.deeper?.[0]) l.push(`<a href="${e(s.deeper[0].url)}" target="_blank" rel="noopener">${e(s.deeper[0].name)}</a>`);
  return `<p class="src">${l.join(' · ')}</p>`;
}
function story(s: Story, o: { notes?: boolean; title?: boolean; cls?: string; img?: boolean } = {}) {
  const notes = o.notes !== false;
  let n = '';
  if (notes && s.why) n += `<p class="note"><b>Why it matters.</b> ${e(clean(s.why))}</p>`;
  if (notes && s.forTeam) n += `<p class="note"><b>For the team.</b> ${e(clean(s.forTeam))}</p>`;
  const img = o.img ? `<figure class="ph">${art(s.id, s.team, { cols: 6, rows: 3 })}</figure>` : '';
  return `<article class="st ${o.cls ?? ''}">${img}<p class="kick">${team(s.team)}</p>${o.title === false ? '' : `<h3>${e(s.title)}</h3>`}${s.buzz ? `<p class="buzz">${e(s.buzz)}</p>` : ''}<p class="body">${e(s.summary)}</p>${n}${sources(s)}</article>`;
}
// rough height of a story in one 254px column, in px
const est = (s: Story, notes = true) => 64 + (s.buzz ? 14 : 0) + Math.ceil((s.title.length / 30)) * 18 +
  Math.ceil((s.summary.length + (notes ? (s.why?.length ?? 0) + (s.forTeam?.length ?? 0) + 30 : 0)) / 46) * 16;

const poster = (word: string, color: string, cls = '') =>
  `<div class="poster ${cls}" style="--pc:var(--${color})"><div class="poster__w">${[...word].map((ch, i) => `<span style="--r:${ROT[i % 12]}deg;--y:${OFF[i % 12]}%">${e(ch === ' ' ? ' ' : ch)}</span>`).join('')}</div></div>`;
const span = (word: string, side: 'L' | 'R', top: number, size = 172) =>
  `<div class="span span--${side}" style="top:${top}px;font-size:${size}px" aria-hidden="true">${e(word)}</div>`;

const filler = (seed: string, t: Team = 'both') => `<div class="fill-art" aria-hidden="true">${art(`fill-${seed}`, t, { cols: 9, rows: 7 })}</div>`;

export interface PaperPage { html: string; label: string }

export function layoutPaper(issue: Issue) {
  const NO = `No. ${String(issue.number).padStart(3, '0')}`;
  const d = new Date(`${issue.date}T09:00:00+06:00`);
  const longDate = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' });
  const shortDate = issue.date.split('-').reverse().join('.');
  const pages: { side?: 'L' | 'R'; inner: string; label: string; cls?: string; raw?: boolean }[] = [];
  const stories = issue.stories;
  const lead = stories.find((s) => s.featured) ?? stories[0];
  const experiment = stories.find((s) => s.section === 'experiment');

  // 2-3: before nine + lead
  const brief = issue.brief.map((b) => `<li><h3>${e(b.title)}</h3><p>${e(b.text)}</p></li>`).join('');
  const dont = issue.dontMiss.length ? `<div class="dont"><p class="kick">Don't miss today</p><ol>${issue.dontMiss.map((x) => `<li>${e(x)}</li>`).join('')}</ol></div>` : '';
  pages.push({ label: 'Before nine', inner: span('Before nine', 'L', 46) + `<div class="push"><p class="kick">01 · In brief</p><ol class="brief">${brief}</ol>${dont}</div>${filler(issue.date + '-brief')}` });
  pages.push({ label: 'Lead story', inner: span('Before nine', 'R', 46) + `<div class="push"><p class="kick">Lead · ${e(SECTIONS.find((x) => x.key === lead.section)?.label ?? '')}</p><h2 class="lead__h">${e(lead.title)}</h2><div class="cols2">${story({ ...lead, why: '' }, { title: false, cls: 'st--lead' })}</div>${lead.why ? `<blockquote class="pull">${e(clean(lead.why))}<small>Why it matters for the Monks</small></blockquote>` : ''}</div>${filler(issue.date + '-lead', lead.team)}` });

  // content pages: one two-column flow per page; sections run on with an inline label,
  // so columns fill evenly instead of leaving half a page empty
  const FIRST = 1130, NEXT = 1250; // usable two-column height with / without a big heading
  let cur: { head: string; items: string[]; used: number; cap: number; label: string[]; first: string } | null = null;
  const flush = () => {
    if (!cur) return;
    const t = stories.find((x) => x.section === cur!.first)?.team ?? 'both';
    pages.push({ label: cur.label.join(', '), inner: `${cur.head}<div class="cols2 flow">${cur.items.join('')}</div>${filler(`${issue.date}-${pages.length}`, t)}` });
    cur = null;
  };
  const open = (sec: (typeof SECTIONS)[number], continued: boolean) => {
    cur = { head: continued ? '' : `<h2 class="sec">${e(SEC_TITLE[sec.key])}</h2>`, items: [], used: 0, cap: continued ? NEXT : FIRST, label: [SEC_TITLE[sec.key]], first: sec.key };
    if (continued) { cur.items.push(`<p class="kick sub">${e(sec.label)}, continued</p>`); cur.used += 30; }
  };
  for (const sec of SECTIONS) {
    if (sec.key === 'experiment') continue;
    const list = stories.filter((s) => s.section === sec.key && s !== lead);
    if (!list.length) continue;
    const notes = !['inspiration', 'learning', 'social', 'branding'].includes(sec.key);
    if (cur && cur.cap - cur.used < 300) flush();
    if (!cur) open(sec, false);
    else { cur.items.push(`<p class="kick sub">${e(sec.label)}</p>`); cur.used += 34; if (!cur.label.includes(SEC_TITLE[sec.key])) cur.label.push(SEC_TITLE[sec.key]); }
    let first = true;
    for (const s of list) {
      const h = est(s, notes) + (first ? 128 : 0);
      if (cur!.used + h > cur!.cap && cur!.items.length > 1) { flush(); open(sec, true); }
      cur!.items.push(story(s, { notes, img: first, cls: notes ? '' : 'st--small' })); first = false; cur!.used += h;
    }
  }
  flush();

  // rated tools
  if (issue.tools.length) {
    const rows = [...issue.tools].sort((a, b) => b.rating - a.rating).slice(0, 6).map((t) => `<li><div class="score">${t.rating}<small>/10</small></div><div><h3><a href="${e(t.url)}" target="_blank" rel="noopener">${e(t.name)}</a> ${team(t.team)}</h3><p>${e(t.text)}</p><p class="for"><b>For</b> ${e(t.for)}</p></div></li>`).join('');
    pages.push({ label: 'Rated tools', inner: span('Rated', 'L', 26, 136) + `<div class="push2"><p class="kick">Tools worth trying, best first</p><ol class="rated">${rows}</ol></div>${filler(issue.date + '-rated')}` });
  }

  // cover + back cover; pad to an even page count with a full-bleed poster
  const back = `<section class="page page--L back" aria-label="Back cover">${poster('TODAY', 'red', 'poster--back')}<div class="back__in">${experiment ? `<p class="kick">Today's experiment · ${team(experiment.team)}</p><h2 class="lead__h">${e(experiment.title)}</h2><p class="body">${e(experiment.summary)}</p>${experiment.forTeam ? `<p class="note"><b>Try this.</b> ${e(clean(experiment.forTeam))}</p>` : ''}${sources(experiment)}` : `<h2 class="lead__h">That's today's paper.</h2>`}${filler(issue.date + '-back', experiment?.team ?? 'both')}<div class="colophon"><b>DM Bytes</b> is the paper edition of Monks News, put together every morning from the last 24 hours of design, development and AI news for the designers at Design Monks and the developers at Dev Monks. The next edition is on the table by 9:00.</div></div></section>`;
  const inner = pages.length; // pages between cover and back
  if ((inner + 2) % 2 === 1) pages.push({ label: 'DM Bytes', inner: '', raw: true });

  const toc = pages.map((p, i) => ({ label: p.label, n: i + 2 })).filter((p, i, a) => p.label !== 'DM Bytes' && a.findIndex((x) => x.label === p.label) === i).slice(0, 11);
  const cover = `<section class="page page--R cover" aria-label="Cover"><div class="mast">DM<br>Bytes</div><div class="dateline"><span>${NO}</span><span>${e(longDate)}</span><span>Dhaka, 9:00 edition</span></div><div class="cover__grid"><div><p class="kick">Lead story · ${team(lead.team)}</p><h1 class="cover__h">${e(lead.title)}</h1><p class="body">${e(lead.summary)}</p></div><ol class="toc">${toc.map((t) => `<li><b>${e(t.label)}</b><i>${t.n}</i></li>`).join('')}</ol></div>${poster(NO.replace(' ', ''), 'orange', 'poster--cover')}<p class="cover__foot">Design, development and AI news for Design Monks and Dev Monks. Read with your first tea.</p></section>`;

  const html: string[] = [cover];
  pages.forEach((p, i) => {
    const n = i + 2, side = n % 2 === 0 ? 'L' : 'R';
    if (p.raw) { html.push(`<section class="page page--${side} fill" aria-label="Page ${n}">${poster('DM BYTES', 'violet', 'poster--full')}</section>`); return; }
    const rh = side === 'L' ? `<span>monks-news.vercel.app</span><span>${NO} — ${shortDate}</span>` : `<span>${NO} — ${shortDate}</span><span>monks-news.vercel.app</span>`;
    html.push(`<section class="page page--${side} ${p.cls ?? ''}" aria-label="Page ${n}"><div class="rh">${rh}</div><div class="folio">${n}</div><div class="pg">${p.inner}</div></section>`);
  });
  html.push(back);

  const labels = ['Cover'];
  for (let i = 1; i < html.length - 1; i += 2) labels.push(`Pages ${i + 1}–${i + 2} · ${[...new Set([pages[i - 1]?.label, pages[i]?.label].filter((x) => x && x !== 'DM Bytes').flatMap((x) => x!.split(', ')))].join(', ')}`);
  labels.push(`Back cover${experiment ? ' · Experiment' : ''}`);
  const leaves: string[] = [];
  for (let k = 0; k < html.length / 2; k++) leaves.push(`<div class="leaf" data-i="${k}"><div class="face front">${html[2 * k]}</div><div class="face back">${html[2 * k + 1]}</div></div>`);
  return { leaves: leaves.join(''), labels, no: NO, longDate };
}
