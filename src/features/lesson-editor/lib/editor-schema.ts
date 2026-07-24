import type { AnyExtension, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { EMPTY_TIPTAP_DOC } from "#/server/zero/constants";

/** TipTap document stored in `activity.content`. */
export type TheoryDoc = JSONContent;

export const emptyTheoryDoc: TheoryDoc = EMPTY_TIPTAP_DOC as TheoryDoc;

/**
 * Theory editor extensions (v1 foundation).
 * Video / liveReact land in later tasks on top of this kit.
 */
export function createTheoryExtensions(): AnyExtension[] {
	return [
		StarterKit.configure({
			heading: { levels: [1, 2, 3] },
		}),
	];
}

export function normalizeTheoryDoc(content: unknown): TheoryDoc {
	if (
		content !== null &&
		typeof content === "object" &&
		!Array.isArray(content) &&
		"type" in content &&
		(content as { type: unknown }).type === "doc"
	) {
		return content as TheoryDoc;
	}
	return emptyTheoryDoc;
}

/** Shape expected by Zero `updateActivity` / `createActivity` content args. */
export function toActivityContent(doc: TheoryDoc): Record<string, unknown> {
	return doc as Record<string, unknown>;
}
