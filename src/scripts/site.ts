const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string | null) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} },
};

/* ---------- Theme ---------- */
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
const syncThemeLabel = () => document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme'));
syncThemeLabel();
document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next; store.set('mn-theme', next); syncThemeLabel();
}));

/* ---------- Team filter (Design Monks / Dev Monks) ---------- */
function applyTeam(team: string, persist = true) {
  if (team === 'design' || team === 'dev') root.dataset.team = team; else delete root.dataset.team;
  if (persist) store.set('mn-team', team === 'all' ? null : team);
  document.querySelectorAll<HTMLButtonElement>('[data-team-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.teamSet === (root.dataset.team ?? 'all'))));
  const u = new URL(location.href);
  if (u.searchParams.has('team')) { team === 'all' ? u.searchParams.delete('team') : u.searchParams.set('team', team); history.replaceState(null, '', u); }
  // counts and empty states
  document.querySelectorAll<HTMLElement>('[data-count-of]').forEach((el) => {
    const scope = document.querySelector(el.dataset.countOf!);
    if (!scope) return;
    const n = [...scope.querySelectorAll<HTMLElement>('[data-team]')].filter((x) => x.offsetParent !== null || getComputedStyle(x).display !== 'none').length;
    el.textContent = String(n);
  });
  document.querySelectorAll<HTMLElement>('[data-hide-empty]').forEach((sec) => {
    const any = [...sec.querySelectorAll<HTMLElement>('[data-team]')].some((x) => getComputedStyle(x).display !== 'none');
    sec.hidden = !any;
  });
  document.dispatchEvent(new CustomEvent('teamchange'));
}
document.querySelectorAll<HTMLButtonElement>('[data-team-set]').forEach((b) => b.addEventListener('click', () => applyTeam(b.dataset.teamSet!)));
applyTeam(root.dataset.team ?? 'all', false);

/* ---------- Drawer ---------- */
const drawer = document.getElementById('drawer');
const toggle = document.querySelector<HTMLButtonElement>('[data-drawer-toggle]');
function setDrawer(open: boolean) {
  if (!drawer || !toggle) return;
  drawer.classList.toggle('is-open', open);
  drawer.toggleAttribute('inert', !open);
  drawer.setAttribute('aria-hidden', String(!open));
  toggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('drawer-open', open);
  if (open) drawer.querySelector<HTMLElement>('a, button')?.focus(); else toggle.focus({ preventScroll: true });
}
toggle?.addEventListener('click', () => setDrawer(true));
document.querySelector('[data-drawer-close]')?.addEventListener('click', () => setDrawer(false));
drawer?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setDrawer(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer?.classList.contains('is-open')) setDrawer(false); });
matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setDrawer(false); });

/* ---------- Hide nav on scroll down ---------- */
const nav = document.querySelector<HTMLElement>('.nav');
if (nav && !reduced) {
  let last = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (Math.abs(y - last) > 6) {
        nav.classList.toggle('is-hidden', y > last && y > innerHeight * 0.6 && !document.body.classList.contains('drawer-open') && !nav.matches(':focus-within'));
        last = y;
      }
      ticking = false;
    });
  }, { passive: true });
}

/* ---------- Hash links: instant jump + focus ---------- */
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href')!;
  let el: HTMLElement | null = null;
  try { el = id.length > 1 ? document.querySelector(id) : null; } catch { return; }
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  history.pushState(null, '', id);
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
});

/* ---------- Rolling button labels ---------- */
if (finePointer && !reduced) {
  document.querySelectorAll('.btn:not(.btn--tertiary), .nav__link').forEach((el) => {
    const t = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
    if (!t) return;
    const txt = t.textContent!.trim();
    const roll = document.createElement('span'); roll.className = 'roll';
    const a = document.createElement('span'); a.textContent = txt;
    const b = document.createElement('span'); b.textContent = txt; b.setAttribute('aria-hidden', 'true');
    roll.append(a, b); el.replaceChild(roll, t);
  });
}

