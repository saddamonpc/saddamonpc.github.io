import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the built site, served by `astro preview`.
export default defineConfig({
	testDir: 'tests/e2e',
	// On Windows, Chromium sometimes crashes while starting (exit 0xC0000005): retry once locally. CI (Linux) never retries.
	retries: process.env.CI ? 0 : 1,
	use: { baseURL: 'http://localhost:4321' },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'npm run build && npm run preview -- --port 4321',
		url: 'http://localhost:4321',
		env: { SHOW_DRAFTS: '1' }, // the sample post and project are drafts
		reuseExistingServer: false,
		timeout: 180_000,
	},
});
