"use client";

import { useId } from "react";
import type { AnswerOption } from "@/components/answer-widgets/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type MultipleChoiceAnswerProps = {
	options: AnswerOption[];
	value: string[];
	onChange: (value: string[]) => void;
	error?: string;
	disabled?: boolean;
	label?: string;
	className?: string;
};

function MultipleChoiceAnswer({
	options,
	value,
	onChange,
	error,
	disabled = false,
	label = "Выберите один или несколько вариантов",
	className,
}: MultipleChoiceAnswerProps) {
	const groupId = useId();
	const errorId = useId();
	const invalid = Boolean(error);

	function toggleOption(optionId: string, checked: boolean) {
		if (checked) {
			onChange([...value, optionId]);
			return;
		}
		onChange(value.filter((id) => id !== optionId));
	}

	return (
		<fieldset
			data-slot="multiple-choice-answer"
			data-testid="multiple-choice-answer"
			className={cn("grid w-full gap-3 border-0 p-0", className)}
			aria-describedby={invalid ? errorId : undefined}
			disabled={disabled}
		>
			<legend className="mb-0 px-0 text-sm font-medium">{label}</legend>
			<div className="grid gap-3">
				{options.map((option) => {
					const optionId = `${groupId}-${option.id}`;
					const checked = value.includes(option.id);
					return (
						<div key={option.id} className="flex items-center gap-2">
							<Checkbox
								id={optionId}
								checked={checked}
								aria-invalid={invalid || undefined}
								data-testid={`multiple-choice-option-${option.id}`}
								onCheckedChange={(next) =>
									toggleOption(option.id, next === true)
								}
							/>
							<Label htmlFor={optionId} className="font-normal">
								{option.label}
							</Label>
						</div>
					);
				})}
			</div>
			{error ? (
				<p
					id={errorId}
					role="alert"
					data-testid="multiple-choice-answer-error"
					className="text-sm text-destructive"
				>
					{error}
				</p>
			) : null}
		</fieldset>
	);
}

export { MultipleChoiceAnswer };
export type { MultipleChoiceAnswerProps };
