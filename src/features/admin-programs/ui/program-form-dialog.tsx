import { useEffect, useState } from "react";
import {
	EXAM_TYPES,
	SUBJECT_SUGGESTIONS,
} from "#/features/admin-programs/lib/exam-options";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ProgramFormValues = {
	title: string;
	description: string;
	examType: string;
	subject: string;
};

type ProgramFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initial?: Partial<ProgramFormValues>;
	onSubmit: (values: ProgramFormValues) => Promise<void>;
};

const emptyValues: ProgramFormValues = {
	title: "",
	description: "",
	examType: EXAM_TYPES[0],
	subject: "",
};

export function ProgramFormDialog({
	open,
	onOpenChange,
	mode,
	initial,
	onSubmit,
}: ProgramFormDialogProps) {
	const [values, setValues] = useState<ProgramFormValues>(() => ({
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
			examType: initial?.examType ?? EXAM_TYPES[0],
			subject: initial?.subject ?? "",
		});
		setError(null);
		setIsSubmitting(false);
	}, [
		open,
		initial?.title,
		initial?.description,
		initial?.examType,
		initial?.subject,
	]);

	const canSubmit =
		values.title.trim().length > 0 &&
		values.examType.trim().length > 0 &&
		values.subject.trim().length > 0;

	const handleOpenChange = (next: boolean) => {
		onOpenChange(next);
	};

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
				examType: values.examType.trim(),
				subject: values.subject.trim(),
			});
			onOpenChange(false);
		} catch {
			setError("Не удалось сохранить программу");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md" data-testid="program-form-dialog">
				<form onSubmit={handleSubmit} className="grid gap-4">
					<DialogHeader>
						<DialogTitle>
							{mode === "create"
								? "Новая программа"
								: "Редактировать программу"}
						</DialogTitle>
						<DialogDescription>
							{mode === "create"
								? "Укажите название, экзамен и предмет."
								: "Измените основные поля программы."}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-3">
						<div className="space-y-1.5">
							<Label htmlFor="program-title">Название</Label>
							<Input
								id="program-title"
								data-testid="program-title-input"
								value={values.title}
								onChange={(event) =>
									setValues((prev) => ({ ...prev, title: event.target.value }))
								}
								placeholder="Например, ЕГЭ Математика — база"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="program-description">Описание</Label>
							<Textarea
								id="program-description"
								data-testid="program-description-input"
								value={values.description}
								onChange={(event) =>
									setValues((prev) => ({
										...prev,
										description: event.target.value,
									}))
								}
								placeholder="Кратко о программе (необязательно)"
								rows={3}
							/>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="program-exam-type">Экзамен</Label>
								<Select
									value={values.examType}
									onValueChange={(examType) =>
										setValues((prev) => ({
											...prev,
											examType: examType ?? EXAM_TYPES[0],
										}))
									}
								>
									<SelectTrigger
										id="program-exam-type"
										className="w-full"
										data-testid="program-exam-type-select"
									>
										<SelectValue placeholder="Выберите экзамен" />
									</SelectTrigger>
									<SelectContent>
										{EXAM_TYPES.map((examType) => (
											<SelectItem key={examType} value={examType}>
												{examType}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="program-subject">Предмет</Label>
								<Input
									id="program-subject"
									data-testid="program-subject-input"
									value={values.subject}
									onChange={(event) =>
										setValues((prev) => ({
											...prev,
											subject: event.target.value,
										}))
									}
									placeholder="Математика"
									list="program-subject-suggestions"
									required
								/>
								<datalist id="program-subject-suggestions">
									{SUBJECT_SUGGESTIONS.map((subject) => (
										<option key={subject} value={subject} />
									))}
								</datalist>
							</div>
						</div>
					</div>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							data-testid="program-form-cancel"
							onClick={() => onOpenChange(false)}
						>
							Отмена
						</Button>
						<Button
							type="submit"
							data-testid="program-form-submit"
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
