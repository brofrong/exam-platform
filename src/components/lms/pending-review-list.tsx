import { EmptyState } from "@/components/lms/empty-state";
import { StatusBadge } from "@/components/lms/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PendingReviewItem = {
	id: string;
	title: string;
	subtitle?: string;
	submittedAt?: string;
};

type PendingReviewListProps = {
	items: PendingReviewItem[];
	emptyTitle?: string;
	emptyDescription?: string;
	onItemClick?: (id: string) => void;
	className?: string;
};

function PendingReviewList({
	items,
	emptyTitle = "Нет работ на проверке",
	emptyDescription = "Когда появятся ответы с ручной проверкой, они отобразятся здесь.",
	onItemClick,
	className,
}: PendingReviewListProps) {
	if (items.length === 0) {
		return (
			<EmptyState
				title={emptyTitle}
				description={emptyDescription}
				className={className}
			/>
		);
	}

	return (
		<ul
			data-slot="pending-review-list"
			data-testid="pending-review-list"
			className={cn("divide-y divide-border rounded-xl border", className)}
		>
			{items.map((item) => (
				<li key={item.id}>
					<div className="flex items-center gap-3 px-4 py-3">
						<div className="min-w-0 flex-1 space-y-0.5">
							<div className="flex flex-wrap items-center gap-2">
								<p className="truncate text-sm font-medium">{item.title}</p>
								<StatusBadge status="pending" />
							</div>
							{(item.subtitle || item.submittedAt) && (
								<p className="truncate text-xs text-muted-foreground">
									{[item.subtitle, item.submittedAt]
										.filter(Boolean)
										.join(" · ")}
								</p>
							)}
						</div>
						{onItemClick ? (
							<Button
								size="sm"
								variant="outline"
								data-testid={`pending-review-item-${item.id}`}
								onClick={() => onItemClick(item.id)}
							>
								Открыть
							</Button>
						) : null}
					</div>
				</li>
			))}
		</ul>
	);
}

export { PendingReviewList };
export type { PendingReviewListProps, PendingReviewItem };
