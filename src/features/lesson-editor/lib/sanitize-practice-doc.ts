import type { JSONContent } from "@tiptap/core";
import { EMPTY_TIPTAP_DOC } from "#/server/zero/constants";

export const PRACTICE_QUESTION_NODE_TYPES = [
	"shortTextQuestion",
	"singleChoiceQuestion",
	"multipleChoiceQuestion",
	"fileUploadQuestion",
] as const;

export type PracticeQuestionNodeType =
	(typeof PRACTICE_QUESTION_NODE_TYPES)[number];

function isQuestionNodeType(type: unknown): type is PracticeQuestionNodeType {
	return (
		typeof type === "string" &&
		(PRACTICE_QUESTION_NODE_TYPES as readonly string[]).includes(type)
	);
}

function sanitizeNode(node: JSONContent): JSONContent {
	const next: JSONContent = { ...node };

	if (node.attrs && typeof node.attrs === "object") {
		if (isQuestionNodeType(node.type)) {
			const { correctAnswer: _correctAnswer, ...rest } = node.attrs as Record<
				string,
				unknown
			>;
			next.attrs = rest;
		} else {
			next.attrs = { ...node.attrs };
		}
	}

	if (Array.isArray(node.content)) {
		next.content = node.content.map(sanitizeNode);
	}

	if (Array.isArray(node.marks)) {
		next.marks = node.marks.map((mark) => ({ ...mark }));
	}

	return next;
}

/**
 * Deep-clone a practice TipTap doc and strip `correctAnswer` from question
 * nodes so student clients never receive grading keys.
 */
export function sanitizePracticeDoc(content: unknown): JSONContent {
	if (
		content === null ||
		typeof content !== "object" ||
		Array.isArray(content) ||
		!("type" in content) ||
		(content as { type: unknown }).type !== "doc"
	) {
		return structuredClone(EMPTY_TIPTAP_DOC) as JSONContent;
	}

	return sanitizeNode(content as JSONContent);
}
