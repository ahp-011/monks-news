// Builds the morning email (HTML + plain text) for one issue, laid out like a broadsheet front page.
//   node scripts/email/build.mjs --date 2026-11-28 --out email-out [--base https://monks-news.vercel.app] [--gif <url>]
// Gmail-safe: tables, inline styles, web-safe fonts, one image (the animated page flip).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const date = arg('date'), out = arg('out', 'email-out'), base = arg('base', 'https://monks-news.vercel.app');
const gif = arg('gif', `${base}/email/${date}.gif`);
const issue = JSON.parse(readFileSync(new URL(`../../src/content/issues/${date}.json`, import.meta.url), 'utf8'));

const e = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);
const clean = (t = '') => t.replace(/^\s*(why it matters|for the team)\s*:\s*/i, '');
const NO = `No. ${String(issue.number).padStart(3, '0')}`;
const longDate = new Date(`${issue.date}T09:00:00+06:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' });
const paperUrl = `${base}/paper/${date}/`, issueUrl = `${base}/issue/${date}/`;
const storyUrl = (id) => `${issueUrl}#${id}`;
const SECTIONS = [['industry', 'AI industry'], ['design-ux', 'Design & UX'], ['branding', 'Branding'], ['development', 'Development'], ['ai-engineering', 'AI engineering'], ['tools', 'New tools'], ['trends', 'Trends'], ['inspiration', 'Inspiration'], ['open-source', 'Open source'], ['social', 'Social'], ['learning', 'Learning'], ['opportunities', 'Opportunities'], ['experiment', "Today's experiment"]];

// palette: newsprint and ink, with the paper's orange
const C = { table: '#E7E3DB', paper: '#F3EFE7', ink: '#1F1C19', soft: '#5B554D', rule: '#CFC8BB', orange: '#E8541E' };
const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const BODY = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
const MONO = "'Courier New', Courier, monospace";
const kick = (t) => `<div style="font:bold 11px/1 ${MONO};letter-spacing:2px;text-transform:uppercase;color:${C.soft};margin:0 0 10px">${t}</div>`;
const rule = (h = 1, c = C.ink) => `<tr><td style="padding:0"><div style="height:${h}px;line-height:${h}px;font-size:0;background:${c}">&nbsp;</div></td></tr>`;

const stories = issue.stories;
const lead = stories.find((s) => s.featured) ?? stories[0];
const inBrief = issue.brief.map((b, i) => `
  <tr><td style="padding:12px 0;border-top:1px solid ${C.rule}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="34" valign="top" style="font:bold 12px/20px ${MONO};color:${C.orange}">0${i + 1}</td>
      <td valign="top"><a href="${storyUrl(b.story)}" style="text-decoration:none;color:${C.ink}"><div style="font:bold 17px/1.25 ${BODY};color:${C.ink}">${e(b.title)}</div></a>
        <div style="font:15px/1.45 ${SERIF};color:${C.soft};margin-top:3px">${e(b.text)}</div></td>
    </tr></table>
  </td></tr>`).join('');

const sections = SECTIONS.map(([key, label]) => {
  const list = stories.filter((s) => s.section === key && s !== lead);
  if (!list.length) return '';
  return `
  <tr><td style="padding:26px 0 6px">
    <div style="font:900 24px/1 ${SANS};letter-spacing:-0.5px;color:${C.ink};padding-bottom:8px;border-bottom:3px solid ${C.ink}">${label}</div>
  </td></tr>` + list.map((s) => `
  <tr><td style="padding:12px 0;border-bottom:1px solid ${C.rule}">
    <a href="${storyUrl(s.id)}" style="text-decoration:none;color:${C.ink}"><div style="font:bold 17px/1.25 ${BODY};color:${C.ink}">${e(s.title)}</div></a>
    <div style="font:15px/1.45 ${SERIF};color:${C.soft};margin-top:4px">${e(cut(s.summary, 170))}</div>
  </td></tr>`).join('');
}).join('');

const tools = [...issue.tools].sort((a, b) => b.rating - a.rating).map((t) => `
  <tr><td style="padding:10px 0;border-top:1px solid ${C.rule}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="58" valign="top" style="font:900 30px/1 ${SANS};color:${C.ink}">${t.rating}<span style="font:bold 11px ${MONO};color:${C.soft}">/10</span></td>
      <td valign="top"><a href="${e(t.url)}" style="text-decoration:none;color:${C.ink}"><div style="font:bold 16px/1.25 ${BODY}">${e(t.name)}</div></a>
        <div style="font:14px/1.4 ${SERIF};color:${C.soft};margin-top:2px">${e(cut(t.text, 130))}</div></td>
    </tr></table>
  </td></tr>`).join('');

const button = (href, text, dark) => `<a href="${href}" style="display:inline-block;padding:14px 22px;font:bold 15px/1 ${BODY};text-decoration:none;border-radius:4px;${dark ? `background:${C.ink};color:${C.paper}` : `background:transparent;color:${C.ink};border:2px solid ${C.ink}`}">${text}</a>`;

const preheader = `${lead.title} · plus ${issue.brief.length - 1} more things to know today.`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>DM Bytes · ${NO}</title>
<style>@media (max-width:620px){ .wrap{width:100%!important} .pad{padding-left:18px!important;padding-right:18px!important} .mast{font-size:54px!important} }</style>
</head>
<body style="margin:0;padding:0;background:${C.table}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.table}">${e(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.table}"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" style="width:640px;background:${C.paper};border:1px solid #D6D0C4">
  <tr><td class="pad" style="padding:30px 36px 10px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="font:bold 11px/1 ${MONO};letter-spacing:2px;text-transform:uppercase;color:${C.soft};padding-bottom:14px">Monks News &middot; The paper edition</td></tr>
      <tr><td class="mast" style="font:900 72px/0.9 ${SANS};letter-spacing:-3px;color:${C.ink};padding-bottom:16px">DM Bytes</td></tr>
      ${rule(3)}
      <tr><td style="padding:8px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font:bold 11px/1 ${MONO};letter-spacing:1px;text-transform:uppercase;color:${C.ink}">${NO}</td>
          <td align="center" style="font:bold 11px/1 ${MONO};letter-spacing:1px;text-transform:uppercase;color:${C.ink}">${e(longDate)}</td>
          <td align="right" style="font:bold 11px/1 ${MONO};letter-spacing:1px;text-transform:uppercase;color:${C.ink}">Morning edition</td>
        </tr></table>
      </td></tr>
      ${rule(1)}
    </table>
  </td></tr>

  <tr><td class="pad" style="padding:18px 36px 6px" align="center">
    <a href="${paperUrl}" style="text-decoration:none"><img src="${gif}" width="560" alt="Today's DM Bytes paper turning its pages. Tap to read it." style="display:block;width:100%;max-width:560px;height:auto;border:0;background:${C.table}"></a>
  </td></tr>
  <tr><td class="pad" style="padding:14px 36px 4px" align="center">
    ${button(paperUrl, 'Turn the pages &rarr;', true)}&nbsp;&nbsp;${button(issueUrl, 'Read on the website', false)}
  </td></tr>

  <tr><td class="pad" style="padding:28px 36px 0">
    ${kick('Lead story')}
    <a href="${storyUrl(lead.id)}" style="text-decoration:none;color:${C.ink}"><div style="font:900 32px/1.05 ${SANS};letter-spacing:-1px;color:${C.ink}">${e(lead.title)}</div></a>
    <div style="font:17px/1.5 ${SERIF};color:${C.ink};margin-top:12px">${e(lead.summary)}</div>
    ${lead.why ? `<div style="font:italic 19px/1.35 ${SERIF};color:${C.ink};margin-top:16px;padding-top:12px;border-top:3px solid ${C.ink}">${e(clean(lead.why))}</div>` : ''}
  </td></tr>

  <tr><td class="pad" style="padding:30px 36px 0">
    ${kick('In brief &middot; five things to know')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${inBrief}</table>
  </td></tr>

  ${issue.dontMiss.length ? `<tr><td class="pad" style="padding:22px 36px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ink}"><tr><td style="padding:18px 20px">
      <div style="font:bold 11px/1 ${MONO};letter-spacing:2px;text-transform:uppercase;color:${C.orange};margin-bottom:10px">Don't miss today</div>
      ${issue.dontMiss.map((d, i) => `<div style="font:15px/1.45 ${SERIF};color:${C.paper};margin-top:${i ? 8 : 0}px">${i + 1}. ${e(d)}</div>`).join('')}
    </td></tr></table>
  </td></tr>` : ''}

  <tr><td class="pad" style="padding:6px 36px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${sections}</table>
  </td></tr>

  ${tools ? `<tr><td class="pad" style="padding:28px 36px 0">
    <div style="font:900 24px/1 ${SANS};letter-spacing:-0.5px;color:${C.ink};padding-bottom:8px;border-bottom:3px solid ${C.ink};margin-bottom:4px">Rated tools</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tools}</table>
  </td></tr>` : ''}

  <tr><td class="pad" style="padding:30px 36px 8px" align="center">
    ${button(paperUrl, 'Read today&#39;s paper &rarr;', true)}
  </td></tr>
  <tr><td class="pad" style="padding:22px 36px 30px">
    ${rule(1, C.rule).replace('<tr><td style="padding:0">', '').replace('</td></tr>', '')}
    <div style="font:13px/1.5 ${BODY};color:${C.soft};margin-top:14px">DM Bytes is the paper edition of <a href="${base}" style="color:${C.ink}">Monks News</a>, the day's design, development and AI news for the Monks team. To stop getting it, reply to this email.</div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

const text = [`DM BYTES · ${NO} · ${longDate}`, '', `Turn the pages: ${paperUrl}`, '', 'LEAD STORY', lead.title, lead.summary, storyUrl(lead.id), '',
  'FIVE THINGS TO KNOW', ...issue.brief.map((b, i) => `${i + 1}. ${b.title} ${b.text}\n   ${storyUrl(b.story)}`), '',
  ...SECTIONS.flatMap(([key, label]) => { const l = stories.filter((s) => s.section === key && s !== lead); return l.length ? [label.toUpperCase(), ...l.map((s) => `- ${s.title}\n  ${storyUrl(s.id)}`), ''] : []; }),
  `Read on the website: ${issueUrl}`].join('\n');

mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, 'email.html'), html);
writeFileSync(path.join(out, 'email.txt'), text);
writeFileSync(path.join(out, 'subject.txt'), `DM Bytes ${NO}: ${cut(lead.title, 70)}`);
console.log(`built ${out}/email.html (${Math.round(html.length / 1024)} KB), subject: ${readFileSync(path.join(out, 'subject.txt'), 'utf8')}`);
