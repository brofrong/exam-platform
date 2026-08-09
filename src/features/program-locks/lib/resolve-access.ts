import {
	computeTopicProgressPercent,
	isLessonAccessible,
	isLessonUnlocked,
	isTopicUnlocked,
	type LockMode,
	type UnlockBlocker,
} from "#/features/program-locks/lib/unlock";
import { LOCK_MODES } from "#/server/zero/constants";

function asLockMode(value: string | null | undefined): LockMode {
	if (value && (LOCK_MODES as readonly string[]).includes(value)) {
		return value as LockMode;
	}
	return "open";
}

type ProgramLockInput = {
	topicLockMode?: string | null;
	lessonLockMode?: string | null;
	unlockThresholdPercent?: number | null;
	topics?: ReadonlyArray<{
		id: string;
		title: string;
		position: number;
		topicLessons?: ReadonlyArray<{
			position: number;
			lesson?: {
				id: string;
				title: string;
				status?: string | null;
			} | null;
		}> | null;
	}> | null;
	topicLockEdges?: ReadonlyArray<{
		blockerTopicId: string;
		topicId: string;
	}> | null;
	lessonLockEdges?: ReadonlyArray<{
		topicId: string;
		blockerLessonId: string;
		lessonId: string;
	}> | null;
};

export type LessonAccessResult = {
	unlocked: boolean;
	threshold: number;
	topicBlockers: UnlockBlocker[];
	lessonBlockers: UnlockBlocker[];
	topicId: string | null;
};

export function formatLockHint(args: {
	threshold: number;
	topicBlockers: ReadonlyArray<UnlockBlocker>;
	lessonBlockers: ReadonlyArray<UnlockBlocker>;
}): string {
	const parts = [
		...args.topicBlockers.map(
			(blocker) => `${blocker.title} (${blocker.percent}%)`,
		),
		...args.lessonBlockers.map(
			(blocker) => `${blocker.title} (${blocker.percent}%)`,
		),
	];
	if (parts.length === 0) {
		return `Нужно ≥ ${args.threshold}%`;
	}
	return `Нужно ≥ ${args.threshold}% по: ${parts.join(", ")}`;
}

export function resolveLessonAccess(args: {
	program: ProgramLockInput;
	lessonId: string;
	lessonProgressById: Readonly<Record<string, number>>;
}): LessonAccessResult {
	const threshold = args.program.unlockThresholdPercent ?? 80;
	const topicMode = asLockMode(args.program.topicLockMode);
	const lessonMode = asLockMode(args.program.lessonLockMode);
	const topics = [...(args.program.topics ?? [])].sort(
		(a, b) => a.position - b.position,
	);

	const topicProgressById: Record<string, number> = {};
	for (const topic of topics) {
		const lessons = [...(topic.topicLessons ?? [])]
			.map((link) => link.lesson)
			.filter((lesson): lesson is NonNullable<typeof lesson> => lesson != null)
			.map((lesson) => ({
				status: lesson.status ?? "published",
				percent: args.lessonProgressById[lesson.id] ?? 0,
			}));
		topicProgressById[topic.id] = computeTopicProgressPercent(lessons);
	}

	let containingTopic: (typeof topics)[number] | null = null;
	for (const topic of topics) {
		const hasLesson = (topic.topicLessons ?? []).some(
			(link) => link.lesson?.id === args.lessonId,
		);
		if (hasLesson) {
			containingTopic = topic;
			break;
		}
	}

	if (!containingTopic) {
		return {
			unlocked: false,
			threshold,
			topicBlockers: [],
			lessonBlockers: [],
			topicId: null,
		};
	}

	const topicResult = isTopicUnlocked({
		mode: topicMode,
		threshold,
		topicId: containingTopic.id,
		topics: topics.map((topic) => ({
			id: topic.id,
			title: topic.title,
			position: topic.position,
		})),
		topicProgressById,
		edges: args.program.topicLockEdges ?? [],
	});

	const topicLessons = [...(containingTopic.topicLessons ?? [])]
		.sort((a, b) => a.position - b.position)
		.flatMap((link) => {
			if (!link.lesson) return [];
			return [
				{
					id: link.lesson.id,
					title: link.lesson.title,
					position: link.position,
				},
			];
		});

	const lessonResult = isLessonUnlocked({
		mode: lessonMode,
		threshold,
		lessonId: args.lessonId,
		lessons: topicLessons,
		lessonProgressById: args.lessonProgressById,
		edges: (args.program.lessonLockEdges ?? []).filter(
			(edge) => edge.topicId === containingTopic.id,
		),
	});

	const access = isLessonAccessible({
		topicUnlocked: topicResult.unlocked,
		lessonUnlocked: lessonResult.unlocked,
		topicBlockers: topicResult.blockers,
		lessonBlockers: lessonResult.blockers,
	});

	return {
		unlocked: access.unlocked,
		threshold,
		topicBlockers: access.topicBlockers,
		lessonBlockers: access.lessonBlockers,
		topicId: containingTopic.id,
	};
}

export function resolveTopicAccess(args: {
	program: ProgramLockInput;
	topicId: string;
	lessonProgressById: Readonly<Record<string, number>>;
}): { unlocked: boolean; blockers: UnlockBlocker[]; threshold: number } {
	const threshold = args.program.unlockThresholdPercent ?? 80;
	const topicMode = asLockMode(args.program.topicLockMode);
	const topics = [...(args.program.topics ?? [])].sort(
		(a, b) => a.position - b.position,
	);
	const topicProgressById: Record<string, number> = {};
	for (const topic of topics) {
		const lessons = [...(topic.topicLessons ?? [])]
			.map((link) => link.lesson)
			.filter((lesson): lesson is NonNullable<typeof lesson> => lesson != null)
			.map((lesson) => ({
				status: lesson.status ?? "published",
				percent: args.lessonProgressById[lesson.id] ?? 0,
			}));
		topicProgressById[topic.id] = computeTopicProgressPercent(lessons);
	}

	const result = isTopicUnlocked({
		mode: topicMode,
		threshold,
		topicId: args.topicId,
		topics: topics.map((topic) => ({
			id: topic.id,
			title: topic.title,
			position: topic.position,
		})),
		topicProgressById,
		edges: args.program.topicLockEdges ?? [],
	});

	return {
		unlocked: result.unlocked,
		blockers: result.blockers,
		threshold,
	};
}
