import { answersEqual } from "#/server/grading/normalize-answer";

export type QuestionResult = "correct" | "incorrect" | "pending";
export type AttemptGradeStatus = "pending_review" | "graded";

export type ShortTextAnswer = {
	type: "short_text";
	value: string;
};

export type NumberAnswer = {
	type: "number";
	value: string;
};

export type SingleChoiceAnswer = {
	type: "single_choice";
	optionId: string;
};

export type MultipleChoiceAnswer = {
	type: "multiple_choice";
	optionIds: string[];
};

export type FileUploadAnswer = {
	type: "file_upload";
	storageKey: string;
	filename: string;
	mime: string;
	size: number;
};

export type StudentAnswer =
	| ShortTextAnswer
	| NumberAnswer
	| SingleChoiceAnswer
	| MultipleChoiceAnswer
	| FileUploadAnswer;

export type GradedAnswer = StudentAnswer & {
	result: QuestionResult;
};

export type StudentAnswers = Record<string, StudentAnswer>;
export type GradedAnswers = Record<string, GradedAnswer>;

export type GradeableTest = {
	id: string;
	answerType: string;
	grading: string;
	correctAnswer: unknown;
};

export type GradeAttemptResult = {
	status: AttemptGradeStatus;
	answers: GradedAnswers;
	scorePercent: number;
	passed: boolean;
};

function sortedUnique(ids: string[]): string[] {
	return [...new Set(ids)].sort();
}

function arraysEqual(a: string[], b: string[]): boolean {
	const left = sortedUnique(a);
	const right = sortedUnique(b);
	if (left.length !== right.length) {
		return false;
	}
	return left.every((id, i) => id === right[i]);
}

function gradeAutoTest(
	test: GradeableTest,
	answer: StudentAnswer | undefined,
): QuestionResult {
	if (!answer) {
		return "incorrect";
	}

	switch (test.answerType) {
		case "short_text": {
			if (answer.type !== "short_text") {
				return "incorrect";
			}
			if (typeof test.correctAnswer !== "string") {
				return "incorrect";
			}
			return answersEqual(answer.value, test.correctAnswer)
				? "correct"
				: "incorrect";
		}
		case "number": {
			if (answer.type !== "number" && answer.type !== "short_text") {
				return "incorrect";
			}
			if (typeof test.correctAnswer !== "string") {
				return "incorrect";
			}
			const value =
				answer.type === "number" || answer.type === "short_text"
					? answer.value
					: "";
			return answersEqual(value, test.correctAnswer) ? "correct" : "incorrect";
		}
		case "single_choice": {
			if (answer.type !== "single_choice") {
				return "incorrect";
			}
			if (typeof test.correctAnswer !== "string") {
				return "incorrect";
			}
			return answer.optionId === test.correctAnswer ? "correct" : "incorrect";
		}
		case "multiple_choice": {
			if (answer.type !== "multiple_choice") {
				return "incorrect";
			}
			if (!Array.isArray(test.correctAnswer)) {
				return "incorrect";
			}
			const expected = test.correctAnswer.filter(
				(id): id is string => typeof id === "string",
			);
			return arraysEqual(answer.optionIds, expected) ? "correct" : "incorrect";
		}
		case "file_upload":
			return "pending";
		default:
			return "incorrect";
	}
}

function ensureAnswerPayload(
	test: GradeableTest,
	answer: StudentAnswer | undefined,
): StudentAnswer {
	if (answer) {
		return answer;
	}

	switch (test.answerType) {
		case "short_text":
			return { type: "short_text", value: "" };
		case "number":
			return { type: "number", value: "" };
		case "single_choice":
			return { type: "single_choice", optionId: "" };
		case "multiple_choice":
			return { type: "multiple_choice", optionIds: [] };
		case "file_upload":
			return {
				type: "file_upload",
				storageKey: "",
				filename: "",
				mime: "",
				size: 0,
			};
		default:
			return { type: "short_text", value: "" };
	}
}

function isManual(test: GradeableTest): boolean {
	return test.grading === "manual" || test.answerType === "file_upload";
}

/** Optimistic client insert: keep answer payloads, mark every result pending. */
export function markAnswersPending(answers: StudentAnswers): GradedAnswers {
	const graded: GradedAnswers = {};
	for (const [testId, answer] of Object.entries(answers)) {
		graded[testId] = { ...answer, result: "pending" };
	}
	return graded;
}

/**
 * Apply reviewer correct/incorrect outcomes onto stored graded answers.
 * Remaining `pending` results keep the attempt pending_review.
 */
export function applyReviewResults(
	answers: GradedAnswers,
	results: Record<string, "correct" | "incorrect">,
): { status: AttemptGradeStatus; answers: GradedAnswers } {
	const next: GradedAnswers = { ...answers };
	for (const [testId, result] of Object.entries(results)) {
		const existing = next[testId];
		if (!existing) {
			continue;
		}
		next[testId] = { ...existing, result };
	}
	const hasPending = Object.values(next).some((a) => a.result === "pending");
	return {
		status: hasPending ? "pending_review" : "graded",
		answers: next,
	};
}

export function computeScorePercent(answers: GradedAnswers): number {
	const values = Object.values(answers);
	if (values.length === 0) {
		return 0;
	}
	const correct = values.filter((a) => a.result === "correct").length;
	return Math.round((correct / values.length) * 100);
}

/**
 * Grade attempt answers against authoritative test rows (server-side only).
 * Manual / file_upload → pending. Overall pending_review if any pending.
 */
export function gradeAttempt(
	tests: GradeableTest[],
	answers: StudentAnswers,
	passPercent: number,
): GradeAttemptResult {
	const graded: GradedAnswers = {};
	let hasPending = false;

	for (const test of tests) {
		const raw = answers[test.id];
		const result = isManual(test)
			? ("pending" as const)
			: gradeAutoTest(test, raw);

		if (result === "pending") {
			hasPending = true;
		}

		graded[test.id] = {
			...ensureAnswerPayload(test, raw),
			result,
		};
	}

	const scorePercent = hasPending ? 0 : computeScorePercent(graded);
	const status: AttemptGradeStatus = hasPending ? "pending_review" : "graded";
	const passed = status === "graded" && scorePercent >= passPercent;

	return {
		status,
		answers: graded,
		scorePercent: hasPending ? 0 : scorePercent,
		passed,
	};
}

/** Recompute score/passed after review finishes. */
export function finalizeAttemptScore(
	answers: GradedAnswers,
	passPercent: number,
): { scorePercent: number; passed: boolean } {
	const scorePercent = computeScorePercent(answers);
	return {
		scorePercent,
		passed: scorePercent >= passPercent,
	};
}
