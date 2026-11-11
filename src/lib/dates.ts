// Dates in frontmatter (date: 2026-11-02) mean midnight UTC.
// Always format in UTC, or a computer in another timezone would show the previous day.

const monthDayFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: '2-digit' });

export function formatDate(date: Date, style: 'iso' | 'monthDay' | 'year'): string {
	if (style === 'iso') return date.toISOString().slice(0, 10); // 2026-11-02
	if (style === 'year') return String(date.getUTCFullYear()); // 2026
	return monthDayFormat.format(date); // Nov 02
}
