import { createFileRoute } from "@tanstack/react-router";
import { LessonPlayerPage } from "#/features/lesson-player";

export const Route = createFileRoute(
	"/app/programs/$programId_/lessons/$lessonId",
)({
	component: StudentLessonPage,
});

function StudentLessonPage() {
	const { programId, lessonId } = Route.useParams();
	return <LessonPlayerPage programId={programId} lessonId={lessonId} />;
}
