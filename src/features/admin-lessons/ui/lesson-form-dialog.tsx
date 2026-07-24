import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LessonFormValues = {
	title: string;
};

type LessonFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initial?: Partial<LessonFormValues>;
	onSubmit: (values: LessonFormValues) => Promise<void>;
};

const emptyValues: LessonFormValues = {
	title: "",
};

export function LessonFormDialog({
	open,
	onOpenChange,
	mode,
	initial,
	onSubmit,
}: LessonFormDialogProps) {
	const [values, setValues] = useState<LessonFormValues>(() => ({
		...emptyValues,
		...initial,
	}));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			return;
		}
		setValues({
			title: initial?.title ?? "",
		});
		setError(null);
		setIsSubmitting(false);
	}, [open, initial?.title]);

	const canSubmit = values.title.trim().length > 0;

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit || isSubmitting) {
			return;
		}
		setIsSubmitting(true);
		setError(null);
		try {
			await onSubmit({
				title: values.title.trim(),
			});
			onOpenChange(false);
		} catch {
			setError("Не удалось сохранить урок");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md" data-testid="lesson-form-dialog">
				<form onSubmit={handleSubmit} className="grid gap-4">
					<DialogHeader>
						<DialogTitle>
							{mode === "create" ? "Новый урок" : "Редактировать урок"}
						</DialogTitle>
						<DialogDescription>
							{mode === "create"
								? "Урок можно позже привязать к темам программ."
								: "Измените название урока."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-1.5">
						<Label htmlFor="lesson-title">Название</Label>
						<Input
							id="lesson-title"
							data-testid="lesson-title-input"
							value={values.title}
							onChange={(event) =>
								setValues((prev) => ({ ...prev, title: event.target.value }))
							}
							placeholder="Например, Квадратные уравнения"
							required
						/>
					</div>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							data-testid="lesson-form-cancel"
							onClick={() => onOpenChange(false)}
						>
							Отмена
						</Button>
						<Button
							type="submit"
							data-testid="lesson-form-submit"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting
								? "Сохраняем…"
								: mode === "create"
									? "Создать"
									: "Сохранить"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
