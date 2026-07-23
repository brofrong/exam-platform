import { ZeroProvider } from "@rocicorp/zero/react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "#/server/auth/get-current-user";
import { getZeroCacheURL } from "#/utils/zero-cache-url";
import { mutators } from "#/zero/mutators";
import { schema } from "#/zero/schema";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const user = await getCurrentUser();
		if (!user) {
			throw redirect({ to: "/login" });
		}
		return { user };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { user } = Route.useRouteContext();

	return (
		<ZeroProvider
			cacheURL={getZeroCacheURL()}
			schema={schema}
			mutators={mutators}
			userID={user.id}
			context={{ id: user.id, login: user.login }}
		>
			<Outlet />
		</ZeroProvider>
	);
}
