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

export const deckUrl = (id: string) => url(`/decks/${id}/`);
export const essayUrl = (id: string) => url(`/essays/${id}/`);
export const topicUrl = (id: string) => url(`/topics/${id}/`);

/** Drafts are visible in `astro dev` and excluded from production builds. */
const isVisible = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

/** Decks, most recently updated first. */
export async function getDecks(): Promise<CollectionEntry<'decks'>[]> {
  const decks = await getCollection('decks', isVisible);
  return decks.sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf());
}

/** Essays, newest first. */
export async function getEssays(): Promise<CollectionEntry<'essays'>[]> {
  const essays = await getCollection('essays', isVisible);
  return essays.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

/** Topics in the order they appear in topics.yaml. */
export async function getTopics(): Promise<CollectionEntry<'topics'>[]> {
  return getCollection('topics');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
