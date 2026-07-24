import type * as React from "react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
	label: string;
	value: React.ReactNode;
	hint?: string;
	className?: string;
};

function StatCard({ label, value, hint, className }: StatCardProps) {
	return (
		<Card data-slot="stat-card" size="sm" className={cn(className)}>
			<CardHeader>
				<CardDescription>{label}</CardDescription>
				<CardTitle className="font-heading text-2xl tabular-nums">
					{value}
				</CardTitle>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			</CardHeader>
		</Card>
	);
}

export { StatCard };
export type { StatCardProps };
