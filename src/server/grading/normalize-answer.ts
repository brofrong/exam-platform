/**
 * Normalize student/expected short-text answers for comparison:
 * trim, lowercase, treat comma as decimal separator.
 */
export function normalizeAnswer(value: string): string {
	return value.trim().toLowerCase().replaceAll(",", ".");
}

export function answersEqual(a: string, b: string): boolean {
	return normalizeAnswer(a) === normalizeAnswer(b);
}
