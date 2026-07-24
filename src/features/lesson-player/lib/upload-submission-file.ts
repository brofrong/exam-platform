export type UploadedSubmissionFile = {
	storageKey: string;
	filename: string;
	mime: string;
	size: number;
};

/**
 * Upload a practice answer file via `/api/upload` (purpose=submissions).
 * Uses cookies for auth (`credentials: "include"`).
 */
export function uploadSubmissionFile(
	file: File,
	ctx: { onProgress: (progress: number) => void; signal: AbortSignal },
): Promise<UploadedSubmissionFile> {
	return new Promise((resolve, reject) => {
		const formData = new FormData();
		formData.set("purpose", "submissions");
		formData.set("file", file);

		const xhr = new XMLHttpRequest();
		xhr.open("POST", "/api/upload");
		xhr.withCredentials = true;

		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable && event.total > 0) {
				ctx.onProgress(Math.round((event.loaded / event.total) * 100));
			}
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const data = JSON.parse(xhr.responseText) as { key?: string };
					if (typeof data.key !== "string" || data.key.length === 0) {
						reject(new Error("Сервер не вернул ключ файла"));
						return;
					}
					ctx.onProgress(100);
					resolve({
						storageKey: data.key,
						filename: file.name,
						mime: file.type || "application/octet-stream",
						size: file.size,
					});
				} catch {
					reject(new Error("Некорректный ответ сервера"));
				}
				return;
			}

			let message = `Ошибка загрузки (${xhr.status})`;
			try {
				const data = JSON.parse(xhr.responseText) as { error?: string };
				if (typeof data.error === "string" && data.error.length > 0) {
					message = data.error;
				}
			} catch {
				// keep default message
			}
			reject(new Error(message));
		};

		xhr.onerror = () => {
			reject(new Error("Не удалось загрузить файл"));
		};

		xhr.onabort = () => {
			reject(new DOMException("Aborted", "AbortError"));
		};

		const onAbort = () => {
			xhr.abort();
		};
		if (ctx.signal.aborted) {
			onAbort();
			return;
		}
		ctx.signal.addEventListener("abort", onAbort, { once: true });

		xhr.send(formData);
	});
}
