import { describe, expect, test } from "bun:test";
import { CHANGELOG } from "./changelog";

describe("CHANGELOG", () => {
	test("exports an array", () => {
		expect(Array.isArray(CHANGELOG)).toBe(true);
	});
});
