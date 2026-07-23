import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "#/server/auth/session";

export const Route = createFileRoute("/api/auth/me")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}
				return Response.json(user);
			},
		},
	},
});
