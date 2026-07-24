import { createFileRoute } from "@tanstack/react-router";
import { ProgramOutlinePage } from "#/features/lesson-player";

export const Route = createFileRoute("/app/programs/$programId")({
	component: StudentProgramPage,
});

function StudentProgramPage() {
	const { programId } = Route.useParams();
	return <ProgramOutlinePage programId={programId} />;
}
