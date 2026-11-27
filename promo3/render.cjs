(async () => {
// Renders promo/index.html frame by frame (exact, deterministic) and optionally encodes an MP4.
//   node promo/render.cjs --out <dir> [--fps 30] [--start 0] [--end 15] [--width 1920] [--mp4 file.mp4] [--audio file.wav]
const { chromium } = require('playwright');
const { mkdirSync, existsSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const out = arg('out', 'promo/frames'), fps = +arg('fps', 30), start = +arg('start', 0), end = +arg('end', 15), width = +arg('width', 1920);
const mp4 = arg('mp4', ''), audio = arg('audio', ''), ext = arg('ext', 'jpg');
mkdirSync(out, { recursive: true });
const here = __dirname;

const b = await chromium.launch();
const scale = width / 1920;
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
await p.goto('file://' + path.join(here, 'index.html'), { waitUntil: 'networkidle' });
await p.evaluate(() => window.ready);
const n = Math.round((end - start) * fps);
for (let i = 0; i < n; i++) {
  const t = start + i / fps;
  await p.evaluate((t) => window.render(t), t);
  await p.screenshot({ path: path.join(out, String(i + 1).padStart(5, '0') + '.' + ext), ...(ext === 'png' ? { type: 'png' } : { type: 'jpeg', quality: 92 }), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
}
await b.close();
console.log(`rendered ${n} frames to ${out}`);

if (mp4) {
  const args = ['-y', '-v', 'error', '-framerate', String(fps), '-i', path.join(out, '%05d.' + ext)];
  if (audio && existsSync(audio)) args.push('-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  console.log('encoded', mp4);
}

})();
