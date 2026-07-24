import { useZero } from "@rocicorp/zero/react";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { TheoryRenderer } from "#/features/lesson-editor";
import { mutators } from "#/server/zero/mutators";
import { Button } from "@/components/ui/button";

type TheoryActivityViewProps = {
	activityId: string;
	content: unknown;
};

export function TheoryActivityView({
	activityId,
	content,
}: TheoryActivityViewProps) {
	const zero = useZero();
	const [studied, setStudied] = useState(false);

	const handleMarkStudied = async () => {
		setStudied(true);
		// TODO(Task 25): real progress persistence
		await zero.mutate(mutators.markActivityStudied({ activityId }));
	};

	return (
		<section
			className="space-y-4"
			data-testid={`theory-activity-${activityId}`}
		>
			<TheoryRenderer content={content} />
			<div className="flex items-center gap-3 border-t border-border pt-4">
				<Button
					variant={studied ? "secondary" : "default"}
					disabled={studied}
					data-testid={`mark-studied-${activityId}`}
					onClick={() => {
						void handleMarkStudied();
					}}
				>
					{studied ? <CheckIcon /> : null}
					Изучено
				</Button>
				{studied ? (
					<p
						className="text-sm text-muted-foreground"
						data-testid={`studied-note-${activityId}`}
					>
						Отмечено локально (прогресс сохранится позже)
					</p>
				) : null}
			</div>
		</section>
	);
}
