import { env } from "#/utils/env";

/** Zero cache is served via the app proxy at `/zero`. */
export function getZeroCacheURL(): string {
	if (typeof window !== "undefined") {
		return `${window.location.origin}/zero`;
	}

	return new URL("/zero", env.APP_URL).toString();
}
