# Monks News

The daily design and development brief for **Design Monks** and **Dev Monks**. A new issue every morning at 9:00, Dhaka.

- **Today**: the latest issue, with featured stories, five things to know, more stories, rated tools, earlier issues and sections.
- **Issue pages** (`/issue/YYYY-MM-DD/`): the full brief with a section index, "Don't miss today", why it matters, team actions, sources and shareable story links.
- **Archive**: search, date range, section and team filters. Filters stay in the URL, so a view can be shared.
- **Tools**: every rated tool and open-source project, filterable by kind, sorted best or newest first.
- **Team switch** (All / Design / Dev) on every page. It is remembered per browser and can be shared with `?team=design` or `?team=dev`.
- Light and dark theme, mobile menu, reduced-motion support.

## Run locally

```bash
npm install
npm run dev
```

## Content

Each issue is one JSON file in `src/content/issues/`. The format is in [docs/ISSUE_FORMAT.md](docs/ISSUE_FORMAT.md). `npm run build` validates every issue before building. Issues are published automatically every morning by GitHub Actions; see [docs/DAILY_RUN.md](docs/DAILY_RUN.md).

Branding text and footer links are in `src/lib/site.ts`. Section names are in `src/lib/data.ts` and `scripts/validate.mjs`.

## Deploy

This is a static Astro site. On Vercel, import the repo. The defaults work (framework Astro, build `npm run build`, output `dist`). Every push to `main` redeploys.
