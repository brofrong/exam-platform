/**
 * Practice activity `content` shape after test-groups redesign.
 * Replaces TipTap documents that embedded question nodes.
 */
export type PracticeActivityContent = {
	testGroupId: string;
	/** How many tests to sample for the student. */
	questionCount: number;
	/** 0–100; activity completes when attempt scorePercent >= passPercent. */
	passPercent: number;
};

export function isPracticeActivityContent(
	value: unknown,
): value is PracticeActivityContent {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}
	const record = value as Record<string, unknown>;
	return (
		typeof record.testGroupId === "string" &&
		record.testGroupId.length > 0 &&
		typeof record.questionCount === "number" &&
		Number.isInteger(record.questionCount) &&
		record.questionCount >= 0 &&
		typeof record.passPercent === "number" &&
		Number.isInteger(record.passPercent) &&
		record.passPercent >= 0 &&
		record.passPercent <= 100
	);
}

export function defaultPracticeActivityContent(
	partial?: Partial<PracticeActivityContent>,
): PracticeActivityContent {
	return {
		testGroupId: partial?.testGroupId ?? "",
		questionCount: partial?.questionCount ?? 1,
		passPercent: partial?.passPercent ?? 100,
	};
}
