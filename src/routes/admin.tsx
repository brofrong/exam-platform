import { ZeroProvider } from "@rocicorp/zero/react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "#/server/auth/get-current-user";
import { mutators } from "#/server/zero/mutators";
import { schema } from "#/server/zero/schema";
import { can } from "#/shared/authz";
import { getZeroCacheURL } from "#/shared/zero-cache-url";

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const user = await getCurrentUser();
		if (!user) {
			throw redirect({ to: "/login" });
		}
		if (!can(user.role, "program:write")) {
			throw redirect({ to: "/app" });
		}
		return { user };
	},
	component: AdminLayout,
});

function AdminLayout() {
	const { user } = Route.useRouteContext();

	return (
		<ZeroProvider
			cacheURL={getZeroCacheURL()}
			schema={schema}
			mutators={mutators}
			userID={user.id}
			context={{ id: user.id, name: user.name, role: user.role }}
		>
			<Outlet />
		</ZeroProvider>
	);
}
