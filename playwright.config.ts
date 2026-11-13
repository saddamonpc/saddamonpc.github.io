import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the built site, served by `astro preview`.
// On their own port, so they can run while `npm run dev` (port 4321) is open.
const URL = 'http://localhost:4329';

export default defineConfig({
	testDir: 'tests/e2e',
	// On Windows, Chromium sometimes crashes while starting (exit 0xC0000005): retry once locally. CI (Linux) never retries.
	retries: process.env.CI ? 0 : 1,
	use: { baseURL: URL },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'npm run build && npm run preview -- --port 4329',
		url: URL,
		env: { SHOW_DRAFTS: '1' }, // the sample post and project are drafts
		reuseExistingServer: false,
		timeout: 180_000,
	},
});
