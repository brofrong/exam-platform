"use client";

import { UploadIcon } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
	onFile: (file: File) => void;
	accept?: string;
	disabled?: boolean;
	label?: string;
	hint?: string;
	className?: string;
};

function FileDropzone({
	onFile,
	accept,
	disabled = false,
	label = "Перетащите файл сюда",
	hint = "или нажмите, чтобы выбрать",
	className,
}: FileDropzoneProps) {
	const inputId = useId();
	const [dragging, setDragging] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);

	function handleFile(file: File | undefined) {
		if (!file || disabled) return;
		setFileName(file.name);
		onFile(file);
	}

	return (
		// Drop target needs drag event handlers on a non-interactive container.
		// biome-ignore lint/a11y/noStaticElementInteractions: file drop zone
		<div
			data-slot="file-dropzone"
			data-testid="file-dropzone"
			data-dragging={dragging || undefined}
			className={cn(
				"flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors",
				dragging && "border-primary bg-primary/5",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			onDragEnter={(event) => {
				event.preventDefault();
				event.stopPropagation();
				if (!disabled) setDragging(true);
			}}
			onDragOver={(event) => {
				event.preventDefault();
				event.stopPropagation();
				if (!disabled) setDragging(true);
			}}
			onDragLeave={(event) => {
				event.preventDefault();
				event.stopPropagation();
				setDragging(false);
			}}
			onDrop={(event) => {
				event.preventDefault();
				event.stopPropagation();
				setDragging(false);
				handleFile(event.dataTransfer.files?.[0]);
			}}
		>
			<input
				id={inputId}
				type="file"
				accept={accept}
				disabled={disabled}
				className="sr-only"
				data-testid="file-dropzone-input"
				onChange={(event) => {
					handleFile(event.target.files?.[0]);
					event.target.value = "";
				}}
			/>
			<label
				htmlFor={inputId}
				className="flex cursor-pointer flex-col items-center gap-2"
			>
				<span className="flex size-10 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10">
					<UploadIcon className="size-5" />
				</span>
				<span className="text-sm font-medium">{label}</span>
				<span className="text-xs text-muted-foreground">{hint}</span>
				{fileName ? (
					<span className="mt-1 text-xs text-foreground">{fileName}</span>
				) : null}
			</label>
		</div>
	);
}

export { FileDropzone };
export type { FileDropzoneProps };
