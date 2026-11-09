import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const contentDir = process.env.CONTENT_DIR || 'src/content';

/** The curated Topic list. Adding a Topic = adding an entry to topics.yaml. */
const topics = defineCollection({
  loader: file(`${contentDir}/topics.yaml`),
  schema: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

/** One or more Topics; an unknown Topic id fails the build. */
const topicRefs = z.array(reference('topics')).min(1);

/** Essays: one file each, `essays/<essay>.md`. The filename is the id. */
const essays = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: `./${contentDir}/essays` }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Essays are dated: published once. */
    published: z.coerce.date(),
    topics: topicRefs,
    draft: z.boolean().default(false),
  }),
});

export const collections = { topics, essays };
