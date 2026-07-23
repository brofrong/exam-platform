import { env } from "#/utils/env";

const HOP_BY_HOP_HEADERS = new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailers",
	"transfer-encoding",
	"upgrade",
]);

export async function proxyToZeroCache(
	request: Request,
	targetPath: string,
): Promise<Response> {
	const upstream = new URL(env.ZERO_CACHE_UPSTREAM_URL);
	const targetUrl = new URL(
		`${targetPath.replace(/^\//, "")}${new URL(request.url).search}`,
		upstream,
	);

	const headers = new Headers(request.headers);
	for (const header of HOP_BY_HOP_HEADERS) {
		headers.delete(header);
	}
	headers.set("host", upstream.host);

	const hasBody =
		request.method !== "GET" &&
		request.method !== "HEAD" &&
		request.method !== "OPTIONS";

	const response = await fetch(targetUrl, {
		method: request.method,
		headers,
		body: hasBody ? request.body : undefined,
		// @ts-expect-error duplex is required when streaming a request body
		duplex: hasBody ? "half" : undefined,
		redirect: "manual",
	});

	const responseHeaders = new Headers(response.headers);
	for (const header of HOP_BY_HOP_HEADERS) {
		responseHeaders.delete(header);
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}
