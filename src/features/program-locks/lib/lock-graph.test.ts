import { describe, expect, test } from "bun:test";
import { assertAcyclicEdges } from "./lock-graph";

describe("assertAcyclicEdges", () => {
	test("empty ok", () => {
		expect(() => assertAcyclicEdges([])).not.toThrow();
	});

	test("self-loop throws", () => {
		expect(() => assertAcyclicEdges([{ from: "a", to: "a" }])).toThrow();
	});

	test("simple cycle throws", () => {
		expect(() =>
			assertAcyclicEdges([
				{ from: "a", to: "b" },
				{ from: "b", to: "a" },
			]),
		).toThrow();
	});

	test("DAG ok", () => {
		expect(() =>
			assertAcyclicEdges([
				{ from: "a", to: "b" },
				{ from: "b", to: "c" },
			]),
		).not.toThrow();
	});

	test("diamond ok", () => {
		expect(() =>
			assertAcyclicEdges([
				{ from: "a", to: "c" },
				{ from: "b", to: "c" },
			]),
		).not.toThrow();
	});
});
