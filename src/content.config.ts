import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** The curated Topic list. Adding a Topic = adding an entry to topics.yaml. */
const topics = defineCollection({
  loader: file('src/content/topics.yaml'),
  schema: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

/** One or more Topics; an unknown Topic id fails the build. */
const topicRefs = z.array(reference('topics')).min(1);

/** Decks: one folder per Deck, `decks/<deck>/index.mdx`. The folder name is the id. */
const decks = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './src/content/decks',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Decks are evergreen: revised in place, so they carry a last-updated date. */
    updated: z.coerce.date(),
    topics: topicRefs,
    draft: z.boolean().default(false),
  }),
});

/** Essays: one file each, `essays/<essay>.md`. The filename is the id. */
const essays = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Essays are dated: published once. */
    published: z.coerce.date(),
    topics: topicRefs,
    draft: z.boolean().default(false),
  }),
});

export const collections = { topics, decks, essays };
