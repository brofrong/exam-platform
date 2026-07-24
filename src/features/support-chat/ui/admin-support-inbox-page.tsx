import { useQuery } from "@rocicorp/zero/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MessageCircleIcon } from "lucide-react";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader } from "@/components/lms";
import { Button } from "@/components/ui/button";

function formatMessageTime(ms: number | null | undefined): string {
	if (ms == null) {
		return "";
	}
	return new Date(ms).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function previewBody(body: string, max = 96): string {
	const trimmed = body.trim();
	if (trimmed.length <= max) {
		return trimmed;
	}
	return `${trimmed.slice(0, max - 1)}…`;
}

export function AdminSupportInboxPage() {
	const navigate = useNavigate();
	const [threads] = useQuery(queries.supportThreads());

	const items = (threads ?? []).map((thread) => {
		const last = thread.messages?.[0];
		return {
			id: thread.id,
			studentName: thread.student?.name ?? "Ученик",
			preview: last ? previewBody(last.body) : "Нет сообщений",
			at: last?.createdAt ?? thread.createdAt,
		};
	});

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10"
			data-testid="admin-support-inbox"
		>
			<PageHeader
				title="Поддержка"
				description="Переписка с учениками — один тред на ученика."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/admin"
							className="hover:text-foreground"
							data-testid="support-admin-link"
						>
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Поддержка</span>
					</nav>
				}
				actions={
					<Button asChild variant="outline" data-testid="support-back-admin">
						<Link to="/admin">Назад</Link>
					</Button>
				}
			/>

			{threads === undefined ? (
				<p className="text-sm text-muted-foreground">Загрузка тредов…</p>
			) : items.length === 0 ? (
				<EmptyState
					icon={<MessageCircleIcon />}
					title="Пока нет обращений"
					description="Когда ученик напишет в поддержку, тред появится здесь."
				/>
			) : (
				<ul className="flex flex-col gap-2" data-testid="support-thread-list">
					{items.map((item) => (
						<li key={item.id}>
							<button
								type="button"
								className="flex w-full flex-col gap-1 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
								data-testid={`support-thread-${item.id}`}
								onClick={() => {
									void navigate({
										to: "/admin/support/$threadId",
										params: { threadId: item.id },
									});
								}}
							>
								<div className="flex items-baseline justify-between gap-3">
									<span className="font-medium">{item.studentName}</span>
									<span className="text-xs text-muted-foreground">
										{formatMessageTime(item.at)}
									</span>
								</div>
								<p className="line-clamp-2 text-sm text-muted-foreground">
									{item.preview}
								</p>
							</button>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
