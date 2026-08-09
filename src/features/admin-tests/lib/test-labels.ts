import type { TestAnswerType, TestGrading } from "#/server/zero/constants";

export const ANSWER_TYPE_LABELS: Record<TestAnswerType, string> = {
	single_choice: "Один из списка",
	multiple_choice: "Несколько из списка",
	short_text: "Короткий текст",
	number: "Число",
	file_upload: "Файл",
};

export const GRADING_LABELS: Record<TestGrading, string> = {
	auto: "Авто",
	manual: "Вручную",
};

export function requiresOptions(answerType: TestAnswerType): boolean {
	return answerType === "single_choice" || answerType === "multiple_choice";
}

export function supportsCorrectAnswer(answerType: TestAnswerType): boolean {
	return answerType !== "file_upload";
}

/** Russian pluralization for "тест" counts (1 тест, 2 теста, 5 тестов). */
export function pluralizeTests(count: number): string {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) {
		return "тест";
	}
	if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
		return "теста";
	}
	return "тестов";
}
