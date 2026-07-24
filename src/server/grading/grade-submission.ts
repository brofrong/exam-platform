import { answersEqual } from "#/server/grading/normalize-answer";

export type QuestionResult = "correct" | "incorrect" | "pending";
export type SubmissionStatus = "pending" | "graded";

export type ShortTextAnswer = {
	type: "short_text";
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
	| SingleChoiceAnswer
	| MultipleChoiceAnswer
	| FileUploadAnswer;

export type GradedAnswer = StudentAnswer & {
	result: QuestionResult;
};

export type StudentAnswers = Record<string, StudentAnswer>;
export type GradedAnswers = Record<string, GradedAnswer>;

export type GradeSubmissionResult = {
	status: SubmissionStatus;
	answers: GradedAnswers;
};

type QuestionNodeType =
	| "shortTextQuestion"
	| "singleChoiceQuestion"
	| "multipleChoiceQuestion"
	| "fileUploadQuestion";

type ExtractedQuestion = {
	questionId: string;
	nodeType: QuestionNodeType;
	grading: "auto" | "manual";
	correctAnswer: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isQuestionNodeType(type: unknown): type is QuestionNodeType {
	return (
		type === "shortTextQuestion" ||
		type === "singleChoiceQuestion" ||
		type === "multipleChoiceQuestion" ||
		type === "fileUploadQuestion"
	);
}

function collectQuestions(node: unknown, out: ExtractedQuestion[]): void {
	if (!isRecord(node)) {
		return;
	}

	if (isQuestionNodeType(node.type) && isRecord(node.attrs)) {
		const questionId = node.attrs.questionId;
		if (typeof questionId === "string" && questionId.length > 0) {
			const grading =
				node.attrs.grading === "manual" || node.type === "fileUploadQuestion"
					? "manual"
					: "auto";
			out.push({
				questionId,
				nodeType: node.type,
				grading,
				correctAnswer: node.attrs.correctAnswer ?? null,
			});
		}
	}

	if (Array.isArray(node.content)) {
		for (const child of node.content) {
			collectQuestions(child, out);
		}
	}
}

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

function gradeAutoQuestion(
	question: ExtractedQuestion,
	answer: StudentAnswer | undefined,
): QuestionResult {
	if (!answer) {
		return "incorrect";
	}

	switch (question.nodeType) {
		case "shortTextQuestion": {
			if (answer.type !== "short_text") {
				return "incorrect";
			}
			if (typeof question.correctAnswer !== "string") {
				return "incorrect";
			}
			return answersEqual(answer.value, question.correctAnswer)
				? "correct"
				: "incorrect";
		}
		case "singleChoiceQuestion": {
			if (answer.type !== "single_choice") {
				return "incorrect";
			}
			if (typeof question.correctAnswer !== "string") {
				return "incorrect";
			}
			return answer.optionId === question.correctAnswer
				? "correct"
				: "incorrect";
		}
		case "multipleChoiceQuestion": {
			if (answer.type !== "multiple_choice") {
				return "incorrect";
			}
			if (!Array.isArray(question.correctAnswer)) {
				return "incorrect";
			}
			const expected = question.correctAnswer.filter(
				(id): id is string => typeof id === "string",
			);
			return arraysEqual(answer.optionIds, expected) ? "correct" : "incorrect";
		}
		case "fileUploadQuestion":
			return "pending";
	}
}

function ensureAnswerPayload(
	question: ExtractedQuestion,
	answer: StudentAnswer | undefined,
): StudentAnswer {
	if (answer) {
		return answer;
	}

	switch (question.nodeType) {
		case "shortTextQuestion":
			return { type: "short_text", value: "" };
		case "singleChoiceQuestion":
			return { type: "single_choice", optionId: "" };
		case "multipleChoiceQuestion":
			return { type: "multiple_choice", optionIds: [] };
		case "fileUploadQuestion":
			return {
				type: "file_upload",
				storageKey: "",
				filename: "",
				mime: "",
				size: 0,
			};
	}
}

/** Optimistic client insert: keep answer payloads, mark every result pending. */
export function markAnswersPending(answers: StudentAnswers): GradedAnswers {
	const graded: GradedAnswers = {};
	for (const [questionId, answer] of Object.entries(answers)) {
		graded[questionId] = { ...answer, result: "pending" };
	}
	return graded;
}

/**
 * Apply reviewer correct/incorrect outcomes onto stored graded answers.
 * Remaining `pending` results keep the submission pending.
 */
export function applyReviewResults(
	answers: GradedAnswers,
	results: Record<string, "correct" | "incorrect">,
): GradeSubmissionResult {
	const next: GradedAnswers = { ...answers };
	for (const [questionId, result] of Object.entries(results)) {
		const existing = next[questionId];
		if (!existing) {
			continue;
		}
		next[questionId] = { ...existing, result };
	}
	const hasPending = Object.values(next).some((a) => a.result === "pending");
	return {
		status: hasPending ? "pending" : "graded",
		answers: next,
	};
}

/**
 * Grade practice answers against the full TipTap activity content
 * (including `correctAnswer` attrs — server-side only).
 *
 * Auto short/choice → correct|incorrect. Manual and file_upload → pending.
 * Overall status is `pending` if any question is pending, else `graded`.
 */
export function gradeSubmission(
	content: unknown,
	answers: StudentAnswers,
): GradeSubmissionResult {
	const questions: ExtractedQuestion[] = [];
	collectQuestions(content, questions);

	const graded: GradedAnswers = {};
	let hasPending = false;

	for (const question of questions) {
		const raw = answers[question.questionId];
		const result =
			question.grading === "manual" ||
			question.nodeType === "fileUploadQuestion"
				? ("pending" as const)
				: gradeAutoQuestion(question, raw);

		if (result === "pending") {
			hasPending = true;
		}

		graded[question.questionId] = {
			...ensureAnswerPayload(question, raw),
			result,
		};
	}

	return {
		status: hasPending ? "pending" : "graded",
		answers: graded,
	};
}
