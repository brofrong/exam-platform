import type * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
};

function EmptyState({
	title,
	description,
	icon,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			data-slot="empty-state"
			className={cn(
				"flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center",
				className,
			)}
		>
			{icon ? (
				<div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">
					{icon}
				</div>
			) : null}
			<div className="space-y-1">
				<p className="font-heading text-base font-medium">{title}</p>
				{description ? (
					<p className="max-w-sm text-sm text-muted-foreground text-pretty">
						{description}
					</p>
				) : null}
			</div>
			{action ? <div className="pt-1">{action}</div> : null}
		</div>
	);
}

export { EmptyState };
export type { EmptyStateProps };
