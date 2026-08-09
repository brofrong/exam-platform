import { CHANGELOG } from "#/shared/changelog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type ChangelogDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ChangelogDialog({ open, onOpenChange }: ChangelogDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md" data-testid="changelog-dialog">
				<DialogHeader>
					<DialogTitle>Что нового</DialogTitle>
					<DialogDescription className="sr-only">
						Список изменений по версиям приложения
					</DialogDescription>
				</DialogHeader>

				{CHANGELOG.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Пока нет записей об изменениях
					</p>
				) : (
					<div className="max-h-[60vh] space-y-4 overflow-y-auto">
						{CHANGELOG.map((entry) => (
							<section key={entry.version}>
								<h3 className="border-b border-border pb-1.5 text-sm font-semibold tracking-tight">
									{entry.version}
								</h3>
								<ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
									{entry.changes.map((change) => (
										<li key={`${entry.version}:${change}`}>{change}</li>
									))}
								</ul>
							</section>
						))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
