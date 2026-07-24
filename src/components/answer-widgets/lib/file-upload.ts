type SimulateUploadOptions = {
	onProgress: (progress: number) => void;
	durationMs?: number;
	signal?: AbortSignal;
};

type SimulateUploadResult = {
	key: string;
};

function formatFileSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} Б`;
	}
	if (bytes < 1024 * 1024) {
		const kb = bytes / 1024;
		const rounded = kb >= 10 ? Math.round(kb) : Math.round(kb * 10) / 10;
		return `${rounded} КБ`;
	}
	const mb = bytes / (1024 * 1024);
	const rounded = mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10;
	return `${rounded} МБ`;
}

function isImageFile(file: File): boolean {
	return file.type.startsWith("image/");
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new DOMException("Aborted", "AbortError"));
			return;
		}

		const timer = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, ms);

		function onAbort() {
			clearTimeout(timer);
			reject(new DOMException("Aborted", "AbortError"));
		}

		signal?.addEventListener("abort", onAbort, { once: true });
	});
}

/**
 * Mock uploader for gallery / local demos until S3/MinIO API is wired.
 * Reports determinate progress over ~1–2s by default.
 */
async function simulateUpload(
	file: File,
	{ onProgress, durationMs = 1500, signal }: SimulateUploadOptions,
): Promise<SimulateUploadResult> {
	if (signal?.aborted) {
		throw new DOMException("Aborted", "AbortError");
	}

	const steps = 20;
	const stepMs = durationMs / steps;

	for (let step = 1; step <= steps; step += 1) {
		await delay(stepMs, signal);
		onProgress(Math.round((step / steps) * 100));
	}

	return { key: `mock/${file.name}` };
}

export type { SimulateUploadOptions, SimulateUploadResult };
export { formatFileSize, isImageFile, simulateUpload };
