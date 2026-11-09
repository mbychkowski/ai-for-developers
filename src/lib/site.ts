import fs from 'node:fs';
import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE_TITLE = 'AI for Developers';
export const SITE_DESCRIPTION = 'Decks and Essays on building software with AI.';

/**
 * Prefix an internal path with the configured `base` (e.g. `/ai-for-developers`).
 * Always use this for internal links so a future custom domain only needs a config change.
 */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export const essayUrl = (id: string) => url(`/essays/${id}/`);
export const topicUrl = (id: string) => url(`/topics/${id}/`);

/** Drafts are visible in `astro dev` and excluded from production builds. */
const isVisible = ({ data }: { data: { draft?: boolean } }) => import.meta.env.DEV || !data.draft;

/** Essays, newest first. */
export async function getEssays(): Promise<CollectionEntry<'essays'>[]> {
  const essays = await getCollection('essays', isVisible);
  return essays.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

/**
 * Topics in the order they appear in topics.yaml.
 * Astro's content layer stores entries in SQLite, which defaults to primary key (id)
 * ordering. We scan the top-level keys in topics.yaml to preserve the curated list order.
 */
export async function getTopics(): Promise<CollectionEntry<'topics'>[]> {
  const topics = await getCollection('topics');
  const contentDir = process.env.CONTENT_DIR || 'src/content';
  const yamlPath = `${contentDir}/topics.yaml`;
  try {
    const raw = fs.readFileSync(yamlPath, 'utf8');
    const order: string[] = [];
    for (const line of raw.split('\n')) {
      const match = line.match(/^([a-z0-9-]+):/);
      if (match && match[1] !== 'id') {
        order.push(match[1]);
      }
    }
    const orderMap = new Map(order.map((id, index) => [id, index]));
    return topics.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
  } catch {
    return topics;
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
