import { describe, expect, test } from "bun:test";
import { can } from "#/shared/authz/capabilities";

describe("can", () => {
	test("admin has program:write", () => {
		expect(can("admin", "program:write")).toBe(true);
	});

	test("student does not have program:write", () => {
		expect(can("student", "program:write")).toBe(false);
	});

	test("unknown capability is false", () => {
		expect(can("admin", "unknown:capability" as never)).toBe(false);
	});
});
