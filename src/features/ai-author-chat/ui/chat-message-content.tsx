import { CheckIcon, CopyIcon, FilePenIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { canApplyCodeBlock } from "#/features/ai-author-chat/lib/apply-to-editor";
import { useTheoryEditorApply } from "#/features/ai-author-chat/lib/editor-bridge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Segment =
	| { type: "text"; key: string; text: string }
	| { type: "code"; key: string; language: string; code: string };

function parseSegments(content: string): Segment[] {
	const segments: Segment[] = [];
	const fence = /```([^\n`]*)\n([\s\S]*?)```/g;
	let lastIndex = 0;
	let match = fence.exec(content);
	let part = 0;
	while (match) {
		if (match.index > lastIndex) {
			const text = content.slice(lastIndex, match.index);
			segments.push({
				type: "text",
				key: `text-${part}-${text.length}`,
				text,
			});
			part += 1;
		}
		const code = match[2] ?? "";
		segments.push({
			type: "code",
			key: `code-${part}-${match[1]?.trim() ?? ""}-${code.length}`,
			language: match[1]?.trim() ?? "",
			code,
		});
		part += 1;
		lastIndex = match.index + match[0].length;
		match = fence.exec(content);
	}
	if (lastIndex < content.length) {
		const text = content.slice(lastIndex);
		segments.push({
			type: "text",
			key: `text-${part}-${text.length}`,
			text,
		});
	}
	return segments.length > 0
		? segments
		: [{ type: "text", key: "text-empty", text: content }];
}

function CodeBlock({ language, code }: { language: string; code: string }) {
	const apply = useTheoryEditorApply();
	const [copied, setCopied] = useState(false);
	const [replaceOpen, setReplaceOpen] = useState(false);
	const applicable = apply != null && canApplyCodeBlock(language, code);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			setCopied(false);
		}
	};

	const handleInsert = () => {
		if (!apply) return;
		const result = apply.insertFromCodeBlock(language, code);
		if (result.ok) {
			toast.success("Вставлено в редактор");
		} else {
			toast.error(result.error);
		}
	};

	const handleReplace = () => {
		if (!apply) return;
		const result = apply.replaceFromCodeBlock(language, code);
		setReplaceOpen(false);
		if (result.ok) {
			toast.success("Документ заменён");
		} else {
			toast.error(result.error);
		}
	};

	return (
		<div className="overflow-hidden rounded-lg border bg-muted/40">
			<div className="flex flex-wrap items-center justify-between gap-2 border-b px-2 py-1">
				<span className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
					{language || "code"}
				</span>
				<div className="flex flex-wrap items-center gap-1">
					{applicable ? (
						<>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								className="h-7 px-2 text-xs"
								onClick={handleInsert}
								data-testid="ai-chat-insert-code"
							>
								<PlusIcon className="size-3.5" />
								Вставить
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7 px-2 text-xs"
								onClick={() => setReplaceOpen(true)}
								data-testid="ai-chat-replace-code"
							>
								<FilePenIcon className="size-3.5" />
								Заменить всё
							</Button>
						</>
					) : null}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={() => void handleCopy()}
						data-testid="ai-chat-copy-code"
					>
						{copied ? (
							<CheckIcon className="size-3.5" />
						) : (
							<CopyIcon className="size-3.5" />
						)}
						{copied ? "Скопировано" : "Копировать"}
					</Button>
				</div>
			</div>
			<pre className="max-h-72 overflow-auto p-3 text-xs leading-relaxed">
				<code>{code}</code>
			</pre>

			<AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Заменить весь документ?</AlertDialogTitle>
						<AlertDialogDescription>
							Текущее содержимое редактора будет заменено этим блоком. Можно
							отменить через Ctrl/Cmd+Z.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel data-testid="ai-chat-replace-cancel">
							Отмена
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleReplace}
							data-testid="ai-chat-replace-confirm"
						>
							Заменить
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

export function ChatMessageContent({
	content,
	className,
}: {
	content: string;
	className?: string;
}) {
	const segments = parseSegments(content);
	return (
		<div className={cn("grid gap-2 text-sm", className)}>
			{segments.map((segment) =>
				segment.type === "text" ? (
					<p
						key={segment.key}
						className="whitespace-pre-wrap text-pretty leading-relaxed"
					>
						{segment.text}
					</p>
				) : (
					<CodeBlock
						key={segment.key}
						language={segment.language}
						code={segment.code}
					/>
				),
			)}
		</div>
	);
}
