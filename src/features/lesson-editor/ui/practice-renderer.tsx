import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import {
	createPracticeExtensions,
	emptyPracticeDoc,
	normalizePracticeDoc,
} from "#/features/lesson-editor/lib/practice-schema";
import { sanitizePracticeDoc } from "#/features/lesson-editor/lib/sanitize-practice-doc";
import { cn } from "@/lib/utils";

const proseClassName = cn(
	"px-1 py-0.5 text-sm leading-relaxed",
	"[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold",
	"[&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold",
	"[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:font-medium",
	"[&_p]:my-1.5",
	"[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
	"[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
	"[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic",
	"[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em]",
	"[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3",
	"[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
);

export type PracticeRendererProps = {
	content?: unknown;
	/** When true (default), strip `correctAnswer` before render. */
	sanitize?: boolean;
	className?: string;
};

/** Read-only TipTap render of practice JSON (student answering in Task 21). */
export function PracticeRenderer({
	content,
	sanitize = true,
	className,
}: PracticeRendererProps) {
	const raw = normalizePracticeDoc(content ?? emptyPracticeDoc);
	const doc = sanitize ? sanitizePracticeDoc(raw) : raw;

	const editor = useEditor({
		extensions: createPracticeExtensions(),
		content: doc,
		editable: false,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: proseClassName,
				"data-testid": "practice-renderer-content",
			},
		},
	});

	useEffect(() => {
		if (!editor || editor.isDestroyed) {
			return;
		}
		const nextRaw = normalizePracticeDoc(content ?? emptyPracticeDoc);
		const next = sanitize ? sanitizePracticeDoc(nextRaw) : nextRaw;
		editor.commands.setContent(next, { emitUpdate: false });
	}, [content, editor, sanitize]);

	return (
		<div
			className={cn("practice-renderer", className)}
			data-testid="practice-renderer"
		>
			<EditorContent editor={editor} />
		</div>
	);
}
