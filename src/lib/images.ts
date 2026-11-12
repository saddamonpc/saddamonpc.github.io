// What the posts page's picture strip shows: every picture, video and YouTube video in a post.
// Pictures are shrunk to three sizes; YouTube's still picture is downloaded and shrunk too, so
// visitors' browsers never ask YouTube for anything until they press play.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { dirname, posix } from 'node:path';
import type { MediaRef } from './markdown/remark-post-meta';
import { entryUrl } from './content';

export interface StripItem {
	kind: 'image' | 'video' | 'youtube';
	thumb: string; // tiny thumbnail in the strip (a video file is its own thumbnail: it shows its first frame)
	preview: string; // bigger version shown on hover (a video file plays there, silently)
	full: string; // what the viewer shows: the full-size picture, the video file, or the YouTube player's address
	width: number; // full size of a picture (videos fill the viewer instead)
	height: number;
	caption: string;
}

// Every picture under src/content, so a post's "./photo.jpg" can be turned into an optimisable image.
const contentImages = import.meta.glob<ImageMetadata>('/src/content/**/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}', {
	eager: true,
	import: 'default',
});

const ABSOLUTE = /^[a-z][a-z0-9+.-]*:/i; // https:, data:, ...

/** The cover (if any) first, then the post's own pictures and videos in order. Missing pictures are skipped with a warning. */
export async function stripItems(entry: CollectionEntry<'posts'>, refs: MediaRef[]): Promise<StripItem[]> {
	const filePath = entry.filePath ?? '';
	const folder = `/${dirname(filePath).replaceAll('\\', '/')}`;
	const cover = entry.data.cover ? [await pictureItem(entry.data.cover, 'Header image')] : [];
	const items = await Promise.all(
		refs.map(async (ref, i): Promise<StripItem | null> => {
			const number = cover.length + i + 1;
			if (ref.kind === 'youtube') return youTubeItem(ref.src, ref.alt || 'YouTube video');
			if (ref.kind === 'video') {
				// Video files are copied to the post's own address (see astro.config.mjs).
				const src = ABSOLUTE.test(ref.src) ? ref.src : encodeURI(posix.join(entryUrl('posts', entry.id), decodeURI(ref.src)));
				return { kind: 'video', thumb: src, preview: src, full: src, width: 0, height: 0, caption: ref.alt || `Video ${number}` };
			}
			const image = contentImages[posix.join(folder, decodeURI(ref.src))];
			if (!image) console.warn(`[images] ${filePath}: picture not found: ${ref.src}`);
			return image ? pictureItem(image, ref.alt || `Picture ${number}`) : null;
		}),
	);
	return [...cover, ...items.filter((item) => item !== null)];
}

async function pictureItem(image: ImageMetadata, caption: string): Promise<StripItem> {
	const fullWidth = Math.min(1600, image.width);
	const [thumb, preview, full] = await Promise.all([
		getImage({ src: image, width: 120 }),
		getImage({ src: image, width: 520 }),
		getImage({ src: image, width: fullWidth }),
	]);
	return {
		kind: 'image',
		thumb: thumb.src,
		preview: preview.src,
		full: full.src,
		width: fullWidth,
		height: Math.round((image.height * fullWidth) / image.width),
		caption,
	};
}

// A plain dark box, for when YouTube's still can't be downloaded (no internet, or YouTube blocked).
const BLANK_STILL = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="68"><rect width="120" height="68" fill="#1f2422"/></svg>')}`;

async function youTubeItem(id: string, caption: string): Promise<StripItem> {
	const still = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`; // YouTube's 320×180 still (allowed in astro.config.mjs)
	const full = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
	const reachable = await fetch(still, { method: 'HEAD', signal: AbortSignal.timeout(5000) }).then((r) => r.ok, () => false);
	if (!reachable) {
		console.warn(`[images] couldn't download YouTube's still for ${id}: showing a plain box instead`);
		return { kind: 'youtube', thumb: BLANK_STILL, preview: BLANK_STILL, full, width: 0, height: 0, caption };
	}
	const [thumb, preview] = await Promise.all([getImage({ src: still, width: 120, height: 68 }), getImage({ src: still, width: 320, height: 180 })]);
	return { kind: 'youtube', thumb: thumb.src, preview: preview.src, full, width: 0, height: 0, caption };
}
