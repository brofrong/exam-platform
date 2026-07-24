import type { ProgressStatus } from "#/server/zero/constants";
import type { StatusVariant } from "@/components/lms";

export type OutlineLesson = {
	readonly id: string;
	readonly title: string;
	readonly activities?: ReadonlyArray<{
		readonly id: string;
		readonly type: string;
		readonly position: number;
	}> | null;
};

export type OutlineTopic = {
	readonly id: string;
	readonly title: string;
	readonly position: number;
	readonly topicLessons?: ReadonlyArray<{
		readonly position: number;
		readonly lesson?: OutlineLesson | null;
	}> | null;
};

export type OutlineProgram = {
	readonly id: string;
	readonly title: string;
	readonly topics?: ReadonlyArray<OutlineTopic> | null;
};

export type LessonProgressRow = {
	readonly userId: string;
	readonly programId: string;
	readonly lessonId: string;
	readonly status: string;
	readonly percent: number;
};

export type ActivityProgressRow = {
	readonly userId: string;
	readonly programId: string;
	readonly activityId: string;
	readonly status: string;
	readonly completedAt?: number | null;
};

const PROGRESS_BADGE: Record<
	ProgressStatus,
	{ status: StatusVariant; label: string }
> = {
	not_started: { status: "draft", label: "Не начато" },
	in_progress: { status: "pending", label: "В процессе" },
	completed: { status: "graded", label: "Завершено" },
};

export function flattenProgramLessons(
	program: OutlineProgram,
): OutlineLesson[] {
	const topics = [...(program.topics ?? [])].sort(
		(a, b) => a.position - b.position,
	);
	const lessons: OutlineLesson[] = [];
	for (const topic of topics) {
		const links = [...(topic.topicLessons ?? [])].sort(
			(a, b) => a.position - b.position,
		);
		for (const link of links) {
			if (link.lesson) {
				lessons.push(link.lesson);
			}
		}
	}
	return lessons;
}

export function programProgressPercent(
	program: OutlineProgram,
	lessonProgress: readonly LessonProgressRow[],
	userId: string,
): number {
	const lessons = flattenProgramLessons(program);
	if (lessons.length === 0) {
		return 0;
	}
	const byLesson = new Map(
		lessonProgress
			.filter((row) => row.programId === program.id && row.userId === userId)
			.map((row) => [row.lessonId, row.percent] as const),
	);
	const sum = lessons.reduce(
		(acc, lesson) => acc + (byLesson.get(lesson.id) ?? 0),
		0,
	);
	return Math.round(sum / lessons.length);
}

export function topicProgressPercent(
	topic: OutlineTopic,
	lessonProgress: readonly LessonProgressRow[],
	userId: string,
	programId: string,
): number {
	const links = [...(topic.topicLessons ?? [])]
		.sort((a, b) => a.position - b.position)
		.filter((link) => link.lesson != null);
	if (links.length === 0) {
		return 0;
	}
	const byLesson = new Map(
		lessonProgress
			.filter((row) => row.programId === programId && row.userId === userId)
			.map((row) => [row.lessonId, row.percent] as const),
	);
	const sum = links.reduce((acc, link) => {
		const lesson = link.lesson;
		if (!lesson) {
			return acc;
		}
		return acc + (byLesson.get(lesson.id) ?? 0);
	}, 0);
	return Math.round(sum / links.length);
}

export function formatLastActivity(
	activityProgress: readonly ActivityProgressRow[],
	userId: string,
	programId: string,
): string {
	const rows = activityProgress.filter(
		(row) => row.userId === userId && row.programId === programId,
	);
	const withTime = rows
		.filter((row) => row.completedAt != null)
		.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
	if (withTime.length === 0) {
		if (rows.some((row) => row.status === "in_progress")) {
			return "В процессе";
		}
		return "—";
	}
	return new Date(withTime[0].completedAt as number).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function progressStatusBadge(status: string): {
	status: StatusVariant;
	label: string;
} {
	if (status in PROGRESS_BADGE) {
		return PROGRESS_BADGE[status as ProgressStatus];
	}
	return PROGRESS_BADGE.not_started;
}

export function activityTypeLabel(type: string): string {
	if (type === "practice") {
		return "Практика";
	}
	if (type === "theory") {
		return "Теория";
	}
	return type;
}
