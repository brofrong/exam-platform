import type { Editor } from "@tiptap/react";
import {
	BotIcon,
	PanelLeftCloseIcon,
	PanelLeftOpenIcon,
	SendIcon,
} from "lucide-react";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { createTheoryEditorApply } from "#/features/ai-author-chat/lib/apply-to-editor";
import type {
	AuthorChatMessage,
	ChatMode,
} from "#/features/ai-author-chat/lib/chat-types";
import { MAX_DOCUMENT_JSON_CHARS } from "#/features/ai-author-chat/lib/chat-types";
import {
	type AiAuthorEditorBridge,
	AiAuthorEditorBridgeProvider,
} from "#/features/ai-author-chat/lib/editor-bridge";
import { ChatMessageContent } from "#/features/ai-author-chat/ui/chat-message-content";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AiAuthorChatPanelProps = {
	mode: ChatMode;
	title?: string;
	/** Current TipTap JSON (or stringified). Truncated before send. */
	documentJson?: unknown;
	className?: string;
};

function newId(): string {
	return crypto.randomUUID();
}

async function readSseAssistantText(
	response: Response,
	onDelta: (chunk: string) => void,
): Promise<void> {
	if (!response.body) {
		throw new Error("Пустой ответ от сервера");
	}
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const parts = buffer.split("\n");
		buffer = parts.pop() ?? "";

		for (const line of parts) {
			const trimmed = line.trim();
			if (!trimmed.startsWith("data:")) continue;
			const data = trimmed.slice(5).trim();
			if (data === "[DONE]") continue;
			try {
				const json = JSON.parse(data) as {
					choices?: Array<{ delta?: { content?: string } }>;
				};
				const delta = json.choices?.[0]?.delta?.content;
				if (typeof delta === "string" && delta.length > 0) {
					onDelta(delta);
				}
			} catch {
				// ignore malformed SSE chunks
			}
		}
	}
}

