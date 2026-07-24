import { createFileRoute } from "@tanstack/react-router";
import { AdminSupportThreadPage } from "#/features/support-chat";

export const Route = createFileRoute("/admin/support/$threadId")({
	component: AdminSupportThreadRoute,
});

function AdminSupportThreadRoute() {
	const { user } = Route.useRouteContext();
	const { threadId } = Route.useParams();
	return (
		<AdminSupportThreadPage
			threadId={threadId}
			userId={user.id}
			userName={user.name}
		/>
	);
}
