import { expect, test } from 'vitest';
import { formatDate, readingTime } from '../../src/lib/dates';

// Frontmatter dates are UTC midnight. They must never shift a day, whatever timezone builds the site.
test('formats midnight UTC without shifting the day', () => {
	const d = new Date('2026-11-02T00:00:00Z');
	expect(formatDate(d, 'long')).toBe('2 November 2026');
	expect(formatDate(d, 'short')).toBe('2 Nov 2026');
	expect(formatDate(d, 'dayMonth')).toBe('2 Nov');
});

test('formats the year, and the month with the year', () => {
	expect(formatDate(new Date('2026-01-01T00:00:00Z'), 'year')).toBe('2026');
	expect(formatDate(new Date('2025-10-12T00:00:00Z'), 'monthYear')).toBe('Oct 2025');
	expect(formatDate(new Date('2025-09-12T00:00:00Z'), 'monthYear')).toBe('Sept 2025'); // British English shortens September to "Sept"
});

test('reading time is a phrase: words up to ten minutes, digits after', () => {
	expect(readingTime(1)).toBe('One-minute read');
	expect(readingTime(6)).toBe('Six-minute read');
	expect(readingTime(10)).toBe('Ten-minute read');
	expect(readingTime(25)).toBe('25-minute read');
});
