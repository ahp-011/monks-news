# Daily run: the morning brief

## The job

Designers and developers at Design Monks and Dev Monks start work at 9:00 in Dhaka. Before they start, they open Monks News to catch up on the hottest design, development and AI news from **today and yesterday**. If a story grabs them, they go deeper from there.

So each issue must be:

- **Fresh.** What broke in the last 24–48 hours, not last week. At least 60% of stories must be from today or yesterday (Dhaka date). Nothing older than 7 days, except Learning corner and Today's experiment.
- **Hot.** What people in design and dev are actually talking about right now. Prefer stories with clear trend signals, and say what the signal is in `buzz`.
- **Useful.** Every story passes this test: *would a designer or developer here do something differently today because they read it?* Skip general business news, gossip, stock moves and announcements with nothing to try. If a big industry story has no practical angle, keep it short or leave it out.
- **Deep when wanted.** Featured stories (and ideally most others) carry `deeper` links: the official docs, changelog, tutorial, demo, repo or best discussion thread. Not more news coverage of the same thing.

## Where to look for what's hot (check in this order)

1. **Trend signals:** Hacker News front page and "best" of the last day, GitHub trending (daily), Product Hunt top launches today and yesterday, r/webdev, r/reactjs, r/UXDesign, r/FigmaDesign, r/LocalLLaMA, r/ClaudeAI, Dribbble and Behance popular, notable posts on X and LinkedIn by well-known designers and engineers.
2. **Changelogs and release notes** of tools the teams use: Figma (release notes, Config, community), Framer, Webflow, Adobe, Canva, Spline, Rive; Vercel and Next.js, React, Vite, Tailwind, shadcn/ui, Node, TypeScript, Expo and React Native, Flutter, Swift and Kotlin, Supabase, Chrome and web.dev, Safari; Anthropic, OpenAI, Google (Gemini, AI Studio), Cursor, GitHub (Copilot), Replit, Lovable, v0, Bolt.
3. **Trusted editorial:** Smashing Magazine, UX Collective, Nielsen Norman Group, Sidebar.io, CSS-Tricks, The Verge, TechCrunch, Ars Technica, Simon Willison's blog, Latent Space, It's Nice That and Brand New (for branding).

Search broadly. Open the primary source to confirm every fact you state. If two sources disagree, say so or leave the number out.

## Steps

1. Work on the `main` branch of this repo. Pull the latest.
2. Today's date is the current date in **Asia/Dhaka**. If `src/content/issues/<today>.json` already exists, stop: it has been published.
3. Read `docs/ISSUE_FORMAT.md`. Read the last two issues so nothing is repeated (a story returns only with real new information) and the number continues (`number` = latest + 1).
4. Research as above. Running several research subagents in parallel (design and branding / web, mobile and SaaS / AI and tools / trend signals) works well; then pick the best 20–30.
5. Write `src/content/issues/<today>.json`.
   - Lead and featured stories are the three hottest *and* most useful items of the day.
   - "In brief" is the five things everyone should know before 9:00.
   - "Don't miss today" is three concrete actions someone can do in under 30 minutes.
   - Tools: 4–6 tools worth trying, launched or updated recently, rated honestly out of 10.
   - Every story has `published`, real `sources`, and (for practical sections) `forTeam`.
6. Run `npm ci` (first time) and `npm run build`. The validator enforces the freshness and usefulness rules; fix and rebuild until it passes. Never weaken the validator to get through.
7. Commit only the new issue file with message `Issue No. NNN, <date>` and push to `main`. Vercel redeploys within a minute or two.

If there is genuinely too little fresh, verified news, publish a shorter issue (15 stories is fine) rather than padding it with old or vague items. Never invent facts, numbers, quotes or links.
