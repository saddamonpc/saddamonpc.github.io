// Pictures for the posts page's picture strip: every local picture in a post, shrunk to three sizes.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { dirname, posix } from 'node:path';

export interface StripImage {
	thumb: string; // tiny thumbnail in the strip
	preview: string; // bigger version shown on hover
	full: string; // full size, for the viewer
	width: number;
	height: number;
	caption: string;
}

// Every picture under src/content, so a post's "./photo.jpg" can be turned into an optimisable image.
const contentImages = import.meta.glob<ImageMetadata>('/src/content/**/*.{jpg,jpeg,png,webp,avif,gif}', {
	eager: true,
	import: 'default',
});

/** Turns a post's picture paths (relative to the post) into images. Missing files are skipped with a warning. */
export function resolveEntryImages(filePath: string, refs: { url: string; alt: string }[]): { image: ImageMetadata; alt: string }[] {
	const folder = `/${dirname(filePath).replaceAll('\\', '/')}`;
	return refs.flatMap(({ url, alt }) => {
		const key = posix.join(folder, decodeURI(url));
		const image = contentImages[key];
		if (!image) console.warn(`[images] ${filePath}: picture not found: ${url}`);
		return image ? [{ image, alt }] : [];
	});
}

/** The cover (if any) first, then the post's own pictures in order. */
export async function stripImages(entry: CollectionEntry<'posts'>, refs: { url: string; alt: string }[]): Promise<StripImage[]> {
	const pictures = [
		...(entry.data.cover ? [{ image: entry.data.cover, alt: 'Header image' }] : []),
		...resolveEntryImages(entry.filePath ?? '', refs),
	];
	return Promise.all(
		pictures.map(async ({ image, alt }, i) => {
			const fullWidth = Math.min(1600, image.width);
			const [thumb, preview, full] = await Promise.all([
				getImage({ src: image, width: 120 }),
				getImage({ src: image, width: 520 }),
				getImage({ src: image, width: fullWidth }),
			]);
			return {
				thumb: thumb.src,
				preview: preview.src,
				full: full.src,
				width: fullWidth,
				height: Math.round((image.height * fullWidth) / image.width),
				caption: alt || `Picture ${i + 1}`,
			};
		}),
	);
}
