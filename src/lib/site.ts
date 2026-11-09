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

/** Essays, newest first. */
export async function getEssays(): Promise<CollectionEntry<'essays'>[]> {
  const essays = await getCollection('essays');
  return essays.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
