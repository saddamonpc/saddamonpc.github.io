import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the built site, served by `astro preview`.
export default defineConfig({
	testDir: 'tests/e2e',
	use: { baseURL: 'http://localhost:4321' },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'npm run build && npm run preview -- --port 4321',
		url: 'http://localhost:4321',
		reuseExistingServer: false,
		timeout: 180_000,
	},
});
