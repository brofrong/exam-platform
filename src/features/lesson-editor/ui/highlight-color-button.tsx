import type { Editor } from "@tiptap/react";
import { ChevronDownIcon, HighlighterIcon } from "lucide-react";
import { useState } from "react";
import {
	DEFAULT_THEORY_HIGHLIGHT_COLOR,
	THEORY_HIGHLIGHT_COLORS,
} from "#/features/lesson-editor/lib/highlight-colors";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type HighlightControlsProps = {
	editor: Editor;
};

export function HighlightControls({ editor }: HighlightControlsProps) {
	const [open, setOpen] = useState(false);
	const [lastColor, setLastColor] = useState<string>(
		DEFAULT_THEORY_HIGHLIGHT_COLOR,
	);
	const active = editor.isActive("highlight");
	const activeColor = editor.getAttributes("highlight").color;
	const swatchColor =
		typeof activeColor === "string" && activeColor.length > 0
			? activeColor
			: lastColor;

	function toggleHighlight() {
		editor.chain().focus().toggleHighlight({ color: lastColor }).run();
	}

	function applyColor(color: string) {
		setLastColor(color);
		editor.chain().focus().setHighlight({ color }).run();
		setOpen(false);
	}

	return (
		<div className="flex items-center" data-testid="theory-highlight-controls">
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Выделение"
				aria-pressed={active}
				data-testid="theory-toolbar-highlight"
				className={cn(active && "bg-muted text-foreground")}
				onClick={toggleHighlight}
			>
				<HighlighterIcon />
			</Button>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="Цвет выделения"
						data-testid="theory-toolbar-highlight-color"
						className="relative w-6"
					>
						<span
							aria-hidden
							className="absolute top-1.5 left-1 size-2.5 rounded-sm ring-1 ring-border"
							style={{ backgroundColor: swatchColor }}
						/>
						<ChevronDownIcon className="absolute right-0.5 size-3 opacity-70" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-auto gap-1.5 p-2"
					data-testid="theory-highlight-popover"
				>
					<PopoverHeader className="px-0.5">
						<PopoverTitle>Цвет выделения</PopoverTitle>
					</PopoverHeader>
					<div className="grid grid-cols-5 gap-1">
						{THEORY_HIGHLIGHT_COLORS.map((color) => {
							const selected = swatchColor === color.cssVar;
							return (
								<button
									key={color.id}
									type="button"
									title={color.label}
									aria-label={color.label}
									aria-pressed={selected}
									data-testid={`theory-highlight-${color.id}`}
									className={cn(
										"size-7 rounded-md ring-1 ring-border transition-transform hover:scale-105",
										selected &&
											"ring-2 ring-ring ring-offset-1 ring-offset-popover",
									)}
									style={{ backgroundColor: color.cssVar }}
									onClick={() => applyColor(color.cssVar)}
								/>
							);
						})}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
