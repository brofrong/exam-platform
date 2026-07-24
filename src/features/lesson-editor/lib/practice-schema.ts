import type { AnyExtension, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
	FileUploadQuestion,
	MultipleChoiceQuestion,
	ShortTextQuestion,
	SingleChoiceQuestion,
} from "#/features/lesson-editor/lib/nodes/questions";
import { EMPTY_TIPTAP_DOC } from "#/server/zero/constants";

/** TipTap document stored in practice `activity.content`. */
export type PracticeDoc = JSONContent;

export const emptyPracticeDoc: PracticeDoc = EMPTY_TIPTAP_DOC as PracticeDoc;

/**
 * Practice editor extensions: StarterKit + answer question nodes.
 */
export function createPracticeExtensions(): AnyExtension[] {
	return [
		StarterKit.configure({
			heading: { levels: [1, 2, 3] },
		}),
		ShortTextQuestion,
		SingleChoiceQuestion,
		MultipleChoiceQuestion,
		FileUploadQuestion,
	];
}

export function normalizePracticeDoc(content: unknown): PracticeDoc {
	if (
		content !== null &&
		typeof content === "object" &&
		!Array.isArray(content) &&
		"type" in content &&
		(content as { type: unknown }).type === "doc"
	) {
		return content as PracticeDoc;
	}
	return emptyPracticeDoc;
}

/** Shape expected by Zero `updateActivity` / `createActivity` content args. */
export function toPracticeActivityContent(
	doc: PracticeDoc,
): Record<string, unknown> {
	return doc as Record<string, unknown>;
}
