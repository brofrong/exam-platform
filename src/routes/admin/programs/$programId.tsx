import { createFileRoute } from "@tanstack/react-router";
import { ProgramsWorkspaceProgramPane } from "#/features/admin-programs/ui/programs-workspace-page";

export const Route = createFileRoute("/admin/programs/$programId")({
	component: AdminProgramDetailPage,
});

function AdminProgramDetailPage() {
	const { programId } = Route.useParams();
	return <ProgramsWorkspaceProgramPane programId={programId} />;
}
