# Daily run: how the morning issue gets published

Designers and developers at Design Monks and Dev Monks start work at 9:00 in Dhaka. Before that, Monks News has to carry the hottest, most useful design, development and AI news from the **last 24 hours**, with links to go deeper.

It runs by itself in **GitHub Actions** (`.github/workflows/daily.yml`). Nobody needs to do anything.

| Dhaka time | What happens |
|---|---|
| 06:07 | Main run: collect, write, validate, publish (~5 minutes). Vercel deploys within ~2 minutes. |
| 07:13 | Backup run: publishes only if the 06:07 run failed or was skipped. |
| 08:07 | Last backup, still live well before 9:00. |

## How an issue is made (`scripts/daily/publish.mjs`)

1. **Collect.** Items from the last 24 hours (48 on a slow day) from about 80 sources in `scripts/daily/sources.mjs`, worldwide:
   - What everyone is covering: Techmeme, and Google News searches for design tools, UX, branding, web, mobile and AI news.
   - Trend signals: Hacker News stories with 60+ points, GitHub trending today (all, TypeScript, Python), fast-rising new repos, Hugging Face's most upvoted AI papers, Product Hunt launches.
   - Official changelogs and blogs: Figma, Vercel, Next.js, React, Chrome, WebKit, MDN, GitHub, OpenAI, Google, Claude, Cursor, Expo, Supabase, Cloudflare, Apple, Android and more.
   - Publications: The Verge, TechCrunch, Wired, MIT Technology Review, Ars Technica, 9to5Mac/Google, InfoQ, The New Stack, Smashing, UX Collective, NN/g, Fast Company Co.Design, Dezeen, Designboom, Muzli, Codrops and more.
   Shopping deals and off-topic items (games, mods, crypto) are filtered out, links from the last three issues are skipped, and the same story from several outlets is merged into one item that counts how many outlets cover it. Items are ranked by one "heat" score: points, stars, upvotes, number of outlets, trending today and freshness.
2. **Write.** Google Gemini (free tier) picks 18–26 of the hottest, most useful items and writes the headline, summary, "Why it matters", "For the team", "In brief", "Don't miss today" and tool ratings. It can only use the collected items: links, dates and trend signals (points, stars) are always taken from the items themselves, never from the AI.
3. **Check.** `scripts/validate.mjs` enforces freshness (60% dated today or yesterday), team actions on practical stories and correct structure. Anything the AI gets wrong is repaired or dropped.
4. **Fallback.** If Gemini is down, over quota or produces an invalid issue, a links-only issue is published instead: the top-ranked items with their own descriptions, balanced across sections. A day is never skipped.
5. **Publish.** The new file is committed to `main`; Vercel redeploys.

## Settings (GitHub → repo → Settings → Secrets and variables → Actions)

- Secret `GEMINI_API_KEY`: a free key from https://aistudio.google.com/apikey. Without it, every issue is links-only.
- Variable `GEMINI_MODEL` (optional): force a model name. By default the newest available Gemini Flash model is picked automatically, so it keeps working as Google releases new models.

## Running or fixing by hand

- Run now: GitHub → Actions → Daily issue → Run workflow.
- Re-make today's issue: GitHub → Actions → Daily issue → Run workflow, tick **Rewrite today's issue**.
- Add or remove a source: edit `scripts/daily/sources.mjs`.
- Run locally: `GEMINI_API_KEY=... node scripts/daily/publish.mjs`.

## The morning email (DM Bytes in the inbox)

After a new issue is published, the same run records the paper turning its pages (`scripts/email/flip.cjs`), builds a Gmail-safe broadsheet email (`scripts/email/build.mjs`) and sends one copy to each person (`scripts/email/send.mjs`). It sends from **aman@designmonks.co** and is off until these are set in GitHub → Settings → Secrets and variables → Actions:

- Secret `MAIL_APP_PASSWORD`: a Google app password for aman@designmonks.co (Google Account → Security → 2-Step Verification → App passwords).
- Secret `MAIL_TO`: the team's addresses, one per line or comma separated.
- Variable `MAIL_FROM` (optional): to send from a different address later.

Backup runs that find the issue already published do not send again.
