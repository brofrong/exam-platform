import { createFileRoute } from "@tanstack/react-router";
import { proxyToZeroCache } from "#/server/zero-proxy";

const proxyHandler = async ({ request }: { request: Request }) =>
	proxyToZeroCache(request, "/");

export const Route = createFileRoute("/zero")({
	server: {
		handlers: {
			GET: proxyHandler,
			POST: proxyHandler,
			PUT: proxyHandler,
			PATCH: proxyHandler,
			DELETE: proxyHandler,
			OPTIONS: proxyHandler,
			HEAD: proxyHandler,
		},
	},
});
