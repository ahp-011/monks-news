// Where the daily issue looks for news. Focus: UI/UX and product design, front-end and app development, and AI
// (models plus AI tools for designing and building). Add or remove feeds here.
// section/team are hints for the writer and for the no-AI fallback.
// filter: true means a general source; only its items that match FOCUS are kept.
const g = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}%20when:1d&hl=en-US&gl=US&ceid=US:en`;

export const FEEDS = [
  // ---- UI/UX and product design ----
  { name: 'Figma release notes', url: 'https://www.figma.com/release-notes/feed/atom.xml', section: 'design-ux', team: 'design', official: true },
  { name: 'Figma blog', url: 'https://www.figma.com/blog/feed/atom.xml', section: 'design-ux', team: 'design', official: true },
  { name: 'UX Collective', url: 'https://uxdesign.cc/feed', section: 'design-ux', team: 'design' },
  { name: 'Nielsen Norman Group', url: 'https://www.nngroup.com/feed/rss/', section: 'design-ux', team: 'design' },
  { name: 'UX Planet', url: 'https://uxplanet.org/feed', section: 'design-ux', team: 'design' },
  { name: 'Bootcamp', url: 'https://medium.com/feed/design-bootcamp', section: 'design-ux', team: 'design' },
  { name: 'Prototypr', url: 'https://blog.prototypr.io/feed', section: 'design-ux', team: 'design' },
  { name: 'UX Movement', url: 'https://uxmovement.com/feed/', section: 'design-ux', team: 'design' },
  { name: 'Google Design', url: 'https://medium.com/feed/google-design', section: 'design-ux', team: 'design' },
  { name: 'Medium: Figma', url: 'https://medium.com/feed/tag/figma', section: 'design-ux', team: 'design', limit: 4 },
  { name: 'Medium: UI design', url: 'https://medium.com/feed/tag/ui-design', section: 'design-ux', team: 'design', limit: 4 },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', section: 'learning', team: 'both' },
  { name: 'A List Apart', url: 'https://alistapart.com/main/feed/', section: 'learning', team: 'both' },
  { name: 'Sidebar', url: 'https://sidebar.io/feed.xml', section: 'design-ux', team: 'design' },
  { name: 'Dribbble stories', url: 'https://dribbble.com/stories.rss', section: 'inspiration', team: 'design' },
  { name: 'Codrops', url: 'https://tympanus.net/codrops/feed/', section: 'inspiration', team: 'both' },
  { name: 'Muzli', url: 'https://medium.muz.li/feed', section: 'inspiration', team: 'design' },
  { name: 'Fast Company Co.Design', url: 'https://www.fastcompany.com/co-design/rss', section: 'design-ux', team: 'design', filter: true },
  // branding and identity
  { name: 'Abduzeedo', url: 'https://abduzeedo.com/rss.xml', section: 'branding', team: 'design', limit: 4 },
  { name: 'Creative Bloq', url: 'https://www.creativebloq.com/feeds/all', section: 'branding', team: 'design', filter: true },
  { name: 'Brand New', url: 'https://www.underconsideration.com/brandnew/feed/', section: 'branding', team: 'design' },

  // ---- front-end, web and app development ----
  { name: 'Webflow blog', url: 'https://webflow.com/blog/rss.xml', section: 'development', team: 'both', official: true },
  { name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/', section: 'development', team: 'dev' },
  { name: 'Josh W. Comeau', url: 'https://www.joshwcomeau.com/rss.xml', section: 'learning', team: 'dev' },
  { name: 'Frontend Masters', url: 'https://frontendmasters.com/blog/feed/', section: 'development', team: 'dev' },
  { name: 'Bram.us', url: 'https://www.bram.us/feed/', section: 'development', team: 'dev' },
  { name: 'Piccalilli', url: 'https://piccalil.li/feed.xml', section: 'learning', team: 'dev' },
  { name: 'Vercel', url: 'https://vercel.com/atom', section: 'development', team: 'dev', official: true },
  { name: 'Next.js', url: 'https://nextjs.org/feed.xml', section: 'development', team: 'dev', official: true },
  { name: 'React', url: 'https://react.dev/rss.xml', section: 'development', team: 'dev', official: true },
  { name: 'Chrome for Developers', url: 'https://developer.chrome.com/static/blog/feed.xml', section: 'development', team: 'dev', official: true },
  { name: 'web.dev', url: 'https://web.dev/static/blog/feed.xml', section: 'development', team: 'dev', official: true },
  { name: 'WebKit', url: 'https://webkit.org/feed/', section: 'development', team: 'dev', official: true },
  { name: 'MDN', url: 'https://developer.mozilla.org/en-US/blog/rss.xml', section: 'learning', team: 'dev', official: true },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/feeds/feed.xml', section: 'development', team: 'dev', official: true },
  { name: 'Expo', url: 'https://expo.dev/changelog/rss.xml', section: 'development', team: 'dev', official: true },
  { name: 'Supabase', url: 'https://supabase.com/rss.xml', section: 'development', team: 'dev', official: true, limit: 3 },
  { name: 'Apple Developer', url: 'https://developer.apple.com/news/rss/news.rss', section: 'development', team: 'dev', official: true },
  { name: 'Android Developers', url: 'https://android-developers.googleblog.com/feeds/posts/default', section: 'development', team: 'dev', official: true },
  { name: 'GitHub changelog', url: 'https://github.blog/changelog/feed/', section: 'tools', team: 'dev', official: true, filter: true },

  // ---- AI: models, and AI tools for design and code ----
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml', section: 'industry', team: 'both', official: true },
  { name: 'Claude', url: 'https://claude.com/blog/rss.xml', section: 'industry', team: 'both', official: true },
  { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', section: 'industry', team: 'both', official: true },
  { name: 'Gemini', url: 'https://blog.google/products/gemini/rss/', section: 'industry', team: 'both', official: true },
  { name: 'Google for Developers', url: 'https://developers.googleblog.com/feeds/posts/default', section: 'ai-engineering', team: 'dev', official: true, filter: true },
  { name: 'Cursor changelog', url: 'https://cursor.com/changelog/rss.xml', section: 'tools', team: 'dev', official: true },
  { name: 'Lovable', url: 'https://lovable.dev/blog/rss.xml', section: 'tools', team: 'both', official: true },
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/', section: 'ai-engineering', team: 'dev', filter: true },
  { name: 'Medium: vibe coding', url: 'https://medium.com/feed/tag/vibe-coding', section: 'ai-engineering', team: 'both', limit: 3 },

  // ---- what everyone is covering (general sources: filtered to the focus) ----
  { name: 'Techmeme', url: 'https://www.techmeme.com/feed.xml', section: 'industry', team: 'both', limit: 15, filter: true },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', section: 'industry', team: 'both', filter: true },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', section: 'industry', team: 'both', filter: true },
  { name: 'Google News', url: g('Figma OR Framer OR Webflow OR Canva OR "Adobe Firefly"'), section: 'design-ux', team: 'design', google: true, filter: true, limit: 6 },
  { name: 'Google News', url: g('"AI design tool" OR "Figma AI" OR "vibe coding" OR "Claude Code" OR Cursor OR v0 OR "Lovable AI" OR "Google Stitch"'), section: 'tools', team: 'both', google: true },
  { name: 'Google News', url: g('OpenAI OR Anthropic OR Claude OR Gemini OR "AI model" OR "AI agents"'), section: 'industry', team: 'both', google: true, limit: 8 },

  // ---- trending code (filtered to design, front-end and AI tooling) ----
  { name: 'GitHub trending', url: 'https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml', section: 'open-source', team: 'dev', kind: 'repo', trending: true },
  { name: 'GitHub trending', url: 'https://mshibanami.github.io/GitHubTrendingRSS/daily/typescript.xml', section: 'open-source', team: 'dev', kind: 'repo', trending: true },
  { name: 'GitHub trending', url: 'https://mshibanami.github.io/GitHubTrendingRSS/daily/javascript.xml', section: 'open-source', team: 'dev', kind: 'repo', trending: true },

  // ---- launches ----
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed?category=design-tools', section: 'tools', team: 'both', kind: 'product' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed', section: 'tools', team: 'both', kind: 'product', filter: true, limit: 8 },
];

// Items from general sources, Hacker News and GitHub must match this to count.
export const FOCUS = /\b(design(er|ers|ing)?|figma|framer|webflow|canva|adobe|sketch|prototyp\w*|wirefram\w*|ux|ui|user experience|usability|accessib\w*|a11y|typograph\w*|typeface|font|brand(ing)?|logo|icon|illustrat\w*|motion|animation|css|html|javascript|typescript|reactjs|react\.js|react native|react 19|react compiler|next\.?js|vue|svelte|astro|tailwind|frontend|front-end|web ?app|website|browser|chrome|safari|webkit|ios|android|swift ?ui|jetpack compose|flutter|react native|expo|mobile app|component|design system|ai|llm|gpt|openai|claude|anthropic|gemini|mistral|llama|agent|agents|agentic|mcp|copilot|cursor|v0|lovable|bolt|stitch|vibe cod\w*|coding assistant|image model|video model|midjourney|firefly|runway)\b/i;
export const RELEVANT = FOCUS;

// Never news for this team, whatever the source.
// Wire services and finance sites that Google News mixes in.
export const NOISY_SOURCES = /\b(marketbeat|motley fool|yahoo finance|seeking alpha|benzinga|zacks|prlog|pr newswire|business wire|globenewswire|accesswire|einpresswire|openpr|newsfile)\b/i;

export const OFFTOPIC = /\b(gta|xbox|playstation|ps5|nintendo|emulator|game mod|mod manager|minecraft|roblox|fortnite|cheat|crack|torrent|crypto|bitcoin|ethereum|airdrop|memecoin|stock|stocks|shares|share unlock|investors?|investment|analysts?|wall street|earnings|ipo|valuation|layoffs?|lawsuit|sues|sued|countersues|court|trade secrets|antitrust|tariff|election|senate|congress|data cent(er|re)s?|chipmakers?|semiconductors?|gpu shipments|kubernetes|k8s|devops|terraform|sre|incident|outage|ransomware|malware|breach|skimm\w*|phishing|vulnerabilit\w*|cve|exploit|database migration|data pipeline|etl|mainframe|cobol|blockchain|woke|football|soccer|nfl|nba|cricket)\b/i;
