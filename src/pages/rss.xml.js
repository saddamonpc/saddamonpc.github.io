// The RSS feed at /rss.xml, so people can follow new posts in a feed reader.
import rss from '@astrojs/rss';
import { render } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPublished } from '../lib/collections';
import { entryUrl } from '../lib/content';

export async function GET(context) {
	const posts = await getPublished('posts');
	const items = await Promise.all(
		posts.map(async (post) => {
			const { remarkPluginFrontmatter } = await render(post);
			return {
				title: post.data.title,
				pubDate: post.data.date,
				link: entryUrl('posts', post.id),
				description: remarkPluginFrontmatter.excerpt,
			};
		}),
	);
	return rss({ title: SITE_TITLE, description: SITE_DESCRIPTION, site: context.site, items });
}
