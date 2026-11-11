/** How many items use each tag, most used first, ties in alphabetical order. */
export function countTags(items: { tags: string[] }[]): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const item of items) {
		for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
