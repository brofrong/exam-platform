import { cn } from "@/lib/utils";

type SupportMessageBubbleProps = {
	body: string;
	authorName: string;
	timestamp?: string;
	side?: "incoming" | "outgoing";
	className?: string;
};

function SupportMessageBubble({
	body,
	authorName,
	timestamp,
	side = "incoming",
	className,
}: SupportMessageBubbleProps) {
	const outgoing = side === "outgoing";

	return (
		<div
			data-slot="support-message-bubble"
			data-side={side}
			className={cn(
				"flex w-full",
				outgoing ? "justify-end" : "justify-start",
				className,
			)}
		>
			<div
				className={cn(
					"max-w-[85%] space-y-1 rounded-2xl px-3.5 py-2.5 text-sm",
					outgoing
						? "rounded-br-md bg-primary text-primary-foreground"
						: "rounded-bl-md bg-muted text-foreground",
				)}
			>
				<div
					className={cn(
						"flex items-baseline gap-2 text-xs",
						outgoing ? "text-primary-foreground/80" : "text-muted-foreground",
					)}
				>
					<span className="font-medium">{authorName}</span>
					{timestamp ? <span>{timestamp}</span> : null}
				</div>
				<p className="whitespace-pre-wrap text-pretty">{body}</p>
			</div>
		</div>
	);
}

export { SupportMessageBubble };
export type { SupportMessageBubbleProps };
