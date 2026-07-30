import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";
import {
	createTheoryExtensions,
	emptyTheoryDoc,
	normalizeTheoryDoc,
} from "#/features/lesson-editor/lib/editor-schema";
import {
	bindImageLightbox,
	type ImageLightboxRequest,
} from "#/features/lesson-editor/lib/image-lightbox-bridge";
import { renderKatexInElement } from "#/features/lesson-editor/lib/render-katex";
import { theoryProseClassName } from "#/features/lesson-editor/lib/theory-prose";
import { ImageLightbox } from "#/features/lesson-editor/ui/image-lightbox";
import { cn } from "@/lib/utils";

const proseClassName = theoryProseClassName("px-1 py-0.5");

export type TheoryRendererProps = {
	content?: unknown;
	className?: string;
};

/** Read-only TipTap render of theory JSON (student player later). */
export function TheoryRenderer({ content, className }: TheoryRendererProps) {
	const doc = normalizeTheoryDoc(content ?? emptyTheoryDoc);
	const [lightbox, setLightbox] = useState<ImageLightboxRequest | null>(null);

	useEffect(() => {
		bindImageLightbox((request) => {
			setLightbox(request);
		});
		return () => {
			bindImageLightbox(null);
		};
	}, []);

	const onLightboxOpenChange = useCallback((open: boolean) => {
		if (!open) {
			setLightbox(null);
		}
	}, []);

	const editor = useEditor({
		extensions: createTheoryExtensions({ mode: "view" }),
		content: doc,
		editable: false,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: proseClassName,
				"data-testid": "theory-renderer-content",
			},
		},
	});

	useEffect(() => {
		if (!editor || editor.isDestroyed) {
			return;
		}
		const next = normalizeTheoryDoc(content ?? emptyTheoryDoc);
		editor.commands.setContent(next, { emitUpdate: false });
		requestAnimationFrame(() => {
			if (!editor.isDestroyed) {
				renderKatexInElement(editor.view.dom);
			}
		});
	}, [content, editor]);

	return (
		<>
			<div
				className={cn("theory-renderer", className)}
				data-testid="theory-renderer"
			>
				<EditorContent editor={editor} />
			</div>
			<ImageLightbox
				src={lightbox?.src ?? null}
				alt={lightbox?.alt}
				open={lightbox !== null}
				onOpenChange={onLightboxOpenChange}
			/>
		</>
	);
}
