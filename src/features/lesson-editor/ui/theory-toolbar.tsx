import type { Editor } from "@tiptap/react";
import {
	BoldIcon,
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	ItalicIcon,
	ListIcon,
	ListOrderedIcon,
	Redo2Icon,
	Undo2Icon,
} from "lucide-react";
import { InsertVideoButton } from "#/features/lesson-editor/ui/insert-video-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type TheoryToolbarProps = {
	editor: Editor;
};

function ToolbarButton({
	pressed,
	onClick,
	label,
	children,
	testId,
}: {
	pressed?: boolean;
	onClick: () => void;
	label: string;
	children: React.ReactNode;
	testId: string;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			aria-label={label}
			aria-pressed={pressed}
			data-testid={testId}
			className={cn(pressed && "bg-muted text-foreground")}
			onClick={onClick}
		>
			{children}
		</Button>
	);
}

export function TheoryToolbar({ editor }: TheoryToolbarProps) {
	return (
		<div
			className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1"
			data-testid="theory-toolbar"
		>
			<ToolbarButton
				label="Отменить"
				testId="theory-toolbar-undo"
				onClick={() => editor.chain().focus().undo().run()}
			>
				<Undo2Icon />
			</ToolbarButton>
			<ToolbarButton
				label="Повторить"
				testId="theory-toolbar-redo"
				onClick={() => editor.chain().focus().redo().run()}
			>
				<Redo2Icon />
			</ToolbarButton>

			<Separator orientation="vertical" className="mx-1 h-5" />

			<ToolbarButton
				label="Жирный"
				testId="theory-toolbar-bold"
				pressed={editor.isActive("bold")}
				onClick={() => editor.chain().focus().toggleBold().run()}
			>
				<BoldIcon />
			</ToolbarButton>
			<ToolbarButton
				label="Курсив"
				testId="theory-toolbar-italic"
				pressed={editor.isActive("italic")}
				onClick={() => editor.chain().focus().toggleItalic().run()}
			>
				<ItalicIcon />
			</ToolbarButton>

			<Separator orientation="vertical" className="mx-1 h-5" />

			<ToolbarButton
				label="Заголовок 1"
				testId="theory-toolbar-h1"
				pressed={editor.isActive("heading", { level: 1 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
			>
				<Heading1Icon />
			</ToolbarButton>
			<ToolbarButton
				label="Заголовок 2"
				testId="theory-toolbar-h2"
				pressed={editor.isActive("heading", { level: 2 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				<Heading2Icon />
			</ToolbarButton>
			<ToolbarButton
				label="Заголовок 3"
				testId="theory-toolbar-h3"
				pressed={editor.isActive("heading", { level: 3 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
			>
				<Heading3Icon />
			</ToolbarButton>

			<Separator orientation="vertical" className="mx-1 h-5" />

			<ToolbarButton
				label="Маркированный список"
				testId="theory-toolbar-bullet-list"
				pressed={editor.isActive("bulletList")}
				onClick={() => editor.chain().focus().toggleBulletList().run()}
			>
				<ListIcon />
			</ToolbarButton>
			<ToolbarButton
				label="Нумерованный список"
				testId="theory-toolbar-ordered-list"
				pressed={editor.isActive("orderedList")}
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
			>
				<ListOrderedIcon />
			</ToolbarButton>

			<Separator orientation="vertical" className="mx-1 h-5" />

			<InsertVideoButton editor={editor} />
		</div>
	);
}
