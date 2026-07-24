import { describe, expect, test } from "bun:test";
import {
	aggregateFileUploadStatus,
	formatFileSize,
	isImageFile,
	simulateUpload,
} from "@/components/answer-widgets/lib/file-upload";

describe("formatFileSize", () => {
	test("formats bytes under 1 KB", () => {
		expect(formatFileSize(512)).toBe("512 Б");
	});

	test("formats kilobytes", () => {
		expect(formatFileSize(2048)).toBe("2 КБ");
	});

	test("formats megabytes", () => {
		expect(formatFileSize(1_572_864)).toBe("1.5 МБ");
	});
});

describe("isImageFile", () => {
	test("detects image mime types", () => {
		expect(isImageFile(new File([], "photo.png", { type: "image/png" }))).toBe(
			true,
		);
		expect(
			isImageFile(new File([], "doc.pdf", { type: "application/pdf" })),
		).toBe(false);
	});
});

describe("aggregateFileUploadStatus", () => {
	test("returns idle for empty list", () => {
		expect(aggregateFileUploadStatus([])).toBe("idle");
	});

	test("prefers uploading over other statuses", () => {
		expect(aggregateFileUploadStatus(["uploaded", "uploading", "error"])).toBe(
			"uploading",
		);
	});

	test("returns error when any file failed and none uploading", () => {
		expect(aggregateFileUploadStatus(["uploaded", "error"])).toBe("error");
	});

	test("returns uploaded when every file uploaded", () => {
		expect(aggregateFileUploadStatus(["uploaded", "uploaded"])).toBe(
			"uploaded",
		);
	});
});

describe("simulateUpload", () => {
	test("reports progress up to 100 and resolves", async () => {
		const file = new File(["x"], "a.txt", { type: "text/plain" });
		const progress: number[] = [];

		const result = await simulateUpload(file, {
			onProgress: (value) => progress.push(value),
			durationMs: 40,
		});

		expect(progress.at(-1)).toBe(100);
		expect(progress[0]).toBeGreaterThan(0);
		expect(result.key).toContain("a.txt");
	});

	test("aborts when signal is aborted", async () => {
		const file = new File(["x"], "a.txt", { type: "text/plain" });
		const controller = new AbortController();
		controller.abort();

		await expect(
			simulateUpload(file, {
				onProgress: () => undefined,
				durationMs: 100,
				signal: controller.signal,
			}),
		).rejects.toMatchObject({ name: "AbortError" });
	});
});
