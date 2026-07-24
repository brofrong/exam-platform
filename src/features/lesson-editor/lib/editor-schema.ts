import type { AnyExtension, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Video } from "#/features/lesson-editor/lib/nodes/video";
import { EMPTY_TIPTAP_DOC } from "#/server/zero/constants";

/** TipTap document stored in `activity.content`. */
export type TheoryDoc = JSONContent;

export const emptyTheoryDoc: TheoryDoc = EMPTY_TIPTAP_DOC as TheoryDoc;

/**
 * Theory editor extensions: StarterKit + video embed.
 * liveReact lands in a later task.
 */
export function createTheoryExtensions(): AnyExtension[] {
	return [
		StarterKit.configure({
			heading: { levels: [1, 2, 3] },
		}),
		Video,
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
