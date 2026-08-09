import { PlusIcon, XIcon } from "lucide-react";
import type { AnswerOption } from "@/components/answer-widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TestOptionsEditorProps = {
	options: AnswerOption[];
	onChange: (options: AnswerOption[]) => void;
};

export function TestOptionsEditor({
	options,
	onChange,
}: TestOptionsEditorProps) {
	const handleAdd = () => {
		onChange([...options, { id: crypto.randomUUID(), label: "" }]);
	};

	const handleLabelChange = (id: string, label: string) => {
		onChange(
			options.map((option) =>
				option.id === id ? { ...option, label } : option,
			),
		);
	};

	const handleRemove = (id: string) => {
		onChange(options.filter((option) => option.id !== id));
	};

	return (
		<div className="grid gap-3" data-testid="test-options-editor">
			<Label>Варианты ответа</Label>
			<div className="grid gap-2">
				{options.map((option, index) => (
					<div
						key={option.id}
						className="flex items-center gap-2"
						data-testid={`test-option-row-${option.id}`}
					>
						<Input
							value={option.label}
							onChange={(event) =>
								handleLabelChange(option.id, event.target.value)
							}
							placeholder={`Вариант ${index + 1}`}
							data-testid={`test-option-label-${option.id}`}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label="Удалить вариант"
							data-testid={`test-option-remove-${option.id}`}
							onClick={() => handleRemove(option.id)}
						>
							<XIcon />
						</Button>
					</div>
				))}
			</div>
			<Button
				type="button"
				variant="outline"
				size="sm"
				data-testid="test-option-add"
				onClick={handleAdd}
			>
				<PlusIcon />
				Добавить вариант
			</Button>
			{options.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Добавьте хотя бы один вариант ответа.
				</p>
			) : null}
		</div>
	);
}
