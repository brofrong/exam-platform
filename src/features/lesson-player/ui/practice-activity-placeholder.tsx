type PracticeActivityPlaceholderProps = {
	title?: string;
};

export function PracticeActivityPlaceholder({
	title,
}: PracticeActivityPlaceholderProps) {
	return (
		<section
			className="space-y-2 rounded-xl border border-dashed border-border px-4 py-8 text-center"
			data-testid="practice-activity-placeholder"
		>
			{title ? (
				<p className="text-sm font-medium text-foreground">{title}</p>
			) : null}
			<p className="text-sm text-muted-foreground">
				Практика будет доступна позже
			</p>
		</section>
	);
}
