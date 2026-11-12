// photoswipe-video-plugin has no TypeScript types of its own.
declare module 'photoswipe-video-plugin' {
	import type PhotoSwipeLightbox from 'photoswipe/lightbox';
	export default class PhotoSwipeVideoPlugin {
		constructor(lightbox: PhotoSwipeLightbox, options: object);
	}
}
