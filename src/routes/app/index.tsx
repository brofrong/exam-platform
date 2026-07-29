import { createFileRoute } from "@tanstack/react-router";
import { StudentHomePage } from "#/features/student-home";

export const Route = createFileRoute("/app/")({
	component: AppHomePage,
});

function AppHomePage() {
	const { user } = Route.useRouteContext();
	return (
		<StudentHomePage userId={user.id} userName={user.name} role={user.role} />
	);
}
