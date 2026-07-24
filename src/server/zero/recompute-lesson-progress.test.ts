import { describe, expect, test } from "bun:test";
import { aggregateLessonProgress } from "#/server/zero/recompute-lesson-progress";

describe("aggregateLessonProgress", () => {
	test("empty lesson is not_started at 0%", () => {
		expect(aggregateLessonProgress(0, 0, 1_000)).toEqual({
			percent: 0,
			status: "not_started",
			completedAt: null,
		});
	});

	test("partial completion is in_progress with fractional percent", () => {
		expect(aggregateLessonProgress(4, 1, 1_000)).toEqual({
			percent: 25,
			status: "in_progress",
			completedAt: null,
		});
	});

	test("all activities completed → 100% and completedAt", () => {
		expect(aggregateLessonProgress(3, 3, 5_000)).toEqual({
			percent: 100,
			status: "completed",
			completedAt: 5_000,
		});
	});

	test("clamps completed count to total", () => {
		expect(aggregateLessonProgress(2, 99, 9)).toEqual({
			percent: 100,
			status: "completed",
			completedAt: 9,
		});
	});
});
