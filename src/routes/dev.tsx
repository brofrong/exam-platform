import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "#/server/auth/get-current-user";
import { can } from "#/shared/authz";

export const Route = createFileRoute("/dev")({
	beforeLoad: async () => {
		// DEV always open; production requires admin (program:write).
		if (import.meta.env.DEV) {
			const user = await getCurrentUser();
			return { user };
		}

		const user = await getCurrentUser();
		if (!user) {
			throw redirect({ to: "/login" });
		}
		if (!can(user.role, "program:write")) {
			throw redirect({ to: "/app" });
		}
		return { user };
	},
	component: DevLayout,
});

function DevLayout() {
	return <Outlet />;
}
