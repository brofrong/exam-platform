import { useState } from "react";
import { ANSWER_TYPE_LABELS } from "#/features/admin-tests/lib/test-labels";
import {
	TEST_ANSWER_TYPES,
	type TestAnswerType,
} from "#/server/zero/constants";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type AddTestDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (answerType: TestAnswerType) => Promise<void>;
};

export function AddTestDialog({
	open,
	onOpenChange,
	onSubmit,
}: AddTestDialogProps) {
	const [answerType, setAnswerType] = useState<TestAnswerType>(
		TEST_ANSWER_TYPES[0],
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (isSubmitting) {
			return;
		}
		setIsSubmitting(true);
		try {
			await onSubmit(answerType);
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md" data-testid="add-test-dialog">
				<form onSubmit={handleSubmit} className="grid gap-4">
					<DialogHeader>
						<DialogTitle>Новый тест</DialogTitle>
						<DialogDescription>
							Выберите тип ответа. Остальное можно настроить в редакторе теста.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-1.5">
						<Label htmlFor="add-test-answer-type">Тип ответа</Label>
						<Select
							value={answerType}
							onValueChange={(value) => setAnswerType(value as TestAnswerType)}
						>
							<SelectTrigger
								id="add-test-answer-type"
								className="w-full"
								data-testid="add-test-answer-type"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TEST_ANSWER_TYPES.map((type) => (
									<SelectItem key={type} value={type}>
										{ANSWER_TYPE_LABELS[type]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							data-testid="add-test-cancel"
							onClick={() => onOpenChange(false)}
						>
							Отмена
						</Button>
						<Button
							type="submit"
							data-testid="add-test-submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Создаём…" : "Создать"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
