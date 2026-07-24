export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const UPLOAD_PURPOSES = ["editor", "submissions"] as const;
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

const ALLOWED_CONTENT_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"application/pdf",
	"text/plain",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isUploadPurpose(value: unknown): value is UploadPurpose {
	return (
		typeof value === "string" &&
		(UPLOAD_PURPOSES as readonly string[]).includes(value)
	);
}

export function isAllowedContentType(contentType: string): boolean {
	const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
	return ALLOWED_CONTENT_TYPES.has(base);
}

/** Strip path junk; keep a short safe basename. */
export function sanitizeFilename(name: string): string {
	const base = name.split(/[/\\]/).pop()?.trim() || "file";
	const cleaned = base.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120);
	return cleaned.length > 0 ? cleaned : "file";
}

export function buildObjectKey(
	purpose: UploadPurpose,
	userId: string,
	filename: string,
): string {
	const id = crypto.randomUUID();
	return `${purpose}/${userId}/${id}-${sanitizeFilename(filename)}`;
}
