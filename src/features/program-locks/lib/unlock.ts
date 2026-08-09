export type LockMode = "open" | "sequential" | "graph";

export type UnlockBlocker = {
	id: string;
	title: string;
	percent: number;
};

export type UnlockResult = {
	unlocked: boolean;
	blockers: UnlockBlocker[];
};

type OrderedNode = {
	id: string;
	position: number;
	title: string;
};

function progressOf(
	progressById: Readonly<Record<string, number>>,
	id: string,
): number {
	return progressById[id] ?? 0;
}

export function computeTopicProgressPercent(
	lessons: ReadonlyArray<{ status: string; percent: number }>,
): number {
	const published = lessons.filter((lesson) => lesson.status === "published");
	if (published.length === 0) {
		return 0;
	}
	const sum = published.reduce((acc, lesson) => acc + lesson.percent, 0);
	return Math.round(sum / published.length);
}

function isOpenUnlocked(): UnlockResult {
	return { unlocked: true, blockers: [] };
}

function isSequentialUnlocked(args: {
	threshold: number;
	nodeId: string;
	nodes: ReadonlyArray<OrderedNode>;
	progressById: Readonly<Record<string, number>>;
}): UnlockResult {
	const ordered = [...args.nodes].sort((a, b) => a.position - b.position);
	const index = ordered.findIndex((node) => node.id === args.nodeId);
	if (index <= 0) {
		return { unlocked: true, blockers: [] };
	}
	const previous = ordered[index - 1];
	if (!previous) {
		return { unlocked: true, blockers: [] };
	}
	const percent = progressOf(args.progressById, previous.id);
	if (percent >= args.threshold) {
		return { unlocked: true, blockers: [] };
	}
	return {
		unlocked: false,
		blockers: [{ id: previous.id, title: previous.title, percent }],
	};
}

function isGraphUnlocked(args: {
	threshold: number;
	nodeId: string;
	nodes: ReadonlyArray<OrderedNode>;
	progressById: Readonly<Record<string, number>>;
	blockerIds: ReadonlyArray<string>;
}): UnlockResult {
	if (args.blockerIds.length === 0) {
		return { unlocked: true, blockers: [] };
	}
	const byId = new Map(args.nodes.map((node) => [node.id, node] as const));
	const blockers: UnlockBlocker[] = [];
	for (const blockerId of args.blockerIds) {
		const percent = progressOf(args.progressById, blockerId);
		if (percent >= args.threshold) {
			continue;
		}
		const node = byId.get(blockerId);
		blockers.push({
			id: blockerId,
			title: node?.title ?? blockerId,
			percent,
		});
	}
	return { unlocked: blockers.length === 0, blockers };
}

export function isTopicUnlocked(args: {
	mode: LockMode;
	threshold: number;
	topicId: string;
	topics: ReadonlyArray<OrderedNode>;
	topicProgressById: Readonly<Record<string, number>>;
	edges: ReadonlyArray<{ blockerTopicId: string; topicId: string }>;
}): UnlockResult {
	if (args.mode === "open") {
		return isOpenUnlocked();
	}
	if (args.mode === "sequential") {
		return isSequentialUnlocked({
			threshold: args.threshold,
			nodeId: args.topicId,
			nodes: args.topics,
			progressById: args.topicProgressById,
		});
	}
	const blockerIds = args.edges
		.filter((edge) => edge.topicId === args.topicId)
		.map((edge) => edge.blockerTopicId);
	return isGraphUnlocked({
		threshold: args.threshold,
		nodeId: args.topicId,
		nodes: args.topics,
		progressById: args.topicProgressById,
		blockerIds,
	});
}

export function isLessonUnlocked(args: {
	mode: LockMode;
	threshold: number;
	lessonId: string;
	lessons: ReadonlyArray<OrderedNode>;
	lessonProgressById: Readonly<Record<string, number>>;
	edges: ReadonlyArray<{ blockerLessonId: string; lessonId: string }>;
}): UnlockResult {
	if (args.mode === "open") {
		return isOpenUnlocked();
	}
	if (args.mode === "sequential") {
		return isSequentialUnlocked({
			threshold: args.threshold,
			nodeId: args.lessonId,
			nodes: args.lessons,
			progressById: args.lessonProgressById,
		});
	}
	const blockerIds = args.edges
		.filter((edge) => edge.lessonId === args.lessonId)
		.map((edge) => edge.blockerLessonId);
	return isGraphUnlocked({
		threshold: args.threshold,
		nodeId: args.lessonId,
		nodes: args.lessons,
		progressById: args.lessonProgressById,
		blockerIds,
	});
}

export function isLessonAccessible(args: {
	topicUnlocked: boolean;
	lessonUnlocked: boolean;
	topicBlockers: ReadonlyArray<UnlockBlocker>;
	lessonBlockers: ReadonlyArray<UnlockBlocker>;
}): {
	unlocked: boolean;
	topicBlockers: UnlockBlocker[];
	lessonBlockers: UnlockBlocker[];
} {
	return {
		unlocked: args.topicUnlocked && args.lessonUnlocked,
		topicBlockers: [...args.topicBlockers],
		lessonBlockers: [...args.lessonBlockers],
	};
}
