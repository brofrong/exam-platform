import type { TestAnswerType } from "#/server/zero/constants";

/** Minimal shape needed from a `testAttemptAnswer` row for aggregation. */
export type AttemptAnswerLike = {
	result: string;
	answer?: unknown;
};

export type TestStats = {
	total: number;
	correct: number;
	incorrect: number;
	pending: number;
	/** Share of graded (correct + incorrect) answers that were incorrect, 0–100. */
	errorRate: number;
	/** `optionId` → selection count. Only set for single/multiple choice. */
	choiceCounts?: Record<string, number>;
	/** Most frequent free-text answers. Only set for short_text/number. */
	topAnswers?: Array<{ value: string; count: number }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function extractChoiceIds(answer: unknown): string[] {
	if (!isRecord(answer)) {
		return [];
	}
	if (answer.type === "single_choice" && typeof answer.optionId === "string") {
		return [answer.optionId];
	}
	if (answer.type === "multiple_choice" && Array.isArray(answer.optionIds)) {
		return answer.optionIds.filter(
			(id): id is string => typeof id === "string",
		);
	}
	return [];
}

function extractTextValue(answer: unknown): string | null {
	if (!isRecord(answer)) {
		return null;
	}
	if (
		(answer.type === "short_text" || answer.type === "number") &&
		typeof answer.value === "string"
	) {
		return answer.value;
	}
	return null;
}

const TOP_ANSWERS_LIMIT = 5;

/** Aggregate raw attempt answers into correct/incorrect/pending counts + insight. */
export function computeTestStats(
	answers: ReadonlyArray<AttemptAnswerLike>,
	answerType?: TestAnswerType,
): TestStats {
	let correct = 0;
	let incorrect = 0;
	let pending = 0;
	const choiceCounts: Record<string, number> = {};
	const textCounts = new Map<string, number>();

	for (const row of answers) {
		if (row.result === "correct") {
			correct += 1;
		} else if (row.result === "incorrect") {
			incorrect += 1;
		} else {
			pending += 1;
		}

		if (answerType === "single_choice" || answerType === "multiple_choice") {
			for (const id of extractChoiceIds(row.answer)) {
				choiceCounts[id] = (choiceCounts[id] ?? 0) + 1;
			}
		}
		if (answerType === "short_text" || answerType === "number") {
			const value = extractTextValue(row.answer);
			if (value && value.trim().length > 0) {
				textCounts.set(value, (textCounts.get(value) ?? 0) + 1);
			}
		}
	}

	const total = answers.length;
	const graded = correct + incorrect;
	const errorRate = graded > 0 ? Math.round((incorrect / graded) * 100) : 0;

	const topAnswers =
		textCounts.size > 0
			? [...textCounts.entries()]
					.sort((a, b) => b[1] - a[1])
					.slice(0, TOP_ANSWERS_LIMIT)
					.map(([value, count]) => ({ value, count }))
			: undefined;

	return {
		total,
		correct,
		incorrect,
		pending,
		errorRate,
		choiceCounts:
			answerType === "single_choice" || answerType === "multiple_choice"
				? choiceCounts
				: undefined,
		topAnswers,
	};
}
