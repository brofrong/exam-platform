import { createFileRoute, redirect } from "@tanstack/react-router";
import { InviteActivatePage } from "#/features/invites";
import { getCurrentUser } from "#/server/auth/get-current-user";

export const Route = createFileRoute("/invite/$token")({
	beforeLoad: async ({ params }) => {
		const user = await getCurrentUser();
		if (!user) {
			throw redirect({
				to: "/login",
				search: { returnUrl: `/invite/${params.token}` },
			});
		}
	},
	component: InviteTokenPage,
});

function InviteTokenPage() {
	const { token } = Route.useParams();
	return <InviteActivatePage token={token} />;
}
