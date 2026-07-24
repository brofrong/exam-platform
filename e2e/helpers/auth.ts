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
		email: `${label.toLowerCase()}-${id}@example.com`,
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

async function waitForHomeShell(page: Page) {
	await page.waitForURL(
		(url) => url.pathname === "/app" || url.pathname === "/app/",
	);
	await expect(page.getByTestId("home-shell")).toBeVisible({
		timeout: 60_000,
	});
}

async function fillField(page: Page, testId: string, value: string) {
	const field = page.getByTestId(testId);
	await field.click();
	await field.fill("");
	await field.pressSequentially(value, { delay: 5 });
	await expect(field).toHaveValue(value);
}

/** Fill controlled auth inputs after hydration; retry if React resets values. */
async function fillAuthFields(
	page: Page,
	user: TestUser,
	mode: "signin" | "signup",
) {
	await expect(async () => {
		if (mode === "signup") {
			await expect(page.getByTestId("auth-name")).toBeVisible();
			await fillField(page, "auth-name", user.name);
		}
		await fillField(page, "auth-email", user.email);
		await fillField(page, "auth-password", user.password);
		await expect(page.getByTestId("auth-submit")).toBeEnabled({
			timeout: 1_500,
		});
	}).toPass({ timeout: 20_000 });
}

async function submitSignup(page: Page, user: TestUser) {
	await fillAuthFields(page, user, "signup");

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
}

export async function signup(page: Page, user: TestUser) {
	await openLogin(page);
	// openLogin leaves the form in signup mode
	await submitSignup(page, user);
	await waitForHomeShell(page);
}

/** Sign up on the current /login page (e.g. after invite redirect with returnUrl). */
export async function signupFromCurrentLogin(page: Page, user: TestUser) {
	await expect(page.getByTestId("auth-submit")).toBeVisible();
	await expect(async () => {
		await page.getByTestId("auth-mode-signup").click();
		await expect(
			page.getByRole("heading", { name: "Регистрация" }),
		).toBeVisible({ timeout: 1_500 });
	}).toPass({ timeout: 15_000 });
	await submitSignup(page, user);
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

	await fillAuthFields(page, user, "signin");

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

	await waitForHomeShell(page);
}

export async function logout(page: Page) {
	await page.getByTestId("nav-user-menu").click();
	await page.getByTestId("nav-logout").click();
	await page.waitForURL((url) => url.pathname.includes("/login"));
	await expect(page.getByTestId("auth-submit")).toBeVisible();
}
