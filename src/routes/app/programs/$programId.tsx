import { createFileRoute } from "@tanstack/react-router";
import { ProgramPage } from "#/features/programs";

export const Route = createFileRoute("/app/programs/$programId")({
	component: StudentProgramPage,
});

function StudentProgramPage() {
	const { programId } = Route.useParams();
	return <ProgramPage programId={programId} />;
}
