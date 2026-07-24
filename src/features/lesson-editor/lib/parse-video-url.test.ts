import { describe, expect, test } from "bun:test";
import { parseVideoUrl } from "#/features/lesson-editor/lib/parse-video-url";

describe("parseVideoUrl", () => {
	test("parses VK video URL with negative owner (community)", () => {
		const url = "https://vk.com/video-123456_789012";
		expect(parseVideoUrl(url)).toEqual({
			provider: "vk",
			sourceId: "-123456_789012",
			embedUrl: "https://vk.com/video_ext.php?oid=-123456&id=789012",
			originalUrl: url,
		});
	});

	test("parses VK video URL with positive owner (user)", () => {
		const url = "https://vk.com/video987654_321098";
		expect(parseVideoUrl(url)).toEqual({
			provider: "vk",
			sourceId: "987654_321098",
			embedUrl: "https://vk.com/video_ext.php?oid=987654&id=321098",
			originalUrl: url,
		});
	});

	test("parses vkvideo.ru video URL", () => {
		const url = "https://vkvideo.ru/video-111_222";
		expect(parseVideoUrl(url)).toEqual({
			provider: "vk",
			sourceId: "-111_222",
			embedUrl: "https://vk.com/video_ext.php?oid=-111&id=222",
			originalUrl: url,
		});
	});

	test("parses VK embed URL (video_ext.php)", () => {
		const url = "https://vk.com/video_ext.php?oid=-123456&id=789012";
		expect(parseVideoUrl(url)).toEqual({
			provider: "vk",
			sourceId: "-123456_789012",
			embedUrl: "https://vk.com/video_ext.php?oid=-123456&id=789012",
			originalUrl: url,
		});
	});

	test("parses YouTube watch URL", () => {
		const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
		expect(parseVideoUrl(url)).toEqual({
			provider: "youtube",
			sourceId: "dQw4w9WgXcQ",
			embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
			originalUrl: url,
		});
	});

	test("parses youtu.be short URL", () => {
		const url = "https://youtu.be/dQw4w9WgXcQ";
		expect(parseVideoUrl(url)).toEqual({
			provider: "youtube",
			sourceId: "dQw4w9WgXcQ",
			embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
			originalUrl: url,
		});
	});

	test("returns null for empty / unrelated URLs", () => {
		expect(parseVideoUrl("")).toBeNull();
		expect(parseVideoUrl("   ")).toBeNull();
		expect(parseVideoUrl("https://example.com/page")).toBeNull();
	});

	test("parses VK z= query with playlist suffix", () => {
		const url = "https://vk.com/video?z=video-1_2%2Fplaylist";
		expect(parseVideoUrl(url)).toEqual({
			provider: "vk",
			sourceId: "-1_2",
			embedUrl: "https://vk.com/video_ext.php?oid=-1&id=2",
			originalUrl: url,
		});
	});

	test("best-effort for unclear VK-looking URL keeps original as embed", () => {
		const url = "https://vk.com/video";
		expect(parseVideoUrl(url)).toEqual({
			provider: "vk",
			sourceId: url,
			embedUrl: url,
			originalUrl: url,
		});
	});
});
