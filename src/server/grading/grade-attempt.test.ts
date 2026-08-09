import { describe, expect, test } from "bun:test";
import {
	applyReviewResults,
	computeScorePercent,
	finalizeAttemptScore,
	gradeAttempt,
	markAnswersPending,
} from "#/server/grading/grade-attempt";

const tests = [
	{
		id: "q-short",
		answerType: "short_text",
		grading: "auto",
		correctAnswer: "4",
	},
	{
		id: "q-num",
		answerType: "number",
		grading: "auto",
		correctAnswer: "3.14",
	},
	{
		id: "q-single",
		answerType: "single_choice",
		grading: "auto",
		correctAnswer: "a",
	},
	{
		id: "q-multi",
		answerType: "multiple_choice",
		grading: "auto",
		correctAnswer: ["x", "y"],
	},
	{
		id: "q-file",
		answerType: "file_upload",
		grading: "manual",
		correctAnswer: null,
	},
];

describe("gradeAttempt", () => {
	test("auto-grades and leaves file pending", () => {
		const result = gradeAttempt(
			tests,
			{
				"q-short": { type: "short_text", value: "4" },
				"q-num": { type: "number", value: "3,14" },
				"q-single": { type: "single_choice", optionId: "a" },
				"q-multi": { type: "multiple_choice", optionIds: ["y", "x"] },
				"q-file": {
					type: "file_upload",
					storageKey: "k",
					filename: "a.png",
					mime: "image/png",
					size: 10,
				},
			},
			80,
		);
		expect(result.status).toBe("pending_review");
		expect(result.answers["q-short"]?.result).toBe("correct");
		expect(result.answers["q-num"]?.result).toBe("correct");
		expect(result.answers["q-file"]?.result).toBe("pending");
		expect(result.passed).toBe(false);
	});

	test("computes pass when all auto and above threshold", () => {
		const result = gradeAttempt(
			tests.filter((t) => t.id !== "q-file"),
			{
				"q-short": { type: "short_text", value: "4" },
				"q-num": { type: "number", value: "3.14" },
				"q-single": { type: "single_choice", optionId: "a" },
				"q-multi": { type: "multiple_choice", optionIds: ["x", "y"] },
			},
			75,
		);
		expect(result.status).toBe("graded");
		expect(result.scorePercent).toBe(100);
		expect(result.passed).toBe(true);
	});

	test("fails below pass percent", () => {
		const result = gradeAttempt(
			[
				{
					id: "a",
					answerType: "short_text",
					grading: "auto",
					correctAnswer: "yes",
				},
				{
					id: "b",
					answerType: "short_text",
					grading: "auto",
					correctAnswer: "yes",
				},
			],
			{
				a: { type: "short_text", value: "yes" },
				b: { type: "short_text", value: "no" },
			},
			80,
		);
		expect(result.scorePercent).toBe(50);
		expect(result.passed).toBe(false);
	});
});

describe("review helpers", () => {
	test("markAnswersPending", () => {
		const pending = markAnswersPending({
			a: { type: "short_text", value: "1" },
		});
		expect(pending.a?.result).toBe("pending");
	});

	test("applyReviewResults finalizes score", () => {
		const reviewed = applyReviewResults(
			{
				a: { type: "short_text", value: "1", result: "pending" },
				b: { type: "short_text", value: "2", result: "correct" },
			},
			{ a: "incorrect" },
		);
		expect(reviewed.status).toBe("graded");
		const score = finalizeAttemptScore(reviewed.answers, 50);
		expect(score.scorePercent).toBe(50);
		expect(score.passed).toBe(true);
		expect(computeScorePercent(reviewed.answers)).toBe(50);
	});
});
