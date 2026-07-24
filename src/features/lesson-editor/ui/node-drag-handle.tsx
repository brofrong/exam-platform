import { cn } from "@/lib/utils";

export type NodeDragHandleProps = {
	label: string;
	"data-testid"?: string;
	className?: string;
};

/**
 * Explicit TipTap drag grip. Must be the only element with `data-drag-handle`
 * inside interactive atom NodeViews — never put that attr on NodeViewWrapper.
 *
 * `draggable` on the grip makes dragstart's target the handle so TipTap's
 * onDragStart can find `[data-drag-handle]` (outer atom DOM is also draggable).
 */
export function NodeDragHandle({
	label,
	"data-testid": testId,
	className,
}: NodeDragHandleProps) {
	return (
		<button
			type="button"
			draggable
			contentEditable={false}
			data-drag-handle
			data-testid={testId}
			aria-label={label}
			title="Переместить"
			className={cn(
				"inline-flex shrink-0 cursor-grab touch-none select-none items-center rounded px-1 py-0.5 text-xs text-muted-foreground active:cursor-grabbing",
				className,
			)}
		>
			⋮⋮
		</button>
	);
}
