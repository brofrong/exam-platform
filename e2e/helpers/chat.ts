import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function createChat(page: Page, title: string) {
	await page.getByTestId("chat-new").click();
	await page.getByTestId("chat-create-title").fill(title);
	await page.getByTestId("chat-create-submit").click();
	await expect(
		page.getByTestId("chat-list-item").filter({ hasText: title }),
	).toBeVisible();
}

export async function openChat(page: Page, title: string) {
	const item = page.getByTestId("chat-list-item").filter({ hasText: title });
	await expect(item).toBeVisible();
	await item.click();
	await expect(page.getByTestId("chat-message-input")).toBeVisible();
}

export async function sendMessage(page: Page, content: string) {
	await page.getByTestId("chat-message-input").fill(content);
	await page.getByTestId("chat-send").click();
	await expect(
		page.getByTestId("chat-message").filter({ hasText: content }),
	).toBeVisible();
}

export async function expectMessageVisible(page: Page, content: string) {
	await expect(
		page.getByTestId("chat-message").filter({ hasText: content }),
	).toBeVisible();
}
