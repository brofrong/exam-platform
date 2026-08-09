import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import { listOpenRouterModels } from "#/server/openrouter/client";
import { getOpenRouterApiKey } from "#/server/openrouter/settings";
import { can } from "#/shared/authz";

export const Route = createFileRoute("/api/admin/openrouter-models")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}
				if (!can(user.role, "settings:ai")) {
					return Response.json({ error: "Forbidden" }, { status: 403 });
				}
				const apiKey = await getOpenRouterApiKey();
				const models = await listOpenRouterModels(apiKey);
				return Response.json({ models });
			},
		},
	},
});
