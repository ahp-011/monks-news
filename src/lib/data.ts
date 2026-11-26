export type Team = 'design' | 'dev' | 'both';

export interface Source { name: string; url: string }
export interface Story {
  id: string; section: SectionKey; team: Team; featured?: boolean;
  title: string; summary: string; why?: string; forTeam?: string; sources: Source[];
}
export interface Tool {
  id: string; name: string; kind: 'ai' | 'open-source'; team: Team;
  rating: number; text: string; for: string; url: string;
}
export interface BriefItem { story: string; title: string; text: string }
export interface Issue {
  number: number; date: string; headline: string;
  dontMiss: string[]; brief: BriefItem[]; stories: Story[]; tools: Tool[];
}

export const SECTIONS = [
  { key: 'industry', label: 'AI industry news', short: 'Industry' },
  { key: 'design-ux', label: 'Product design and UX', short: 'Design and UX' },
  { key: 'branding', label: 'Branding and identity', short: 'Branding' },
  { key: 'development', label: 'Web, mobile and SaaS', short: 'Development' },
  { key: 'ai-engineering', label: 'AI engineering', short: 'AI engineering' },
  { key: 'tools', label: 'New AI tools', short: 'Tools' },
  { key: 'trends', label: 'Trends to watch', short: 'Trends' },
  { key: 'inspiration', label: 'Design inspiration', short: 'Inspiration' },
  { key: 'open-source', label: 'GitHub and open source', short: 'Open source' },
  { key: 'social', label: 'Social buzz', short: 'Social' },
  { key: 'learning', label: 'Learning corner', short: 'Learning' },
  { key: 'opportunities', label: 'Opportunities', short: 'Opportunities' },
  { key: 'experiment', label: "Today's experiment", short: 'Experiment' },
] as const;
export type SectionKey = (typeof SECTIONS)[number]['key'];
export const sectionOf = (k: string) => SECTIONS.find((s) => s.key === k) ?? SECTIONS[0];

export const TEAMS = {
  design: { label: 'Design Monks', short: 'Design' },
  dev: { label: 'Dev Monks', short: 'Dev' },
  both: { label: 'Both teams', short: 'Both' },
} as const;

const modules = import.meta.glob<{ default: Issue }>('../content/issues/*.json', { eager: true });
export const issues: Issue[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => b.date.localeCompare(a.date));

export const latest = issues[0];
export const issueByDate = (d: string) => issues.find((i) => i.date === d);

export const allStories = issues.flatMap((i) => i.stories.map((s) => ({ ...s, issue: i })));

/** Every tool ever rated; a tool mentioned again keeps its latest mention. */
export const allTools = (() => {
  const seen = new Map<string, Tool & { issue: Issue }>();
  for (const i of issues) for (const t of i.tools) {
    const k = t.name.trim().toLowerCase();
    if (!seen.has(k)) seen.set(k, { ...t, issue: i });
  }
  return [...seen.values()];
})();

export const sectionCounts = Object.fromEntries(
  SECTIONS.map((s) => [s.key, allStories.filter((x) => x.section === s.key).length + (s.key === 'tools' ? allTools.filter((t) => t.kind === 'ai').length : 0)]),
) as Record<SectionKey, number>;

const tz = 'Asia/Dhaka';
const at = (d: string) => new Date(`${d}T09:00:00+06:00`);
export const fmt = {
  long: (d: string) => at(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }),
  dayMonth: (d: string) => at(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz }),
  short: (d: string) => at(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: tz }).toUpperCase(),
  no: (n: number) => `No. ${String(n).padStart(3, '0')}`,
};

export const teamCount = (list: { team: Team }[], t: 'design' | 'dev') => list.filter((x) => x.team === t || x.team === 'both').length;

export const url = {
  issue: (d: string) => `/issue/${d}/`,
  story: (d: string, id: string) => `/issue/${d}/#${id}`,
  section: (k: string) => `/archive/?section=${k}`,
};
