/** Publish lifecycle for program / topic / lesson. */
export const PUBLISH_STATUSES = ["draft", "published"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

/** Activity kinds stored on `activity.type`. */
export const ACTIVITY_TYPES = ["theory", "practice"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Empty TipTap document used when creating an activity without content. */
export const EMPTY_TIPTAP_DOC: Record<string, unknown> = {
	type: "doc",
	content: [],
};

/** Submission lifecycle after practice submit / review. */
export const SUBMISSION_STATUSES = ["pending", "graded"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/** Per-question auto/manual review outcome (верно / неверно / ожидает). */
export const QUESTION_RESULTS = ["correct", "incorrect", "pending"] as const;
export type QuestionResult = (typeof QUESTION_RESULTS)[number];

/** Progress row status for activity / lesson progress. */
export const PROGRESS_STATUSES = [
	"not_started",
	"in_progress",
	"completed",
] as const;
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];
