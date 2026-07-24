/** True when TipTap theory JSON contains at least one video node. */
export function theoryHasVideo(content: unknown): boolean {
	if (content === null || typeof content !== "object") {
		return false;
	}
	const node = content as { type?: unknown; content?: unknown };
	if (node.type === "video") {
		return true;
	}
	if (!Array.isArray(node.content)) {
		return false;
	}
	return node.content.some((child) => theoryHasVideo(child));
}
