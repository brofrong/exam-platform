import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export function uniqueTitle(label: string): string {
	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	return `${label} ${id}`;
}

export async function selectRadixOption(
	page: Page,
	triggerTestId: string,
	optionLabel: string,
) {
	await page.getByTestId(triggerTestId).click();
	await page.getByRole("option", { name: optionLabel }).click();
}

export async function waitForPath(page: Page, pattern: RegExp) {
	await page.waitForURL((url) => pattern.test(url.pathname));
	const match = page.url().match(pattern);
	expect(match?.[1]).toBeTruthy();
	return match?.[1] as string;
}

export async function fillTipTap(
	page: Page,
	editorTestId: string,
	text: string,
) {
	const editor = page.getByTestId(editorTestId);
	await expect(editor).toBeVisible();
	await editor.click();
	await page.keyboard.type(text);
}

/** Reload until the detail shell is present (mutation flushed via Zero). */
async function reloadUntilVisible(page: Page, testId: string, heading: string) {
	await expect(async () => {
		await page.reload({ waitUntil: "domcontentloaded" });
		await expect(page.getByTestId(testId)).toBeVisible({ timeout: 10_000 });
		await expect(page.getByRole("heading", { name: heading })).toBeVisible({
			timeout: 5_000,
		});
	}).toPass({ timeout: 60_000 });
}

