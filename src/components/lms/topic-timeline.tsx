import { CheckIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

type TopicTimelineItem = {
	id: string;
	title: string;
	/** 0–100: доля завершённых уроков в теме */
	percent: number;
	children?: React.ReactNode;
};

type TopicTimelineProps = {
	items: readonly TopicTimelineItem[];
	className?: string;
};

function clampPercent(value: number): number {
	return Math.min(100, Math.max(0, Math.round(value)));
}

function TopicProgressRing({
	percent,
	complete,
}: {
	percent: number;
	complete: boolean;
}) {
	const size = 40;
	const stroke = 3.5;
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference * (1 - percent / 100);
	const track = complete
		? "stroke-emerald-500/25"
		: "stroke-muted-foreground/25";
	const fill = complete ? "stroke-emerald-500" : "stroke-muted-foreground/70";
	const label = complete
		? "text-emerald-600 dark:text-emerald-400"
		: "text-muted-foreground";

	return (
		<span
			className="relative inline-flex size-10 shrink-0 items-center justify-center"
			aria-hidden
		>
			<svg
				width={size}
				height={size}
				className="-rotate-90"
				viewBox={`0 0 ${size} ${size}`}
				role="presentation"
			>
				<title>Progress</title>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={stroke}
					className={track}
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={stroke}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className={cn(
						fill,
						"transition-[stroke-dashoffset] duration-500 ease-out",
					)}
				/>
			</svg>
			<span
				className={cn(
					"absolute inline-flex items-center justify-center text-[10px] font-semibold tabular-nums",
					label,
				)}
			>
				{complete ? <CheckIcon className="size-3.5 stroke-[2.5]" /> : percent}
			</span>
		</span>
	);
}

function TopicTimeline({ items, className }: TopicTimelineProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<ol
			data-slot="topic-timeline"
			data-testid="topic-timeline"
			className={cn("flex flex-col", className)}
		>
			{items.map((item, index) => {
				const percent = clampPercent(item.percent);
				const complete = percent >= 100;
				const isLast = index === items.length - 1;

				return (
					<li
						key={item.id}
						data-testid={`topic-timeline-item-${item.id}`}
						data-complete={complete ? "true" : "false"}
						className="relative flex gap-4"
					>
						{!isLast ? (
							<span
								aria-hidden
								className={cn(
									"absolute top-10 bottom-0 left-5 w-px -translate-x-1/2",
									complete ? "bg-emerald-500/60" : "bg-border",
								)}
							/>
						) : null}
						<div className="relative z-10 flex flex-col items-center pt-0.5">
							<TopicProgressRing percent={percent} complete={complete} />
						</div>
						<div className={cn("min-w-0 flex-1 pb-8", isLast && "pb-0")}>
							<h3
								className={cn(
									"font-heading pt-2 text-base font-medium leading-snug",
									complete
										? "text-emerald-700 dark:text-emerald-400"
										: "text-foreground",
								)}
							>
								{item.title}
							</h3>
							{item.children ? (
								<div className="mt-3 space-y-2">{item.children}</div>
							) : null}
						</div>
					</li>
				);
			})}
		</ol>
	);
}

export { TopicTimeline };
export type { TopicTimelineItem, TopicTimelineProps };
