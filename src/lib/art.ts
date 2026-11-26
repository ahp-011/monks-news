/**
 * Generative cover art. Each story gets a deterministic tile composition
 * built from its id: a grid of geometric cells (quarter circles, half discs,
 * stripes, dots, squares), drawn in ink with one accent per team.
 * Colours come from CSS variables, so the art follows light/dark theme.
 */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed || 1;
  return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 10000) / 10000; };
}

type Shape = (x: number, y: number, s: number, r: () => number, fill: string) => string;

const shapes: Shape[] = [
  // quarter circle from a random corner
  (x, y, s, r, f) => {
    const c = Math.floor(r() * 4);
    const cx = x + (c % 2) * s, cy = y + (c > 1 ? s : 0);
    const sx = c % 2 ? -1 : 1, sy = c > 1 ? -1 : 1;
    return `<path d="M${cx} ${cy} L${cx + sx * s} ${cy} A${s} ${s} 0 0 ${sx * sy > 0 ? 1 : 0} ${cx} ${cy + sy * s} Z" fill="${f}"/>`;
  },
  // half disc
  (x, y, s, r, f) => {
    const v = r() > 0.5;
    return v
      ? `<path d="M${x} ${y + s / 2} A${s / 2} ${s / 2} 0 0 1 ${x + s} ${y + s / 2} Z" fill="${f}"/>`
      : `<path d="M${x + s / 2} ${y} A${s / 2} ${s / 2} 0 0 1 ${x + s / 2} ${y + s} Z" fill="${f}"/>`;
  },
  // full disc
  (x, y, s, _r, f) => `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.42}" fill="${f}"/>`,
  // ring
  (x, y, s, _r, f) => `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.34}" fill="none" stroke="${f}" stroke-width="${s * 0.12}"/>`,
  // stripes
  (x, y, s, r, f) => {
    const n = 4, out: string[] = [], h = r() > 0.5;
    for (let i = 0; i < n; i++) {
      const o = (i * s) / n + s / (n * 4);
      out.push(h ? `<rect x="${x}" y="${y + o}" width="${s}" height="${s / (n * 2)}" fill="${f}"/>` : `<rect x="${x + o}" y="${y}" width="${s / (n * 2)}" height="${s}" fill="${f}"/>`);
    }
    return out.join('');
  },
  // dot grid
  (x, y, s, _r, f) => {
    const out: string[] = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) out.push(`<circle cx="${x + s * (0.2 + i * 0.3)}" cy="${y + s * (0.2 + j * 0.3)}" r="${s * 0.06}" fill="${f}"/>`);
    return out.join('');
  },
  // diagonal triangle
  (x, y, s, r, f) => r() > 0.5
    ? `<path d="M${x} ${y} L${x + s} ${y} L${x} ${y + s} Z" fill="${f}"/>`
    : `<path d="M${x + s} ${y} L${x + s} ${y + s} L${x} ${y + s} Z" fill="${f}"/>`,
  // inset square
  (x, y, s, _r, f) => `<rect x="${x + s * 0.18}" y="${y + s * 0.18}" width="${s * 0.64}" height="${s * 0.64}" fill="${f}"/>`,
];

export function art(seed: string, team: string = 'both', opts: { cols?: number; rows?: number } = {}) {
  const cols = opts.cols ?? 6, rows = opts.rows ?? 4;
  const s = 40, W = cols * s, H = rows * s;
  const r = rng(hash(seed));
  const accent = team === 'design' ? 'var(--c-design)' : team === 'dev' ? 'var(--c-dev)' : 'var(--c-both)';
  const parts: string[] = [];
  // grid lines
  for (let i = 1; i < cols; i++) parts.push(`<line x1="${i * s}" y1="0" x2="${i * s}" y2="${H}" stroke="var(--art-line)" stroke-width="0.5"/>`);
  for (let j = 1; j < rows; j++) parts.push(`<line x1="0" y1="${j * s}" x2="${W}" y2="${j * s}" stroke="var(--art-line)" stroke-width="0.5"/>`);
  // one big accent element spanning 2x2
  const bx = Math.floor(r() * (cols - 1)) * s, by = Math.floor(r() * (rows - 1)) * s;
  const big = shapes[Math.floor(r() * 3)];
  const cells: string[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i * s, y = j * s;
    if (x >= bx && x < bx + 2 * s && y >= by && y < by + 2 * s) continue;
    if (r() < 0.5) continue;
    const sh = shapes[Math.floor(r() * shapes.length)];
    const fill = r() < 0.1 ? accent : 'var(--art-ink)';
    cells.push(sh(x, y, s, r, fill));
  }
  parts.push(...cells);
  parts.push(big(bx, by, 2 * s, r, accent));
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}
