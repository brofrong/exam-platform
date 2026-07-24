import type { Editor } from "@tiptap/react";
import {
	BoldIcon,
	CheckSquareIcon,
	CircleDotIcon,
	FileUpIcon,
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	ItalicIcon,
	ListIcon,
	ListOrderedIcon,
	Redo2Icon,
	TextCursorInputIcon,
	Undo2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type PracticeToolbarProps = {
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

export function PracticeToolbar({ editor }: PracticeToolbarProps) {
	return (
		<div
			className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1"
			data-testid="practice-toolbar"
		>
			<ToolbarButton
				label="Отменить"
				testId="practice-toolbar-undo"
				onClick={() => editor.chain().focus().undo().run()}
			>
				<Undo2Icon />
			</ToolbarButton>
			<ToolbarButton
				label="Повторить"
				testId="practice-toolbar-redo"
				onClick={() => editor.chain().focus().redo().run()}
			>
				<Redo2Icon />
			</ToolbarButton>

			<Separator orientation="vertical" className="mx-1 h-5" />

			<ToolbarButton
				label="Жирный"
				testId="practice-toolbar-bold"
				pressed={editor.isActive("bold")}
				onClick={() => editor.chain().focus().toggleBold().run()}
			>
				<BoldIcon />
			</ToolbarButton>
			<ToolbarButton
				label="Курсив"
				testId="practice-toolbar-italic"
				pressed={editor.isActive("italic")}
				onClick={() => editor.chain().focus().toggleItalic().run()}
			>
				<ItalicIcon />
			</ToolbarButton>

			<Separator orientation="vertical" className="mx-1 h-5" />

			<ToolbarButton
				label="Заголовок 1"
				testId="practice-toolbar-h1"
				pressed={editor.isActive("heading", { level: 1 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
			>
				<Heading1Icon />
			</ToolbarButton>
			<ToolbarButton
				label="Заголовок 2"
				testId="practice-toolbar-h2"
				pressed={editor.isActive("heading", { level: 2 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				<Heading2Icon />
			</ToolbarButton>
			<ToolbarButton
				label="Заголовок 3"
				testId="practice-toolbar-h3"
				pressed={editor.isActive("heading", { level: 3 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
			>
				<Heading3Icon />
			</ToolbarButton>

			<Separator orientation="vertical" className="mx-1 h-5" />

			<ToolbarButton
				label="Маркированный список"
				testId="practice-toolbar-bullet-list"
				pressed={editor.isActive("bulletList")}
				onClick={() => editor.chain().focus().toggleBulletList().run()}
			>
				<ListIcon />
			</ToolbarButton>
			<ToolbarButton
				label="Нумерованный список"
				testId="practice-toolbar-ordered-list"
				pressed={editor.isActive("orderedList")}
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
			>
				<ListOrderedIcon />
			</ToolbarButton>

			<Separator orientation="vertical" className="mx-1 h-5" />

			<ToolbarButton
				label="Короткий ответ"
				testId="practice-toolbar-short-text"
				onClick={() => editor.chain().focus().insertShortTextQuestion().run()}
			>
				<TextCursorInputIcon />
			</ToolbarButton>
			<ToolbarButton
				label="Один вариант"
				testId="practice-toolbar-single-choice"
				onClick={() =>
					editor.chain().focus().insertSingleChoiceQuestion().run()
				}
			>
				<CircleDotIcon />
			</ToolbarButton>
			<ToolbarButton
				label="Несколько вариантов"
				testId="practice-toolbar-multiple-choice"
				onClick={() =>
					editor.chain().focus().insertMultipleChoiceQuestion().run()
				}
			>
				<CheckSquareIcon />
			</ToolbarButton>
			<ToolbarButton
				label="Загрузка файла"
				testId="practice-toolbar-file-upload"
				onClick={() => editor.chain().focus().insertFileUploadQuestion().run()}
			>
				<FileUpIcon />
			</ToolbarButton>
		</div>
	);
}
