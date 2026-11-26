import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://monks-news.vercel.app',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
