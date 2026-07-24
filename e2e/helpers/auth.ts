import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type TestUser = {
	name: string;
	email: string;
	password: string;
};

export function uniqueUser(label: string): TestUser {
	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	return {
		name: label,
		email: `${label.toLowerCase()}-${id}@e2e.local`,
		password: "password123",
	};
}

async function openLogin(page: Page) {
	await page.goto("/login", { waitUntil: "domcontentloaded" });
	await expect(page.getByTestId("auth-submit")).toBeVisible();
	// Wait until client handlers are attached (SSR HTML exists earlier).
	await expect(async () => {
		await page.getByTestId("auth-mode-signup").click();
		await expect(
			page.getByRole("heading", { name: "Регистрация" }),
		).toBeVisible({ timeout: 1_500 });
	}).toPass({ timeout: 15_000 });
}

async function waitForChatShell(page: Page) {
	await page.waitForURL((url) => {
		const path = url.pathname;
		return path === "/" || path === "";
	});
	await expect(page.getByTestId("chat-logout")).toBeVisible({
		timeout: 60_000,
	});
}

export async function signup(page: Page, user: TestUser) {
	await openLogin(page);
	// openLogin leaves the form in signup mode
	await expect(page.getByTestId("auth-name")).toBeVisible();
	await page.getByTestId("auth-name").fill(user.name);
	await page.getByTestId("auth-email").fill(user.email);
	await page.getByTestId("auth-password").fill(user.password);

	const signupResponse = page.waitForResponse(
		(response) =>
			response.url().includes("/api/auth/") &&
			response.request().method() === "POST",
	);
	await page.getByTestId("auth-submit").click();
	const response = await signupResponse;
	expect(
		response.ok(),
		`signup failed: ${response.status()} ${await response.text()}`,
	).toBeTruthy();

	await waitForChatShell(page);
}

export async function login(page: Page, user: TestUser) {
	await page.goto("/login", { waitUntil: "domcontentloaded" });
	await expect(page.getByTestId("auth-submit")).toBeVisible();

	await expect(async () => {
		await page.getByTestId("auth-mode-signin").click();
		await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible({
			timeout: 1_500,
		});
	}).toPass({ timeout: 15_000 });

	await page.getByTestId("auth-email").fill(user.email);
	await page.getByTestId("auth-password").fill(user.password);

	const loginResponse = page.waitForResponse(
		(response) =>
			response.url().includes("/api/auth/") &&
			response.request().method() === "POST",
	);
	await page.getByTestId("auth-submit").click();
	const response = await loginResponse;
	expect(
		response.ok(),
		`login failed: ${response.status()} ${await response.text()}`,
	).toBeTruthy();

	await waitForChatShell(page);
}

export async function logout(page: Page) {
	await page.getByTestId("chat-logout").click();
	await page.waitForURL((url) => url.pathname.includes("/login"));
	await expect(page.getByTestId("auth-submit")).toBeVisible();
}
