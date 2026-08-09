import type { EditorView } from "@tiptap/pm/view";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	createTheoryExtensions,
	emptyTheoryDoc,
	normalizeTheoryDoc,
	type TheoryDoc,
} from "#/features/lesson-editor/lib/editor-schema";
import { theoryProseClassName } from "#/features/lesson-editor/lib/theory-prose";
import {
	getImageFileFromDataTransfer,
	uploadEditorImage,
} from "#/features/lesson-editor/lib/upload-editor-image";
import { TheoryToolbar } from "#/features/lesson-editor/ui/theory-toolbar";
import { cn } from "@/lib/utils";

const proseClassName = theoryProseClassName("min-h-[12rem] px-3 py-2");

function insertImageAtSelection(
	view: EditorView,
	src: string,
	alt: string,
): void {
	const imageType = view.state.schema.nodes.image;
	if (!imageType) {
		return;
	}
	const node = imageType.create({ src, alt });
	view.dispatch(view.state.tr.replaceSelectionWith(node).scrollIntoView());
}

export type TheoryEditorProps = {
	content?: unknown;
	onChange?: (doc: TheoryDoc) => void;
	/** Fires when the TipTap instance is ready or destroyed. */
	onEditorReady?: (editor: Editor | null) => void;
	className?: string;
};

export function TheoryEditor({
	content,
	onChange,
	onEditorReady,
	className,
}: TheoryEditorProps) {
	const initial = normalizeTheoryDoc(content ?? emptyTheoryDoc);
	const uploadingRef = useRef(false);

	const editor = useEditor({
		extensions: createTheoryExtensions(),
		content: initial,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: proseClassName,
				"data-testid": "theory-editor-content",
			},
			handlePaste(view, event) {
				const file = getImageFileFromDataTransfer(event.clipboardData);
				if (!file || uploadingRef.current) {
					return false;
				}

				event.preventDefault();
				uploadingRef.current = true;
				void uploadEditorImage(file)
					.then((src) => {
						insertImageAtSelection(view, src, file.name);
					})
					.catch((error: unknown) => {
						toast.error(
							error instanceof Error
								? error.message
								: "Не удалось вставить изображение",
						);
					})
					.finally(() => {
						uploadingRef.current = false;
					});
				return true;
			},
			handleDrop(view, event, _slice, moved) {
				if (moved) {
					return false;
				}
				const file = getImageFileFromDataTransfer(event.dataTransfer);
				if (!file || uploadingRef.current) {
					return false;
				}

				event.preventDefault();
				uploadingRef.current = true;
				void uploadEditorImage(file)
					.then((src) => {
						insertImageAtSelection(view, src, file.name);
					})
					.catch((error: unknown) => {
						toast.error(
							error instanceof Error
								? error.message
								: "Не удалось вставить изображение",
						);
					})
					.finally(() => {
						uploadingRef.current = false;
					});
				return true;
			},
		},
		onUpdate: ({ editor: instance }) => {
			onChange?.(instance.getJSON());
		},
	});

	useEffect(() => {
		onEditorReady?.(editor ?? null);
		return () => {
			onEditorReady?.(null);
		};
	}, [editor, onEditorReady]);

	return (
		<div
			className={cn("rounded-xl border border-border bg-background", className)}
			data-testid="theory-editor"
		>
			{editor ? (
				<div
					className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
					data-testid="theory-toolbar-sticky"
				>
					<TheoryToolbar editor={editor} />
				</div>
			) : null}
			<EditorContent editor={editor} />
		</div>
	);
}
