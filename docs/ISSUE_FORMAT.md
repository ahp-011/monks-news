# Monks News: issue format

Each daily issue is one JSON file at `src/content/issues/YYYY-MM-DD.json`.
The date is the publishing day in Dhaka (Asia/Dhaka). The site is rebuilt from these files only.

```jsonc
{
  "number": 1,                       // previous issue number + 1
  "date": "2026-11-26",              // same as the filename
  "headline": "Short line used in the archive list (usually the lead story, max ~70 chars)",
  "dontMiss": [                      // exactly 3 short imperative actions for the team
    "Try X on one real handoff."
  ],
  "brief": [                         // exactly 5. Each links to a story id below
    { "story": "gemini-4-neon", "title": "Google ships Gemini 4 Neon.", "text": "One sentence, with source in brackets." }
  ],
  "stories": [
    {
      "id": "kebab-case-unique-within-issue",
      "section": "industry",         // one of the section keys below
      "team": "both",                // "design" | "dev" | "both"
      "featured": true,              // exactly 3 stories in the issue are featured (first = lead)
      "title": "Sentence-case headline, no trailing period",
      "summary": "2-4 factual sentences. Name dates, numbers, who said it. Attribute in brackets (Source).",
      "why": "1-2 sentences for an agency team. No label prefix.",       // shown under WHY IT MATTERS; optional
      "forTeam": "1-2 sentences, a concrete action. No label prefix.",  // shown under FOR THE TEAM; optional
      "sources": [ { "name": "blog.google", "url": "https://..." } ]       // 1-4 real URLs, required
    }
  ],
  "tools": [                         // 4-6 tools, best first
    {
      "id": "tool-kebab-case",
      "name": "Tool name",
      "kind": "ai",                  // "ai" | "open-source"
      "team": "design",              // "design" | "dev" | "both"
      "rating": 8,                   // integer 1-10, honest
      "text": "What it does in one or two sentences.",
      "for": "Who at Design Monks / Dev Monks it helps.",
      "url": "https://..."
    }
  ]
}
```

## Sections

| key            | label                     | covers |
|----------------|---------------------------|--------|
| `industry`     | AI industry news          | model launches, funding, policy, big-tech moves |
| `design-ux`    | Product design and UX     | Figma, design systems, UX research, accessibility, app/web/dashboard design |
| `branding`     | Branding and identity     | logo and identity work, brand strategy, type, 3D, motion, social branding |
| `development`  | Web, mobile and SaaS      | frameworks, Webflow/Framer, React/Next, iOS/Android/cross-platform, SaaS architecture, backend/APIs, browsers |
| `ai-engineering` | AI engineering          | agents, LLM APIs, RAG, evals, workflow automation, MCP, AI features in products |
| `tools`        | New AI tools              | new AI products useful to designers or developers |
| `trends`       | Trends to watch           | longer-arc shifts in design, dev, SaaS, AI |
| `inspiration`  | Design inspiration        | notable UI, launches, interaction patterns (short) |
| `open-source`  | GitHub and open source    | repos, libraries, MCP servers, UI kits |
| `social`       | Social buzz               | what designers/devs are discussing on X, Dribbble, Reddit, HN |
| `learning`     | Learning corner           | guides, talks, courses worth the time |
| `opportunities`| Opportunities             | client-side demand, RFP trends, awards, grants, events, hiring signals |
| `experiment`   | Today's experiment        | one small hands-on task for the team (usually 1 story) |

A normal issue has 20-30 stories spread across all sections, with a healthy mix of `design`, `dev` and `both`.

## Who reads it

- **Design Monks** (team `design`): UI/UX design for apps, websites and dashboards; wireframing, prototyping, interaction and product design; logo and branding (identity, 3D logos, brand strategy, social branding); Webflow and Framer sites.
- **Dev Monks** (team `dev`): AI engineering (agentic AI, custom LLM solutions, RAG, workflow automation); SaaS platform engineering (multi-tenant, enterprise portals, MVPs, backend and APIs); mobile apps (iOS, Android, cross-platform, IoT companion apps).
- Client industries both teams serve: FinTech, EdTech, travel and booking, fitness, health, FMCG, SaaS startups. Use these to pick `opportunities` and to make "For the team" actions concrete.

## Rules

- Only real, verifiable news from the last ~7 days. Every story needs at least one working source URL.
- No invented numbers or quotes. If a claim is a vendor claim, say so.
- Write plainly: sentence case headlines, no hype words, no emoji.
- Don't repeat a story that appeared in an earlier issue unless there is real new information.