/** Create program → land on detail; returns programId. */
export async function createProgram(
	page: Page,
	opts: { title: string; subject: string; description?: string },
) {
	await page.goto("/admin/programs");
	await expect(page.getByTestId("admin-programs-workspace")).toBeVisible();
	await page.getByTestId("program-create-open").click();
	await expect(page.getByTestId("program-form-dialog")).toBeVisible();
	await page.getByTestId("program-title-input").fill(opts.title);
	if (opts.description) {
		await page.getByTestId("program-description-input").fill(opts.description);
	}
	await page.getByTestId("program-subject-input").fill(opts.subject);
	await page.getByTestId("program-form-submit").click();
	const programId = await waitForPath(page, /\/admin\/programs\/([^/?#]+)/);
	await expect(page.getByTestId("admin-program-detail")).toBeVisible();
	await expect(page.getByRole("heading", { name: opts.title })).toBeVisible();
	await reloadUntilVisible(page, "admin-program-detail", opts.title);
	return programId;
}

export async function createTopic(page: Page, title: string) {
	await page.getByTestId("topic-create-open").click();
	await expect(page.getByTestId("topic-create-dialog")).toBeVisible();
	await page.getByTestId("topic-title-input").fill(title);
	await page.getByTestId("topic-create-submit").click();
	await expect(page.getByTestId("topic-create-dialog")).toBeHidden();
	await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
}

/** Create lesson → land on detail; returns lessonId. */
export async function createLesson(page: Page, title: string) {
	await page.goto("/admin/lessons");
	await expect(page.getByTestId("admin-lessons-list")).toBeVisible();
	await page.getByTestId("lesson-create-open").click();
	await expect(page.getByTestId("lesson-form-dialog")).toBeVisible();
	await page.getByTestId("lesson-title-input").fill(title);
	await page.getByTestId("lesson-form-submit").click();
	const lessonId = await waitForPath(page, /\/admin\/lessons\/([^/?#]+)/);
	await expect(page.getByTestId("admin-lesson-detail")).toBeVisible();
	await expect(page.getByRole("heading", { name: title })).toBeVisible();
	await reloadUntilVisible(page, "admin-lesson-detail", title);
	return lessonId;
}

export async function createActivity(page: Page, type: "Теория" | "Практика") {
	await page.getByTestId("activity-create-open").click();
	await expect(page.getByTestId("activity-create-dialog")).toBeVisible();
	if (type !== "Теория") {
		await selectRadixOption(page, "activity-type-select", type);
	}
	await page.getByTestId("activity-create-submit").click();
	await expect(page.getByTestId("activity-create-dialog")).toBeHidden();
	await expect(page.getByTestId("activities-list")).toBeVisible();
}

export async function editTheoryActivity(page: Page, body: string) {
	const editLink = page
		.getByTestId("activities-list")
		.getByRole("link", { name: "Редактировать" })
		.first();
	await editLink.click();
	await expect(page.getByTestId("admin-activity-edit")).toBeVisible();
	await fillTipTap(page, "theory-editor-content", body);
	await page.getByTestId("activity-content-submit").click();
	await expect(page.getByTestId("admin-lesson-detail")).toBeVisible();
}

/** Create a test group with a single short-text auto-graded test. Returns groupId. */
export async function createShortTextTestGroup(
	page: Page,
	opts: { groupTitle: string; prompt: string; correctAnswer: string },
) {
	await page.goto("/admin/tests");
	await expect(page.getByTestId("admin-test-groups-list")).toBeVisible();
	const createOpen = (await page.getByTestId("test-group-create-open").count())
		? page.getByTestId("test-group-create-open")
		: page.getByTestId("test-group-create-empty");
	await createOpen.click();
	await expect(page.getByTestId("test-group-form-dialog")).toBeVisible();
	await page.getByTestId("test-group-title-input").fill(opts.groupTitle);
	await page.getByTestId("test-group-form-submit").click();
	const groupId = await waitForPath(page, /\/admin\/tests\/([^/?#]+)/);
	await expect(page.getByTestId("admin-test-group-detail")).toBeVisible();

	const addTestOpen = (await page.getByTestId("test-add-open").count())
		? page.getByTestId("test-add-open")
		: page.getByTestId("test-add-open-empty");
	await addTestOpen.click();
	await expect(page.getByTestId("add-test-dialog")).toBeVisible();
	await selectRadixOption(page, "add-test-answer-type", "Короткий текст");
	await page.getByTestId("add-test-submit").click();
	await expect(page.getByTestId("admin-test-edit")).toBeVisible();

	await fillTipTap(page, "theory-editor-content", opts.prompt);
	await page.getByTestId("short-text-answer-input").fill(opts.correctAnswer);
	await page.getByTestId("test-edit-submit").click();
	await expect(page.getByTestId("admin-test-group-detail")).toBeVisible();

	return groupId;
}

/** Link a lesson's practice activity to an existing test group. */
export async function configurePracticeActivity(
	page: Page,
	opts: { groupTitle: string; questionCount?: number; passPercent?: number },
) {
	const editLinks = page
		.getByTestId("activities-list")
		.getByRole("link", { name: "Редактировать" });
	await editLinks.last().click();
	await expect(page.getByTestId("admin-activity-edit")).toBeVisible();
	await expect(page.getByTestId("practice-config-form")).toBeVisible();

	await page.getByTestId("practice-pick-group").click();
	await expect(page.getByTestId("select-test-group-dialog")).toBeVisible();
	await page.getByTestId("select-test-group-create").click();
	await selectRadixOption(page, "select-test-group-picker", opts.groupTitle);
	await page.getByTestId("select-test-group-confirm").click();
	await expect(page.getByTestId("select-test-group-dialog")).toBeHidden();
	await expect(page.getByTestId("practice-selected-group")).toContainText(
		opts.groupTitle,
	);

	if (opts.questionCount != null) {
		await page
			.getByTestId("practice-question-count")
			.fill(String(opts.questionCount));
	}
	if (opts.passPercent != null) {
		await page
			.getByTestId("practice-pass-percent")
			.fill(String(opts.passPercent));
	}

	await page.getByTestId("practice-config-submit").click();
	await expect(page.getByTestId("admin-lesson-detail")).toBeVisible();
}

export async function linkLessonToTopic(
	page: Page,
	opts: { topicTitle: string; lessonTitle: string },
) {
	await page
		.getByTestId("admin-program-detail")
		.getByRole("button", { name: opts.topicTitle, exact: true })
		.click();
	await expect(page.getByTestId("topic-pane")).toBeVisible();
	await page
		.getByTestId("topic-pane")
		.getByRole("button", { name: /Урок/ })
		.click();
	await expect(page.getByTestId("add-lesson-dialog")).toBeVisible();
	await page.getByTestId("add-lesson-pick-existing").click();
	await selectRadixOption(page, "add-lesson-filter", "Все уроки");
	await selectRadixOption(page, "add-lesson-select", opts.lessonTitle);
	await page.getByTestId("add-lesson-link-submit").click();
	await expect(page.getByTestId("add-lesson-dialog")).toBeHidden();
	await expect(
		page.getByTestId("topic-pane").getByText(opts.lessonTitle, { exact: true }),
	).toBeVisible();
}

export async function createInviteForProgram(
	page: Page,
	opts: { programTitle: string; inviteeName?: string; inviteeEmail?: string },
) {
	await page.goto("/admin/invites");
	await expect(page.getByTestId("admin-invites-page")).toBeVisible();
	if (opts.inviteeName) {
		await page.getByTestId("invite-invitee-name").fill(opts.inviteeName);
	}
	if (opts.inviteeEmail) {
		await page.getByTestId("invite-invitee-email").fill(opts.inviteeEmail);
	}
	await page.getByLabel(opts.programTitle, { exact: true }).click();
	await page.getByTestId("invite-create-submit").click();
	await expect(page.getByTestId("invite-created")).toBeVisible();
	const url = (await page.getByTestId("invite-created-url").innerText()).trim();
	expect(url).toContain("/invite/");
	return url;
}
