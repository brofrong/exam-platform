import { cn } from "@/lib/utils";

type MessageBubbleProps = {
	content: string;
	authorName: string;
	isOwn: boolean;
};

export function MessageBubble({
	content,
	authorName,
	isOwn,
}: MessageBubbleProps) {
	return (
		<div
			className={cn("flex", isOwn ? "justify-end" : "justify-start")}
			data-testid="chat-message"
			data-own={isOwn ? "true" : "false"}
		>
			<div
				className={cn(
					"max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
					isOwn
						? "bg-primary text-primary-foreground"
						: "bg-bg-elevated text-text-body",
				)}
			>
				{!isOwn && (
					<p className="mb-1 text-xs font-medium text-muted-foreground">
						{authorName}
					</p>
				)}
				<p className="whitespace-pre-wrap break-words">{content}</p>
			</div>
		</div>
	);
}
