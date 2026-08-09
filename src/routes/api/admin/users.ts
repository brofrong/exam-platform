import { createFileRoute } from "@tanstack/react-router";
import { asc, eq } from "drizzle-orm";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import { db } from "#/server/db/db";
import { usersTable } from "#/server/db/user/user.schema";
import { can, isRole, type Role } from "#/shared/authz";

export const Route = createFileRoute("/api/admin/users")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const user = await authenticateRequest(request);
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}
				if (!can(user.role, "users:manage")) {
					return Response.json({ error: "Forbidden" }, { status: 403 });
				}

				const rows = await db
					.select({
						id: usersTable.id,
						name: usersTable.name,
						email: usersTable.email,
						role: usersTable.role,
						createdAt: usersTable.createdAt,
					})
					.from(usersTable)
					.orderBy(asc(usersTable.createdAt));

				return Response.json({
					users: rows.map((row) => ({
						id: row.id,
						name: row.name,
						email: row.email,
						role: isRole(row.role) ? row.role : ("student" as Role),
						createdAt: row.createdAt.toISOString(),
					})),
				});
			},
			PATCH: async ({ request }) => {
				const actor = await authenticateRequest(request);
				if (!actor) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}
				if (!can(actor.role, "users:manage")) {
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
				const userId = typeof record.userId === "string" ? record.userId : "";
				const role = record.role;

				if (!userId) {
					return Response.json(
						{ error: "userId is required" },
						{ status: 400 },
					);
				}
				if (!isRole(role)) {
					return Response.json(
						{ error: "role must be admin, teacher, or student" },
						{ status: 400 },
					);
				}

				if (userId === actor.id && role !== "admin") {
					return Response.json(
						{ error: "Нельзя снять с себя роль админа" },
						{ status: 400 },
					);
				}

				const updated = await db
					.update(usersTable)
					.set({ role })
					.where(eq(usersTable.id, userId))
					.returning({
						id: usersTable.id,
						name: usersTable.name,
						email: usersTable.email,
						role: usersTable.role,
						createdAt: usersTable.createdAt,
					});

				const row = updated[0];
				if (!row) {
					return Response.json({ error: "User not found" }, { status: 404 });
				}

				return Response.json({
					user: {
						id: row.id,
						name: row.name,
						email: row.email,
						role: isRole(row.role) ? row.role : ("student" as Role),
						createdAt: row.createdAt.toISOString(),
					},
				});
			},
		},
	},
});
