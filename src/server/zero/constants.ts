/** Publish lifecycle for program / topic / lesson / test_group. */
export const PUBLISH_STATUSES = ["draft", "published"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

/** Activity kinds stored on `activity.type`. */
export const ACTIVITY_TYPES = ["theory", "practice"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Empty TipTap document used when creating theory / test prompts. */
export const EMPTY_TIPTAP_DOC: Record<string, unknown> = {
	type: "doc",
	content: [],
};

/** Test answer kinds. */
export const TEST_ANSWER_TYPES = [
	"single_choice",
	"multiple_choice",
	"short_text",
	"number",
	"file_upload",
] as const;
export type TestAnswerType = (typeof TEST_ANSWER_TYPES)[number];

/** Auto vs manual grading on a test. */
export const TEST_GRADING = ["auto", "manual"] as const;
export type TestGrading = (typeof TEST_GRADING)[number];

/** Attempt lifecycle. */
export const TEST_ATTEMPT_STATUSES = [
	"in_progress",
	"pending_review",
	"graded",
] as const;
export type TestAttemptStatus = (typeof TEST_ATTEMPT_STATUSES)[number];

/** Per-test auto/manual review outcome. */
export const QUESTION_RESULTS = ["correct", "incorrect", "pending"] as const;
export type QuestionResult = (typeof QUESTION_RESULTS)[number];

/** Progress row status for activity / lesson progress. */
export const PROGRESS_STATUSES = [
	"not_started",
	"in_progress",
	"completed",
] as const;
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];
