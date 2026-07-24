"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ShortTextAnswerProps = {
	value: string;
	onChange: (value: string) => void;
	error?: string;
	disabled?: boolean;
	label?: string;
	placeholder?: string;
	className?: string;
};

function ShortTextAnswer({
	value,
	onChange,
	error,
	disabled = false,
	label = "Ваш ответ",
	placeholder = "Введите ответ",
	className,
}: ShortTextAnswerProps) {
	const inputId = useId();
	const errorId = useId();
	const invalid = Boolean(error);

	return (
		<div
			data-slot="short-text-answer"
			data-testid="short-text-answer"
			className={cn("grid w-full gap-2", className)}
		>
			<Label htmlFor={inputId}>{label}</Label>
			<Input
				id={inputId}
				type="text"
				value={value}
				disabled={disabled}
				placeholder={placeholder}
				aria-invalid={invalid || undefined}
				aria-describedby={invalid ? errorId : undefined}
				data-testid="short-text-answer-input"
				onChange={(event) => onChange(event.target.value)}
			/>
			{error ? (
				<p
					id={errorId}
					role="alert"
					data-testid="short-text-answer-error"
					className="text-sm text-destructive"
				>
					{error}
				</p>
			) : null}
		</div>
	);
}

export { ShortTextAnswer };
export type { ShortTextAnswerProps };
