// Everything on the CV page (/cv/). Edit the values here; the page layout lives in src/pages/cv.astro.
// "(to fill in)" marks things only you know. Search for TODO(Saddam) to find them.

export interface CvEntry {
	title: string;
	org: string;
	location?: string;
	start: string;
	end: string; // 'present' = still ongoing (filled dot on the timeline)
	bullets?: string[];
	note?: string;
}

export interface Cv {
	name: string;
	role: string;
	updated: string; // YYYY-MM-DD
	links: { label: string; href: string }[];
	// Paths to the two PDFs, e.g. '/cv/mohammad-saddam-mashuri-cv.pdf' (put the files in public/cv/).
	// null = the button is greyed out and says "under construction".
	pdf: { cv: string | null; resume: string | null };
	about: string;
	experience: CvEntry[];
	education: CvEntry[];
	skills: { label: string; value: string }[];
	languages: { label: string; value: string }[];
}

export const cv: Cv = {
	name: 'Mohammad Saddam Mashuri',
	role: 'Backend Developer · 3D hobbyist · guitarist',
	updated: '2026-11-11',
	links: [
		{ label: 'email', href: 'mailto:saddamonpc@gmail.com' },
		{ label: 'github', href: 'https://github.com/saddamonpc' },
		{ label: 'linkedin', href: 'https://www.linkedin.com/in/mohammad-saddam-mashuri/' },
	],
	pdf: { cv: null, resume: null }, // TODO(Saddam): add the PDF paths when they're ready
	about:
		'Backend developer from Jakarta. I build APIs and look after databases by day, and sculpt, simulate and play guitar the rest of the time.',
	experience: [
		{
			title: 'Backend Developer',
			org: 'BNI Sekuritas',
			location: 'Jakarta, ID',
			start: '2025',
			end: 'present',
			bullets: ['Develop APIs for the BIONS trading application.', 'Maintain the BIONS backend and manage its databases.'],
		},
	],
	education: [
		{
			title: 'Computer Science',
			org: 'The Australian National University',
			location: 'Canberra, AU',
			start: '2022',
			end: '2025',
			note: 'Double-degree program. Degree name (to fill in).', // TODO(Saddam)
		},
		{ title: 'Computer Science', org: 'Universitas Indonesia', location: 'Depok, ID', start: '2019', end: '2025' },
	],
	skills: [
		{ label: 'Programming', value: '(to fill in)' }, // TODO(Saddam)
		{ label: 'Data', value: '(to fill in)' }, // TODO(Saddam)
		{ label: 'CG software', value: 'ZBrush, SideFX Houdini' },
		{ label: 'Other', value: 'Guitar, drawing' },
	],
	languages: [
		{ label: 'Indonesian', value: 'Native' },
		{ label: 'English', value: '(to fill in)' }, // TODO(Saddam)
	],
};
