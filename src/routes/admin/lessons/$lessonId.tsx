import { createFileRoute } from "@tanstack/react-router";
import { LessonDetailPage } from "#/features/admin-lessons";

export const Route = createFileRoute("/admin/lessons/$lessonId")({
	component: AdminLessonDetailPage,
});

function AdminLessonDetailPage() {
	const { lessonId } = Route.useParams();
	return <LessonDetailPage lessonId={lessonId} />;
}
