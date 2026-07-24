"use client";

import { UploadIcon } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
	/** Called with every selected file (always an array). Prefer this for multi-select. */
	onFiles?: (files: File[]) => void;
	/** Called once per selected file (or first only when `multiple` is false). */
	onFile?: (file: File) => void;
	multiple?: boolean;
	accept?: string;
	disabled?: boolean;
	label?: string;
	hint?: string;
	className?: string;
};

function FileDropzone({
	onFiles,
	onFile,
	multiple = false,
	accept,
	disabled = false,
	label = "Перетащите файл сюда",
	hint = "или нажмите, чтобы выбрать",
	className,
}: FileDropzoneProps) {
	const inputId = useId();
	const [dragging, setDragging] = useState(false);
	const [fileSummary, setFileSummary] = useState<string | null>(null);

	function emitFiles(list: FileList | File[] | null | undefined) {
		if (!list || disabled) return;
		const files = Array.from(list);
		if (files.length === 0) return;

		const selected = multiple ? files : files.slice(0, 1);
		setFileSummary(
			selected.length === 1
				? selected[0].name
				: `Выбрано файлов: ${selected.length}`,
		);
		onFiles?.(selected);
		if (onFile) {
			for (const file of selected) {
				onFile(file);
			}
		}
	}

	return (
		// Drop target needs drag event handlers on a non-interactive container.
		// biome-ignore lint/a11y/noStaticElementInteractions: file drop zone
		<div
			data-slot="file-dropzone"
			data-testid="file-dropzone"
			data-dragging={dragging || undefined}
			data-multiple={multiple || undefined}
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
				emitFiles(event.dataTransfer.files);
			}}
		>
			<input
				id={inputId}
				type="file"
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				className="sr-only"
				data-testid="file-dropzone-input"
				onChange={(event) => {
					emitFiles(event.target.files);
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
				{fileSummary ? (
					<span className="mt-1 text-xs text-foreground">{fileSummary}</span>
				) : null}
			</label>
		</div>
	);
}

export { FileDropzone };
export type { FileDropzoneProps };
