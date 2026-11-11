import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { expect, test } from 'vitest';
import { rehypeTaskLabels } from '../../src/lib/markdown/rehype-task-labels';

const render = (md: string) =>
	String(unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeTaskLabels).use(rehypeStringify).processSync(md));

test('checklist boxes get a label screen readers can announce', () => {
	const html = render('- [x] tuned\n- [ ] practised');
	expect(html).toContain('aria-label="done"');
	expect(html).toContain('aria-label="not done"');
});
