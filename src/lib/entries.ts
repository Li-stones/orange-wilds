import { getCollection, type CollectionEntry } from 'astro:content';

export type GardenEntry = CollectionEntry<'garden'>;
export type GardenKind = GardenEntry['data']['kind'];

export const kindLabels: Record<GardenKind, string> = {
	encounter: '停住',
	work: '做出来',
	question: '还没想明白',
	revision: '我改口了',
};

export async function getPublicEntries(kind?: GardenKind): Promise<GardenEntry[]> {
	const entries = await getCollection('garden', ({ data }) => !data.draft && (!kind || data.kind === kind));
	return entries.sort((a, b) => {
		const dateDifference = b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
		return dateDifference || a.id.localeCompare(b.id, 'zh-CN');
	});
}

export function getFeaturedEntry(entries: GardenEntry[]): GardenEntry | undefined {
	return entries.find((entry) => entry.data.featured) ?? entries[0];
}

export function getTimelineNeighbors(entries: GardenEntry[], id: string): { newer?: GardenEntry; older?: GardenEntry } {
	const index = entries.findIndex((entry) => entry.id === id);
	if (index < 0) return {};
	return {
		newer: index > 0 ? entries[index - 1] : undefined,
		older: index < entries.length - 1 ? entries[index + 1] : undefined,
	};
}

export function entryHref(entry: GardenEntry): string {
	return `/garden/${entry.id}/`;
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
}
