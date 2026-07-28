import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LessonCreatePage } from "#/features/admin-lessons/ui/lesson-create-page";

const lessonCreateSearchSchema = z.object({
	programId: z.string().optional(),
	topicId: z.string().optional(),
});

export const Route = createFileRoute("/admin/lessons/new")({
	validateSearch: lessonCreateSearchSchema,
	component: AdminLessonCreatePage,
});

function AdminLessonCreatePage() {
	const search = Route.useSearch();
	return (
		<LessonCreatePage programId={search.programId} topicId={search.topicId} />
	);
}
