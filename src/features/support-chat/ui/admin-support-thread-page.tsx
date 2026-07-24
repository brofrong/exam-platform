import { useQuery, useZero } from "@rocicorp/zero/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { EmptyState, PageHeader, SupportMessageBubble } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AdminSupportThreadPageProps = {
	threadId: string;
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

export function AdminSupportThreadPage({
	threadId,
	userId,
	userName,
}: AdminSupportThreadPageProps) {
	const zero = useZero();
	const [thread, threadDetails] = useQuery(
		queries.supportThreadById({ id: threadId }),
	);
	const [body, setBody] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const messages = thread?.messages ?? [];
	const lastMessageId = messages.at(-1)?.id;

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
					threadId,
					messageId: crypto.randomUUID(),
				}),
			);
			setBody("");
		} catch {
			setError("Не удалось отправить ответ");
		} finally {
			setIsSending(false);
		}
	}

	if (threadDetails.type === "unknown") {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Загрузка треда…</p>
			</main>
		);
	}

	if (thread == null) {
		return (
			<main
				className="mx-auto w-full max-w-3xl px-4 py-10"
				data-testid="admin-support-missing"
			>
				<EmptyState
					title="Тред не найден"
					description="Возможно, он был удалён или у вас нет доступа."
				/>
				<div className="mt-4">
					<Button asChild variant="outline">
						<Link to="/admin/support">К списку</Link>
					</Button>
				</div>
			</main>
		);
	}

	const studentName = thread.student?.name ?? "Ученик";

	return (
		<main
			className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10"
			data-testid="admin-support-thread"
		>
			<PageHeader
				title={studentName}
				description="Ответ ученику в чате поддержки."
				breadcrumbs={
					<nav className="text-sm">
						<Link to="/admin" className="hover:text-foreground">
							Админка
						</Link>
						<span className="mx-1.5">/</span>
						<Link
							to="/admin/support"
							className="hover:text-foreground"
							data-testid="support-inbox-link"
						>
							Поддержка
						</Link>
						<span className="mx-1.5">/</span>
						<span className="text-foreground">{studentName}</span>
					</nav>
				}
				actions={
					<Button asChild variant="outline" data-testid="support-back-inbox">
						<Link to="/admin/support">К списку</Link>
					</Button>
				}
			/>

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
							title="Нет сообщений"
							description="Ученик ещё ничего не написал."
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
												: (message.author?.name ?? studentName)
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
						placeholder="Ответ ученику…"
						rows={3}
						disabled={isSending}
						data-testid="support-message-input"
					/>
					{error ? (
						<p className="text-sm text-destructive" data-testid="support-error">
							{error}
						</p>
					) : null}
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={isSending || body.trim().length === 0}
							data-testid="support-send"
						>
							{isSending ? "Отправка…" : "Ответить"}
						</Button>
					</div>
				</form>
			</div>
		</main>
	);
}
