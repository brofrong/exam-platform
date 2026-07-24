import { mustGetMutator } from "@rocicorp/zero";
import { handleMutateRequest } from "@rocicorp/zero/server";
import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import { dbProvider } from "#/server/db/db";
import { mutators } from "#/server/zero/mutators";

export const Route = createFileRoute("/api/mutate")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}

				const result = await handleMutateRequest({
					dbProvider,
					handler: (transact) =>
						transact((tx, name, args) => {
							const mutator = mustGetMutator(mutators, name);
							return mutator.fn({
								args,
								tx,
								ctx: {
									id: user.id,
									name: user.name,
									role: user.role,
								},
							});
						}),
					request,
					userID: user.id,
				});

				return Response.json(result);
			},
		},
	},
});
