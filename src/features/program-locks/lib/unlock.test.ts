import { describe, expect, test } from "bun:test";
import {
	computeTopicProgressPercent,
	isLessonAccessible,
	isLessonUnlocked,
	isTopicUnlocked,
} from "./unlock";

const threshold = 80;

describe("computeTopicProgressPercent", () => {
	test("averages published lesson percents only", () => {
		expect(
			computeTopicProgressPercent([
				{ status: "published", percent: 100 },
				{ status: "draft", percent: 0 },
				{ status: "published", percent: 60 },
			]),
		).toBe(80);
	});

	test("empty published → 0", () => {
		expect(
			computeTopicProgressPercent([{ status: "draft", percent: 50 }]),
		).toBe(0);
	});
});

describe("isTopicUnlocked", () => {
	const topics = [
		{ id: "t1", position: 0, title: "A" },
		{ id: "t2", position: 1, title: "B" },
		{ id: "t3", position: 2, title: "C" },
	];

	test("open → always unlocked", () => {
		const r = isTopicUnlocked({
			mode: "open",
			threshold,
			topicId: "t3",
			topics,
			topicProgressById: { t1: 0, t2: 0, t3: 0 },
			edges: [{ blockerTopicId: "t1", topicId: "t3" }],
		});
		expect(r.unlocked).toBe(true);
		expect(r.blockers).toEqual([]);
	});

	test("sequential → needs previous ≥ threshold", () => {
		expect(
			isTopicUnlocked({
				mode: "sequential",
				threshold,
				topicId: "t2",
				topics,
				topicProgressById: { t1: 79, t2: 0 },
				edges: [],
			}).unlocked,
		).toBe(false);

		expect(
			isTopicUnlocked({
				mode: "sequential",
				threshold,
				topicId: "t2",
				topics,
				topicProgressById: { t1: 80, t2: 0 },
				edges: [],
			}).unlocked,
		).toBe(true);
	});

	test("sequential first topic unlocked", () => {
		expect(
			isTopicUnlocked({
				mode: "sequential",
				threshold,
				topicId: "t1",
				topics,
				topicProgressById: {},
				edges: [],
			}).unlocked,
		).toBe(true);
	});

	test("graph AND all blockers; no edges → free", () => {
		expect(
			isTopicUnlocked({
				mode: "graph",
				threshold,
				topicId: "t3",
				topics,
				topicProgressById: { t1: 100, t2: 50 },
				edges: [
					{ blockerTopicId: "t1", topicId: "t3" },
					{ blockerTopicId: "t2", topicId: "t3" },
				],
			}).unlocked,
		).toBe(false);

		expect(
			isTopicUnlocked({
				mode: "graph",
				threshold,
				topicId: "t3",
				topics,
				topicProgressById: { t1: 100, t2: 80 },
				edges: [
					{ blockerTopicId: "t1", topicId: "t3" },
					{ blockerTopicId: "t2", topicId: "t3" },
				],
			}).unlocked,
		).toBe(true);

		expect(
			isTopicUnlocked({
				mode: "graph",
				threshold,
				topicId: "t2",
				topics,
				topicProgressById: {},
				edges: [],
			}).unlocked,
		).toBe(true);
	});
});

describe("isLessonUnlocked", () => {
	const lessons = [
		{ id: "l1", position: 0, title: "L1" },
		{ id: "l2", position: 1, title: "L2" },
	];

	test("open / sequential / graph mirror topic rules within topic", () => {
		expect(
			isLessonUnlocked({
				mode: "sequential",
				threshold,
				lessonId: "l2",
				lessons,
				lessonProgressById: { l1: 79 },
				edges: [],
			}).unlocked,
		).toBe(false);

		expect(
			isLessonUnlocked({
				mode: "graph",
				threshold,
				lessonId: "l2",
				lessons,
				lessonProgressById: { l1: 80 },
				edges: [{ blockerLessonId: "l1", lessonId: "l2" }],
			}).unlocked,
		).toBe(true);
	});
});

describe("isLessonAccessible", () => {
	test("requires topic unlocked AND lesson unlocked", () => {
		const r = isLessonAccessible({
			topicUnlocked: false,
			lessonUnlocked: true,
			topicBlockers: [{ id: "t1", title: "A", percent: 10 }],
			lessonBlockers: [],
		});
		expect(r.unlocked).toBe(false);
		expect(r.topicBlockers).toHaveLength(1);
	});
});
