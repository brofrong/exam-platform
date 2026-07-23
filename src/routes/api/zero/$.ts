import { createFileRoute } from "@tanstack/react-router";
import { proxyToZeroCache } from "#/server/zero-proxy";

const proxyHandler = async ({
	request,
	params,
}: {
	request: Request;
	params: { _splat?: string };
}) => {
	const suffix = params._splat ? `/${params._splat}` : "";
	return proxyToZeroCache(request, suffix);
};

export const Route = createFileRoute("/api/zero/$")({
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
