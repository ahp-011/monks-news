# Daily run: how the morning issue gets published

Designers and developers at Design Monks and Dev Monks start work at 9:00 in Dhaka. Before that, Monks News has to carry the hottest, most useful design, development and AI news from **today and yesterday**, with links to go deeper.

It runs by itself in **GitHub Actions** (`.github/workflows/daily.yml`). Nobody needs to do anything.

| Dhaka time | What happens |
|---|---|
| 07:10 | Main run: collect, write, validate, publish. Vercel deploys within ~2 minutes. |
| 08:13 | Backup run: publishes only if the 07:10 run failed. |

## How an issue is made (`scripts/daily/publish.mjs`)

1. **Collect.** Items from the last 48 hours (96 if it's a slow day) from the feeds in `scripts/daily/sources.mjs`: official changelogs and blogs (Figma, Vercel, Next.js, React, Chrome, WebKit, GitHub, OpenAI, Google, Cursor, Expo, Supabase, Apple, Android and more), design and dev publications, Hacker News stories with 60+ points, fast-rising new GitHub repos and Product Hunt launches. Shopping deals are filtered out, and links used in the last three issues are skipped.
2. **Write.** Google Gemini (free tier) picks 18–26 of the hottest, most useful items and writes the headline, summary, "Why it matters", "For the team", "In brief", "Don't miss today" and tool ratings. It can only use the collected items: links, dates and trend signals (points, stars) are always taken from the items themselves, never from the AI.
3. **Check.** `scripts/validate.mjs` enforces freshness (60% from the last two days), team actions on practical stories and correct structure. Anything the AI gets wrong is repaired or dropped.
4. **Fallback.** If Gemini is down, over quota or produces an invalid issue, a links-only issue is published instead: the top-ranked items with their own descriptions, balanced across sections. A day is never skipped.
5. **Publish.** The new file is committed to `main`; Vercel redeploys.

## Settings (GitHub → repo → Settings → Secrets and variables → Actions)

- Secret `GEMINI_API_KEY`: a free key from https://aistudio.google.com/apikey. Without it, every issue is links-only.
- Variable `GEMINI_MODEL` (optional): force a model name. By default the newest available Gemini Flash model is picked automatically, so it keeps working as Google releases new models.

## Running or fixing by hand

- Run now: GitHub → Actions → Daily issue → Run workflow.
- Re-make today's issue: delete `src/content/issues/<today>.json` on `main`, then run the workflow.
- Add or remove a source: edit `scripts/daily/sources.mjs`.
- Run locally: `GEMINI_API_KEY=... node scripts/daily/publish.mjs`.
