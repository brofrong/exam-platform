"use client";

import { FileIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
	aggregateFileUploadStatus,
	type FileUploadStatus,
	formatFileSize,
	isImageFile,
} from "@/components/answer-widgets/lib/file-upload";
import { FileDropzone } from "@/components/lms";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FileUploadEntry = {
	id: string;
	file: File;
	status: FileUploadStatus;
	progress: number;
	previewUrl: string | null;
	error: string | null;
};

type FileUploadAnswerProps = {
	/** Allow selecting/dropping several files. Default `true`. */
	multiple?: boolean;
	value?: File[];
	onChange: (files: File[]) => void;
	/**
	 * Pluggable uploader. Called once per file. Receives progress callbacks so
	 * real S3 uploads can report determinate progress later.
	 */
	onUpload?: (
		file: File,
		ctx: { onProgress: (progress: number) => void; signal: AbortSignal },
	) => Promise<unknown>;
	/** Aggregate status across all files (`uploading` if any file is uploading). */
	onStatusChange?: (status: FileUploadStatus) => void;
	error?: string;
	disabled?: boolean;
	label?: string;
	hint?: string;
	accept?: string;
	className?: string;
};

function createEntryId() {
	return crypto.randomUUID();
}

function createEntry(
	file: File,
	status: FileUploadStatus,
	progress: number,
): FileUploadEntry {
	return {
		id: createEntryId(),
		file,
		status,
		progress,
		previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
		error: null,
	};
}

