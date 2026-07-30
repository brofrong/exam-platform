import type { AnyExtension, JSONContent } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { LiveReact } from "#/features/lesson-editor/lib/nodes/live-react";
import { TheoryImage } from "#/features/lesson-editor/lib/nodes/theory-image";
import { Video } from "#/features/lesson-editor/lib/nodes/video";
import { EMPTY_TIPTAP_DOC } from "#/server/zero/constants";

const lowlight = createLowlight(common);

/** TipTap document stored in `activity.content`. */
export type TheoryDoc = JSONContent;

export const emptyTheoryDoc: TheoryDoc = EMPTY_TIPTAP_DOC as TheoryDoc;

export type TheoryExtensionsOptions = {
	/**
	 * `edit` — resizable images in the authoring toolbar flow.
	 * `view` — read-only images with loupe / tap → fullscreen lightbox.
	 */
	mode?: "edit" | "view";
};

/**
 * Theory editor extensions.
 * Math is plain `$...$` / `$$...$$` text rendered with KaTeX in TheoryRenderer.
 */
export function createTheoryExtensions(
	options: TheoryExtensionsOptions = {},
): AnyExtension[] {
	const mode = options.mode ?? "edit";
	const isView = mode === "view";

	return [
		StarterKit.configure({
			heading: { levels: [1, 2, 3] },
			codeBlock: false,
			link: {
				openOnClick: false,
				autolink: true,
				defaultProtocol: "https",
				HTMLAttributes: {
					rel: "noopener noreferrer",
					target: "_blank",
				},
			},
		}),
		Highlight.configure({ multicolor: true }),
		TextAlign.configure({
			types: ["heading", "paragraph"],
		}),
		Typography,
		CodeBlockLowlight.configure({
			lowlight,
			defaultLanguage: "plaintext",
		}),
		TableKit.configure({
			table: {
				resizable: !isView,
				HTMLAttributes: {
					class: "theory-table",
				},
			},
		}),
		TheoryImage.configure({
			inline: true,
			allowBase64: false,
			interactivePreview: isView,
			HTMLAttributes: {
				class: "theory-image",
			},
			resize: isView
				? false
				: {
						enabled: true,
						directions: [
							"top-left",
							"top-right",
							"bottom-left",
							"bottom-right",
						],
						minWidth: 48,
						minHeight: 48,
						alwaysPreserveAspectRatio: true,
					},
		}),
		Video,
		LiveReact,
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
