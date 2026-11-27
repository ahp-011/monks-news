// Where the daily issue looks for news. Add or remove feeds here.
// section/team are hints for the writer and for the no-AI fallback.
export const FEEDS = [
  // Design, UX, branding
  { name: 'Figma release notes', url: 'https://www.figma.com/release-notes/feed/atom.xml', section: 'design-ux', team: 'design', official: true },
  { name: 'Figma blog', url: 'https://www.figma.com/blog/feed/atom.xml', section: 'design-ux', team: 'design', official: true },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', section: 'learning', team: 'both' },
  { name: 'UX Collective', url: 'https://uxdesign.cc/feed', section: 'design-ux', team: 'design' },
  { name: 'Nielsen Norman Group', url: 'https://www.nngroup.com/feed/rss/', section: 'learning', team: 'design' },
  { name: 'Google Design', url: 'https://medium.com/feed/google-design', section: 'design-ux', team: 'design' },
  { name: 'Sidebar', url: 'https://sidebar.io/feed.xml', section: 'design-ux', team: 'design' },
  { name: 'Codrops', url: 'https://tympanus.net/codrops/feed/', section: 'inspiration', team: 'both' },
  { name: 'Abduzeedo', url: 'https://abduzeedo.com/rss.xml', section: 'branding', team: 'design' },
  { name: 'Creative Bloq', url: 'https://www.creativebloq.com/feeds/all', section: 'branding', team: 'design' },
  { name: 'Brand New', url: 'https://www.underconsideration.com/brandnew/feed/', section: 'branding', team: 'design' },
  { name: 'Webflow blog', url: 'https://webflow.com/blog/rss.xml', section: 'development', team: 'both', official: true },
  { name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/', section: 'learning', team: 'dev' },
  // Web, mobile, SaaS
  { name: 'Vercel', url: 'https://vercel.com/atom', section: 'development', team: 'dev', official: true },
  { name: 'Next.js', url: 'https://nextjs.org/feed.xml', section: 'development', team: 'dev', official: true },
  { name: 'React', url: 'https://react.dev/rss.xml', section: 'development', team: 'dev', official: true },
  { name: 'Chrome for Developers', url: 'https://developer.chrome.com/static/blog/feed.xml', section: 'development', team: 'dev', official: true },
  { name: 'web.dev', url: 'https://web.dev/static/blog/feed.xml', section: 'development', team: 'dev', official: true },
  { name: 'WebKit', url: 'https://webkit.org/feed/', section: 'development', team: 'dev', official: true },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/feeds/feed.xml', section: 'development', team: 'dev', official: true },
  { name: 'Expo', url: 'https://expo.dev/changelog/rss.xml', section: 'development', team: 'dev', official: true },
  { name: 'Supabase', url: 'https://supabase.com/rss.xml', section: 'development', team: 'dev', official: true },
  { name: 'Deno', url: 'https://deno.com/feed', section: 'development', team: 'dev', official: true },
  { name: 'Bun', url: 'https://bun.sh/rss.xml', section: 'development', team: 'dev', official: true },
  { name: 'Apple Developer', url: 'https://developer.apple.com/news/rss/news.rss', section: 'development', team: 'dev', official: true },
  { name: 'Android Developers', url: 'https://android-developers.googleblog.com/feeds/posts/default', section: 'development', team: 'dev', official: true },
  { name: 'GitHub blog', url: 'https://github.blog/feed/', section: 'development', team: 'dev', official: true },
  { name: 'GitHub changelog', url: 'https://github.blog/changelog/feed/', section: 'tools', team: 'dev', official: true },
  { name: 'DEV Community', url: 'https://dev.to/feed/', section: 'social', team: 'dev' },
  // AI
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml', section: 'industry', team: 'both', official: true },
  { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', section: 'industry', team: 'both', official: true },
  { name: 'Google for Developers', url: 'https://developers.googleblog.com/feeds/posts/default', section: 'ai-engineering', team: 'dev', official: true },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', section: 'ai-engineering', team: 'dev', official: true },
  { name: 'Cursor changelog', url: 'https://cursor.com/changelog/rss.xml', section: 'tools', team: 'dev', official: true },
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/', section: 'ai-engineering', team: 'dev' },
  { name: 'Latent Space', url: 'https://www.latent.space/feed', section: 'ai-engineering', team: 'dev' },
  // General tech
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', section: 'industry', team: 'both' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', section: 'industry', team: 'both' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', section: 'industry', team: 'both' },
  // What everyone is covering right now
  { name: 'Techmeme', url: 'https://www.techmeme.com/feed.xml', section: 'industry', team: 'both', limit: 15 },
  { name: 'Google News', url: 'https://news.google.com/rss/search?q=Figma%20OR%20Framer%20OR%20Webflow%20OR%20Canva%20OR%20Adobe%20when:1d&hl=en-US&gl=US&ceid=US:en', section: 'design-ux', team: 'design', google: true },
  { name: 'Google News', url: 'https://news.google.com/rss/search?q=%22UX%20design%22%20OR%20%22product%20design%22%20OR%20%22UI%20design%22%20OR%20%22design%20system%22%20when:1d&hl=en-US&gl=US&ceid=US:en', section: 'design-ux', team: 'design', google: true },
  { name: 'Google News', url: 'https://news.google.com/rss/search?q=rebrand%20OR%20%22brand%20identity%22%20OR%20%22new%20logo%22%20OR%20typeface%20when:1d&hl=en-US&gl=US&ceid=US:en', section: 'branding', team: 'design', google: true },
  { name: 'Google News', url: 'https://news.google.com/rss/search?q=React%20OR%20Next.js%20OR%20JavaScript%20OR%20TypeScript%20OR%20%22web%20developers%22%20when:1d&hl=en-US&gl=US&ceid=US:en', section: 'development', team: 'dev', google: true },
  { name: 'Google News', url: 'https://news.google.com/rss/search?q=%22iOS%20developers%22%20OR%20%22Android%20developers%22%20OR%20%22App%20Store%22%20OR%20%22Google%20Play%22%20when:1d&hl=en-US&gl=US&ceid=US:en', section: 'development', team: 'dev', google: true },
  { name: 'Google News', url: 'https://news.google.com/rss/search?q=OpenAI%20OR%20Anthropic%20OR%20Claude%20OR%20Gemini%20OR%20%22AI%20agents%22%20OR%20%22AI%20model%22%20when:1d&hl=en-US&gl=US&ceid=US:en', section: 'industry', team: 'both', google: true },
  // Trending code and research today
  { name: 'GitHub trending', url: 'https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml', section: 'open-source', team: 'dev', kind: 'repo', trending: true },
  { name: 'GitHub trending', url: 'https://mshibanami.github.io/GitHubTrendingRSS/daily/typescript.xml', section: 'open-source', team: 'dev', kind: 'repo', trending: true },
  { name: 'GitHub trending', url: 'https://mshibanami.github.io/GitHubTrendingRSS/daily/python.xml', section: 'open-source', team: 'dev', kind: 'repo', trending: true },
  // More publications
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', section: 'industry', team: 'both' },
  { name: 'Wired', url: 'https://www.wired.com/feed/tag/ai/latest/rss', section: 'industry', team: 'both' },
  { name: '9to5Mac', url: 'https://9to5mac.com/feed/', section: 'development', team: 'both' },
  { name: '9to5Google', url: 'https://9to5google.com/feed/', section: 'development', team: 'both' },
  { name: 'InfoQ', url: 'https://www.infoq.com/feed/', section: 'development', team: 'dev' },
  { name: 'The New Stack', url: 'https://thenewstack.io/feed/', section: 'development', team: 'dev' },
  { name: 'Cloudflare', url: 'https://blog.cloudflare.com/rss/', section: 'development', team: 'dev', official: true },
  { name: 'MDN', url: 'https://developer.mozilla.org/en-US/blog/rss.xml', section: 'learning', team: 'dev', official: true },
  { name: 'Claude', url: 'https://claude.com/blog/rss.xml', section: 'industry', team: 'both', official: true },
  { name: 'Dezeen', url: 'https://www.dezeen.com/feed/', section: 'branding', team: 'design' },
  { name: 'Designboom', url: 'https://www.designboom.com/feed/', section: 'inspiration', team: 'design' },
  { name: 'Fast Company Co.Design', url: 'https://www.fastcompany.com/co-design/rss', section: 'design-ux', team: 'design' },
  { name: 'Muzli', url: 'https://medium.muz.li/feed', section: 'inspiration', team: 'design' },
  { name: 'Medium: UX design', url: 'https://medium.com/feed/tag/ux-design', section: 'design-ux', team: 'design' },
  // Launches
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed', section: 'tools', team: 'both', kind: 'product' },
];

// Hacker News stories need one of these words to count as relevant in the no-AI fallback.
// gaming and modding repos trend constantly but are not useful here
export const OFFTOPIC = /\b(gta|xbox|playstation|ps5|nintendo|switch emulator|emulator|game mod|mod manager|minecraft|roblox|fortnite|cheat|crack|torrent|crypto|airdrop|memecoin)\b/i;

export const RELEVANT = /\b(design|designer|figma|framer|webflow|ux|ui|font|typeface|brand|logo|css|html|javascript|typescript|react|next\.?js|vue|svelte|node|deno|bun|web|browser|chrome|safari|firefox|ios|android|swift|kotlin|flutter|api|sdk|saas|frontend|backend|database|postgres|open.?source|github|ai|llm|gpt|openai|claude|anthropic|gemini|mistral|llama|agent|agents|mcp|rag|copilot|cursor|model|models|vercel|supabase|accessibility|a11y)\b/i;
