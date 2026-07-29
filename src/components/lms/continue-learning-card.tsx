import { ArrowRightIcon } from "lucide-react";
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
			className={cn(
				"border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card",
				className,
			)}
		>
			<CardHeader>
				<CardDescription>{programTitle}</CardDescription>
				<CardTitle className="text-xl">{lessonTitle}</CardTitle>
			</CardHeader>
			{typeof progress === "number" ? (
				<CardContent>
					<ProgressStat label="Пройдено" value={progress} />
				</CardContent>
			) : null}
			<CardFooter>
				<Button
					size="lg"
					data-testid="continue-learning"
					onClick={onContinue}
					disabled={!onContinue}
				>
					{actionLabel}
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</CardFooter>
		</Card>
	);
}

export { ContinueLearningCard };
export type { ContinueLearningCardProps };
