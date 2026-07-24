import { createFileRoute } from "@tanstack/react-router";
import { StudentSupportPage } from "#/features/support-chat";

export const Route = createFileRoute("/app/support")({
	component: AppSupportPage,
});

function AppSupportPage() {
	const { user } = Route.useRouteContext();
	return <StudentSupportPage userId={user.id} userName={user.name} />;
}
