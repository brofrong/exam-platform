import { createFileRoute } from "@tanstack/react-router";
import { LessonsListPage } from "#/features/admin-lessons";

export const Route = createFileRoute("/admin/lessons/")({
	component: AdminLessonsPage,
});

function AdminLessonsPage() {
	return <LessonsListPage />;
}
