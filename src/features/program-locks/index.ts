export {
	type GraphEdge,
	assertAcyclicEdges,
} from "#/features/program-locks/lib/lock-graph";
export {
	type LockMode,
	type UnlockBlocker,
	type UnlockResult,
	computeTopicProgressPercent,
	isLessonAccessible,
	isLessonUnlocked,
	isTopicUnlocked,
} from "#/features/program-locks/lib/unlock";
