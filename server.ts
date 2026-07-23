import path from "node:path";
import type { ServerWebSocket } from "bun";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const CLIENT_DIRECTORY = "./dist/client";
const SERVER_ENTRY_POINT = "./dist/server/server.js";
const ZERO_PROXY_PREFIXES = ["/api/zero", "/zero"] as const;
const ZERO_CACHE_UPSTREAM_URL =
	process.env.ZERO_CACHE_UPSTREAM_URL ?? "http://localhost:4848";

type StartHandler = {
	fetch: (request: Request) => Response | Promise<Response>;
};

type ZeroWsPayload = string | ArrayBuffer;

type ZeroWsData = {
	upstreamUrl: string;
	headers: Record<string, string>;
	upstream: WebSocket | null;
	pending: ZeroWsPayload[];
};

function toWsPayload(message: string | Buffer): ZeroWsPayload {
	if (typeof message === "string") return message;
	return message.buffer.slice(
		message.byteOffset,
		message.byteOffset + message.byteLength,
	) as ArrayBuffer;
}

const serverModule = (await import(SERVER_ENTRY_POINT)) as {
	default: StartHandler;
};
const handler = serverModule.default;

function rewriteZeroPath(pathname: string): string | null {
	for (const prefix of ZERO_PROXY_PREFIXES) {
		if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
			const stripped = pathname.slice(prefix.length);
			return stripped.length > 0 ? stripped : "/";
		}
	}
	return null;
}

function toUpstreamWebSocketUrl(pathname: string, search: string): string {
	const upstream = new URL(pathname + search, ZERO_CACHE_UPSTREAM_URL);
	upstream.protocol = upstream.protocol === "https:" ? "wss:" : "ws:";
	return upstream.toString();
}

function pickUpstreamHeaders(request: Request): Record<string, string> {
	const headers: Record<string, string> = {};
	const cookie = request.headers.get("cookie");
	const authorization = request.headers.get("authorization");
	const protocol = request.headers.get("sec-websocket-protocol");
	if (cookie) headers.cookie = cookie;
	if (authorization) headers.authorization = authorization;
	if (protocol) headers["sec-websocket-protocol"] = protocol;
	return headers;
}

function sendToUpstream(ws: ServerWebSocket<ZeroWsData>, message: string | Buffer) {
	const payload = toWsPayload(message);
	const upstream = ws.data.upstream;
	if (!upstream || upstream.readyState !== WebSocket.OPEN) {
		ws.data.pending.push(payload);
		return;
	}
	upstream.send(payload);
}

type BunWebSocketConstructor = new (
	url: string | URL,
	options?: Bun.WebSocketOptions,
) => WebSocket;

const BunWebSocket = WebSocket as unknown as BunWebSocketConstructor;

Bun.serve<ZeroWsData>({
	hostname: HOST,
	port: PORT,
	async fetch(request, server) {
		const url = new URL(request.url);
		const pathname = decodeURIComponent(url.pathname);
		const rewritten = rewriteZeroPath(pathname);

		if (
			rewritten !== null &&
			request.headers.get("upgrade")?.toLowerCase() === "websocket"
		) {
			const upgraded = server.upgrade(request, {
				data: {
					upstreamUrl: toUpstreamWebSocketUrl(rewritten, url.search),
					headers: pickUpstreamHeaders(request),
					upstream: null,
					pending: [],
				},
			});
			if (upgraded) return undefined;
			return new Response("WebSocket upgrade failed", { status: 400 });
		}

		if (pathname !== "/" && !pathname.endsWith("/")) {
			const filePath = path.join(CLIENT_DIRECTORY, pathname);
			const file = Bun.file(filePath);
			if (await file.exists()) {
				return new Response(file, {
					headers: {
						"Cache-Control": "public, max-age=31536000, immutable",
					},
				});
			}
		}

		return handler.fetch(request);
	},
	websocket: {
		open(ws) {
			const upstream = new BunWebSocket(ws.data.upstreamUrl, {
				headers: ws.data.headers,
			});
			ws.data.upstream = upstream;

			upstream.addEventListener("open", () => {
				for (const message of ws.data.pending) {
					upstream.send(message);
				}
				ws.data.pending = [];
			});
			upstream.addEventListener("message", (event) => {
				if (typeof event.data === "string") {
					ws.send(event.data);
					return;
				}
				if (event.data instanceof ArrayBuffer) {
					ws.send(event.data);
					return;
				}
				if (ArrayBuffer.isView(event.data)) {
					const view = event.data;
					ws.send(
						view.buffer.slice(
							view.byteOffset,
							view.byteOffset + view.byteLength,
						) as ArrayBuffer,
					);
				}
			});
			upstream.addEventListener("close", (event) => {
				ws.close(event.code, event.reason);
			});
			upstream.addEventListener("error", () => {
				ws.close(1011, "upstream error");
			});
		},
		message(ws, message) {
			sendToUpstream(ws, message);
		},
		close(ws) {
			const upstream = ws.data.upstream;
			if (
				upstream &&
				upstream.readyState !== WebSocket.CLOSED &&
				upstream.readyState !== WebSocket.CLOSING
			) {
				upstream.close();
			}
		},
	},
});

console.log(`Server listening on http://${HOST}:${PORT}`);
