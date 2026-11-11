import { expect, test } from 'vitest';
import { formatDate } from '../../src/lib/dates';

// Frontmatter dates are UTC midnight. They must never shift a day, whatever timezone builds the site.
test('formats midnight UTC without shifting the day', () => {
	const d = new Date('2026-11-02T00:00:00Z');
	expect(formatDate(d, 'iso')).toBe('2026-11-02');
	expect(formatDate(d, 'monthDay')).toBe('Nov 02');
});

test('formats the year', () => {
	expect(formatDate(new Date('2026-01-01T00:00:00Z'), 'year')).toBe('2026');
});
