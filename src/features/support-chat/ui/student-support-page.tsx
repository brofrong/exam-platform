import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader, SupportMessageBubble } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type StudentSupportPageProps = {
	userId: string;
	userName: string;
};

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

export function StudentSupportPage({
	userId,
	userName,
}: StudentSupportPageProps) {
	const zero = useZero();
	const [thread, threadDetails] = useQuery(queries.mySupportThread());
	const [body, setBody] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const messages = thread?.messages ?? [];
	const lastMessageId = messages.at(-1)?.id;
	// `.one()` with no row stays `undefined` after sync — use details, not data.
	const loading = threadDetails.type === "unknown";

	useEffect(() => {
		if (!lastMessageId) {
			return;
		}
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [lastMessageId]);

	async function handleSend(event: React.FormEvent) {
		event.preventDefault();
		const trimmed = body.trim();
		if (trimmed.length === 0 || isSending) {
			return;
		}
		setError(null);
		setIsSending(true);
		try {
			await zero.mutate(
				mutators.sendSupportMessage({
					body: trimmed,
					threadId: thread?.id,
					messageId: crypto.randomUUID(),
				}),
			);
			setBody("");
		} catch {
			setError("Не удалось отправить сообщение");
		} finally {
			setIsSending(false);
		}
	}

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10"
			data-testid="student-support-page"
		>
			<PageHeader
				title="Поддержка"
				description="Напишите преподавателю — ответ появится здесь."
				breadcrumbs={
					<nav className="text-sm">
						<Link
							to="/app"
							className="hover:text-foreground"
							data-testid="support-home-link"
						>
							Кабинет
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">Поддержка</span>
					</nav>
				}
				actions={
					<Button asChild variant="outline" data-testid="support-back-home">
						<Link to="/app">Назад</Link>
					</Button>
				}
			/>

			{loading ? (
				<p className="text-sm text-muted-foreground">Загрузка чата…</p>
			) : (
				<div
					className="flex min-h-[28rem] flex-col rounded-xl border bg-card"
					data-testid="support-chat-panel"
				>
					<div
						className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
						data-testid="support-message-list"
					>
						{messages.length === 0 ? (
							<EmptyState
								title="Пока нет сообщений"
								description="Напишите первый вопрос — преподаватель ответит здесь."
							/>
						) : (
							messages.map((message) => {
								const outgoing = message.authorId === userId;
								return (
									<div
										key={message.id}
										data-testid={`support-message-${message.id}`}
									>
										<SupportMessageBubble
											body={message.body}
											authorName={
												outgoing
													? userName
													: (message.author?.name ?? "Преподаватель")
											}
											timestamp={formatMessageTime(message.createdAt)}
											side={outgoing ? "outgoing" : "incoming"}
										/>
									</div>
								);
							})
						)}
						<div ref={bottomRef} />
					</div>

					<form
						className="flex flex-col gap-2 border-t p-3"
						onSubmit={handleSend}
						data-testid="support-compose"
					>
						<Textarea
							value={body}
							onChange={(event) => setBody(event.target.value)}
							placeholder="Ваше сообщение…"
							rows={3}
							disabled={isSending}
							data-testid="support-message-input"
						/>
						{error ? (
							<p
								className="text-sm text-destructive"
								data-testid="support-error"
							>
								{error}
							</p>
						) : null}
						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={isSending || body.trim().length === 0}
								data-testid="support-send"
							>
								{isSending ? "Отправка…" : "Отправить"}
							</Button>
						</div>
					</form>
				</div>
			)}
		</main>
	);
}
