import type { Editor } from "@tiptap/react";
import {
	AlignCenterIcon,
	AlignLeftIcon,
	AlignRightIcon,
	BoldIcon,
	CodeXmlIcon,
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	ItalicIcon,
	ListIcon,
	ListOrderedIcon,
	Redo2Icon,
	SigmaIcon,
	SplineIcon,
	TableIcon,
	UnderlineIcon,
	Undo2Icon,
} from "lucide-react";
import { HighlightControls } from "#/features/lesson-editor/ui/highlight-color-button";
import { InsertImageButton } from "#/features/lesson-editor/ui/insert-image-button";
import { InsertLinkButton } from "#/features/lesson-editor/ui/insert-link-dialog";
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
	disabled,
}: {
	pressed?: boolean;
	onClick: () => void;
	label: string;
	children: React.ReactNode;
	testId: string;
	disabled?: boolean;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			aria-label={label}
			aria-pressed={pressed}
			disabled={disabled}
			data-testid={testId}
			className={cn(pressed && "bg-muted text-foreground")}
			onClick={onClick}
		>
			{children}
		</Button>
	);
}

export function TheoryToolbar({ editor }: TheoryToolbarProps) {
	const inTable = editor.isActive("table");

	return (
		<div
			className="flex flex-wrap items-center gap-0.5 px-1.5 py-1"
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
			<ToolbarButton
				label="Подчёркнутый"
				testId="theory-toolbar-underline"
				pressed={editor.isActive("underline")}
				onClick={() => editor.chain().focus().toggleUnderline().run()}
			>
				<UnderlineIcon />
			</ToolbarButton>
			<HighlightControls editor={editor} />
			<InsertLinkButton editor={editor} />

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
				label="По левому краю"
				testId="theory-toolbar-align-left"
				pressed={editor.isActive({ textAlign: "left" })}
				onClick={() => editor.chain().focus().setTextAlign("left").run()}
			>
				<AlignLeftIcon />
			</ToolbarButton>
			<ToolbarButton
				label="По центру"
				testId="theory-toolbar-align-center"
				pressed={editor.isActive({ textAlign: "center" })}
				onClick={() => editor.chain().focus().setTextAlign("center").run()}
			>
				<AlignCenterIcon />
			</ToolbarButton>
			<ToolbarButton
				label="По правому краю"
				testId="theory-toolbar-align-right"
				pressed={editor.isActive({ textAlign: "right" })}
				onClick={() => editor.chain().focus().setTextAlign("right").run()}
			>
				<AlignRightIcon />
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
			<ToolbarButton
				label="Блок кода"
				testId="theory-toolbar-code-block"
				pressed={editor.isActive("codeBlock")}
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
			>
				<CodeXmlIcon />
			</ToolbarButton>
			<ToolbarButton
				label="Вставить таблицу"
				testId="theory-toolbar-table"
				pressed={inTable}
				onClick={() =>
					editor
						.chain()
						.focus()
						.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
						.run()
				}
			>
				<TableIcon />
			</ToolbarButton>
			{inTable ? (
				<>
					<ToolbarButton
						label="Добавить столбец"
						testId="theory-toolbar-table-add-col"
						onClick={() => editor.chain().focus().addColumnAfter().run()}
					>
						<span className="text-[10px] font-semibold">+Col</span>
					</ToolbarButton>
					<ToolbarButton
						label="Добавить строку"
						testId="theory-toolbar-table-add-row"
						onClick={() => editor.chain().focus().addRowAfter().run()}
					>
						<span className="text-[10px] font-semibold">+Row</span>
					</ToolbarButton>
					<ToolbarButton
						label="Удалить таблицу"
						testId="theory-toolbar-table-delete"
						onClick={() => editor.chain().focus().deleteTable().run()}
					>
						<span className="text-[10px] font-semibold">Del</span>
					</ToolbarButton>
				</>
			) : null}

			<Separator orientation="vertical" className="mx-1 h-5" />

			<ToolbarButton
				label="Вставить формулу ($…$)"
				testId="theory-toolbar-math"
				onClick={() => {
					const { from } = editor.state.selection;
					editor
						.chain()
						.focus()
						.insertContent("$  $")
						.setTextSelection(from + 2)
						.run();
				}}
			>
				<SigmaIcon />
			</ToolbarButton>
			<InsertImageButton editor={editor} />
			<InsertVideoButton editor={editor} />
			<ToolbarButton
				label="Вставить интерактив"
				testId="theory-toolbar-live-react"
				onClick={() => editor.chain().focus().insertLiveReact().run()}
			>
				<SplineIcon />
			</ToolbarButton>
		</div>
	);
}
