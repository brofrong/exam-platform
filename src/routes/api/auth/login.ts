import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createSessionCookie, createSessionToken } from "#/server/auth/session";
import { db } from "#/server/db/db";
import { usersTable } from "#/server/db/user/user.schema";

const loginSchema = z.object({
	login: z.string().trim().min(1).max(255),
});

export const Route = createFileRoute("/api/auth/login")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await request.json();
				const parsed = loginSchema.safeParse(body);
				if (!parsed.success) {
					return Response.json({ error: "Login is required" }, { status: 400 });
				}

				const login = parsed.data.login.toLowerCase();

				const [existing] = await db
					.select()
					.from(usersTable)
					.where(eq(usersTable.login, login))
					.limit(1);

				const user =
					existing ??
					(await db.insert(usersTable).values({ login }).returning())[0];

				const token = createSessionToken(user.id);

				return new Response(
					JSON.stringify({ id: user.id, login: user.login }),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							"Set-Cookie": createSessionCookie(token),
						},
					},
				);
			},
		},
	},
});