export function AiAuthorChatPanel({
	mode,
	title,
	documentJson,
	className,
}: AiAuthorChatPanelProps) {
	const [open, setOpen] = useState(true);
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<AuthorChatMessage[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isStreaming, setIsStreaming] = useState(false);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
		});
	};

	const send = async () => {
		const text = input.trim();
		if (!text || isStreaming) return;

		const userMessage: AuthorChatMessage = {
			id: newId(),
			role: "user",
			content: text,
		};
		const assistantId = newId();
		const nextMessages = [...messages, userMessage];
		setMessages([
			...nextMessages,
			{ id: assistantId, role: "assistant", content: "" },
		]);
		scrollToBottom();
		setInput("");
		setError(null);
		setIsStreaming(true);

		let documentPayload: string | undefined;
		if (documentJson != null) {
			try {
				const raw =
					typeof documentJson === "string"
						? documentJson
						: JSON.stringify(documentJson, null, 2);
				documentPayload = raw.slice(0, MAX_DOCUMENT_JSON_CHARS);
			} catch {
				documentPayload = undefined;
			}
		}

		try {
			const response = await fetch("/api/ai/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					mode,
					title,
					documentJson: documentPayload,
					messages: nextMessages.map((message) => ({
						role: message.role,
						content: message.content,
					})),
				}),
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(payload?.error ?? `Ошибка ${response.status}`);
			}

			await readSseAssistantText(response, (chunk) => {
				setMessages((prev) =>
					prev.map((message) =>
						message.id === assistantId
							? { ...message, content: message.content + chunk }
							: message,
					),
				);
				scrollToBottom();
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Не удалось получить ответ";
			setError(message);
			setMessages((prev) =>
				prev.filter(
					(item) => !(item.id === assistantId && item.content.length === 0),
				),
			);
		} finally {
			setIsStreaming(false);
			scrollToBottom();
		}
	};

	if (!open) {
		return (
			<div className={cn("shrink-0", className)}>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setOpen(true)}
					data-testid="ai-author-chat-open"
				>
					<PanelLeftOpenIcon className="size-4" />
					ИИ
				</Button>
			</div>
		);
	}

	return (
		<aside
			className={cn(
				"flex w-full max-w-full shrink-0 flex-col border-r bg-muted/20 md:w-[360px] md:max-w-[360px]",
				className,
			)}
			data-testid="ai-author-chat-panel"
		>
			<div className="flex items-center gap-2 border-b px-3 py-2">
				<BotIcon className="size-4 text-muted-foreground" />
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">ИИ-ассистент</p>
					<p className="truncate text-xs text-muted-foreground">
						{mode === "theory" ? "Теория" : "Вопрос теста"} · Вставить /
						Заменить всё
					</p>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => setOpen(false)}
					data-testid="ai-author-chat-close"
					aria-label="Скрыть чат"
				>
					<PanelLeftCloseIcon className="size-4" />
				</Button>
			</div>

			<ScrollArea className="min-h-0 flex-1 px-3 py-3">
				<div className="grid gap-3">
					{messages.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Опиши тему или попроси фрагмент теории / Mafs-график / вопрос. У
							блоков кода появятся кнопки «Вставить» и «Заменить всё».
						</p>
					) : null}
					{messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								"rounded-xl px-3 py-2",
								message.role === "user"
									? "bg-primary/10 text-foreground"
									: "bg-background border",
							)}
							data-testid={`ai-chat-message-${message.role}`}
						>
							<p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
								{message.role === "user" ? "Вы" : "ИИ"}
							</p>
							{message.content.length > 0 ? (
								<ChatMessageContent content={message.content} />
							) : (
								<p className="text-sm text-muted-foreground">Печатает…</p>
							)}
						</div>
					))}
					<div ref={bottomRef} />
				</div>
			</ScrollArea>

			<div className="grid gap-2 border-t p-3">
				{error ? (
					<p className="text-xs text-destructive" data-testid="ai-chat-error">
						{error}
					</p>
				) : null}
				<Textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Например: объясни закон Ома с графиком…"
					rows={3}
					disabled={isStreaming}
					data-testid="ai-chat-input"
					onKeyDown={(event) => {
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							void send();
						}
					}}
				/>
				<Button
					type="button"
					onClick={() => void send()}
					disabled={isStreaming || input.trim().length === 0}
					data-testid="ai-chat-send"
				>
					<SendIcon className="size-4" />
					{isStreaming ? "Ждём ответ…" : "Отправить"}
				</Button>
			</div>
		</aside>
	);
}

/** Split layout: optional left chat + main editor column. */
export function AiAuthorWorkspace({
	mode,
	title,
	documentJson,
	children,
}: {
	mode: ChatMode;
	title?: string;
	documentJson?: unknown;
	children:
		| ReactNode
		| ((api: { onEditorReady: (editor: Editor | null) => void }) => ReactNode);
}) {
	const [editor, setEditor] = useState<Editor | null>(null);
	const registerEditor = useCallback((next: Editor | null) => {
		setEditor(next);
	}, []);

	const bridge = useMemo<AiAuthorEditorBridge>(
		() => ({
			registerEditor,
			apply: editor ? createTheoryEditorApply(editor) : null,
		}),
		[editor, registerEditor],
	);

	return (
		<AiAuthorEditorBridgeProvider value={bridge}>
			<div
				className="flex min-h-[calc(100svh-0px)] w-full flex-col md:flex-row"
				data-testid="ai-author-workspace"
			>
				<AiAuthorChatPanel
					mode={mode}
					title={title}
					documentJson={documentJson}
					className="md:sticky md:top-0 md:h-svh"
				/>
				<div className="min-w-0 flex-1">
					{typeof children === "function"
						? children({ onEditorReady: registerEditor })
						: children}
				</div>
			</div>
		</AiAuthorEditorBridgeProvider>
	);
}
