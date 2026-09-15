import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	reporter: 'line',
	use: { baseURL: 'http://127.0.0.1:4321', trace: 'retain-on-failure' },
	webServer: {
		command: 'npx http-server dist -p 4321 -c-1',
		url: 'http://127.0.0.1:4321',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
