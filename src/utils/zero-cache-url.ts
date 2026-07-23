import { env } from "#/utils/env";

function isLocalUpstream(url: string) {
	try {
		const { hostname, port } = new URL(url);
		return (
			(hostname === "localhost" || hostname === "127.0.0.1") &&
			(port === "4848" || port === "")
		);
	} catch {
		return false;
	}
}

export function getZeroCacheURL(): string {
	const configured = env.VITE_ZERO_CACHE_URL;

	if (typeof window === "undefined") {
		return configured;
	}

	if (configured && !isLocalUpstream(configured)) {
		return configured;
	}

	return `${window.location.origin}/zero`;
}