/* ---------- Reveal animations ---------- */
function splitWords(el: HTMLElement, wrap: (w: string) => { outer: HTMLElement; inner: HTMLElement }) {
  if (el.dataset.split) return [] as HTMLElement[];
  el.dataset.split = 'true';
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
  const inners: HTMLElement[] = [];
  const walk = (src: Node, dst: Node) => src.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      (n.textContent ?? '').split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { dst.appendChild(document.createTextNode(' ')); return; }
        const w = wrap(part); inners.push(w.inner); dst.appendChild(w.outer);
      });
    } else if (n.nodeType === Node.ELEMENT_NODE) { const c = n.cloneNode(false); dst.appendChild(c); walk(n, c); }
  });
  walk(el, vis);
  const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text;
  el.replaceChildren(sr, vis);
  return inners;
}
const delayOf = (el: HTMLElement) => { const v = getComputedStyle(el).getPropertyValue('--d').trim(); return v.endsWith('ms') ? parseFloat(v) : v.endsWith('s') ? parseFloat(v) * 1000 : 0; };

document.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
  const words = splitWords(el, (w) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; return { outer: s, inner: s }; });
  if (reduced) { words.forEach((w) => w.classList.add('is-on')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-on', e.boundingClientRect.top < innerHeight * 0.62)), { rootMargin: '0px 0px -38% 0px' });
  words.forEach((w) => io.observe(w));
});

function runReveals() {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((p) => {
    const step = parseFloat(p.dataset.stagger!) || 80;
    [...p.children].forEach((c, i) => (c as HTMLElement).style.setProperty('--d', `${delayOf(c as HTMLElement) + Math.min(i * step, 400)}ms`));
  });
  document.querySelectorAll<HTMLElement>('[data-reveal="text"]').forEach((el) => {
    const base = delayOf(el);
    splitWords(el, (w) => {
      const o = document.createElement('span'); o.className = 'tw';
      const i = document.createElement('span'); i.className = 'tw__i'; i.textContent = w; o.appendChild(i);
      return { outer: o, inner: i };
    }).forEach((w, i) => w.style.setProperty('--d', `${base + Math.min(i * 40, 600)}ms`));
  });
  const els = [...document.querySelectorAll<HTMLElement>('.reveal, [data-reveal]')];
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  const pending = new Set(els);
  const show = (e: HTMLElement) => { if (pending.delete(e)) e.classList.add('is-in'); };
  const target = (e: HTMLElement) => (e.matches('[data-reveal="image"]') ? e.parentElement! : e);
  const groups = new Map<Element, HTMLElement[]>();
  els.forEach((e) => { const t = target(e); groups.set(t, [...(groups.get(t) ?? []), e]); });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { (groups.get(e.target) ?? []).forEach(show); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  groups.forEach((_, t) => io.observe(t));
  // safety: anything already above the fold (e.g. after hash jump)
  let tm: number | undefined;
  const sweep = () => pending.forEach((e) => { if (target(e).getBoundingClientRect().top < innerHeight * 0.88) show(e); });
  addEventListener('scroll', () => { clearTimeout(tm); tm = window.setTimeout(sweep, 120); }, { passive: true });
  sweep();
}
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(() => { runReveals(); requestAnimationFrame(() => root.classList.add('is-loaded')); });

/* ---------- Issue table of contents: active section ---------- */
const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.toc-desktop a[href^="#"]')];
if (tocLinks.length) {
  const map = new Map(tocLinks.map((a) => [a.getAttribute('href')!.slice(1), a]));
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { tocLinks.forEach((a) => a.classList.remove('is-active')); map.get(e.target.id)?.classList.add('is-active'); } });
  }, { rootMargin: '-30% 0px -60% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}
document.querySelector<HTMLSelectElement>('[data-toc-select]')?.addEventListener('change', (e) => {
  const v = (e.target as HTMLSelectElement).value; if (v) location.hash = v;
});

/* ---------- Copy story link ---------- */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
  const link = new URL(b.dataset.copy!, location.href).href;
  try { await navigator.clipboard.writeText(link); b.textContent = 'Copied'; } catch { b.textContent = 'Copy failed'; }
  setTimeout(() => (b.textContent = 'Copy link'), 1600);
}));

/* ---------- Back to top ---------- */
document.querySelector('[data-top]')?.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
