import { useQuery } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader, PendingReviewList } from "@/components/lms";
import { Button } from "@/components/ui/button";

function formatSubmittedAt(ms: number): string {
	return new Date(ms).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function ReviewsQueuePage() {
	const navigate = useNavigate();
	const [pending] = useQuery(queries.pendingSubmissions());

	const items = (pending ?? []).map((submission) => ({
		id: submission.id,
		title: submission.activity
			? `Практика · позиция ${submission.activity.position + 1}`
			: "Практика",
		subtitle: [submission.user?.name ?? "Ученик", submission.program?.title]
			.filter(Boolean)
			.join(" · "),
		submittedAt:
			submission.createdAt == null
				? undefined
				: formatSubmittedAt(submission.createdAt),
	}));

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-reviews-queue"
		>
			<PageHeader
				title="Проверка работ"
				description="Очередь ответов с ручной проверкой."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="reviews-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Проверка</span>
					</nav>
				}
				actions={
					<Button asChild variant="outline" data-testid="reviews-back-admin">
						<Link to="/admin">Назад</Link>
					</Button>
				}
			/>

			{pending === undefined ? (
				<p className="text-sm text-muted-foreground">Загрузка очереди…</p>
			) : items.length === 0 ? (
				<EmptyState
					title="Нет работ на проверке"
					description="Когда ученики отправят ответы с ручной проверкой, они появятся здесь."
				/>
			) : (
				<PendingReviewList
					items={items}
					onItemClick={(id) => {
						void navigate({
							to: "/admin/reviews/$submissionId",
							params: { submissionId: id },
						});
					}}
				/>
			)}
		</main>
	);
}
