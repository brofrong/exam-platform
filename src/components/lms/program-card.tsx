import { ProgressStat } from "@/components/lms/progress-stat";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProgramCardProps = {
	title: string;
	description?: string;
	subject?: string;
	examType?: string;
	progress?: number;
	actionLabel?: string;
	onOpen?: () => void;
	className?: string;
};

function ProgramCard({
	title,
	description,
	subject,
	examType,
	progress,
	actionLabel = "Открыть",
	onOpen,
	className,
}: ProgramCardProps) {
	const meta = [examType, subject].filter(Boolean).join(" · ");

	return (
		<Card data-slot="program-card" className={cn("max-w-sm", className)}>
			<CardHeader>
				{meta ? <CardDescription>{meta}</CardDescription> : null}
				<CardTitle>{title}</CardTitle>
				{description ? (
					<p className="text-sm text-muted-foreground text-pretty">
						{description}
					</p>
				) : null}
			</CardHeader>
			{typeof progress === "number" ? (
				<CardContent>
					<ProgressStat label="Прогресс" value={progress} />
				</CardContent>
			) : null}
			{onOpen ? (
				<CardFooter>
					<Button size="sm" data-testid="program-card-open" onClick={onOpen}>
						{actionLabel}
					</Button>
				</CardFooter>
			) : null}
		</Card>
	);
}

export { ProgramCard };
export type { ProgramCardProps };
