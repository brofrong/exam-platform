import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import { activateInvite } from "#/server/invites/activate-invite";

const bodySchema = z.object({
	token: z.string().min(1),
});

export const Route = createFileRoute("/api/invite/activate")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}

				let json: unknown;
				try {
					json = await request.json();
				} catch {
					return Response.json({ error: "Invalid JSON body" }, { status: 400 });
				}

				const parsed = bodySchema.safeParse(json);
				if (!parsed.success) {
					return Response.json({ error: "token is required" }, { status: 400 });
				}

				const result = await activateInvite(parsed.data.token, user.id);

				if (!result.ok) {
					const status = result.code === "not_found" ? 404 : 409;
					return Response.json(
						{ error: result.message, code: result.code },
						{ status },
					);
				}

				return Response.json({
					ok: true,
					soft: result.soft,
					programIds: result.programIds,
				});
			},
		},
	},
});
