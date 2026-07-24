import { EditorContent, useEditor } from "@tiptap/react";
import {
	createPracticeExtensions,
	emptyPracticeDoc,
	normalizePracticeDoc,
	type PracticeDoc,
} from "#/features/lesson-editor/lib/practice-schema";
import { PracticeToolbar } from "#/features/lesson-editor/ui/practice-toolbar";
import { cn } from "@/lib/utils";

const proseClassName = cn(
	"min-h-[12rem] px-3 py-2 text-sm leading-relaxed focus:outline-none",
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

export type PracticeEditorProps = {
	content?: unknown;
	onChange?: (doc: PracticeDoc) => void;
	className?: string;
};

export function PracticeEditor({
	content,
	onChange,
	className,
}: PracticeEditorProps) {
	const initial = normalizePracticeDoc(content ?? emptyPracticeDoc);

	const editor = useEditor({
		extensions: createPracticeExtensions(),
		content: initial,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: proseClassName,
				"data-testid": "practice-editor-content",
			},
		},
		onUpdate: ({ editor: instance }) => {
			onChange?.(instance.getJSON());
		},
	});

	return (
		<div
			className={cn(
				"overflow-hidden rounded-xl border border-border bg-background",
				className,
			)}
			data-testid="practice-editor"
		>
			{editor ? <PracticeToolbar editor={editor} /> : null}
			<EditorContent editor={editor} />
		</div>
	);
}
