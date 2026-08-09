function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function walk(node: unknown, out: string[]): void {
	if (!isRecord(node)) {
		return;
	}
	if (node.type === "text" && typeof node.text === "string") {
		out.push(node.text);
	}
	if (Array.isArray(node.content)) {
		for (const child of node.content) {
			walk(child, out);
		}
	}
}

/** Flatten a TipTap prompt doc into plain text (for list previews). */
export function extractPromptText(content: unknown): string {
	if (!isRecord(content) || content.type !== "doc") {
		return "";
	}
	const out: string[] = [];
	walk(content, out);
	return out.join(" ").trim();
}
