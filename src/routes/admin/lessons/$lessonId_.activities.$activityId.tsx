import { createFileRoute } from "@tanstack/react-router";
import { ActivityEditPage } from "#/features/admin-lessons/ui/activity-edit-page";

export const Route = createFileRoute(
	"/admin/lessons/$lessonId_/activities/$activityId",
)({
	component: AdminActivityEditPage,
});

function AdminActivityEditPage() {
	const { lessonId, activityId } = Route.useParams();
	return <ActivityEditPage lessonId={lessonId} activityId={activityId} />;
}
