import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProgressStatProps = {
	label: string;
	value: number;
	description?: string;
	className?: string;
};

function ProgressStat({
	label,
	value,
	description,
	className,
}: ProgressStatProps) {
	const clamped = Math.min(100, Math.max(0, value));

	return (
		<div
			data-slot="progress-stat"
			className={cn("flex w-full flex-col gap-2", className)}
		>
			<div className="flex items-baseline justify-between gap-3">
				<span className="text-sm font-medium">{label}</span>
				<span className="text-sm tabular-nums text-muted-foreground">
					{Math.round(clamped)}%
				</span>
			</div>
			<Progress value={clamped} aria-label={label} />
			{description ? (
				<p className="text-xs text-muted-foreground">{description}</p>
			) : null}
		</div>
	);
}

export { ProgressStat };
export type { ProgressStatProps };
