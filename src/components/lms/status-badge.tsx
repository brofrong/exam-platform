import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
	draft: "Черновик",
	published: "Опубликовано",
	pending: "На проверке",
	graded: "Проверено",
	correct: "Верно",
	incorrect: "Неверно",
} as const;

type StatusVariant = keyof typeof STATUS_LABELS;

const statusBadgeVariants = cva("", {
	variants: {
		status: {
			draft: "border-transparent bg-muted text-muted-foreground",
			published: "border-transparent bg-primary/10 text-primary",
			pending: "border-transparent bg-secondary text-secondary-foreground",
			graded: "border-transparent bg-primary/10 text-primary",
			correct:
				"border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
			incorrect: "border-transparent bg-destructive/10 text-destructive",
		},
	},
	defaultVariants: {
		status: "draft",
	},
});

type StatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "variant"> &
	VariantProps<typeof statusBadgeVariants> & {
		status: StatusVariant;
		label?: string;
	};

function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
	return (
		<Badge
			data-slot="status-badge"
			data-status={status}
			variant="outline"
			className={cn(statusBadgeVariants({ status }), className)}
			{...props}
		>
			{label ?? STATUS_LABELS[status]}
		</Badge>
	);
}

export { StatusBadge, STATUS_LABELS, statusBadgeVariants };
export type { StatusBadgeProps, StatusVariant };
