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

type ContinueLearningCardProps = {
	programTitle: string;
	lessonTitle: string;
	progress?: number;
	actionLabel?: string;
	onContinue?: () => void;
	className?: string;
};

function ContinueLearningCard({
	programTitle,
	lessonTitle,
	progress,
	actionLabel = "Продолжить",
	onContinue,
	className,
}: ContinueLearningCardProps) {
	return (
		<Card
			data-slot="continue-learning-card"
			className={cn("max-w-lg", className)}
		>
			<CardHeader>
				<CardDescription>{programTitle}</CardDescription>
				<CardTitle>{lessonTitle}</CardTitle>
			</CardHeader>
			{typeof progress === "number" ? (
				<CardContent>
					<ProgressStat label="Пройдено" value={progress} />
				</CardContent>
			) : null}
			<CardFooter>
				<Button
					data-testid="continue-learning"
					onClick={onContinue}
					disabled={!onContinue}
				>
					{actionLabel}
				</Button>
			</CardFooter>
		</Card>
	);
}

export { ContinueLearningCard };
export type { ContinueLearningCardProps };
