import type * as React from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
	title: string;
	description?: string;
	actions?: React.ReactNode;
	breadcrumbs?: React.ReactNode;
	className?: string;
};

function PageHeader({
	title,
	description,
	actions,
	breadcrumbs,
	className,
}: PageHeaderProps) {
	return (
		<header
			data-slot="page-header"
			className={cn(
				"flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
				className,
			)}
		>
			<div className="min-w-0 space-y-1.5">
				{breadcrumbs ? (
					<div className="text-muted-foreground">{breadcrumbs}</div>
				) : null}
				<h1 className="font-heading text-2xl font-medium tracking-tight text-balance">
					{title}
				</h1>
				{description ? (
					<p className="max-w-2xl text-sm text-muted-foreground text-pretty">
						{description}
					</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					{actions}
				</div>
			) : null}
		</header>
	);
}

export { PageHeader };
export type { PageHeaderProps };
