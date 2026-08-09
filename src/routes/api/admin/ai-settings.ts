import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import {
	getAiSettingsPublic,
	saveAiSettings,
} from "#/server/openrouter/settings";
import { can } from "#/shared/authz";

export const Route = createFileRoute("/api/admin/ai-settings")({
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
				const settings = await getAiSettingsPublic();
				return Response.json(settings);
			},
			PUT: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}
				if (!can(user.role, "settings:ai")) {
					return Response.json({ error: "Forbidden" }, { status: 403 });
				}

				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return Response.json({ error: "Invalid JSON" }, { status: 400 });
				}

				const record =
					body && typeof body === "object"
						? (body as Record<string, unknown>)
						: {};
				const apiKey =
					typeof record.apiKey === "string" ? record.apiKey : undefined;
				const clearApiKey = record.clearApiKey === true;
				const model =
					typeof record.model === "string" ? record.model : undefined;

				if (apiKey === undefined && !clearApiKey && model === undefined) {
					return Response.json({ error: "Nothing to update" }, { status: 400 });
				}

				const settings = await saveAiSettings({
					apiKey,
					clearApiKey,
					model,
				});
				return Response.json(settings);
			},
		},
	},
});
