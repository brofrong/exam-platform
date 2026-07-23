import path from "node:path";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const CLIENT_DIRECTORY = "./dist/client";
const SERVER_ENTRY_POINT = "./dist/server/server.js";

type StartHandler = {
	fetch: (request: Request) => Response | Promise<Response>;
};

const serverModule = (await import(SERVER_ENTRY_POINT)) as {
	default: StartHandler;
};
const handler = serverModule.default;

Bun.serve({
	hostname: HOST,
	port: PORT,
	async fetch(request) {
		const url = new URL(request.url);
		const pathname = decodeURIComponent(url.pathname);

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
});

console.log(`Server listening on http://${HOST}:${PORT}`);
