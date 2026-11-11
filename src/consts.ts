// Site-wide values. Import them anywhere with `import { SITE_TITLE } from '../consts'`.

export const SITE_TITLE = 'M. Saddam Mashuri';
export const FULL_NAME = 'Mohammad Saddam Mashuri';
export const SITE_DESCRIPTION = 'Personal site of Mohammad Saddam Mashuri: thoughts, guitar, 3D, drawing, and code.';

export type NavKey = 'home' | 'posts' | 'projects' | 'cv';

// The navbar, in order. Adding a page (for example a contact page) is one more line here.
export const NAV_LINKS: { key: NavKey; label: string; href: string }[] = [
	{ key: 'home', label: 'home', href: '/' },
	{ key: 'posts', label: 'posts', href: '/posts/' },
	{ key: 'projects', label: 'projects', href: '/projects/' },
	{ key: 'cv', label: 'cv / résumé', href: '/cv/' },
];

export const SOCIALS = {
	email: 'mailto:saddamonpc@gmail.com',
	github: 'https://github.com/saddamonpc',
	linkedin: 'https://www.linkedin.com/in/mohammad-saddam-mashuri/',
};
