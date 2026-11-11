// Checklist boxes (- [x] / - [ ]) come out of Markdown without a label, so screen readers just say "checkbox".
// This names each one "done" or "not done". Hand-written: no package for this exists (checked 2026-11-11).
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypeTaskLabels() {
	return (tree: Root) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'input' && node.properties.type === 'checkbox') {
				node.properties.ariaLabel = node.properties.checked ? 'done' : 'not done';
			}
		});
	};
}
