import { GripVerticalIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

type EntityRowProps = {
	title: string;
	subtitle?: string;
	status?: React.ReactNode;
	actions?: React.ReactNode;
	draggable?: boolean;
	className?: string;
};

function EntityRow({
	title,
	subtitle,
	status,
	actions,
	draggable = false,
	className,
}: EntityRowProps) {
	return (
		<div
			data-slot="entity-row"
			data-testid="entity-row"
			className={cn(
				"flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-sm",
				className,
			)}
		>
			{draggable ? (
				<span
					data-testid="entity-row-handle"
					className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground"
					aria-hidden
				>
					<GripVerticalIcon className="size-4" />
				</span>
			) : null}
			<div className="min-w-0 flex-1 space-y-0.5">
				<div className="flex flex-wrap items-center gap-2">
					<p className="truncate font-medium">{title}</p>
					{status}
				</div>
				{subtitle ? (
					<p className="truncate text-xs text-muted-foreground">{subtitle}</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex shrink-0 items-center gap-1">{actions}</div>
			) : null}
		</div>
	);
}

export { EntityRow };
export type { EntityRowProps };
