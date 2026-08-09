import type { Editor, JSONContent } from "@tiptap/core";
import {
	emptyTheoryDoc,
	normalizeTheoryDoc,
	type TheoryDoc,
} from "#/features/lesson-editor/lib/editor-schema";

export type ApplyResult = { ok: true } | { ok: false; error: string };

export type ParsedEditorPayload =
	| { kind: "doc"; doc: TheoryDoc }
	| { kind: "fragment"; content: JSONContent[] }
	| { kind: "liveReact"; code: string }
	| { kind: "paragraphs"; text: string };

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function looksLikeMafsCode(code: string): boolean {
	const trimmed = code.trim();
	return (
		trimmed.includes("export default function App") ||
		trimmed.includes("<Mafs") ||
		/function\s+App\s*\(/.test(trimmed)
	);
}

function asNodeArray(value: unknown): JSONContent[] | null {
	if (!Array.isArray(value)) {
		return null;
	}
	const nodes = value.filter(
		(item): item is JSONContent =>
			isRecord(item) && typeof item.type === "string",
	);
	return nodes.length === value.length && nodes.length > 0 ? nodes : null;
}

/** Parse a fenced code block into something TipTap can apply. */
export function parseEditorPayload(
	language: string,
	code: string,
): ParsedEditorPayload | null {
	const lang = language.trim().toLowerCase();
	const trimmed = code.trim();
	if (trimmed.length === 0) {
		return null;
	}

	const looksLikeJson =
		lang === "json" || trimmed.startsWith("{") || trimmed.startsWith("[");

	// Prefer TipTap JSON so docs that embed Mafs in liveReact.attrs.code
	// are inserted as real nodes, not one giant liveReact blob.
	if (looksLikeJson) {
		try {
			const parsed: unknown = JSON.parse(trimmed);
			if (Array.isArray(parsed)) {
				const nodes = asNodeArray(parsed);
				if (nodes) {
					return { kind: "fragment", content: nodes };
				}
				return null;
			}
			if (!isRecord(parsed)) {
				return null;
			}
			if (parsed.type === "doc") {
				return { kind: "doc", doc: normalizeTheoryDoc(parsed) };
			}
			if (typeof parsed.type === "string") {
				return { kind: "fragment", content: [parsed as JSONContent] };
			}
			if ("content" in parsed) {
				const nodes = asNodeArray(parsed.content);
				if (nodes) {
					return { kind: "fragment", content: nodes };
				}
			}
			if (lang === "json") {
				return null;
			}
		} catch {
			if (lang === "json") {
				return null;
			}
		}
	}

	const isJsFence =
		lang === "jsx" || lang === "tsx" || lang === "javascript" || lang === "js";

	if (isJsFence || (!looksLikeJson && looksLikeMafsCode(trimmed))) {
		if (looksLikeMafsCode(trimmed)) {
			return { kind: "liveReact", code: trimmed };
		}
	}

	if (lang === "markdown" || lang === "md" || lang === "text" || lang === "") {
		return { kind: "paragraphs", text: trimmed };
	}

	return null;
}

export function canApplyCodeBlock(language: string, code: string): boolean {
	return parseEditorPayload(language, code) != null;
}

function payloadToInsertContent(payload: ParsedEditorPayload): JSONContent {
	switch (payload.kind) {
		case "doc":
			return {
				type: "doc",
				content: payload.doc.content ?? [],
			};
		case "fragment":
			return {
				type: "doc",
				content: payload.content,
			};
		case "liveReact":
			return {
				type: "doc",
				content: [
					{
						type: "liveReact",
						attrs: { code: payload.code },
					},
				],
			};
		case "paragraphs": {
			const paragraphs = payload.text
				.split(/\n{2,}/)
				.map((block) => block.trim())
				.filter(Boolean)
				.map(
					(block): JSONContent => ({
						type: "paragraph",
						content: [{ type: "text", text: block }],
					}),
				);
			return {
				type: "doc",
				content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }],
			};
		}
	}
}

function insertPayload(
	editor: Editor,
	payload: ParsedEditorPayload,
): ApplyResult {
	try {
		const content = payloadToInsertContent(payload);
		const nodes = content.content ?? [];
		if (nodes.length === 0) {
			return { ok: false, error: "Нечего вставлять" };
		}
		const ok = editor
			.chain()
			.focus()
			.insertContent(nodes.length === 1 ? nodes[0] : nodes)
			.run();
		if (!ok) {
			return { ok: false, error: "Редактор отклонил вставку" };
		}
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Ошибка вставки",
		};
	}
}

function replacePayload(
	editor: Editor,
	payload: ParsedEditorPayload,
): ApplyResult {
	try {
		let doc: TheoryDoc;
		switch (payload.kind) {
			case "doc":
				doc = payload.doc;
				break;
			case "fragment":
				doc = { type: "doc", content: payload.content };
				break;
			case "liveReact":
				doc = {
					type: "doc",
					content: [{ type: "liveReact", attrs: { code: payload.code } }],
				};
				break;
			case "paragraphs": {
				const content = payloadToInsertContent(payload).content ?? [];
				doc = { type: "doc", content };
				break;
			}
		}
		const normalized = normalizeTheoryDoc(doc);
		const ok = editor
			.chain()
			.focus()
			.setContent(normalized.content?.length ? normalized : emptyTheoryDoc)
			.run();
		if (!ok) {
			return { ok: false, error: "Редактор отклонил замену" };
		}
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Ошибка замены",
		};
	}
}

export type TheoryEditorApply = {
	insertFromCodeBlock: (language: string, code: string) => ApplyResult;
	replaceFromCodeBlock: (language: string, code: string) => ApplyResult;
};

export function createTheoryEditorApply(editor: Editor): TheoryEditorApply {
	return {
		insertFromCodeBlock(language, code) {
			const payload = parseEditorPayload(language, code);
			if (!payload) {
				return {
					ok: false,
					error: "Не удалось разобрать блок для редактора",
				};
			}
			return insertPayload(editor, payload);
		},
		replaceFromCodeBlock(language, code) {
			const payload = parseEditorPayload(language, code);
			if (!payload) {
				return {
					ok: false,
					error: "Не удалось разобрать блок для редактора",
				};
			}
			return replacePayload(editor, payload);
		},
	};
}
