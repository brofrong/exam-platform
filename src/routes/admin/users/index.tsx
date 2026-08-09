import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminUsersPage } from "#/features/admin-settings";
import { can } from "#/shared/authz";

export const Route = createFileRoute("/admin/users/")({
	beforeLoad: ({ context }) => {
		if (!can(context.user.role, "users:manage")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminUsersRoute,
});

function AdminUsersRoute() {
	return <AdminUsersPage />;
}
