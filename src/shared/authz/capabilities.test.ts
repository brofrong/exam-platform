import { describe, expect, test } from "bun:test";
import { can, toRole } from "#/shared/authz/capabilities";

describe("can", () => {
	test("admin has program:write and settings:ai", () => {
		expect(can("admin", "program:write")).toBe(true);
		expect(can("admin", "settings:ai")).toBe(true);
		expect(can("admin", "users:manage")).toBe(true);
	});

	test("teacher has staff caps but not admin-only", () => {
		expect(can("teacher", "program:write")).toBe(true);
		expect(can("teacher", "lesson:write")).toBe(true);
		expect(can("teacher", "invite:create")).toBe(true);
		expect(can("teacher", "analytics:read")).toBe(true);
		expect(can("teacher", "settings:ai")).toBe(false);
		expect(can("teacher", "users:manage")).toBe(false);
	});

	test("student does not have program:write", () => {
		expect(can("student", "program:write")).toBe(false);
	});

	test("unknown capability is false", () => {
		expect(can("admin", "unknown:capability" as never)).toBe(false);
	});
});

describe("toRole", () => {
	test("parses known roles", () => {
		expect(toRole("admin")).toBe("admin");
		expect(toRole("teacher")).toBe("teacher");
		expect(toRole("student")).toBe("student");
	});

	test("falls back to student", () => {
		expect(toRole("nope")).toBe("student");
		expect(toRole(null)).toBe("student");
	});
});
