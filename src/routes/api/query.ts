import { mustGetQuery } from "@rocicorp/zero";
import { handleQueryRequest } from "@rocicorp/zero/server";
import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "#/server/auth/session";
import { queries } from "#/zero/queries";
import { schema } from "#/zero/schema";

export const Route = createFileRoute("/api/query")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}

				const result = await handleQueryRequest({
					handler: (name, args) => {
						const query = mustGetQuery(queries, name);
						return query.fn({ args, ctx: user });
					},
					schema,
					request,
					userID: user.id,
				});

				return Response.json(result);
			},
		},
	},
});
