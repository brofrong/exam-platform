import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import {
	ADMIN_SIDEBAR_COLLAPSED_KEY,
	readSidebarCollapsed,
	writeSidebarCollapsed,
} from "./sidebar-collapsed";

beforeAll(() => {
	if (typeof globalThis.localStorage !== "undefined") return;
	const store = new Map<string, string>();
	Object.defineProperty(globalThis, "localStorage", {
		configurable: true,
		value: {
			getItem(key: string) {
				return store.has(key) ? (store.get(key) ?? null) : null;
			},
			setItem(key: string, value: string) {
				store.set(key, String(value));
			},
			removeItem(key: string) {
				store.delete(key);
			},
			clear() {
				store.clear();
			},
		},
	});
});

afterEach(() => {
	localStorage.removeItem(ADMIN_SIDEBAR_COLLAPSED_KEY);
});

describe("sidebar-collapsed", () => {
	test("read defaults to false when empty", () => {
		expect(readSidebarCollapsed()).toBe(false);
	});

	test("write and read true", () => {
		writeSidebarCollapsed(true);
		expect(localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY)).toBe("1");
		expect(readSidebarCollapsed()).toBe(true);
	});

	test("write false clears collapsed", () => {
		writeSidebarCollapsed(true);
		writeSidebarCollapsed(false);
		expect(readSidebarCollapsed()).toBe(false);
	});

	test("invalid stored value → false", () => {
		localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, "yes");
		expect(readSidebarCollapsed()).toBe(false);
	});
});
