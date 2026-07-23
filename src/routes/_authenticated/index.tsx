import { useQuery, useZero } from "@rocicorp/zero/react";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, MessageSquarePlus, Send } from "lucide-react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	getOldestCursor,
	hasMoreMessages,
	isNearBottom,
	mergeMessagePages,
	preserveScrollTop,
} from "#/utils/chat-pagination";
import { mutators } from "#/zero/mutators";
import { queries } from "#/zero/queries";

export const Route = createFileRoute("/_authenticated/")({
	component: ChatApp,
});

function ChatApp() {
	const { user } = Route.useRouteContext();
	const zero = useZero();
	const [chats] = useQuery(queries.allChats());
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [newChatTitle, setNewChatTitle] = useState("");
	const [message, setMessage] = useState("");
	const [isCreatingChat, setIsCreatingChat] = useState(false);

	useEffect(() => {
		if (!selectedChatId && chats.length > 0) {
			setSelectedChatId(chats[0].id);
		}
	}, [chats, selectedChatId]);

	const handleLogout = async () => {
		await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
		await zero.delete();
		window.location.href = "/login";
	};

	const handleCreateChat = async (event: React.FormEvent) => {
		event.preventDefault();
		const title = newChatTitle.trim();
		if (!title) {
			return;
		}

		const id = crypto.randomUUID();
		await zero.mutate(mutators.createChat({ id, title }));
		setNewChatTitle("");
		setIsCreatingChat(false);
		setSelectedChatId(id);
	};

	return (
		<div className="flex h-[calc(100vh-4.5rem)] overflow-hidden border-t border-border">
			<aside className="flex w-72 shrink-0 flex-col border-r border-border bg-bg-surface">
				<div className="border-b border-border p-4">
					<p className="text-sm text-text-muted">Вы вошли как</p>
					<p className="font-semibold text-text-heading">{user.login}</p>
					<button
						type="button"
						onClick={handleLogout}
						className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted transition hover:bg-bg-sunken hover:text-text-heading"
					>
						<LogOut size={16} />
						Выйти
					</button>
				</div>

				<div className="border-b border-border p-4">
					{isCreatingChat ? (
						<form onSubmit={handleCreateChat} className="space-y-2">
							<input
								value={newChatTitle}
								onChange={(event) => setNewChatTitle(event.target.value)}
								placeholder="Название чата"
								className="w-full rounded-lg border border-border bg-bg-page px-3 py-2 text-sm outline-none focus:border-border-focus"
							/>
							<div className="flex gap-2">
								<button
									type="submit"
									className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground"
								>
									Создать
								</button>
								<button
									type="button"
									onClick={() => {
										setIsCreatingChat(false);
										setNewChatTitle("");
									}}
									className="rounded-lg border border-border px-3 py-1.5 text-sm"
								>
									Отмена
								</button>
							</div>
						</form>
					) : (
						<button
							type="button"
							onClick={() => setIsCreatingChat(true)}
							className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-foreground"
						>
							<MessageSquarePlus size={16} />
							Новый чат
						</button>
					)}
				</div>

				<div className="flex-1 overflow-y-auto p-2">
					{chats.length === 0 ? (
						<p className="p-3 text-sm text-text-muted">Пока нет чатов</p>
					) : (
						chats.map((chat) => (
							<button
								key={chat.id}
								type="button"
								onClick={() => setSelectedChatId(chat.id)}
								className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition ${
									selectedChatId === chat.id
										? "bg-brand-subtle text-text-heading"
										: "text-text-body hover:bg-bg-sunken"
								}`}
							>
								{chat.title}
							</button>
						))
					)}
				</div>
			</aside>

			<main className="flex min-w-0 flex-1 flex-col bg-bg-page">
				{selectedChatId ? (
					<ChatWindow
						key={selectedChatId}
						chatId={selectedChatId}
						currentUserId={user.id}
						message={message}
						setMessage={setMessage}
					/>
				) : (
					<div className="flex flex-1 items-center justify-center text-text-muted">
						Выберите чат или создайте новый
					</div>
				)}
			</main>
		</div>
	);
}

function ChatWindow({
	chatId,
	currentUserId,
	message,
	setMessage,
}: {
	chatId: string;
	currentUserId: string;
	message: string;
	setMessage: (value: string) => void;
}) {
	const zero = useZero();
	const [newestPage] = useQuery(queries.chatMessagePage({ chatId }));
	const [olderPages, setOlderPages] = useState<
		Array<NonNullable<typeof newestPage>>
	>([]);
	const [retainedNewest, setRetainedNewest] = useState<
		NonNullable<typeof newestPage>
	>([]);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [chats] = useQuery(queries.allChats());
	const scrollRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const shouldStickToBottomRef = useRef(true);
	const pendingScrollRestoreRef = useRef<{
		previousScrollHeight: number;
		previousScrollTop: number;
	} | null>(null);
	const isLoadingMoreRef = useRef(false);

	const chat = chats.find((item) => item.id === chatId);
	const messages = useMemo(
		() => mergeMessagePages(...olderPages, retainedNewest),
		[olderPages, retainedNewest],
	);

	useEffect(() => {
		const page = (newestPage ?? []).filter((item) => item.chatId === chatId);
		setRetainedNewest((current) => {
			const sameChat = current.every((item) => item.chatId === chatId);
			return mergeMessagePages(sameChat ? current : [], page);
		});
		if (olderPages.length === 0) {
			setHasMore(hasMoreMessages(page.length));
		}
	}, [chatId, newestPage, olderPages.length]);

	const messageAnchorKey = `${messages.length}:${messages.at(0)?.id ?? ""}:${messages.at(-1)?.id ?? ""}`;

	useLayoutEffect(() => {
		void messageAnchorKey;
		const container = scrollRef.current;
		const pending = pendingScrollRestoreRef.current;
		if (container && pending) {
			container.scrollTop = preserveScrollTop({
				previousScrollHeight: pending.previousScrollHeight,
				previousScrollTop: pending.previousScrollTop,
				nextScrollHeight: container.scrollHeight,
			});
			pendingScrollRestoreRef.current = null;
			return;
		}

		if (shouldStickToBottomRef.current) {
			bottomRef.current?.scrollIntoView({ behavior: "instant" });
		}
	}, [messageAnchorKey]);

	const loadOlderMessages = useCallback(async () => {
		if (isLoadingMoreRef.current || !hasMore) {
			return;
		}

		const cursor = getOldestCursor(messages);
		if (!cursor) {
			setHasMore(false);
			return;
		}

		const container = scrollRef.current;
		if (container) {
			pendingScrollRestoreRef.current = {
				previousScrollHeight: container.scrollHeight,
				previousScrollTop: container.scrollTop,
			};
		}

		isLoadingMoreRef.current = true;
		setIsLoadingMore(true);
		try {
			const page = await zero.run(queries.chatMessagePage({ chatId, cursor }), {
				type: "complete",
			});
			setOlderPages((current) => [...current, page]);
			setHasMore(hasMoreMessages(page.length));
		} finally {
			isLoadingMoreRef.current = false;
			setIsLoadingMore(false);
		}
	}, [chatId, hasMore, messages, zero]);

	const handleScroll = () => {
		const container = scrollRef.current;
		if (!container) {
			return;
		}

		shouldStickToBottomRef.current = isNearBottom({
			scrollTop: container.scrollTop,
			scrollHeight: container.scrollHeight,
			clientHeight: container.clientHeight,
		});

		if (container.scrollTop <= 64) {
			void loadOlderMessages();
		}
	};

	const handleSend = async (event: React.FormEvent) => {
		event.preventDefault();
		const content = message.trim();
		if (!content) {
			return;
		}

		shouldStickToBottomRef.current = true;
		await zero.mutate(
			mutators.sendMessage({
				id: crypto.randomUUID(),
				chatId,
				content,
			}),
		);
		setMessage("");
	};

	return (
		<>
			<div className="border-b border-border px-6 py-4">
				<h1 className="text-lg font-semibold text-text-heading">
					{chat?.title ?? "Чат"}
				</h1>
			</div>

			<div
				ref={scrollRef}
				onScroll={handleScroll}
				className="flex-1 space-y-3 overflow-y-auto px-6 py-4"
			>
				{isLoadingMore && (
					<p className="text-center text-xs text-text-muted">
						Загрузка сообщений...
					</p>
				)}
				{messages.length === 0 ? (
					<p className="text-sm text-text-muted">Сообщений пока нет</p>
				) : (
					messages.map((item) => {
						const isOwn = item.authorId === currentUserId;
						const authorLogin =
							"author" in item &&
							item.author &&
							typeof item.author === "object" &&
							"login" in item.author
								? String(item.author.login)
								: "unknown";
						return (
							<div
								key={item.id}
								className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
										isOwn
											? "bg-brand text-brand-foreground"
											: "bg-bg-elevated text-text-body"
									}`}
								>
									{!isOwn && (
										<p className="mb-1 text-xs font-medium opacity-80">
											{authorLogin}
										</p>
									)}
									<p>{item.content}</p>
								</div>
							</div>
						);
					})
				)}
				<div ref={bottomRef} />
			</div>

			<form
				onSubmit={handleSend}
				className="flex gap-2 border-t border-border px-6 py-4"
			>
				<input
					value={message}
					onChange={(event) => setMessage(event.target.value)}
					placeholder="Напишите сообщение..."
					className="min-w-0 flex-1 rounded-xl border border-border bg-bg-surface px-4 py-2 text-sm outline-none focus:border-border-focus"
				/>
				<button
					type="submit"
					className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-brand-foreground disabled:opacity-50"
					disabled={!message.trim()}
				>
					<Send size={16} />
					Отправить
				</button>
			</form>
		</>
	);
}
