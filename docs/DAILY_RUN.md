# Daily run: how the morning issue gets published

Every morning a scheduled Claude session publishes the day's issue. It follows these steps.

1. Work on the `main` branch of this repo. Pull the latest.
2. Today's date is the current date in Asia/Dhaka. If `src/content/issues/<today>.json` already exists, stop.
3. Read `docs/ISSUE_FORMAT.md`. Read the two most recent issues so nothing is repeated and the number continues (`number` = latest + 1).
4. Research real news from the last 7 days (prefer the last 48 hours) for Design Monks (UI/UX, product, web and app design, branding, SaaS, design systems, Webflow/Framer) and Dev Monks (web and mobile development, React/Next.js, Webflow/Framer builds, backend, AI integration). Search widely; open sources to confirm facts where possible.
5. Write `src/content/issues/<today>.json`: about 20–30 stories across every section, 3 featured, 5 brief items, 3 "don't miss" actions, 4–6 rated tools. Every story needs real source URLs. Never invent facts, numbers or links.
6. Run `npm ci` (first time) and `npm run build`. It validates the file and fails on mistakes; fix and rebuild until it passes.
7. Commit only the new issue file with message `Issue No. NNN, <date>` and push to `main`. Vercel redeploys automatically.

If research turns up too little verified news, publish a shorter issue rather than padding it.
