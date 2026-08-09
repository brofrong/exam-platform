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
import { Textarea } from "@/components/ui/textarea";

export type TestGroupFormValues = {
	title: string;
	description: string;
};

type TestGroupFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initial?: Partial<TestGroupFormValues>;
	onSubmit: (values: TestGroupFormValues) => Promise<void>;
};

const emptyValues: TestGroupFormValues = {
	title: "",
	description: "",
};

export function TestGroupFormDialog({
	open,
	onOpenChange,
	mode,
	initial,
	onSubmit,
}: TestGroupFormDialogProps) {
	const [values, setValues] = useState<TestGroupFormValues>(() => ({
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
			description: initial?.description ?? "",
		});
		setError(null);
		setIsSubmitting(false);
	}, [open, initial?.title, initial?.description]);

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
				description: values.description.trim(),
			});
			onOpenChange(false);
		} catch {
			setError("Не удалось сохранить группу тестов");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-md"
				data-testid="test-group-form-dialog"
			>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<DialogHeader>
						<DialogTitle>
							{mode === "create"
								? "Новая группа тестов"
								: "Редактировать группу"}
						</DialogTitle>
						<DialogDescription>
							{mode === "create"
								? "Группа — это банк вопросов, из которого практика сэмплирует тесты."
								: "Измените название и описание группы."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-1.5">
						<Label htmlFor="test-group-title">Название</Label>
						<Input
							id="test-group-title"
							data-testid="test-group-title-input"
							value={values.title}
							onChange={(event) =>
								setValues((prev) => ({ ...prev, title: event.target.value }))
							}
							placeholder="Например, Квадратные уравнения — тесты"
							required
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="test-group-description">Описание</Label>
						<Textarea
							id="test-group-description"
							data-testid="test-group-description-input"
							value={values.description}
							onChange={(event) =>
								setValues((prev) => ({
									...prev,
									description: event.target.value,
								}))
							}
							placeholder="Короткое описание группы (необязательно)"
							rows={3}
						/>
					</div>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							data-testid="test-group-form-cancel"
							onClick={() => onOpenChange(false)}
						>
							Отмена
						</Button>
						<Button
							type="submit"
							data-testid="test-group-form-submit"
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
