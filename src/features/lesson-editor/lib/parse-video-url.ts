export type VideoProvider = "vk" | "youtube";

export type ParsedVideoUrl = {
	provider: VideoProvider;
	sourceId: string;
	embedUrl: string;
	originalUrl: string;
};

const YOUTUBE_ID_RE = /^[\w-]{11}$/;

/** `video-123_456` / `video123_456` → oid + id */
const VK_PATH_VIDEO_RE = /(?:^|\/)video(-?\d+)_(\d+)/i;

function trimInput(input: string): string {
	return input.trim();
}

function tryParseUrl(input: string): URL | null {
	try {
		return new URL(input);
	} catch {
		try {
			return new URL(`https://${input}`);
		} catch {
			return null;
		}
	}
}

function isVkHost(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return (
		host === "vk.com" ||
		host === "www.vk.com" ||
		host === "m.vk.com" ||
		host === "vkvideo.ru" ||
		host === "www.vkvideo.ru" ||
		host.endsWith(".vk.com") ||
		host.endsWith(".vkvideo.ru")
	);
}

function isYoutubeHost(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return (
		host === "youtu.be" ||
		host === "youtube.com" ||
		host === "www.youtube.com" ||
		host === "m.youtube.com" ||
		host === "music.youtube.com"
	);
}

function vkEmbed(oid: string, id: string): string {
	return `https://vk.com/video_ext.php?oid=${oid}&id=${id}`;
}

function vkSourceId(oid: string, id: string): string {
	return `${oid}_${id}`;
}

function parseVkFromUrl(url: URL, originalUrl: string): ParsedVideoUrl | null {
	if (url.pathname.includes("video_ext.php")) {
		const oid = url.searchParams.get("oid");
		const id = url.searchParams.get("id");
		if (oid && id && /^-?\d+$/.test(oid) && /^\d+$/.test(id)) {
			return {
				provider: "vk",
				sourceId: vkSourceId(oid, id),
				embedUrl: vkEmbed(oid, id),
				originalUrl,
			};
		}
	}

	const pathMatch = url.pathname.match(VK_PATH_VIDEO_RE);
	if (pathMatch) {
		const oid = pathMatch[1];
		const id = pathMatch[2];
		return {
			provider: "vk",
			sourceId: vkSourceId(oid, id),
			embedUrl: vkEmbed(oid, id),
			originalUrl,
		};
	}

	// Query param forms: ?z=video-1_2 or nested playlist junk
	const z = url.searchParams.get("z") ?? "";
	const zMatch = z.match(/video(-?\d+)_(\d+)/i);
	if (zMatch) {
		const oid = zMatch[1];
		const id = zMatch[2];
		return {
			provider: "vk",
			sourceId: vkSourceId(oid, id),
			embedUrl: vkEmbed(oid, id),
			originalUrl,
		};
	}

	const haystack = `${url.pathname}?${url.search}`;
	const loose = haystack.match(/video(-?\d+)_(\d+)/i);
	if (loose) {
		const oid = loose[1];
		const id = loose[2];
		return {
			provider: "vk",
			sourceId: vkSourceId(oid, id),
			embedUrl: vkEmbed(oid, id),
			originalUrl,
		};
	}

	// Best-effort: VK host but unclear format — keep original as embed.
	return {
		provider: "vk",
		sourceId: originalUrl,
		embedUrl: originalUrl,
		originalUrl,
	};
}

function extractYoutubeId(url: URL): string | null {
	const host = url.hostname.toLowerCase();

	if (host === "youtu.be") {
		const id = url.pathname.replace(/^\//, "").split("/")[0] ?? "";
		return YOUTUBE_ID_RE.test(id) ? id : null;
	}

	const v = url.searchParams.get("v");
	if (v && YOUTUBE_ID_RE.test(v)) {
		return v;
	}

	const embedMatch = url.pathname.match(
		/\/(?:embed|shorts|live|v)\/([\w-]{11})/,
	);
	if (embedMatch) {
		return embedMatch[1];
	}

	return null;
}

function parseYoutubeFromUrl(
	url: URL,
	originalUrl: string,
): ParsedVideoUrl | null {
	const sourceId = extractYoutubeId(url);
	if (!sourceId) {
		return null;
	}
	return {
		provider: "youtube",
		sourceId,
		embedUrl: `https://www.youtube.com/embed/${sourceId}`,
		originalUrl,
	};
}

/**
 * Normalize a pasted video URL into TipTap video node attrs.
 * Supports VK Video primarily; YouTube as a simple bonus.
 */
export function parseVideoUrl(input: string): ParsedVideoUrl | null {
	const originalUrl = trimInput(input);
	if (!originalUrl) {
		return null;
	}

	const url = tryParseUrl(originalUrl);
	if (!url) {
		return null;
	}

	if (isVkHost(url.hostname)) {
		return parseVkFromUrl(url, originalUrl);
	}

	if (isYoutubeHost(url.hostname)) {
		return parseYoutubeFromUrl(url, originalUrl);
	}

	return null;
}
