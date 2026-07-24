import { describe, expect, test } from "bun:test";
import {
	applyReviewResults,
	gradeSubmission,
	markAnswersPending,
} from "#/server/grading/grade-submission";

const practiceDoc = {
	type: "doc",
	content: [
		{
			type: "shortTextQuestion",
			attrs: {
				questionId: "q-short",
				prompt: "2+2?",
				grading: "auto",
				correctAnswer: "4",
			},
		},
		{
			type: "singleChoiceQuestion",
			attrs: {
				questionId: "q-single",
				prompt: "Pick one",
				grading: "auto",
				options: [
					{ id: "a", label: "A" },
					{ id: "b", label: "B" },
				],
				correctAnswer: "a",
			},
		},
		{
			type: "multipleChoiceQuestion",
			attrs: {
				questionId: "q-multi",
				prompt: "Pick many",
				grading: "auto",
				options: [
					{ id: "x", label: "X" },
					{ id: "y", label: "Y" },
					{ id: "z", label: "Z" },
				],
				correctAnswer: ["x", "y"],
			},
		},
		{
			type: "fileUploadQuestion",
			attrs: {
				questionId: "q-file",
				prompt: "Upload",
				grading: "manual",
				correctAnswer: null,
			},
		},
		{
			type: "shortTextQuestion",
			attrs: {
				questionId: "q-manual-text",
				prompt: "Essay",
				grading: "manual",
				correctAnswer: null,
			},
		},
	],
};

describe("gradeSubmission", () => {
	test("auto-grades short text with normalization", () => {
		const result = gradeSubmission(practiceDoc, {
			"q-short": { type: "short_text", value: " 4 " },
			"q-single": { type: "single_choice", optionId: "a" },
			"q-multi": { type: "multiple_choice", optionIds: ["y", "x"] },
			"q-file": {
				type: "file_upload",
				storageKey: "submissions/u/f.pdf",
				filename: "f.pdf",
				mime: "application/pdf",
				size: 12,
			},
			"q-manual-text": { type: "short_text", value: "long answer" },
		});

		expect(result.answers["q-short"]?.result).toBe("correct");
		expect(result.answers["q-single"]?.result).toBe("correct");
		expect(result.answers["q-multi"]?.result).toBe("correct");
		expect(result.answers["q-file"]?.result).toBe("pending");
		expect(result.answers["q-manual-text"]?.result).toBe("pending");
		expect(result.status).toBe("pending");
	});

	test("marks incorrect auto answers", () => {
		const result = gradeSubmission(practiceDoc, {
			"q-short": { type: "short_text", value: "5" },
			"q-single": { type: "single_choice", optionId: "b" },
			"q-multi": { type: "multiple_choice", optionIds: ["x"] },
			"q-file": {
				type: "file_upload",
				storageKey: "k",
				filename: "f",
				mime: "text/plain",
				size: 1,
			},
			"q-manual-text": { type: "short_text", value: "x" },
		});

		expect(result.answers["q-short"]?.result).toBe("incorrect");
		expect(result.answers["q-single"]?.result).toBe("incorrect");
		expect(result.answers["q-multi"]?.result).toBe("incorrect");
		expect(result.status).toBe("pending");
	});

	test("returns graded when all questions auto-grade", () => {
		const autoOnlyDoc = {
			type: "doc",
			content: [
				{
					type: "shortTextQuestion",
					attrs: {
						questionId: "q1",
						prompt: "?",
						grading: "auto",
						correctAnswer: "3,14",
					},
				},
				{
					type: "singleChoiceQuestion",
					attrs: {
						questionId: "q2",
						prompt: "?",
						grading: "auto",
						options: [{ id: "a", label: "A" }],
						correctAnswer: "a",
					},
				},
			],
		};

		const result = gradeSubmission(autoOnlyDoc, {
			q1: { type: "short_text", value: "3.14" },
			q2: { type: "single_choice", optionId: "a" },
		});

		expect(result.status).toBe("graded");
		expect(result.answers.q1?.result).toBe("correct");
		expect(result.answers.q2?.result).toBe("correct");
	});

	test("file_upload is always pending even if grading attr is auto", () => {
		const doc = {
			type: "doc",
			content: [
				{
					type: "fileUploadQuestion",
					attrs: {
						questionId: "q-file",
						prompt: "Upload",
						grading: "auto",
						correctAnswer: null,
					},
				},
			],
		};

		const result = gradeSubmission(doc, {
			"q-file": {
				type: "file_upload",
				storageKey: "k",
				filename: "f",
				mime: "text/plain",
				size: 1,
			},
		});

		expect(result.answers["q-file"]?.result).toBe("pending");
		expect(result.status).toBe("pending");
	});

	test("missing answer is incorrect for auto questions", () => {
		const doc = {
			type: "doc",
			content: [
				{
					type: "shortTextQuestion",
					attrs: {
						questionId: "q1",
						prompt: "?",
						grading: "auto",
						correctAnswer: "yes",
					},
				},
			],
		};

		const result = gradeSubmission(doc, {});
		expect(result.answers.q1?.result).toBe("incorrect");
		expect(result.status).toBe("graded");
	});

	test("markAnswersPending keeps payloads and sets pending", () => {
		const pending = markAnswersPending({
			q1: { type: "short_text", value: "hi" },
		});
		expect(pending.q1).toEqual({
			type: "short_text",
			value: "hi",
			result: "pending",
		});
	});

	test("applyReviewResults grades pending answers and overall status", () => {
		const reviewed = applyReviewResults(
			{
				q1: {
					type: "file_upload",
					storageKey: "k",
					filename: "f",
					mime: "text/plain",
					size: 1,
					result: "pending",
				},
				q2: { type: "short_text", value: "x", result: "pending" },
			},
			{ q1: "correct", q2: "incorrect" },
		);
		expect(reviewed.answers.q1?.result).toBe("correct");
		expect(reviewed.answers.q2?.result).toBe("incorrect");
		expect(reviewed.status).toBe("graded");
	});
});
