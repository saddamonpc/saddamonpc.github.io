// Dates in frontmatter (date: 2026-11-02) mean midnight UTC.
// Always format in UTC, or a computer in another timezone would show the previous day.

const formats = {
	long: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }), // 2 November 2026
	short: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }), // 2 Nov 2026
	dayMonth: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short' }), // 2 Nov
	monthYear: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'short', year: 'numeric' }), // Nov 2026
	year: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', year: 'numeric' }), // 2026
};

export function formatDate(date: Date, style: keyof typeof formats): string {
	return formats[style].format(date);
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** "Six-minute read". Numbers up to ten are written as words, larger ones as digits ("25-minute read"). */
export function readingTime(minutes: number): string {
	const number = WORDS[minutes] ?? String(minutes);
	return `${number.charAt(0).toUpperCase()}${number.slice(1)}-minute read`;
}
