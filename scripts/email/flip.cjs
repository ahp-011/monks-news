// Records today's DM Bytes paper turning its pages and saves a looping GIF for the morning email.
//   node scripts/email/flip.cjs --date 2026-11-28 --out public/email/2026-11-28.gif [--site dist]
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const date = arg('date'), out = arg('out'), site = path.resolve(arg('site', 'dist'));
if (!date || !out) { console.error('need --date and --out'); process.exit(1); }

// tiny static server for the built site
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(site, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const tmp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'flip-'));
  const W = 1280, H = 860;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: tmp, size: { width: W, height: H } } });
  const p = await ctx.newPage();
  const t0 = Date.now();
  await p.goto(`http://localhost:${port}/paper/${date}/`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.bar,.home{display:none!important}' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2600);
  const start = (Date.now() - t0) / 1000 - 1.2;     // 1.2 s of the closed cover first
  for (let i = 0; i < 2; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1500); }
  const end = (Date.now() - t0) / 1000;
  // crop box: the paper plus a margin of table
  const r = await p.evaluate(() => { const s = document.getElementById('scaler').getBoundingClientRect(); return { x: s.x, y: s.y, w: s.width, h: s.height }; });
  await ctx.close(); await b.close(); server.close();
  const video = fs.readdirSync(tmp).find((f) => f.endsWith('.webm'));
  const pad = 26, cx = Math.max(0, Math.round(r.x - pad)), cy = Math.max(0, Math.round(r.y - pad));
  const cw = Math.min(W - cx, Math.round(r.w + pad * 2)), ch = Math.min(H - cy, Math.round(r.h + pad * 2));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const vf = `crop=${cw}:${ch}:${cx}:${cy},fps=8,scale=520:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=48:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(start), '-to', String(end), '-i', path.join(tmp, video), '-vf', vf, '-loop', '0', out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`wrote ${out} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
})();
