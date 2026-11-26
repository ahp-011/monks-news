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
  // Launches
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed', section: 'tools', team: 'both', kind: 'product' },
];

// Hacker News stories need one of these words to count as relevant in the no-AI fallback.
export const RELEVANT = /\b(design|designer|figma|framer|webflow|ux|ui|font|typeface|brand|logo|css|html|javascript|typescript|react|next\.?js|vue|svelte|node|deno|bun|web|browser|chrome|safari|firefox|ios|android|swift|kotlin|flutter|api|sdk|saas|frontend|backend|database|postgres|open.?source|github|ai|llm|gpt|openai|claude|anthropic|gemini|mistral|llama|agent|agents|mcp|rag|copilot|cursor|model|models|vercel|supabase|accessibility|a11y)\b/i;