function FileUploadAnswer({
	multiple = true,
	value = [],
	onChange,
	onUpload,
	onStatusChange,
	error,
	disabled = false,
	label,
	hint = "или нажмите, чтобы выбрать",
	accept,
	className,
}: FileUploadAnswerProps) {
	const errorId = useId();
	const abortMapRef = useRef(new Map<string, AbortController>());
	const entriesRef = useRef<FileUploadEntry[]>([]);
	const [entries, setEntries] = useState<FileUploadEntry[]>(() =>
		value.map((file) => createEntry(file, "uploaded", 100)),
	);
	const statusRef = useRef<FileUploadStatus>(
		aggregateFileUploadStatus(entries.map((entry) => entry.status)),
	);

	entriesRef.current = entries;

	const resolvedLabel =
		label ?? (multiple ? "Прикрепите файлы" : "Прикрепите файл");
	const invalid = Boolean(error);
	const status = aggregateFileUploadStatus(
		entries.map((entry) => entry.status),
	);
	const busy = status === "uploading";
	const showDropzone = multiple || entries.length === 0;

	function emitStatus(nextEntries: FileUploadEntry[]) {
		const next = aggregateFileUploadStatus(
			nextEntries.map((entry) => entry.status),
		);
		if (statusRef.current !== next) {
			statusRef.current = next;
			onStatusChange?.(next);
		}
	}

	function patchEntry(
		id: string,
		patch: Partial<Omit<FileUploadEntry, "id" | "file">>,
	) {
		setEntries((current) => {
			const next = current.map((entry) =>
				entry.id === id ? { ...entry, ...patch } : entry,
			);
			emitStatus(next);
			return next;
		});
	}

	function revokeEntry(entry: FileUploadEntry) {
		if (entry.previewUrl) {
			URL.revokeObjectURL(entry.previewUrl);
		}
	}

	function removeEntry(id: string) {
		abortMapRef.current.get(id)?.abort();
		abortMapRef.current.delete(id);

		setEntries((current) => {
			const target = current.find((entry) => entry.id === id);
			if (target) revokeEntry(target);
			const next = current.filter((entry) => entry.id !== id);
			onChange(next.map((entry) => entry.file));
			emitStatus(next);
			return next;
		});
	}

	useEffect(() => {
		return () => {
			for (const controller of abortMapRef.current.values()) {
				controller.abort();
			}
			abortMapRef.current.clear();
			for (const entry of entriesRef.current) {
				if (entry.previewUrl) {
					URL.revokeObjectURL(entry.previewUrl);
				}
			}
		};
	}, []);

	async function startUpload(entry: FileUploadEntry) {
		if (!onUpload) {
			patchEntry(entry.id, { status: "uploaded", progress: 100, error: null });
			return;
		}

		const controller = new AbortController();
		abortMapRef.current.get(entry.id)?.abort();
		abortMapRef.current.set(entry.id, controller);
		patchEntry(entry.id, { status: "uploading", progress: 0, error: null });

		try {
			await onUpload(entry.file, {
				onProgress: (progress) => {
					patchEntry(entry.id, { progress });
				},
				signal: controller.signal,
			});
			if (controller.signal.aborted) return;
			patchEntry(entry.id, {
				status: "uploaded",
				progress: 100,
				error: null,
			});
		} catch (cause) {
			if (controller.signal.aborted) return;
			const message =
				cause instanceof Error ? cause.message : "Не удалось загрузить файл";
			patchEntry(entry.id, { status: "error", error: message });
		} finally {
			if (abortMapRef.current.get(entry.id) === controller) {
				abortMapRef.current.delete(entry.id);
			}
		}
	}

	function handleFiles(files: File[]) {
		if (disabled || files.length === 0) return;
		if (!multiple && busy) return;

		const incoming = multiple ? files : files.slice(0, 1);
		const created = incoming.map((file) =>
			createEntry(
				file,
				onUpload ? "uploading" : "uploaded",
				onUpload ? 0 : 100,
			),
		);

		setEntries((current) => {
			if (!multiple) {
				for (const entry of current) {
					abortMapRef.current.get(entry.id)?.abort();
					abortMapRef.current.delete(entry.id);
					revokeEntry(entry);
				}
			}
			const next = multiple ? [...current, ...created] : created;
			onChange(next.map((entry) => entry.file));
			emitStatus(next);
			return next;
		});

		for (const entry of created) {
			void startUpload(entry);
		}
	}

	const itemErrors = entries
		.map((entry) => entry.error)
		.filter((message): message is string => Boolean(message));
	const displayError = error ?? itemErrors[0] ?? null;

	return (
		<div
			data-slot="file-upload-answer"
			data-testid="file-upload-answer"
			data-status={status}
			data-multiple={multiple || undefined}
			className={cn("grid w-full gap-2", className)}
			aria-describedby={invalid || displayError ? errorId : undefined}
		>
			{entries.length > 0 ? (
				<ul data-testid="file-upload-answer-list" className="grid w-full gap-2">
					{entries.map((entry) => {
						const itemBusy = entry.status === "uploading";
						return (
							<li
								key={entry.id}
								data-testid="file-upload-answer-item"
								data-status={entry.status}
								className={cn(
									"grid gap-3 rounded-xl border border-border bg-muted/30 p-3",
									invalid && "border-destructive",
									itemBusy && "ring-1 ring-primary/20",
									entry.status === "error" && "border-destructive",
								)}
							>
								<div className="flex items-start gap-3">
									{entry.previewUrl ? (
										<img
											src={entry.previewUrl}
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
											{entry.file.name}
										</p>
										<p
											data-testid="file-upload-answer-size"
											className="text-xs text-muted-foreground"
										>
											{formatFileSize(entry.file.size)}
										</p>
										{entry.status === "uploaded" ? (
											<p
												data-testid="file-upload-answer-uploaded"
												className="mt-1 text-xs text-muted-foreground"
											>
												Файл загружен
											</p>
										) : null}
										{itemBusy ? (
											<p
												data-testid="file-upload-answer-uploading-label"
												className="mt-1 text-xs text-muted-foreground"
											>
												Загрузка на сервер… {Math.round(entry.progress)}%
											</p>
										) : null}
										{entry.error ? (
											<p
												data-testid="file-upload-answer-item-error"
												className="mt-1 text-xs text-destructive"
											>
												{entry.error}
											</p>
										) : null}
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										disabled={disabled}
										aria-label={`Удалить ${entry.file.name}`}
										data-testid="file-upload-answer-remove"
										onClick={() => removeEntry(entry.id)}
									>
										<XIcon />
									</Button>
								</div>
								{itemBusy ? (
									<div className="grid gap-1.5">
										<Progress
											value={entry.progress}
											data-testid="file-upload-answer-progress"
											aria-valuemin={0}
											aria-valuemax={100}
											aria-valuenow={Math.round(entry.progress)}
											aria-label={`Прогресс загрузки ${entry.file.name}`}
										/>
									</div>
								) : null}
							</li>
						);
					})}
				</ul>
			) : null}

			{showDropzone ? (
				<FileDropzone
					onFiles={handleFiles}
					multiple={multiple}
					accept={accept}
					disabled={disabled}
					label={resolvedLabel}
					hint={hint}
					className={cn(
						invalid && "border-destructive",
						entries.length > 0 && "py-6",
					)}
				/>
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
export type { FileUploadAnswerProps, FileUploadEntry, FileUploadStatus };
