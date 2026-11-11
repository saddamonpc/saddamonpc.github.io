import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPublished } from '../lib/collections';
import { entryUrl } from '../lib/content';

export async function GET(context) {
	const posts = await getPublished('posts');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({ title: post.data.title, pubDate: post.data.date, link: entryUrl('posts', post.id) })),
	});
}
