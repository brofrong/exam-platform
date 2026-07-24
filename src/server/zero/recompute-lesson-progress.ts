import {
	PROGRESS_STATUSES,
	type ProgressStatus,
} from "#/server/zero/constants";

export type LessonProgressAggregate = {
	percent: number;
	status: ProgressStatus;
	completedAt: number | null;
};

/**
 * Lesson percent = completed activities / total activities in the lesson
 * (0–100). Empty lessons stay at 0% / not_started.
 */
export function aggregateLessonProgress(
	totalActivities: number,
	completedActivities: number,
	now = Date.now(),
): LessonProgressAggregate {
	if (totalActivities <= 0) {
		return { percent: 0, status: "not_started", completedAt: null };
	}
	const completed = Math.max(0, Math.min(completedActivities, totalActivities));
	const percent = (completed / totalActivities) * 100;
	if (completed >= totalActivities) {
		return { percent: 100, status: "completed", completedAt: now };
	}
	if (completed > 0) {
		return { percent, status: "in_progress", completedAt: null };
	}
	return { percent: 0, status: "not_started", completedAt: null };
}

export function isProgressStatus(value: string): value is ProgressStatus {
	return (PROGRESS_STATUSES as readonly string[]).includes(value);
}
