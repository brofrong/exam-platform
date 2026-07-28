import { createFileRoute } from "@tanstack/react-router";
import { StudentSettingsPage } from "#/features/student-settings";

export const Route = createFileRoute("/app/settings")({
	component: StudentSettingsRoute,
});

function StudentSettingsRoute() {
	return <StudentSettingsPage />;
}
