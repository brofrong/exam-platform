import type { AnswerOption } from "@/components/answer-widgets/types";

export type QuestionGrading = "auto" | "manual";

export type ShortTextCorrectAnswer = string | null;
export type SingleChoiceCorrectAnswer = string | null;
export type MultipleChoiceCorrectAnswer = string[] | null;

export type ShortTextQuestionAttrs = {
	questionId: string;
	prompt: string;
	grading: QuestionGrading;
	correctAnswer: ShortTextCorrectAnswer;
};

export type SingleChoiceQuestionAttrs = {
	questionId: string;
	prompt: string;
	options: AnswerOption[];
	grading: QuestionGrading;
	correctAnswer: SingleChoiceCorrectAnswer;
};

export type MultipleChoiceQuestionAttrs = {
	questionId: string;
	prompt: string;
	options: AnswerOption[];
	grading: QuestionGrading;
	correctAnswer: MultipleChoiceCorrectAnswer;
};

export type FileUploadQuestionAttrs = {
	questionId: string;
	prompt: string;
	grading: QuestionGrading;
	correctAnswer: null;
};

export type PracticeQuestionAttrs =
	| ShortTextQuestionAttrs
	| SingleChoiceQuestionAttrs
	| MultipleChoiceQuestionAttrs
	| FileUploadQuestionAttrs;

export function newQuestionId(): string {
	return crypto.randomUUID();
}

export function defaultChoiceOptions(): AnswerOption[] {
	return [
		{ id: crypto.randomUUID(), label: "Вариант 1" },
		{ id: crypto.randomUUID(), label: "Вариант 2" },
	];
}

export function defaultShortTextAttrs(
	partial?: Partial<ShortTextQuestionAttrs>,
): ShortTextQuestionAttrs {
	return {
		questionId: partial?.questionId ?? newQuestionId(),
		prompt: partial?.prompt ?? "Введите вопрос",
		grading: partial?.grading ?? "auto",
		correctAnswer: partial?.correctAnswer ?? "",
	};
}

export function defaultSingleChoiceAttrs(
	partial?: Partial<SingleChoiceQuestionAttrs>,
): SingleChoiceQuestionAttrs {
	const options = partial?.options ?? defaultChoiceOptions();
	return {
		questionId: partial?.questionId ?? newQuestionId(),
		prompt: partial?.prompt ?? "Выберите один вариант",
		options,
		grading: partial?.grading ?? "auto",
		correctAnswer: partial?.correctAnswer ?? options[0]?.id ?? null,
	};
}

export function defaultMultipleChoiceAttrs(
	partial?: Partial<MultipleChoiceQuestionAttrs>,
): MultipleChoiceQuestionAttrs {
	const options = partial?.options ?? defaultChoiceOptions();
	return {
		questionId: partial?.questionId ?? newQuestionId(),
		prompt: partial?.prompt ?? "Выберите один или несколько вариантов",
		options,
		grading: partial?.grading ?? "auto",
		correctAnswer:
			partial?.correctAnswer ?? (options[0] ? [options[0].id] : []),
	};
}

export function defaultFileUploadAttrs(
	partial?: Partial<FileUploadQuestionAttrs>,
): FileUploadQuestionAttrs {
	return {
		questionId: partial?.questionId ?? newQuestionId(),
		prompt: partial?.prompt ?? "Загрузите файл ответа",
		grading: partial?.grading ?? "manual",
		correctAnswer: null,
	};
}

export function parseOptions(value: unknown): AnswerOption[] {
	if (!Array.isArray(value)) {
		return defaultChoiceOptions();
	}
	const options: AnswerOption[] = [];
	for (const item of value) {
		if (
			item !== null &&
			typeof item === "object" &&
			"id" in item &&
			"label" in item &&
			typeof (item as { id: unknown }).id === "string" &&
			typeof (item as { label: unknown }).label === "string"
		) {
			options.push({
				id: (item as { id: string }).id,
				label: (item as { label: string }).label,
			});
		}
	}
	return options.length > 0 ? options : defaultChoiceOptions();
}

export function parseGrading(
	value: unknown,
	fallback: QuestionGrading,
): QuestionGrading {
	return value === "auto" || value === "manual" ? value : fallback;
}
