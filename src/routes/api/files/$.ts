import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import { getSignedGetUrl } from "#/server/storage";

const SIGNED_URL_EXPIRES_IN = 60 * 15;

function wantsJson(request: Request): boolean {
	const accept = request.headers.get("accept") ?? "";
	const url = new URL(request.url);
	return (
		url.searchParams.get("format") === "json" ||
		accept.includes("application/json")
	);
}

export const Route = createFileRoute("/api/files/$")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}

				const key = params._splat?.replace(/^\/+/, "").trim() ?? "";
				if (!key || key.includes("..")) {
					return Response.json({ error: "Invalid key" }, { status: 400 });
				}

				const url = await getSignedGetUrl({
					key,
					expiresIn: SIGNED_URL_EXPIRES_IN,
				});

				if (wantsJson(request)) {
					return Response.json({ url });
				}

				return Response.redirect(url, 302);
			},
		},
	},
});
