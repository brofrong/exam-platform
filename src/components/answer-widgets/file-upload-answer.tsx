"use client";

import { useId } from "react";
import { FileDropzone } from "@/components/lms";
import { cn } from "@/lib/utils";

type FileUploadAnswerProps = {
	value?: File | null;
	onChange: (file: File) => void;
	error?: string;
	disabled?: boolean;
	label?: string;
	hint?: string;
	accept?: string;
	className?: string;
};

function FileUploadAnswer({
	value = null,
	onChange,
	error,
	disabled = false,
	label = "Прикрепите файл",
	hint = "или нажмите, чтобы выбрать",
	accept,
	className,
}: FileUploadAnswerProps) {
	const errorId = useId();
	const invalid = Boolean(error);

	return (
		<div
			data-slot="file-upload-answer"
			data-testid="file-upload-answer"
			className={cn("grid w-full gap-2", className)}
			aria-describedby={invalid ? errorId : undefined}
		>
			<FileDropzone
				onFile={onChange}
				accept={accept}
				disabled={disabled}
				label={label}
				hint={value ? value.name : hint}
				className={cn(invalid && "border-destructive")}
			/>
			{error ? (
				<p
					id={errorId}
					role="alert"
					data-testid="file-upload-answer-error"
					className="text-sm text-destructive"
				>
					{error}
				</p>
			) : null}
		</div>
	);
}

export { FileUploadAnswer };
export type { FileUploadAnswerProps };
