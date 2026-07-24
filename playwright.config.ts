import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.APP_URL ?? "http://localhost:3100";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	timeout: 120_000,
	expect: {
		timeout: 30_000,
	},
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "bun --env-file=.env.e2e run dev:e2e",
		url: baseURL,
		reuseExistingServer: false,
		timeout: 120_000,
	},
});
