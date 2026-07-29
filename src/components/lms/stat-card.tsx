import type * as React from "react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StatCardProps = {
	label: string;
	value: React.ReactNode;
	hint?: string;
	icon?: React.ReactNode;
	progress?: number;
	className?: string;
};

function StatCard({
	label,
	value,
	hint,
	icon,
	progress,
	className,
}: StatCardProps) {
	return (
		<Card data-slot="stat-card" size="sm" className={cn(className)}>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardDescription>{label}</CardDescription>
					{icon ? (
						<span className="inline-flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
							{icon}
						</span>
					) : null}
				</div>
				<CardTitle className="font-heading text-2xl tabular-nums">
					{value}
				</CardTitle>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
				{typeof progress === "number" ? (
					<Progress value={progress} aria-label={label} className="mt-1.5" />
				) : null}
			</CardHeader>
		</Card>
	);
}

export { StatCard };
export type { StatCardProps };
