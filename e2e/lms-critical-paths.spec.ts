import { expect, test } from "@playwright/test";
import { promoteToAdmin } from "./helpers/admin";
import {
	login,
	logout,
	signup,
	signupFromCurrentLogin,
	uniqueUser,
} from "./helpers/auth";
import {
	configurePracticeActivity,
	createActivity,
	createInviteForProgram,
	createLesson,
	createProgram,
	createShortTextTestGroup,
	createTopic,
	editTheoryActivity,
	linkLessonToTopic,
	uniqueTitle,
} from "./helpers/lms";

/**
 * Critical LMS paths:
 * 1. Admin creates a test group + short-text test, program/topic/lesson/
 *    theory(+practice linked to the test group), and publishes
 * 2. Invite → student activates → sees program
 * 3. Student completes practice test attempt (and theory «Изучено»)
 * 4. Manual file submission → admin review: skipped (MinIO/file path flaky for e2e)
 * 5. Support message round-trip
 */
test.describe("lms critical paths", () => {
	test("admin publish, invite, student progress, support", async ({ page }) => {
		test.setTimeout(240_000);

		const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
		const admin = uniqueUser(`Admin${runId}`);
		const student = uniqueUser(`Student${runId}`);
		const programTitle = uniqueTitle("E2E Program");
		const topicTitle = uniqueTitle("E2E Topic");
		const lessonTitle = uniqueTitle("E2E Lesson");
		const testGroupTitle = uniqueTitle("E2E Test Group");
		const theoryBody = `Теория ${runId}`;
		const practiceAnswer = `ответ-${runId}`;
		const practicePrompt = `Сколько будет? (${runId})`;
		const studentSupportMsg = `Привет от ученика ${runId}`;
		const adminSupportMsg = `Ответ админа ${runId}`;

		// ── 1. Admin signup + promote ─────────────────────────────────────
		await signup(page, admin);
		promoteToAdmin(admin.email);
		await logout(page);
		await login(page, admin);

		// StudentShell hides AppHeader / UserMenu on /app — go to admin by URL.
		await page.goto("/admin", { waitUntil: "domcontentloaded" });
		await expect(page.getByTestId("admin-shell")).toBeVisible();

		// ── Test group with one auto-graded short-text question ───────────
		await createShortTextTestGroup(page, {
			groupTitle: testGroupTitle,
			prompt: practicePrompt,
			correctAnswer: practiceAnswer,
		});

		// ── Lesson + theory + practice (linked to the test group) ─────────
		const lessonId = await createLesson(page, lessonTitle);
		await createActivity(page, "Теория");
		await editTheoryActivity(page, theoryBody);
		await createActivity(page, "Практика");
		await configurePracticeActivity(page, {
			groupTitle: testGroupTitle,
			questionCount: 1,
			passPercent: 100,
		});
		await page.getByTestId(`lesson-detail-publish-${lessonId}`).click();
		await expect(
			page
				.getByTestId("admin-lesson-detail")
				.locator('[data-status="published"]')
				.first(),
		).toBeVisible();

		// ── Program + topic + link + publish ──────────────────────────────
		const programId = await createProgram(page, {
			title: programTitle,
			subject: "Математика",
			description: `E2E ${runId}`,
		});
		await createTopic(page, topicTitle);
		await linkLessonToTopic(page, {
			topicTitle,
			lessonTitle,
		});

		const topicPane = page
			.getByTestId("admin-programs-workspace")
			.getByTestId("topic-pane");
		const topicPublishId = await topicPane
			.locator("[data-testid^='topic-publish-']")
			.getAttribute("data-testid");
		expect(topicPublishId).toBeTruthy();
		await page.getByTestId(topicPublishId as string).click();
		await expect(
			topicPane.locator('[data-status="published"]').first(),
		).toBeVisible();

		await page.getByTestId(`tree-folder-program:${programId}`).click();
		const programDetail = page
			.getByTestId("admin-programs-workspace")
			.getByTestId("admin-program-detail");
		await expect(programDetail).toBeVisible();
		await page.getByTestId(`program-detail-publish-${programId}`).click();
		await expect(
			programDetail.locator('[data-status="published"]').first(),
		).toBeVisible();

		// ── 2. Invite ─────────────────────────────────────────────────────
		const inviteUrl = await createInviteForProgram(page, {
			programTitle,
			inviteeName: student.name,
			inviteeEmail: student.email,
		});

		await logout(page);

		// Student opens invite → signup → activate → home
		await page.goto(inviteUrl);
		await page.waitForURL((url) => url.pathname.includes("/login"));
		await signupFromCurrentLogin(page, student);
		await page.waitForURL(
			(url) => url.pathname === "/app" || url.pathname === "/app/",
			{ timeout: 60_000 },
		);
		await expect(page.getByTestId("home-shell")).toBeVisible({
			timeout: 60_000,
		});
		await page.goto("/app/programs", { waitUntil: "domcontentloaded" });
		await expect(page.getByTestId("student-programs-list")).toBeVisible({
			timeout: 60_000,
		});
		await expect(
			page.getByTestId("student-programs-list").getByText(programTitle),
		).toBeVisible();

		// ── 3. Progress: open lesson, theory + practice ───────────────────
		await page
			.getByTestId("student-programs-list")
			.locator("[data-slot='program-card']")
			.filter({ hasText: programTitle })
			.getByTestId("program-card-open")
			.click();
		await expect(page.getByTestId("student-program-outline")).toBeVisible();
		await expect(page.getByText(topicTitle)).toBeVisible();

		await page.goto(`/app/programs/${programId}/lessons/${lessonId}`, {
			waitUntil: "domcontentloaded",
		});
		await expect(page).toHaveURL(
			new RegExp(`/app/programs/${programId}/lessons/${lessonId}`),
		);
		await expect(
			page
				.getByTestId("lesson-player")
				.or(page.getByTestId("lesson-player-missing")),
		).toBeVisible({ timeout: 60_000 });
		await expect(page.getByTestId("lesson-player")).toBeVisible();

		const markStudied = page.locator("[data-testid^='mark-studied-']");
		await expect(markStudied).toBeVisible();
		await markStudied.click();
		await expect(page.locator("[data-testid^='studied-note-']")).toBeVisible();

		await expect(page.getByTestId("practice-activity")).toBeVisible();
		await page.getByTestId("practice-start").click();
		await expect(page.getByTestId("practice-attempt-form")).toBeVisible();
		await page.getByTestId("short-text-answer-input").fill(practiceAnswer);
		await page.getByTestId("practice-submit").click();
		await expect(page.getByTestId("practice-attempt-result")).toBeVisible();
		await expect(page.getByText("Пройдено")).toBeVisible();

		// ── 4. Manual file / admin review: skipped ─────────────────────────
		// File-upload + MinIO review path is intentionally not covered here —
		// e2e compose has MinIO, but multi-step upload/review is brittle without
		// dedicated fixtures. Prefer short_text auto practice above.

		// ── 5. Support round-trip ─────────────────────────────────────────
		await page.goto("/app/support");
		await expect(page.getByTestId("student-support-page")).toBeVisible();
		await expect(page.getByTestId("support-chat-panel")).toBeVisible({
			timeout: 60_000,
		});
		await page.getByTestId("support-message-input").fill(studentSupportMsg);
		await page.getByTestId("support-send").click();
		await expect(
			page.getByTestId("support-message-body").filter({
				hasText: studentSupportMsg,
			}),
		).toBeVisible();

		await logout(page);
		await login(page, admin);

		await page.goto("/admin/support");
		await expect(page.getByTestId("admin-support-inbox")).toBeVisible();
		await expect(page.getByTestId("support-thread-list")).toBeVisible();
		await page
			.getByTestId("support-thread-list")
			.getByRole("button")
			.filter({ hasText: student.name })
			.click();
		await expect(page.getByTestId("admin-support-thread")).toBeVisible();
		await expect(
			page.getByTestId("support-message-body").filter({
				hasText: studentSupportMsg,
			}),
		).toBeVisible();

		await page.getByTestId("support-message-input").fill(adminSupportMsg);
		await page.getByTestId("support-send").click();
		await expect(
			page.getByTestId("support-message-body").filter({
				hasText: adminSupportMsg,
			}),
		).toBeVisible();

		await logout(page);
		await login(page, student);
		await page.goto("/app/support");
		await expect(
			page.getByTestId("support-message-body").filter({
				hasText: adminSupportMsg,
			}),
		).toBeVisible();
	});
});
