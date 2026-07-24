import { test } from "@playwright/test";
import { login, logout, signup, uniqueUser } from "./helpers/auth";

test.describe("auth smoke", () => {
	test("signup, logout, and login", async ({ page }) => {
		const user = uniqueUser("AuthSmoke");

		await signup(page, user);
		await logout(page);
		await login(page, user);
	});
});
