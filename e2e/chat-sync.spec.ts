import { expect, test } from "@playwright/test";
import { login, logout, signup, uniqueUser } from "./helpers/auth";
import {
	createChat,
	expectMessageVisible,
	openChat,
	sendMessage,
} from "./helpers/chat";

test.describe("chat sync between two users", () => {
	test("signup, logout, login, create chat, exchange messages", async ({
		browser,
	}) => {
		const userA = uniqueUser("Alice");
		const userB = uniqueUser("Bob");
		const chatTitle = `E2E Chat ${Date.now()}`;
		const messageFromA = `Hello from A ${Date.now()}`;
		const messageFromB = `Hello from B ${Date.now()}`;

		const contextA = await browser.newContext();
		const contextB = await browser.newContext();
		const pageA = await contextA.newPage();
		const pageB = await contextB.newPage();

		try {
			await signup(pageA, userA);
			await logout(pageA);
			await login(pageA, userA);
			await createChat(pageA, chatTitle);

			await signup(pageB, userB);
			await openChat(pageB, chatTitle);

			await sendMessage(pageA, messageFromA);
			await expectMessageVisible(pageB, messageFromA);

			await sendMessage(pageB, messageFromB);
			await expectMessageVisible(pageA, messageFromB);

			await expectMessageVisible(pageA, messageFromA);
			await expectMessageVisible(pageB, messageFromB);
			await expect(pageA.getByTestId("chat-message")).toHaveCount(2);
			await expect(pageB.getByTestId("chat-message")).toHaveCount(2);
		} finally {
			await contextA.close();
			await contextB.close();
		}
	});
});
