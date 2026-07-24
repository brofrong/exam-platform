import { describe, expect, test } from "bun:test";
import {
	answersEqual,
	normalizeAnswer,
} from "#/server/grading/normalize-answer";

describe("normalizeAnswer", () => {
	test("trims whitespace", () => {
		expect(normalizeAnswer("  hello  ")).toBe("hello");
	});

	test("lowercases for case-insensitive comparison", () => {
		expect(normalizeAnswer("AbC")).toBe("abc");
	});

	test("replaces comma with dot", () => {
		expect(normalizeAnswer("3,14")).toBe("3.14");
	});

	test("combines trim, case, and comma/dot", () => {
		expect(normalizeAnswer("  Pi=3,14  ")).toBe("pi=3.14");
	});
});

describe("answersEqual", () => {
	test("matches ignoring case and surrounding spaces", () => {
		expect(answersEqual("  Hello ", "hello")).toBe(true);
	});

	test("matches comma and dot forms", () => {
		expect(answersEqual("3,5", "3.5")).toBe(true);
	});

	test("rejects different values", () => {
		expect(answersEqual("yes", "no")).toBe(false);
	});
});
