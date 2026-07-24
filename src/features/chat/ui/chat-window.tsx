import { useQuery, useZero } from "@rocicorp/zero/react";
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
} from "#/features/chat/lib/pagination";
import { MessageBubble } from "#/features/chat/ui/message-bubble";
import { MessageComposer } from "#/features/chat/ui/message-composer";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";

type ChatWindowProps = {
	chatId: string;
	currentUserId: string;
	message: string;
	setMessage: (value: string) => void;
};

function authorNameFromMessage(item: { author?: unknown }): string {
	if (item.author && typeof item.author === "object" && "name" in item.author) {
		return String(item.author.name);
	}
	return "unknown";
}

export function ChatWindow({
	chatId,
	currentUserId,
	message,
	setMessage,
}: ChatWindowProps) {
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
				<h1 className="text-lg font-semibold text-foreground">
					{chat?.title ?? "Чат"}
				</h1>
			</div>

			<div
				ref={scrollRef}
				onScroll={handleScroll}
				className="flex-1 space-y-3 overflow-y-auto px-6 py-4"
			>
				{isLoadingMore && (
					<p className="text-center text-xs text-muted-foreground">
						Загрузка сообщений...
					</p>
				)}
				{messages.length === 0 ? (
					<p className="text-sm text-muted-foreground">Сообщений пока нет</p>
				) : (
					messages.map((item) => (
						<MessageBubble
							key={item.id}
							content={item.content}
							authorName={authorNameFromMessage(item)}
							isOwn={item.authorId === currentUserId}
						/>
					))
				)}
				<div ref={bottomRef} />
			</div>

			<MessageComposer
				value={message}
				onChange={setMessage}
				onSubmit={handleSend}
			/>
		</>
	);
}
