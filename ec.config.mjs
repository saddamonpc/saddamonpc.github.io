// Code blocks: colours, line numbers, wrapping, copy button and language badge.
// Powered by Expressive Code (https://expressive-code.com) and two of its plugins.
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { defineEcConfig } from 'astro-expressive-code';
import { pluginLanguageBadge } from 'expressive-code-language-badge';

export default defineEcConfig({
	// Everforest: a green-tinted dark theme that sits well with the site's palette.
	themes: ['everforest-dark'],
	plugins: [pluginLineNumbers(), pluginLanguageBadge({ textTransform: 'lowercase' })],
	defaultProps: {
		showLineNumbers: true,
		// Long lines wrap; their extra rows line up under the code, not under the line numbers.
		wrap: true,
		preserveIndent: true,
	},
	styleOverrides: {
		borderColor: 'var(--color-line)',
		borderRadius: '6px',
		codeBackground: 'var(--color-code)',
		codeFontFamily: 'var(--font-mono)',
		uiFontFamily: 'var(--font-mono)',
		frames: {
			shadowColor: 'transparent',
			editorBackground: 'var(--color-code)',
			terminalBackground: 'var(--color-code)',
		},
		// The language name, top-right: plain grey text, like a label rather than a button.
		languageBadge: {
			fontSize: '0.7rem',
			fontWeight: '400',
			fontColor: 'var(--color-muted)',
			background: 'transparent',
			borderWidth: '0',
			opacity: '1',
		},
	},
});
