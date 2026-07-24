import { describe, expect, test } from "bun:test";
import { sanitizePracticeDoc } from "#/features/lesson-editor/lib/sanitize-practice-doc";

describe("sanitizePracticeDoc", () => {
	test("strips correctAnswer from all question node types", () => {
		const doc = {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [{ type: "text", text: "Практика" }],
				},
				{
					type: "shortTextQuestion",
					attrs: {
						questionId: "q1",
						prompt: "2+2?",
						grading: "auto",
						correctAnswer: "4",
					},
				},
				{
					type: "singleChoiceQuestion",
					attrs: {
						questionId: "q2",
						prompt: "Выберите",
						options: [
							{ id: "a", label: "A" },
							{ id: "b", label: "B" },
						],
						grading: "auto",
						correctAnswer: "a",
					},
				},
				{
					type: "multipleChoiceQuestion",
					attrs: {
						questionId: "q3",
						prompt: "Несколько",
						options: [
							{ id: "a", label: "A" },
							{ id: "b", label: "B" },
						],
						grading: "auto",
						correctAnswer: ["a", "b"],
					},
				},
				{
					type: "fileUploadQuestion",
					attrs: {
						questionId: "q4",
						prompt: "Загрузите файл",
						grading: "manual",
						correctAnswer: null,
					},
				},
			],
		};

		const sanitized = sanitizePracticeDoc(doc);

		expect(sanitized).toEqual({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [{ type: "text", text: "Практика" }],
				},
				{
					type: "shortTextQuestion",
					attrs: {
						questionId: "q1",
						prompt: "2+2?",
						grading: "auto",
					},
				},
				{
					type: "singleChoiceQuestion",
					attrs: {
						questionId: "q2",
						prompt: "Выберите",
						options: [
							{ id: "a", label: "A" },
							{ id: "b", label: "B" },
						],
						grading: "auto",
					},
				},
				{
					type: "multipleChoiceQuestion",
					attrs: {
						questionId: "q3",
						prompt: "Несколько",
						options: [
							{ id: "a", label: "A" },
							{ id: "b", label: "B" },
						],
						grading: "auto",
					},
				},
				{
					type: "fileUploadQuestion",
					attrs: {
						questionId: "q4",
						prompt: "Загрузите файл",
						grading: "manual",
					},
				},
			],
		});
	});

	test("does not mutate the input document", () => {
		const doc = {
			type: "doc",
			content: [
				{
					type: "shortTextQuestion",
					attrs: {
						questionId: "q1",
						prompt: "x?",
						grading: "auto",
						correctAnswer: "secret",
					},
				},
			],
		};

		sanitizePracticeDoc(doc);

		expect(doc.content?.[0]?.attrs?.correctAnswer).toBe("secret");
	});

	test("returns empty doc for non-doc input", () => {
		expect(sanitizePracticeDoc(null)).toEqual({ type: "doc", content: [] });
		expect(sanitizePracticeDoc("oops")).toEqual({ type: "doc", content: [] });
		expect(sanitizePracticeDoc({ type: "paragraph" })).toEqual({
			type: "doc",
			content: [],
		});
	});

	test("walks nested content arrays", () => {
		const doc = {
			type: "doc",
			content: [
				{
					type: "bulletList",
					content: [
						{
							type: "listItem",
							content: [
								{
									type: "shortTextQuestion",
									attrs: {
										questionId: "nested",
										prompt: "?",
										grading: "manual",
										correctAnswer: "leak",
									},
								},
							],
						},
					],
				},
			],
		};

		const sanitized = sanitizePracticeDoc(doc);
		const nested = sanitized.content?.[0]?.content?.[0]?.content?.[0];
		expect(nested?.attrs).toEqual({
			questionId: "nested",
			prompt: "?",
			grading: "manual",
		});
		expect(nested?.attrs).not.toHaveProperty("correctAnswer");
	});
});
