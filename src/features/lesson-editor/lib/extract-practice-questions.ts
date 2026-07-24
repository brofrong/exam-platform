import type { JSONContent } from "@tiptap/core";
import {
	PRACTICE_QUESTION_NODE_TYPES,
	type PracticeQuestionNodeType,
} from "#/features/lesson-editor/lib/sanitize-practice-doc";
import type { AnswerOption } from "@/components/answer-widgets/types";

export type ExtractedPracticeQuestion = {
	questionId: string;
	nodeType: PracticeQuestionNodeType;
	prompt: string;
	options: AnswerOption[];
	grading: "auto" | "manual";
};

function isQuestionNodeType(type: unknown): type is PracticeQuestionNodeType {
	return (
		typeof type === "string" &&
		(PRACTICE_QUESTION_NODE_TYPES as readonly string[]).includes(type)
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseOptions(value: unknown): AnswerOption[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(
		(item): item is AnswerOption =>
			isRecord(item) &&
			typeof item.id === "string" &&
			typeof item.label === "string",
	);
}

function walk(node: unknown, out: ExtractedPracticeQuestion[]): void {
	if (!isRecord(node)) {
		return;
	}

	if (isQuestionNodeType(node.type) && isRecord(node.attrs)) {
		const questionId = node.attrs.questionId;
		if (typeof questionId === "string" && questionId.length > 0) {
			out.push({
				questionId,
				nodeType: node.type,
				prompt: typeof node.attrs.prompt === "string" ? node.attrs.prompt : "",
				options: parseOptions(node.attrs.options),
				grading:
					node.attrs.grading === "manual" || node.type === "fileUploadQuestion"
						? "manual"
						: "auto",
			});
		}
	}

	if (Array.isArray(node.content)) {
		for (const child of node.content) {
			walk(child, out);
		}
	}
}

/** Collect question nodes from a practice TipTap doc (order preserved). */
export function extractPracticeQuestions(
	content: unknown,
): ExtractedPracticeQuestion[] {
	if (!isRecord(content) || content.type !== "doc") {
		return [];
	}
	const out: ExtractedPracticeQuestion[] = [];
	walk(content as JSONContent, out);
	return out;
}
