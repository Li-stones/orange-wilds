import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const sourceSchema = z.object({
	title: z.string().min(1),
	url: z.url(),
});

const garden = defineCollection({
	loader: glob({ base: './src/content/garden', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string().min(1),
		publishedAt: z.coerce.date(),
		updatedAt: z.coerce.date().optional(),
		kind: z.enum(['encounter', 'work', 'question', 'revision']),
		summary: z.string().min(1),
		tags: z.array(z.string().min(1)).default([]),
		sources: z.array(sourceSchema).optional(),
		related: z.array(z.string().min(1)).optional(),
		supersedes: z.string().min(1).optional(),
		draft: z.boolean(),
	}),
});

export const collections = { garden };
