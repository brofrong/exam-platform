import { PracticeRenderer } from "#/features/lesson-editor";

type PracticeActivityViewProps = {
	activityId: string;
	content: unknown;
};

/**
 * Read-only practice content for the student player.
 * Interactive answering lands in Task 21.
 */
export function PracticeActivityView({
	activityId,
	content,
}: PracticeActivityViewProps) {
	return (
		<section
			className="space-y-3"
			data-testid={`practice-activity-${activityId}`}
		>
			<PracticeRenderer content={content} sanitize />
			<p
				className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
				data-testid="practice-answering-placeholder"
			>
				Отправка ответов появится позже
			</p>
		</section>
	);
}
