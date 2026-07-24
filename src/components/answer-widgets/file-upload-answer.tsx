"use client";

import { FileIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
	formatFileSize,
	isImageFile,
} from "@/components/answer-widgets/lib/file-upload";
import { FileDropzone } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FileUploadStatus = "idle" | "uploading" | "uploaded" | "error";

type FileUploadAnswerProps = {
	value?: File | null;
	onChange: (file: File | null) => void;
	/** Controlled status; when omitted, managed internally if `onUpload` is set. */
	status?: FileUploadStatus;
	/** Controlled progress 0–100. */
	progress?: number;
	/** Controlled object/preview URL for images. */
	previewUrl?: string | null;
	/**
	 * Pluggable uploader. Receives progress callbacks so real S3 uploads
	 * can report determinate progress later.
	 */
	onUpload?: (
		file: File,
		ctx: { onProgress: (progress: number) => void; signal: AbortSignal },
	) => Promise<unknown>;
	onStatusChange?: (status: FileUploadStatus) => void;
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
	status: statusProp,
	progress: progressProp,
	previewUrl: previewUrlProp,
	onUpload,
	onStatusChange,
	error,
	disabled = false,
	label = "Прикрепите файл",
	hint = "или нажмите, чтобы выбрать",
	accept,
	className,
}: FileUploadAnswerProps) {
	const errorId = useId();
	const progressId = useId();
	const abortRef = useRef<AbortController | null>(null);
	const objectUrlRef = useRef<string | null>(null);

	const [internalStatus, setInternalStatus] = useState<FileUploadStatus>(
		value ? "uploaded" : "idle",
	);
	const [internalProgress, setInternalProgress] = useState(0);
	const [internalPreviewUrl, setInternalPreviewUrl] = useState<string | null>(
		null,
	);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const statusControlled = statusProp !== undefined;
	const progressControlled = progressProp !== undefined;
	const previewControlled = previewUrlProp !== undefined;

	const status = statusControlled ? statusProp : internalStatus;
	const progress = progressControlled ? progressProp : internalProgress;
	const previewUrl = previewControlled ? previewUrlProp : internalPreviewUrl;

	const invalid = Boolean(error);
	const busy = status === "uploading";
	const showDropzone = !value;

	function setStatus(next: FileUploadStatus) {
		if (!statusControlled) {
			setInternalStatus(next);
		}
		onStatusChange?.(next);
	}

	function setProgress(next: number) {
		if (!progressControlled) {
			setInternalProgress(next);
		}
	}

	function revokeObjectUrl() {
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		}
		if (!previewControlled) {
			setInternalPreviewUrl(null);
		}
	}

	function clearUpload() {
		abortRef.current?.abort();
		abortRef.current = null;
		revokeObjectUrl();
		setUploadError(null);
		setProgress(0);
		setStatus("idle");
		onChange(null);
	}

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current);
			}
		};
	}, []);

	async function handleFile(file: File) {
		if (disabled || busy) return;

		abortRef.current?.abort();
		revokeObjectUrl();
		setUploadError(null);

		if (!previewControlled && isImageFile(file)) {
			const url = URL.createObjectURL(file);
			objectUrlRef.current = url;
			setInternalPreviewUrl(url);
		}

		onChange(file);
		setProgress(0);

		if (!onUpload) {
			setStatus("uploaded");
			setProgress(100);
			return;
		}

		const controller = new AbortController();
		abortRef.current = controller;
		setStatus("uploading");

		try {
			await onUpload(file, {
				onProgress: setProgress,
				signal: controller.signal,
			});
			if (controller.signal.aborted) return;
			setProgress(100);
			setStatus("uploaded");
		} catch (cause) {
			if (controller.signal.aborted) return;
			const message =
				cause instanceof Error ? cause.message : "Не удалось загрузить файл";
			setUploadError(message);
			setStatus("error");
		} finally {
			if (abortRef.current === controller) {
				abortRef.current = null;
			}
		}
	}

	const displayError = error ?? uploadError;

	return (
		<div
			data-slot="file-upload-answer"
			data-testid="file-upload-answer"
			data-status={status}
			className={cn("grid w-full gap-2", className)}
			aria-describedby={
				[invalid || uploadError ? errorId : null, busy ? progressId : null]
					.filter(Boolean)
					.join(" ") || undefined
			}
		>
			{showDropzone ? (
				<FileDropzone
					onFile={handleFile}
					accept={accept}
					disabled={disabled}
					label={label}
					hint={hint}
					className={cn(invalid && "border-destructive")}
				/>
			) : value ? (
				<div
					data-testid="file-upload-answer-preview"
					className={cn(
						"grid gap-3 rounded-xl border border-border bg-muted/30 p-3",
						invalid && "border-destructive",
						busy && "ring-1 ring-primary/20",
					)}
				>
					<div className="flex items-start gap-3">
						{previewUrl ? (
							<img
								src={previewUrl}
								alt=""
								data-testid="file-upload-answer-thumbnail"
								className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-foreground/10"
							/>
						) : (
							<span
								data-testid="file-upload-answer-file-icon"
								className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10"
							>
								<FileIcon className="size-5" />
							</span>
						)}
						<div className="min-w-0 flex-1">
							<p
								data-testid="file-upload-answer-name"
								className="truncate text-sm font-medium"
							>
								{value.name}
							</p>
							<p
								data-testid="file-upload-answer-size"
								className="text-xs text-muted-foreground"
							>
								{formatFileSize(value.size)}
							</p>
							{status === "uploaded" ? (
								<p
									data-testid="file-upload-answer-uploaded"
									className="mt-1 text-xs text-muted-foreground"
								>
									Файл загружен
								</p>
							) : null}
							{busy ? (
								<p
									id={progressId}
									data-testid="file-upload-answer-uploading-label"
									className="mt-1 text-xs text-muted-foreground"
								>
									Загрузка на сервер… {Math.round(progress)}%
								</p>
							) : null}
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							disabled={disabled}
							aria-label="Удалить файл"
							data-testid="file-upload-answer-remove"
							onClick={clearUpload}
						>
							<XIcon />
						</Button>
					</div>
					{busy ? (
						<div className="grid gap-1.5">
							<Progress
								value={progress}
								data-testid="file-upload-answer-progress"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={Math.round(progress)}
								aria-label="Прогресс загрузки"
							/>
						</div>
					) : null}
				</div>
			) : null}
			{displayError ? (
				<p
					id={errorId}
					role="alert"
					data-testid="file-upload-answer-error"
					className="text-sm text-destructive"
				>
					{displayError}
				</p>
			) : null}
		</div>
	);
}

export { FileUploadAnswer };
export type { FileUploadAnswerProps, FileUploadStatus };
