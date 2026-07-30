const IMAGE_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
]);

export function isEditorImageFile(file: File): boolean {
	return IMAGE_TYPES.has(file.type);
}

/**
 * Upload an image for the theory editor via `/api/upload` (purpose=editor).
 * Returns a same-origin URL served through `/api/files/...`.
 */
export async function uploadEditorImage(file: File): Promise<string> {
	if (!isEditorImageFile(file)) {
		throw new Error("Поддерживаются JPEG, PNG, GIF и WebP");
	}

	const formData = new FormData();
	formData.set("purpose", "editor");
	formData.set("file", file);

	const response = await fetch("/api/upload", {
		method: "POST",
		body: formData,
		credentials: "include",
	});

	if (!response.ok) {
		let message = `Ошибка загрузки (${response.status})`;
		try {
			const data = (await response.json()) as { error?: string };
			if (data.error) {
				message = data.error;
			}
		} catch {
			// keep default
		}
		throw new Error(message);
	}

	const data = (await response.json()) as { key?: string };
	if (!data.key) {
		throw new Error("Сервер не вернул ключ файла");
	}

	return `/api/files/${data.key}`;
}

/** Pick the first image File from a paste/drop DataTransfer, if any. */
export function getImageFileFromDataTransfer(
	data: DataTransfer | null | undefined,
): File | null {
	if (!data) {
		return null;
	}

	for (const file of data.files) {
		if (isEditorImageFile(file)) {
			return file;
		}
	}

	for (const item of data.items) {
		if (item.kind === "file" && IMAGE_TYPES.has(item.type)) {
			const file = item.getAsFile();
			if (file && isEditorImageFile(file)) {
				return file;
			}
		}
	}

	return null;
}
