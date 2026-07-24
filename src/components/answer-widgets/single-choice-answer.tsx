"use client";

import { useId } from "react";
import type { AnswerOption } from "@/components/answer-widgets/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type SingleChoiceAnswerProps = {
	options: AnswerOption[];
	value: string | null;
	onChange: (value: string) => void;
	error?: string;
	disabled?: boolean;
	label?: string;
	className?: string;
};

function SingleChoiceAnswer({
	options,
	value,
	onChange,
	error,
	disabled = false,
	label = "Выберите один вариант",
	className,
}: SingleChoiceAnswerProps) {
	const groupId = useId();
	const errorId = useId();
	const invalid = Boolean(error);

	return (
		<fieldset
			data-slot="single-choice-answer"
			data-testid="single-choice-answer"
			className={cn("grid w-full gap-3 border-0 p-0", className)}
			aria-describedby={invalid ? errorId : undefined}
			disabled={disabled}
		>
			<legend className="mb-0 px-0 text-sm font-medium">{label}</legend>
			<RadioGroup
				value={value ?? undefined}
				aria-invalid={invalid || undefined}
				onValueChange={onChange}
				className="gap-3"
			>
				{options.map((option) => {
					const optionId = `${groupId}-${option.id}`;
					return (
						<div key={option.id} className="flex items-center gap-2">
							<RadioGroupItem
								value={option.id}
								id={optionId}
								aria-invalid={invalid || undefined}
								data-testid={`single-choice-option-${option.id}`}
							/>
							<Label htmlFor={optionId} className="font-normal">
								{option.label}
							</Label>
						</div>
					);
				})}
			</RadioGroup>
			{error ? (
				<p
					id={errorId}
					role="alert"
					data-testid="single-choice-answer-error"
					className="text-sm text-destructive"
				>
					{error}
				</p>
			) : null}
		</fieldset>
	);
}

export { SingleChoiceAnswer };
export type { SingleChoiceAnswerProps };
